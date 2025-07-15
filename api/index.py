from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from crewai import Crew, Task
from .agents import agents
import json
import os
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()
app = FastAPI()

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
            statuses[session_id]['agents'][agent_name] = 'processing'
            logger.debug(f"Task started for {agent_name}")

        def on_task_complete(task, agent_name):
            logger.debug(f"Task output type: {type(task)}")
            logger.debug(f"Task output attributes: {dir(task)}")
            try:
                output = str(task.raw) if task.raw else "No output"
            except AttributeError:
                output = "No output available"
            statuses[session_id]['agents'][agent_name] = 'completed'
            statuses[session_id]['results'][agent_name] = output
            logger.debug(f"Task completed for {agent_name}: {output}")
            if all(status == 'completed' for status in statuses[session_id]['agents'].values()):
                statuses[session_id]['status'] = 'completed'

        tasks = []
        for agent_name, agent in agents.items():
            task = Task(
                description=f"{agent_name.capitalize()} for {disaster_type}: {query}",
                agent=agent,
                expected_output=f"{agent_name} output",
                callback=lambda t, name=agent_name: (on_task_start(t, name), on_task_complete(t, name))[-1]
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
        'agents': {agent: 'idle' for agent in agents.keys()},
        'results': {}
    }

    background_tasks.add_task(run_crew, session_id, disaster_type, query)
    return {"message": "Processing started"}

@app.get("/status/{session_id}")
async def get_status(session_id: str):
    if session_id not in statuses:
        return {"error": "Session not found"}
    return statuses[session_id]