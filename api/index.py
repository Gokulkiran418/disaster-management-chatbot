from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from crewai import Crew, Task
from api.agents import agents
import json
import os
from dotenv import load_dotenv

load_dotenv()

if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY not found in .env file")

app = FastAPI()

with open("api/data/disaster-data.json", "r") as file:
    disaster_data = json.load(file)

class DisasterRequest(BaseModel):
    disaster_type: str
    query: str
    session_id: str

@app.post("/disaster-response")
async def disaster_response(request: DisasterRequest):
    try:
        disaster_type = request.disaster_type.lower()
        query = request.query
        session_id = request.session_id

        if disaster_type not in disaster_data:
            raise HTTPException(status_code=400, detail="Invalid disaster type")

        planner_task = Task(
            description=f"Design a step-by-step strategy for responding to a {disaster_type} with user request: {query}",
            agent=agents["planner"],
            expected_output="A list of steps for disaster response."
        )

        researcher_task = Task(
            description=f"Gather data on shelters, supplies, and conditions for a {disaster_type} in the affected area based on user request: {query}. Use mock data: {json.dumps(disaster_data[disaster_type])}",
            agent=agents["researcher"],
            expected_output="A summary of available shelters, supplies, and conditions."
        )

        logistics_task = Task(
            description=f"Plan resource distribution based on the Planner's strategy and Researcher's data for a {disaster_type}. User request: {query}",
            agent=agents["logistics"],
            expected_output="A resource distribution plan."
        )

        communicator_task = Task(
            description=f"Draft a clear and empathetic public announcement based on the Planner's strategy and Logistics plan for a {disaster_type}. User request: {query}",
            agent=agents["communicator"],
            expected_output="A public announcement message."
        )

        crew = Crew(
            agents=[agents["planner"], agents["researcher"], agents["logistics"], agents["communicator"]],
            tasks=[planner_task, researcher_task, logistics_task, communicator_task],
            verbose=True
        )

        result = crew.kickoff()

        messages = [
            {"text": {"text": str(planner_task.output)}, "sender": "planner"},
            {"text": {"text": str(researcher_task.output)}, "sender": "researcher"},
            {"text": {"text": str(logistics_task.output)}, "sender": "logistics"},
            {"text": {"text": str(communicator_task.output)}, "sender": "communicator"}
        ]

        return {"messages": messages}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}