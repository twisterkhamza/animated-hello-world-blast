
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Template, Category, Entry, Rating, User, UserPreferences, Tag } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock data for the app
const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Morning Reflection',
    type: 'sod',
    questions: [
      {
        id: '1-1',
        text: 'How did you sleep last night?',
        type: 'text',
        order: 0
      },
      {
        id: '1-2',
        text: 'What are you grateful for today?',
        type: 'text',
        order: 1
      },
      {
        id: '1-3',
        text: 'What are your top priorities for today?',
        type: 'text',
        order: 2
      }
    ]
  },
  {
    id: '2',
    name: 'Evening Reflection',
    type: 'eod',
    questions: [
      {
        id: '2-1',
        text: 'What went well today?',
        type: 'text',
        order: 0
      },
      {
        id: '2-2',
        text: 'What challenges did you face?',
        type: 'text',
        order: 1
      },
      {
        id: '2-3',
        text: 'What are you looking forward to tomorrow?',
        type: 'text',
        order: 2
      }
    ]
  }
];

const mockCategories: Category[] = [
  { id: '1', name: 'Energy', type: 'sod' },
  { id: '2', name: 'Mood', type: 'sod' },
  { id: '3', name: 'Productivity', type: 'eod' },
  { id: '4', name: 'Stress', type: 'eod' },
  { id: '5', name: 'Overall Satisfaction', type: 'eod' }
];

const mockEntries: Entry[] = [
  {
    id: '1',
    templateId: '1',
    timestamp: new Date('2025-05-06T08:00:00'),
    answers: {
      '1-1': { text: 'How did you sleep last night?', value: 'I slept really well!' },
      '1-2': { text: 'What are you grateful for today?', value: 'My family, health, and this beautiful day.' },
      '1-3': { text: 'What are your top priorities for today?', value: 'Complete the project presentation and go for a run.' }
    },
    ratings: [
      { id: '1', category: '1', value: 8, timestamp: new Date('2025-05-06T08:00:00') },
      { id: '2', category: '2', value: 9, timestamp: new Date('2025-05-06T08:00:00') }
    ]
  },
  {
    id: '2',
    templateId: '2',
    timestamp: new Date('2025-05-05T21:00:00'),
    answers: {
      '2-1': { text: 'What went well today?', value: 'I finished my presentation ahead of schedule.' },
      '2-2': { text: 'What challenges did you face?', value: 'Had some technical issues with my computer.' },
      '2-3': { text: 'What are you looking forward to tomorrow?', value: 'The team meeting and trying the new café for lunch.' }
    },
    ratings: [
      { id: '3', category: '3', value: 7, timestamp: new Date('2025-05-05T21:00:00') },
      { id: '4', category: '4', value: 4, timestamp: new Date('2025-05-05T21:00:00') },
      { id: '5', category: '5', value: 8, timestamp: new Date('2025-05-05T21:00:00') }
    ]
  }
];

const mockTags: Tag[] = [
  { id: '1', name: 'Work' },
  { id: '2', name: 'Health' },
  { id: '3', name: 'Personal' },
  { id: '4', name: 'Family' },
  { id: '5', name: 'Goals' }
];

const defaultPreferences: UserPreferences = {
  darkMode: false,
  notifications: {
    journal: true,
    insights: false
  }
};

const mockUser: User = {
  id: '1',
  firstName: 'Sam',
  lastName: 'Johnson',
  preferences: defaultPreferences
};

// Define the context value type
interface JournalContextValue {
  state: AppState;
  user: User | null;
  loading: boolean;
  toggleDarkMode: () => void;
  addTemplate: (template: Omit<Template, 'id'>) => string;
  updateTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => string;
  deleteCategory: (id: string) => void;
  createEntry: (templateId: string, answers: Record<string, any>, ratings: Omit<Rating, 'id' | 'timestamp'>[]) => Entry;
  updateEntry: (entryId: string, answers: Record<string, any>, ratings: Omit<Rating, 'id' | 'timestamp'>[]) => boolean;
  deleteEntry: (entryId: string) => void;
  deleteMultipleEntries: (entryIds: string[]) => void;
  updateUserProfile: (profile: Partial<User>) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
}

// Create the context
const JournalContext = createContext<JournalContextValue | undefined>(undefined);

// Create a provider component
export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    templates: mockTemplates,
    entries: mockEntries,
    categories: mockCategories,
    tags: mockTags,
    darkMode: false
  });
  
  const [user, setUser] = useState<User | null>(mockUser);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Check for dark mode preference on mount
  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode) {
      const isDarkMode = JSON.parse(storedDarkMode);
      setState(prev => ({ ...prev, darkMode: isDarkMode }));
      
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Apply dark mode when state changes
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(state.darkMode));
  }, [state.darkMode]);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
    if (user) {
      setUser({
        ...user,
        preferences: {
          ...user.preferences,
          darkMode: !user.preferences.darkMode
        }
      });
    }
  };
  
  // Add a new template
  const addTemplate = (template: Omit<Template, 'id'>) => {
    const id = uuidv4();
    const newTemplate: Template = {
      ...template,
      id,
      questions: template.questions.map((q, i) => ({
        ...q,
        id: `${id}-${i}`,
        order: q.order || i
      }))
    };
    
    setState(prev => ({
      ...prev,
      templates: [...prev.templates, newTemplate]
    }));
    
    return id;
  };
  
  // Update an existing template
  const updateTemplate = (template: Template) => {
    setState(prev => ({
      ...prev,
      templates: prev.templates.map(t => 
        t.id === template.id ? template : t
      )
    }));
  };
  
  // Delete a template
  const deleteTemplate = (id: string) => {
    setState(prev => ({
      ...prev,
      templates: prev.templates.filter(t => t.id !== id)
    }));
  };
  
  // Add a new category
  const addCategory = (category: Omit<Category, 'id'>) => {
    const id = uuidv4();
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, { ...category, id }]
    }));
    return id;
  };
  
  // Delete a category
  const deleteCategory = (id: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id)
    }));
  };
  
  // Create a new journal entry
  const createEntry = (
    templateId: string, 
    answers: Record<string, any>, 
    ratings: Omit<Rating, 'id' | 'timestamp'>[]
  ): Entry => {
    const newEntry: Entry = {
      id: uuidv4(),
      templateId,
      timestamp: new Date(),
      answers,
      ratings: ratings.map(r => ({
        ...r,
        id: uuidv4(),
        timestamp: new Date()
      }))
    };
    
    setState(prev => ({
      ...prev,
      entries: [...prev.entries, newEntry]
    }));
    
    return newEntry;
  };
  
  // Update an existing entry
  const updateEntry = (
    entryId: string, 
    answers: Record<string, any>, 
    ratings: Omit<Rating, 'id' | 'timestamp'>[]
  ): boolean => {
    const entryExists = state.entries.some(e => e.id === entryId);
    
    if (!entryExists) {
      return false;
    }
    
    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e => {
        if (e.id !== entryId) return e;
        
        return {
          ...e,
          answers,
          ratings: ratings.map(r => ({
            ...r,
            id: uuidv4(),
            timestamp: new Date()
          }))
        };
      })
    }));
    
    return true;
  };
  
  // Delete an entry
  const deleteEntry = (entryId: string) => {
    setState(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.id !== entryId)
    }));
  };
  
  // Delete multiple entries
  const deleteMultipleEntries = (entryIds: string[]) => {
    setState(prev => ({
      ...prev,
      entries: prev.entries.filter(e => !entryIds.includes(e.id))
    }));
  };
  
  // Update user profile
  const updateUserProfile = (profile: Partial<User>) => {
    if (user) {
      setUser({
        ...user,
        ...profile
      });
    }
  };
  
  // Update user preferences
  const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
    if (user) {
      setUser({
        ...user,
        preferences: {
          ...user.preferences,
          ...preferences
        }
      });
      
      // Apply dark mode if it's part of the update
      if (preferences.darkMode !== undefined) {
        setState(prev => ({ ...prev, darkMode: preferences.darkMode as boolean }));
      }
    }
  };

  return (
    <JournalContext.Provider
      value={{
        state,
        user,
        loading,
        toggleDarkMode,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        addCategory,
        deleteCategory,
        createEntry,
        updateEntry,
        deleteEntry,
        deleteMultipleEntries,
        updateUserProfile,
        updateUserPreferences
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

// Create a hook for using the context
export const useJournal = () => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};
