
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { sessionId, message } = await req.json();
    
    if (!sessionId || !message) {
      throw new Error('Missing required parameters: sessionId and message are required');
    }
    
    // Get environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the session details
    const { data: sessionData, error: sessionError } = await supabase
      .from('ai_coach_sessions')
      .select('*, life_areas!inner(*)')
      .eq('id', sessionId)
      .single();
    
    if (sessionError || !sessionData) {
      throw new Error('Session not found');
    }
    
    // Get system prompt for the life area
    const { data: promptData, error: promptError } = await supabase
      .from('ai_coach_prompts')
      .select('system_prompt')
      .eq('life_area_id', sessionData.life_area_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // If no specific prompt is found, create a default one
    const systemPrompt = promptData?.system_prompt || 
      `You are an AI coach specialized in ${sessionData.life_areas.name}. 
       Provide thoughtful guidance and ask insightful questions to help the user 
       improve in this area. Be supportive, encouraging, and practical.`;
    
    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });
    
    // Get previous messages for context (limit to last 10 for simplicity)
    const { data: previousMessages, error: messagesError } = await supabase
      .from('ai_coach_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10);
    
    if (messagesError) {
      throw new Error('Failed to retrieve conversation context');
    }
    
    // Format messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
    ];
    
    // Add previous messages for context
    if (previousMessages && previousMessages.length > 0) {
      previousMessages.forEach(msg => {
        // Only include user and assistant messages (ignore system messages)
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }
    
    // Add the new user message
    messages.push({ role: 'user', content: message });
    
    // Call OpenAI API for response
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });
    
    const assistantResponse = response.choices[0]?.message?.content || "I'm sorry, I don't have a response for that.";
    const tokensUsed = response.usage?.total_tokens || 0;
    
    return new Response(
      JSON.stringify({ 
        content: assistantResponse, 
        tokens: tokensUsed 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error('Error in AI chat function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred processing your request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
