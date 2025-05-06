
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Plus, List, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LifeArea, AICoachSession } from '@/types';
import { fetchLifeAreas, fetchSessions } from '@/services/aiCoachService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function AICoach() {
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [recentSessions, setRecentSessions] = useState<AICoachSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        
        const [areas, sessions] = await Promise.all([
          fetchLifeAreas(),
          fetchSessions()
        ]);
        
        setLifeAreas(areas);
        setRecentSessions(sessions.slice(0, 3)); // Get only the 3 most recent sessions
      } catch (error) {
        console.error('Error loading AI coach data:', error);
        toast({
          title: 'Error loading data',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading AI Coach...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">AI Coach</h1>
          <p className="text-muted-foreground mt-2">
            Your personal coach to help guide you through various aspects of your life.
          </p>
        </div>
        <Button asChild>
          <Link to="/ai-coach/new">
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get started with a coaching session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose a life area and start a guided coaching conversation with your AI Coach.
            </p>
            <div className="flex flex-wrap gap-2">
              {lifeAreas.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No life areas found. Create your first life area to get started.
                </p>
              ) : (
                lifeAreas.slice(0, 4).map(area => (
                  <Button 
                    key={area.id}
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigate('/ai-coach/new');
                    }}
                  >
                    <span className="mr-1">{area.icon}</span> {area.name}
                  </Button>
                ))
              )}
              <Link to="/ai-coach/areas">
                <Button variant="link" size="sm">
                  View all areas...
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Continue where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentSessions.length === 0 ? (
                <>
                  <p className="text-muted-foreground text-sm">No recent coaching sessions found.</p>
                  <Button variant="link" size="sm" asChild>
                    <Link to="/ai-coach/new">Start your first session</Link>
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  {recentSessions.map(session => (
                    <div 
                      key={session.id}
                      className="p-3 border rounded-md flex justify-between items-center hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        // In a full implementation, this would navigate to the session detail page
                        toast({
                          description: "Session details page not implemented yet",
                        });
                      }}
                    >
                      <div>
                        <div className="font-medium">{session.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(session.startedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        session.isActive ? 
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {session.isActive ? 'Active' : 'Completed'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">How AI Coaching Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bot size={20} className="text-primary" />
              </div>
              <CardTitle className="text-lg">1. Select a Life Area</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Choose a specific area of your life you want coaching on, from health to career to personal growth.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <List size={20} className="text-primary" />
              </div>
              <CardTitle className="text-lg">2. Set Context</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your coach integrates with your journal entries and goals to provide personalized guidance.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bot size={20} className="text-primary" />
              </div>
              <CardTitle className="text-lg">3. Get Guidance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Receive personalized coaching, actionable steps, and insights based on your specific situation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
