import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

// Generate ephemeral token
async function getEphemeralToken(): Promise<string> {
  const OPENAI_API_KEY = "sk-proj-...";

  const res = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session: { type: 'realtime', model: 'gpt-realtime' }
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to get ephemeral token: ${res.statusText}`);
  }

  const data = await res.json();
  return data.value; // ephemeral token starts with 'ek_'
}


// Initialize voice agent
async function initVoiceAgent() {
  const ephemeralKey = await getEphemeralToken();
  console.log('Ephemeral token received:', ephemeralKey);

  const agent = new RealtimeAgent({
    name: 'Assistant',
    instructions: `
      You are a helpful assistant.
      Only respond after the user speaks. Always speak in a male voice.
      Detect the language the user is speaking, For Hindi, Urdu, Punjabi, Gujarati, Bengali, or English, respond in the same language as the user's latest message.
    `,
  });


  const session = new RealtimeSession(agent, {
    model: 'GPT-realtime',
  });

  try {
    await session.connect({ apiKey: ephemeralKey });
    console.log('Connected to Realtime API. You can start talking!');

    // Example: listen for responses
    session.on('response', (event) => {
      const now = performance.now();
      if (!firstResponseTime) firstResponseTime = now;
      console.log(`🎵 Received response chunk at ${now.toFixed(2)}ms (delta since first chunk: ${delta}ms)`);
      console.log('Agent response:', event);
    });

  } catch (err) {
    console.error('Failed to connect:', err);
  }
}

// Start everything
initVoiceAgent();
