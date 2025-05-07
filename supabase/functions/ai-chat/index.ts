
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Extract request body
    const { messages, sessionId, systemPrompt: customSystemPrompt } = await req.json();
    
    // Check if required data is provided
    if (!messages || !Array.isArray(messages) || !sessionId) {
      throw new Error("Messages array and sessionId are required");
    }

    // Retrieve OpenAI API key from environment variables
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get session details to determine life area and system prompt
    const { data: sessionData, error: sessionError } = await supabase
      .from("ai_coach_sessions")
      .select("life_area_id")
      .eq("id", sessionId)
      .single();
    
    if (sessionError) throw sessionError;
    
    // Get system prompt for this life area
    const { data: promptData, error: promptError } = await supabase
      .from("ai_coach_prompts")
      .select("system_prompt")
      .eq("life_area_id", sessionData.life_area_id)
      .eq("is_active", true)
      .maybeSingle();
    
    if (promptError) throw promptError;
    
    // Fetch previous messages for context
    const { data: previousMessages, error: messagesError } = await supabase
      .from("ai_coach_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    
    if (messagesError) throw messagesError;

    // Prepare messages for the chat completion
    const formattedMessages = [];
    
    // Add system prompt if provided or found
    let systemPrompt = "You are an AI coach that helps users improve their lives through thoughtful conversation and guidance.";
    
    if (customSystemPrompt) {
      systemPrompt = customSystemPrompt;
    } else if (promptData?.system_prompt) {
      systemPrompt = promptData.system_prompt;
    }
    
    formattedMessages.push({
      role: "system", 
      content: systemPrompt
    });
    
    // Add previous conversation messages for context
    if (previousMessages && previousMessages.length > 0) {
      formattedMessages.push(...previousMessages);
    } else {
      // Add user messages
      formattedMessages.push(...messages);
    }

    // Call OpenAI Chat Completion API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini for efficiency
      messages: formattedMessages,
      temperature: 0.7,
    });

    // Return the result
    return new Response(
      JSON.stringify({
        message: completion.choices[0].message,
        usage: completion.usage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("AI Chat error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
