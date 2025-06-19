import { createClient } from "npm:@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization') || '';
    
    // Create authenticated Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader }
      }
    });
    
    // Get user details
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Nicht autorisiert. Bitte melde dich an.' }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Parse request
    const { prompt, model = "gemini-pro" } = await req.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Ungültige Anfrage. Bitte gib einen Text ein.' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Check and deduct token from user's balance
    const { data: tokenResult, error: tokenError } = await supabase.rpc('deduct_ai_token', {
      user_id: user.id,
      token_count: 1,
      flow_name: 'gemini_chat'
    });
    
    if (tokenError || !tokenResult) {
      return new Response(
        JSON.stringify({ 
          error: 'Nicht genügend Tokens verfügbar',
          details: tokenError?.message || 'Bitte lade dein Token-Guthaben auf.'
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });
    
    const geminiData = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', geminiData);
      
      // Log error to Supabase
      await supabase.from('ai_interaction_logs').insert({
        user_id: user.id,
        flow_name: 'gemini_chat',
        input: { prompt },
        output: { error: geminiData },
        status: 'error'
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Fehler bei der Verarbeitung durch Gemini AI',
          details: geminiData.error?.message || 'Unbekannter Fehler' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Log successful interaction
    await supabase.from('ai_interaction_logs').insert({
      user_id: user.id,
      flow_name: 'gemini_chat',
      input: { prompt },
      output: { success: true },
      status: 'success'
    });
    
    return new Response(
      JSON.stringify(geminiData),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Serverfehler', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});