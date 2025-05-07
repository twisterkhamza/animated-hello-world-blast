
import { supabase } from '@/integrations/supabase/client';
import { AICoachMessage } from '@/types';

export const fetchMessages = async (sessionId: string): Promise<AICoachMessage[]> => {
  const { data, error } = await supabase
    .from('ai_coach_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  
  return (data || []).map(msg => ({
    id: msg.id,
    sessionId: msg.session_id,
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
    tokensUsed: msg.tokens_used,
    createdAt: new Date(msg.created_at)
  }));
};

export const sendMessage = async (
  sessionId: string, 
  content: string
): Promise<AICoachMessage> => {
  // First insert the user message
  const { data: userMessage, error: userError } = await supabase
    .from('ai_coach_messages')
    .insert({
      session_id: sessionId,
      role: 'user',
      content
    })
    .select()
    .single();
  
  if (userError) {
    console.error('Error sending message:', userError);
    throw userError;
  }
  
  try {
    // Call the Edge Function to get AI response
    const { data: responseData, error: fnError } = await supabase.functions
      .invoke('ai-chat', {
        body: { sessionId, message: content }
      });
    
    if (fnError) throw fnError;
    
    // Save the assistant's response to the database
    const { data: assistantMessage, error: assistantError } = await supabase
      .from('ai_coach_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: responseData.content,
        tokens_used: responseData.tokens
      })
      .select()
      .single();
    
    if (assistantError) throw assistantError;
    
    return {
      id: assistantMessage.id,
      sessionId: assistantMessage.session_id,
      role: 'assistant',
      content: assistantMessage.content,
      tokensUsed: assistantMessage.tokens_used,
      createdAt: new Date(assistantMessage.created_at)
    };
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Convert blob to base64
    const reader = new FileReader();
    const audioBase64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(',')[1] || '';
        resolve(base64);
      };
    });
    reader.readAsDataURL(audioBlob);
    const audioBase64 = await audioBase64Promise;
    
    // Send to Edge Function for transcription
    const { data, error } = await supabase.functions
      .invoke('transcribe-audio', {
        body: { audio: audioBase64 }
      });
    
    if (error) throw error;
    
    return data.text || '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

export const fetchSystemPrompt = async (lifeAreaId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('ai_coach_prompts')
    .select('system_prompt')
    .eq('life_area_id', lifeAreaId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error fetching system prompt:', error);
    throw error;
  }
  
  return data.system_prompt;
};

export const setSessionActive = async (sessionId: string, isActive: boolean): Promise<void> => {
  const { error } = await supabase
    .from('ai_coach_sessions')
    .update({ is_active: isActive })
    .eq('id', sessionId);
  
  if (error) {
    console.error('Error updating session status:', error);
    throw error;
  }
};

export const updateSessionSummary = async (sessionId: string, summary: string): Promise<void> => {
  const { error } = await supabase
    .from('ai_coach_sessions')
    .update({ summary })
    .eq('id', sessionId);
  
  if (error) {
    console.error('Error updating session summary:', error);
    throw error;
  }
};
