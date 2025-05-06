
// Type definitions for the journaling app

export type TemplateType = 'sod' | 'eod';

export type QuestionType = 'text' | 'yesno' | 'slider' | 'dynamic_checkbox_group';

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
  preferences: UserPreferences;
}

export interface UserPreferences {
  darkMode: boolean;
  notifications: {
    journal: boolean;
    insights: boolean;
  };
}
