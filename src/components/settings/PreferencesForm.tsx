
import React from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';

export const PreferencesForm: React.FC = () => {
  const { user, state, updateUserPreferences, toggleDarkMode } = useJournal();
  
  const handleDarkModeToggle = () => {
    toggleDarkMode();
    toast.success(`Dark mode ${state.darkMode ? 'disabled' : 'enabled'}`);
  };
  
  const handleJournalNotificationsToggle = () => {
    if (user) {
      updateUserPreferences({
        notifications: {
          ...user.preferences.notifications,
          journal: !user.preferences.notifications.journal
        }
      });
      toast.success(`Journal reminders ${user.preferences.notifications.journal ? 'disabled' : 'enabled'}`);
    }
  };
  
  const handleInsightsNotificationsToggle = () => {
    if (user) {
      updateUserPreferences({
        notifications: {
          ...user.preferences.notifications,
          insights: !user.preferences.notifications.insights
        }
      });
      toast.success(`Insights notifications ${user.preferences.notifications.insights ? 'disabled' : 'enabled'}`);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize your application experience
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">
              Switch to dark theme for low-light environments
            </p>
          </div>
          <Switch
            id="dark-mode"
            checked={state.darkMode}
            onCheckedChange={handleDarkModeToggle}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="journal-notifications">Journal Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Get reminders to complete your daily journal entries
            </p>
          </div>
          <Switch
            id="journal-notifications"
            checked={user?.preferences.notifications.journal || false}
            onCheckedChange={handleJournalNotificationsToggle}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="insights-notifications">Insights Updates</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications about new insights from your journal
            </p>
          </div>
          <Switch
            id="insights-notifications"
            checked={user?.preferences.notifications.insights || false}
            onCheckedChange={handleInsightsNotificationsToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};
