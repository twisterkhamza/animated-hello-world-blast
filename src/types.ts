
// Type definitions for the journaling app

export type TemplateType = 'sod' | 'eod';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  order: number;
  options?: QuestionOption[];
}

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  questions: Question[];
}

export interface Category {
  id: string;
  name: string;
  type: TemplateType;
}

export interface Rating {
  id: string;
  category: string;
  value: number;
  timestamp: Date;
}

export interface Entry {
  id: string;
  templateId: string | null;
  timestamp: Date;
  answers: Record<string, any>;
  ratings: Rating[];
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

export interface AppState {
  templates: Template[];
  entries: Entry[];
  categories: Category[];
  tags: Tag[];
  darkMode: boolean;
}

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isSuperAdmin?: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  darkMode: boolean;
  notifications: {
    journal: boolean;
    insights: boolean;
  };
}

// AI Coach related types
export type QuestionType = 'text' | 'yesno' | 'slider' | 'dynamic_checkbox_group';

export interface LifeArea {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  userId?: string; // Added for Supabase compatibility
}

export interface AIPrompt {
  id: string;
  name: string;
  systemPrompt: string;
  lifeAreaId: string | null;
  isActive: boolean;
  isGlobal: boolean;
  userId?: string;
}

export interface AICoachSession {
  id: string;
  title: string;
  summary: string | null;
  lifeAreaId: string | null;
  promptId?: string | null;
  isActive: boolean;
  startedAt: Date;
  endedAt: Date | null;
  tags: Tag[];
  userId?: string;
}

export interface AICoachInteraction {
  id: string;
  sessionId: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  tokensUsed: number | null;
  createdAt: Date;
}

export interface AICoachMessage {
  id: string;
  sessionId: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  tokensUsed: number | null;
  createdAt: Date;
}
