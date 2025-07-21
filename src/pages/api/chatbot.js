// src/pages/api/chatbot.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, sessionId, disasterType } = req.body;
  const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

  try {
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    if (message === '[START]') {
      return res.status(200).json({
        message: 'Welcome to the Disaster Response Coordinator! Select a disaster type (e.g., Earthquake, Flood) and describe your needs (e.g., Evacuate 500 people).',
      });
    }

    if (!disasterType || !message) {
      return res.status(400).json({ error: 'Missing disasterType or message' });
    }

    const response = await axios.post(
      `${fastApiUrl}/disaster-response`,
      {
        query: message,
        session_id: sessionId,
        disaster_type: disasterType,
      },
      { timeout: 120000 } // 120 seconds
    );
    console.log('Backend chatbot response:', response.data); // Debug

    // Return the backend's response directly
    return res.status(200).json({ message: response.data.message });
  } catch (error) {
    console.error('Error calling FastAPI:', error.message, error.response?.data);
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data?.detail || 'FastAPI error',
        raw: error.response.data,
      });
    }
    return res.status(500).json({ error: `Failed to process request: ${error.message}` });
  }
}