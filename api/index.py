from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from crewai import Crew, Task
from .agents import agents
import json
import os
from dotenv import load_dotenv
import logging
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from uuid import uuid4

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

statuses = {}

class DisasterRequest(BaseModel):
    disaster_type: str
    query: str
    session_id: str

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

async def run_crew(session_id, disaster_type, query):
    try:
        with open("api/data/disaster-data.json", "r") as file:
            disaster_data = json.load(file)

        if disaster_type not in disaster_data:
            statuses[session_id]['status'] = 'failed'
            statuses[session_id]['error'] = "Invalid disaster type"
            logger.error("Invalid disaster type")
            return

        def on_task_start(task, agent_name):
            # Set agent to processing and record working description
            statuses[session_id]['agents'][agent_name] = 'processing'
            statuses[session_id]['working'][agent_name] = f"Executing: {task.description}"
            # Clear any previous thinking
            statuses[session_id]['thinking'][agent_name] = ""

        def on_thinking(thought, agent_name):
            # Stream intermediate reasoning steps
            statuses[session_id]['thinking'][agent_name] = thought

        def on_task_complete(task, agent_name):
            try:
                output = str(task.raw) if task.raw else "No output"
            except AttributeError:
                output = "No output available"
            statuses[session_id]['agents'][agent_name] = 'completed'
            statuses[session_id]['results'][agent_name] = output
            statuses[session_id]['working'][agent_name] = ""
            statuses[session_id]['thinking'][agent_name] = ""
            if all(s == 'completed' for s in statuses[session_id]['agents'].values()):
                statuses[session_id]['status'] = 'completed'

        # Build tasks and assign unique IDs
        tasks = []
        for agent_name, agent in agents.items():
            task_id = str(uuid4())
            statuses[session_id]['task_ids'][agent_name] = task_id
            task = Task(
                description=f"{agent_name.capitalize()} for {disaster_type}: {query}",
                agent=agent,
                expected_output=f"{agent_name} output",
                callback=lambda t, name=agent_name: (on_task_start(t, name), on_task_complete(t, name))[-1],
                on_thinking=lambda thought, name=agent_name: on_thinking(thought, name)
            )
            tasks.append(task)

        crew = Crew(
            agents=list(agents.values()),
            tasks=tasks,
            verbose=True
        )

        result = await crew.kickoff_async()
        if not result:
            statuses[session_id]['status'] = 'failed'
            statuses[session_id]['error'] = "Crew execution returned no result"
            logger.error("Crew execution returned no result")

    except Exception as e:
        logger.error(f"Crew execution failed: {str(e)}", exc_info=True)
        statuses[session_id]['status'] = 'failed'
        statuses[session_id]['error'] = str(e)

@app.post("/disaster-response")
async def disaster_response(request: DisasterRequest, background_tasks: BackgroundTasks):
    session_id = request.session_id
    disaster_type = request.disaster_type.lower()
    query = request.query

    statuses[session_id] = {
        'status': 'processing',
        'agents': {agent: 'idle' for agent in agents},
        'results': {},
        'working': {agent: '' for agent in agents},
        'thinking': {agent: '' for agent in agents},
        'task_ids': {}
    }

    background_tasks.add_task(run_crew, session_id, disaster_type, query)
    return {"message": "Processing started"}

@app.get("/status/{session_id}")
async def get_status(session_id: str):
    if session_id not in statuses:
        return {"error": "Session not found"}
    return statuses[session_id]

@app.get("/stream/{session_id}")
async def stream(session_id: str):
    async def event_generator():
        last_seen = set()
        while True:
            await asyncio.sleep(1)
            if session_id not in statuses:
                yield f"data: {json.dumps({'error': 'Session not found'})}\n\n"
                return
            state = statuses[session_id]
            for agent, status in state['agents'].items():
                thinking = state['thinking'].get(agent, '')
                key = (agent, status, thinking)
                if key not in last_seen:
                    data = {
                        'agent': agent,
                        'status': status,
                        'id': state['task_ids'].get(agent),
                        'thinking': thinking,
                        'result': state['results'].get(agent, '')
                    }
                    yield f"data: {json.dumps(data)}\n\n"
                    last_seen.add(key)
            if state['status'] in ['completed', 'failed']:
                yield f"data: {json.dumps({'overall': state['status'], 'error': state.get('error')})}\n\n"
                return
    return StreamingResponse(event_generator(), media_type='text/event-stream')
