import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface MessageContent {
  role: "user" | "model";
  parts: { text: string }[];
}

interface Message {
  role: "user" | "model";
  content: string;
}

interface GeminiRequest {
  contents: MessageContent[];
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
  };
}

interface ChatRequest {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
}

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const MODEL = 'gemini-pro';
const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${geminiApiKey}`;

function mapUserMessage(message: Message): MessageContent {
  return {
    role: message.role,
    parts: [{ text: message.content }]
  };
}

function buildGeminiRequest(chatRequest: ChatRequest): GeminiRequest {
  const contents = chatRequest.messages.map(mapUserMessage);

  return {
    contents,
    generationConfig: {
      temperature: chatRequest.temperature || 0.7,
      maxOutputTokens: chatRequest.maxTokens || 2048,
      topP: 0.8,
      topK: 40
    }
  };
}

async function generateWithGemini(chatRequest: ChatRequest) {
  // Validate the API key
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY environment variable not set');
  }

  const geminiRequest = buildGeminiRequest(chatRequest);
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(geminiRequest)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
  }

  return response.json();
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse chat request
    const body = await req.json();
    const { messages, userId, temperature, maxTokens } = body;

    // Basic validation
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate userId is present
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required: userId is missing' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Track token usage - in a real implementation, we would validate 
    // and deduct tokens here, but we'll just log for now
    console.log(`Processing request for user ${userId} with ${messages.length} messages`);

    const result = await generateWithGemini({
      messages,
      temperature,
      maxTokens
    });

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred processing your request' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});