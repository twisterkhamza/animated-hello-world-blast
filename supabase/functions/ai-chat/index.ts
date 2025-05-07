
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";

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
    const { messages, systemPrompt } = await req.json();
    
    // Check if required data is provided
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is required");
    }

    // Retrieve OpenAI API key from environment variables
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Prepare messages for the chat completion
    const formattedMessages = [];
    
    // Add system prompt if provided
    if (systemPrompt) {
      formattedMessages.push({
        role: "system", 
        content: systemPrompt
      });
    }
    
    // Add user messages
    formattedMessages.push(...messages);

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
