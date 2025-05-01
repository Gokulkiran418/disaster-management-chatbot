import { SessionsClient } from '@google-cloud/dialogflow';

// Initialize Dialogflow client with credentials from environment variable
const sessionClient = new SessionsClient({
  credentials: JSON.parse(process.env.DIALOGFLOW_CREDENTIALS),
});

const projectId = 'portfoliobot-fugx'; // Replace with your Dialogflow project ID

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { message, sessionId } = req.body;
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  let request;
  if (message === '[START]') {
    // Trigger welcome intent for the initial message
    request = {
      session: sessionPath,
      queryInput: {
        event: {
          name: 'WELCOME',
          languageCode: 'en-US',
        },
      },
    };
  } else {
    // Handle user text input
    request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: 'en-US',
        },
      },
    };
  }

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    res.status(200).json({ messages: result.fulfillmentMessages });
  } catch (error) {
    console.error('Dialogflow Error:', error);
    res.status(500).json({ error: 'Sorry, something went wrong. Please try again.' });
  }
}