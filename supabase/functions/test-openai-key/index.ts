
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
    const { key } = await req.json();

    if (!key) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          message: "No API key provided" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Initialize OpenAI with the provided key
    const openai = new OpenAI({
      apiKey: key,
    });

    // Test the API key with a simple models list request
    try {
      await openai.models.list();
      
      return new Response(
        JSON.stringify({ 
          isValid: true, 
          message: "API key is valid" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          message: "Invalid API key" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Error testing OpenAI key:", error);

    return new Response(
      JSON.stringify({ 
        isValid: false, 
        message: error.message || "An error occurred while testing the API key" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
