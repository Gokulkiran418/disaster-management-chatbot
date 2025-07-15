# Disaster Response Coordinator Bot

The Disaster Response Coordinator Bot is a web application designed to provide structured and actionable disaster response plans by leveraging AI-powered agents. Built with a FastAPI backend and a Next.js frontend, the application allows users to submit disaster-related queries (e.g., "Evacuate 500 people from Zone A during an earthquake") and receive detailed, Markdown-formatted responses from specialized agents. The frontend features a responsive, user-friendly interface with real-time agent status updates and animated loaders, while the backend uses CrewAI to orchestrate multiple agents for planning, researching, logistics, and communication.

## Table of Contents

- Features
- Tech Stack
- Project Structure
- Agents
- Installation
- Usage
- API Endpoints
- Frontend Components
- Contributing
- License

---

## Features

- **Interactive Query Interface**: Users can select a disaster type (e.g., Earthquake, Flood, Hurricane, Wildfire) and submit custom queries via a sleek, responsive form.
- **Real-Time Agent Status**: Displays the progress of each agent (idle, processing, completed) with animated loaders for a dynamic user experience.
- **Structured Output**: Agent responses are rendered in well-formatted Markdown, ensuring clear and readable plans with headings, lists, and bold text.
- **Responsive Design**: The UI adapts seamlessly to mobile and desktop devices using Tailwind CSS.
- **Framer Motion Animations**: Smooth transitions and animations enhance the visual appeal of query submission, status updates, and result rendering.
- **Error Handling**: Robust error handling in both backend and frontend ensures users receive clear feedback on issues like invalid inputs or processing failures.

---

## Tech Stack

### Backend:
- **FastAPI**: A high-performance Python framework for building APIs.
- **CrewAI**: Orchestrates multiple AI agents for task execution.
- **LangChain OpenAI**: Integrates OpenAI's gpt-4o-mini model for agent responses.
- **Python-Dotenv**: Manages environment variables.

### Frontend:
- **Next.js**: A React framework for server-side rendering and API routes.
- **React-Markdown**: Renders Markdown-formatted agent outputs.
- **Framer Motion**: Adds smooth animations for UI components.
- **Tailwind CSS**: Provides responsive and modern styling.

### Dependencies:
- **Backend**: `fastapi`, `uvicorn`, `gunicorn`, `crewai`, `openai`, `langchain`, `langchain_openai`, `pydantic`, `python-dotenv`
- **Frontend**: `react`, `react-dom`, `next`, `react-markdown`, `framer-motion`

---

## Project Structure

```
my-chatbot-app/
├── api/
│   ├── index.py                # FastAPI backend with API endpoints
│   ├── agents.py               # CrewAI agent definitions
│   ├── data/
│   │   └── disaster-data.json  # Mock disaster data
│   └── requirements.txt        # Backend dependencies
├── src/
│   ├── pages/
│   │   ├── index.js            # Main frontend page with components
│   │   ├── api/
│   │   │   ├── chatbot.js      # Proxy API for /disaster-response
│   │   │   └── status/[sessionId].js # Proxy API for /status
│   ├── package.json            # Frontend dependencies
│   └── tailwind.config.js      # Tailwind CSS configuration
├── .env                        # Environment variables
├── render.yaml                 # Deployment configuration

```

---

## Agents

The application uses four specialized CrewAI agents to process disaster response queries collaboratively:

### Disaster Response Planner
- **Role**: Designs a step-by-step strategy for disaster response based on the user’s query and disaster type.
- **Goal**: Create actionable plans, such as evacuation strategies or resource allocation.
- **Backstory**: An experienced emergency planner with expertise in disasters like earthquakes and floods.
- **Example Output**: A detailed evacuation plan with steps like establishing a command center, identifying routes, and ensuring population accountability.

### Disaster Data Researcher
- **Role**: Gathers relevant data on shelters, supplies, and local conditions for the specified disaster.
- **Goal**: Provide critical data to support the planner’s strategy.
- **Backstory**: A skilled researcher specializing in disaster logistics and mock data sources.
- **Example Output**: Lists of available shelters, supply inventories, or local hazard conditions.

### Logistics Coordinator
- **Role**: Plans resource distribution based on the planner’s strategy and researcher’s data.
- **Goal**: Optimize allocation of transportation, supplies, and personnel.
- **Backstory**: A logistics expert ensuring timely delivery during emergencies.
- **Example Output**: Transportation schedules, pickup points, and resource allocation plans.

### Public Communicator
- **Role**: Drafts clear and empathetic public announcements based on the response strategy.
- **Goal**: Communicate evacuation plans or safety instructions effectively.
- **Backstory**: A crisis communication specialist skilled in public messaging.
- **Example Output**: Public alerts with clear instructions, such as evacuation routes or safety tips.

> Each agent uses the `gpt-4o-mini` model from OpenAI for efficient processing, with `allow_delegation=False` to ensure independent task execution.

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/my-chatbot-app.git
cd my-chatbot-app
```

### Backend Setup

#### Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
.\venv\Scripts\activate   # Windows
```

#### Install dependencies:

```bash
pip install -r api/requirements.txt
```

#### Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

### Frontend Setup

#### Navigate to the src directory:

```bash
cd src
```

#### Install dependencies:

```bash
npm install
```

#### Verify `api/data/disaster-data.json`

Ensure this file exists with mock disaster data:

```json
{
  "earthquake": {"shelters": [], "routes": []},
  "flood": {"shelters": [], "routes": []},
  "hurricane": {"shelters": [], "routes": []},
  "wildfire": {"shelters": [], "routes": []}
}
```

---

## Usage

### Run the Backend:

```bash
cd my-chatbot-app
source venv/bin/activate  # Linux/macOS
.\venv\Scripts\activate   # Windows
uvicorn api.index:app --host 0.0.0.0 --port 8000
```

### Run the Frontend:

```bash
cd src
npm run dev
```

### Access the Application:

- Open `http://localhost:3000` in your browser.
- Select a disaster type (e.g., Earthquake), enter a query (e.g., "Evacuate 500 people from Zone A"), and click "Send."
- View real-time agent statuses with animated loaders in the "Agent Status" section.
- See structured, Markdown-formatted results in the "Agent Results" section.

---

## API Endpoints

### `GET /health`

Checks backend health.  
**Response**:  
```json
{"status": "healthy"}
```

### `POST /disaster-response`

Initiates disaster response processing.  
**Body**:  
```json
{
  "disaster_type": "earthquake",
  "query": "Evacuate 500 people from Zone A",
  "session_id": "unique_id"
}
```  
**Response**:  
```json
{"message": "Processing started"}
```

### `GET /status/{session_id}`

Retrieves agent statuses and results for a session.  
**Response**:  
```json
{
  "status": "processing|completed|failed",
  "agents": {...},
  "results": {...},
  "error": null|string
}
```

### Frontend Proxy Routes

- `POST /api/chatbot`: Proxies to `/disaster-response`
- `GET /api/status/[sessionId]`: Proxies to `/status/{session_id}`

---

## Frontend Components

The frontend is divided into three responsive components, styled with Tailwind CSS and animated with Framer Motion:

### `QueryComponent`

- Allows users to select a disaster type, enter a query, and view sent queries.
- Features a responsive form and scrollable query history.

### `AgentWorkingComponent`

- Displays real-time agent statuses (idle, processing, completed) with animated spinning loaders for processing agents.
- Visible only during processing.

### `AgentResultsComponent`

- Renders agent outputs in structured Markdown using `react-markdown`.
- Displays errors if processing fails.
- Visible during processing or when results/errors are available.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch:  
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:  
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to the branch:  
   ```bash
   git push origin feature/your-feature
   ```
5. Open a pull request.

---
