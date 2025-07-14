import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, sessionId, disasterType } = req.body;

  try {
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    if (message === '[START]') {
      return res.status(200).json({
        messages: [
          {
            text: {
              text: 'Welcome to the Disaster Response Coordinator! Select a disaster type (e.g., Earthquake, Flood) and describe your needs (e.g., Evacuate 500 people).'
            }
          }
        ]
      });
    }

    if (!disasterType || !message) {
      return res.status(400).json({ error: 'Missing disasterType or message' });
    }

    // Send request to FastAPI microservice
    const response = await axios.post('http://localhost:8000/disaster-response', {
      disaster_type: disasterType,
      query: message,
      session_id: sessionId
    }, {
      timeout: 30000 // 30-second timeout for API call
    });

    // Return agent outputs as chat messages
    return res.status(200).json({
      messages: response.data.messages
    });

  } catch (error) {
    console.error('Error calling FastAPI microservice:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.detail || 'FastAPI error' });
    }
    return res.status(500).json({ error: `Failed to process request: ${error.message}` });
  }
}