
import React from 'react';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useJournal } from '@/contexts/JournalContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { state } = useJournal();

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full transition-colors duration-200 ${state.darkMode ? 'dark' : ''}`}>
        <AppSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
