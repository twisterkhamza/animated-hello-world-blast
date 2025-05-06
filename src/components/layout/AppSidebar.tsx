
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
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Home, Plus, Settings, Sun, Moon, BookOpen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export function AppSidebar() {
  const { state, toggleDarkMode, user } = useJournal();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-journal-purple w-8 h-8 flex items-center justify-center">
            <span className="text-white font-semibold">ES</span>
          </div>
          <span className="font-semibold text-lg">Echo of Self</span>
        </div>
        <SidebarTrigger />
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
                <SidebarMenuButton asChild>
                  <Link to="/calendar" className="flex items-center gap-3">
                    <Calendar size={18} />
                    <span>Calendar View</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3 w-full justify-start">
                      <BookOpen size={18} />
                      <span>Journal</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 bg-popover">
                    <DropdownMenuItem asChild>
                      <Link to="/entry/new?type=sod" className="cursor-pointer flex items-center">
                        <Sun size={16} className="mr-2" />
                        <span>Morning Entry</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/entry/new?type=eod" className="cursor-pointer flex items-center">
                        <Moon size={16} className="mr-2" />
                        <span>Evening Entry</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
        
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel>Journal</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus size={16} className="mr-2" />
                    New Journal Entry
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-popover">
                  <DropdownMenuItem asChild>
                    <Link to="/entry/new?type=sod" className="cursor-pointer flex items-center">
                      <Sun size={16} className="mr-2" />
                      <span>Morning Entry</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/entry/new?type=eod" className="cursor-pointer flex items-center">
                      <Moon size={16} className="mr-2" />
                      <span>Evening Entry</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
    </Sidebar>
  );
}
