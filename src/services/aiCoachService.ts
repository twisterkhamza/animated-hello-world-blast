
import { supabase } from '@/integrations/supabase/client';
import { LifeArea, AIPrompt, AICoachSession, AICoachInteraction } from '@/types';
import { toast } from '@/hooks/use-toast';

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
  
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    color: item.color,
    icon: item.icon,
    isActive: item.is_active,
    userId: item.user_id
  }));
};

export const createLifeArea = async (lifeArea: Omit<LifeArea, 'id'>): Promise<LifeArea> => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.user) throw new Error('User not authenticated');
  
  // Convert camelCase to snake_case for Supabase
  const dbLifeArea = {
    name: lifeArea.name,
    description: lifeArea.description,
    color: lifeArea.color,
    icon: lifeArea.icon,
    is_active: lifeArea.isActive,
    user_id: sessionData.session.user.id
  };
  
  const { data, error } = await supabase
    .from('life_areas')
    .insert([dbLifeArea])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating life area:', error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
    icon: data.icon,
    isActive: data.is_active,
    userId: data.user_id
  };
};

export const updateLifeArea = async (id: string, updates: Partial<LifeArea>): Promise<LifeArea> => {
  // Convert camelCase to snake_case for Supabase
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  
  const { data, error } = await supabase
    .from('life_areas')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating life area:', error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
    icon: data.icon,
    isActive: data.is_active,
    userId: data.user_id
  };
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
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.user) throw new Error('User not authenticated');
  
  // Convert camelCase to snake_case for Supabase
  const dbSession = {
    title: session.title,
    summary: session.summary,
    life_area_id: session.lifeAreaId,
    prompt_id: session.promptId,
    is_active: session.isActive,
    user_id: sessionData.session.user.id,
  };
  
  const { data, error } = await supabase
    .from('ai_coach_sessions')
    .insert([dbSession])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }
  
  return {
    id: data.id,
    title: data.title,
    summary: data.summary,
    lifeAreaId: data.life_area_id,
    promptId: data.prompt_id,
    isActive: data.is_active,
    startedAt: new Date(data.started_at),
    endedAt: data.ended_at ? new Date(data.ended_at) : null,
    tags: [],
    userId: data.user_id
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
    userId: session.user_id
  }));
};

// AI Coach Interactions
export const createInteraction = async (interaction: Omit<AICoachInteraction, 'id' | 'createdAt'>): Promise<AICoachInteraction> => {
  // Convert camelCase to snake_case for Supabase
  const dbInteraction = {
    session_id: interaction.sessionId,
    role: interaction.role,
    content: interaction.content,
    tokens_used: interaction.tokensUsed
  };
  
  const { data, error } = await supabase
    .from('ai_coach_interactions')
    .insert([dbInteraction])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating interaction:', error);
    throw error;
  }
  
  return {
    id: data.id,
    sessionId: data.session_id,
    role: data.role as 'system' | 'user' | 'assistant',
    content: data.content,
    tokensUsed: data.tokens_used,
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
