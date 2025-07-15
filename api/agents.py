from crewai import Agent
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY not found in .env file")

# Initialize LLM with error handling
try:
    llm = ChatOpenAI(
        model="gpt-4o-mini",  # Use lighter model for better performance
        api_key=openai_api_key,
        temperature=0.7
    )
except Exception as e:
    raise ValueError(f"Failed to initialize LLM: {str(e)}")

planner_agent = Agent(
    role="Disaster Response Planner",
    goal="Design a step-by-step strategy for disaster response based on user input and disaster type.",
    backstory="You are an experienced emergency planner with expertise in creating actionable response strategies for disasters like earthquakes and floods.",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

researcher_agent = Agent(
    role="Disaster Data Researcher",
    goal="Gather relevant data on shelters, supplies, and local conditions for the specified disaster and location.",
    backstory="You are a skilled researcher specializing in disaster logistics, capable of finding critical data from mock sources or APIs.",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

logistics_agent = Agent(
    role="Logistics Coordinator",
    goal="Plan resource distribution based on the Planner's strategy and Researcher's data.",
    backstory="You are a logistics expert who optimizes resource allocation, ensuring timely delivery of supplies and personnel during disasters.",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

communicator_agent = Agent(
    role="Public Communicator",
    goal="Draft clear and empathetic public announcements based on the response strategy and logistics plan.",
    backstory="You are a crisis communication specialist, crafting urgent and clear messages to guide the public during disasters.",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

agents = {
    "planner": planner_agent,
    "researcher": researcher_agent,
    "logistics": logistics_agent,
    "communicator": communicator_agent
}