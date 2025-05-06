
import { supabase } from '@/integrations/supabase/client';
import { LifeArea, AIPrompt, AICoachSession, AICoachInteraction } from '@/types';

// Life Areas
export const fetchLifeAreas = async (): Promise<LifeArea[]> => {
  const { data, error } = await supabase
    .from('life_areas')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching life areas:', error);
    throw error;
  }
  
  return data || [];
};

export const createLifeArea = async (lifeArea: Omit<LifeArea, 'id'>): Promise<LifeArea> => {
  const { data, error } = await supabase
    .from('life_areas')
    .insert([lifeArea])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating life area:', error);
    throw error;
  }
  
  return data;
};

export const updateLifeArea = async (id: string, updates: Partial<LifeArea>): Promise<LifeArea> => {
  const { data, error } = await supabase
    .from('life_areas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating life area:', error);
    throw error;
  }
  
  return data;
};

export const deleteLifeArea = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('life_areas')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting life area:', error);
    throw error;
  }
};

// AI Coach Sessions
export const createSession = async (session: Omit<AICoachSession, 'id' | 'startedAt' | 'endedAt' | 'tags'>): Promise<AICoachSession> => {
  const { data, error } = await supabase
    .from('ai_coach_sessions')
    .insert([session])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }
  
  return {
    ...data,
    startedAt: new Date(data.started_at),
    endedAt: data.ended_at ? new Date(data.ended_at) : null,
    tags: [],
  };
};

export const fetchSessions = async (): Promise<AICoachSession[]> => {
  const { data, error } = await supabase
    .from('ai_coach_sessions')
    .select(`
      *,
      tags:ai_session_tags(
        tag:tags(*)
      )
    `)
    .order('started_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
  
  // Transform the data to match our types
  return (data || []).map(session => ({
    id: session.id,
    title: session.title,
    summary: session.summary,
    lifeAreaId: session.life_area_id,
    promptId: session.prompt_id,
    isActive: session.is_active,
    startedAt: new Date(session.started_at),
    endedAt: session.ended_at ? new Date(session.ended_at) : null,
    tags: session.tags?.map((t: any) => t.tag) || [],
  }));
};

// AI Coach Interactions
export const createInteraction = async (interaction: Omit<AICoachInteraction, 'id' | 'createdAt'>): Promise<AICoachInteraction> => {
  const { data, error } = await supabase
    .from('ai_coach_interactions')
    .insert([interaction])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating interaction:', error);
    throw error;
  }
  
  return {
    ...data,
    createdAt: new Date(data.created_at),
  };
};

export const fetchInteractions = async (sessionId: string): Promise<AICoachInteraction[]> => {
  const { data, error } = await supabase
    .from('ai_coach_interactions')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching interactions:', error);
    throw error;
  }
  
  return (data || []).map(interaction => ({
    id: interaction.id,
    sessionId: interaction.session_id,
    role: interaction.role as 'system' | 'user' | 'assistant',
    content: interaction.content,
    tokensUsed: interaction.tokens_used,
    createdAt: new Date(interaction.created_at),
  }));
};
