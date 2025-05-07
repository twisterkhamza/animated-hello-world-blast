
import { useJournal } from '@/contexts/JournalContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Home, Plus, Settings, Sun, Moon, BookOpen, Notebook, ChevronRight, Bot, Menu } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

export function AppSidebar() {
  const { state, toggleDarkMode, user } = useJournal();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-5">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-journal-purple w-8 h-8 flex items-center justify-center">
              <span className="text-white font-semibold">ES</span>
            </div>
            <span className="font-semibold text-lg">Echo of Self</span>
          </div>
          <SidebarTrigger>
            <Button variant="ghost" size="icon">
              <Menu size={18} />
            </Button>
          </SidebarTrigger>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex items-center gap-3">
                    <Home size={18} />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Notebook size={18} />
                        <span>Journal</span>
                      </div>
                      <ChevronRight size={16} className="transition-transform group-data-[state=open]:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-7 mt-1 space-y-1">
                    <Link to="/entry/new?type=sod" className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                      <Sun size={15} />
                      <span>Morning Entry</span>
                    </Link>
                    <Link to="/entry/new?type=eod" className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                      <Moon size={15} />
                      <span>Evening Entry</span>
                    </Link>
                    <Link to="/calendar" className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                      <Calendar size={15} />
                      <span>Calendar View</span>
                    </Link>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 w-full mt-2" asChild>
                      <Link to="/entry/new?type=sod">
                        <Plus size={15} />
                        <span>New Entry</span>
                      </Link>
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Bot size={18} />
                        <span>AI Coach</span>
                      </div>
                      <ChevronRight size={16} className="transition-transform group-data-[state=open]:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-7 mt-1 space-y-1">
                    <Link to="/ai-coach" className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                      <BookOpen size={15} />
                      <span>All Sessions</span>
                    </Link>
                    <Link to="/ai-coach/areas" className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                      <Calendar size={15} />
                      <span>Life Areas</span>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2 w-full mt-2"
                      asChild
                    >
                      <Link to="/ai-coach/new">
                        <Plus size={15} />
                        <span>New Session</span>
                      </Link>
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/settings" className="flex items-center gap-3">
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-medium">
              {user?.firstName || 'User'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {state.darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>
      </SidebarFooter>
      
      {/* Add the SidebarRail to allow expanding a collapsed sidebar */}
      <SidebarRail />
    </Sidebar>
  );
}

