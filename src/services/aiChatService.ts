
import { supabase } from '@/integrations/supabase/client';
import { AICoachMessage } from '@/types';

export const fetchMessages = async (sessionId: string): Promise<AICoachMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('ai_coach_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (sessionId: string, content: string): Promise<AICoachMessage> => {
  try {
    // First, insert the user message
    const { data: userData, error: userError } = await supabase
      .from('ai_coach_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content
      })
      .select()
      .single();
    
    if (userError) throw userError;
    
    // Then call the AI function to get a response
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        messages: [{ role: 'user', content }]
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get AI response');
    }
    
    const result = await response.json();
    
    // Insert the assistant's response
    const { data: assistantData, error: assistantError } = await supabase
      .from('ai_coach_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: result.message.content,
        tokens_used: result.usage?.total_tokens || null
      })
      .select()
      .single();
    
    if (assistantError) throw assistantError;
    
    return assistantData;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  try {
    const response = await fetch('/api/transcribe-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audio: audioBase64 }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to transcribe audio');
    }
    
    const result = await response.json();
    return result.text || '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};
