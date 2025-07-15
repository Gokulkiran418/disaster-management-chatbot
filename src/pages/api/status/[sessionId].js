import axios from 'axios';

export default async function handler(req, res) {
  const { sessionId } = req.query;
  const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

  try {
    const response = await axios.get(`${fastApiUrl}/status/${sessionId}`);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching status from FastAPI:', error.message);
    return res.status(500).json({ error: 'Failed to fetch status' });
  }
}