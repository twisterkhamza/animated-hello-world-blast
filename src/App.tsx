
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { JournalProvider } from "@/contexts/JournalContext";

// Pages
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import CalendarView from "@/pages/CalendarView";
import Settings from "@/pages/Settings";
import NewEntry from "@/pages/NewEntry";
import EditEntry from "@/pages/EditEntry";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <JournalProvider>
      <TooltipProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/entry/new" element={<NewEntry />} />
              <Route path="/entry/edit/:id" element={<EditEntry />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </JournalProvider>
  </QueryClientProvider>
);

export default App;
