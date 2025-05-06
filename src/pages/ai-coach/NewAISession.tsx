
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowLeft, Loader2 } from 'lucide-react';
import { LifeArea } from '@/types';
import { fetchLifeAreas, createSession } from '@/services/aiCoachService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function NewAISession() {
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<LifeArea | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  useEffect(() => {
    const loadLifeAreas = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const areas = await fetchLifeAreas();
        setLifeAreas(areas);
      } catch (error) {
        console.error('Error loading life areas:', error);
        toast({
          title: 'Error loading life areas',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLifeAreas();
  }, [isAuthenticated]);
  
  const handleStartSession = async () => {
    if (!selectedArea) return;
    
    try {
      setIsSubmitting(true);
      
      const newSession = await createSession({
        title: sessionTitle,
        lifeAreaId: selectedArea.id,
        isActive: true,
        summary: null,
      });
      
      toast({
        title: 'Session created',
        description: 'Your coaching session has been created',
      });
      
      // In a real app, navigate to the session page
      navigate('/ai-coach');
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: 'Error creating session',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate('/ai-coach')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to AI Coach
      </Button>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create New AI Coaching Session</h1>
        <p className="text-muted-foreground mb-8">
          Select a life area and name your session to get started.
        </p>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Select a Life Area</h2>
            {lifeAreas.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/20">
                <h3 className="text-lg font-medium mb-2">No life areas found</h3>
                <p className="text-muted-foreground mb-4">You need to create life areas before starting a coaching session.</p>
                <Button onClick={() => navigate('/ai-coach/areas')}>
                  Create Life Areas
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lifeAreas.map(area => (
                  <Card 
                    key={area.id}
                    className={`cursor-pointer transition-all ${
                      selectedArea?.id === area.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedArea(area)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center" 
                          style={{ backgroundColor: area.color || '#e2e8f0' }}
                        >
                          <span role="img" aria-label={area.name}>
                            {area.icon}
                          </span>
                        </div>
                        <CardTitle className="text-lg">{area.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{area.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Name Your Session</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="session-title">Session Title</Label>
                  <Input 
                    id="session-title"
                    placeholder="e.g., Setting my fitness goals"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Give your session a descriptive name to help you remember what it's about.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button 
            className="w-full"
            size="lg"
            disabled={!selectedArea || !sessionTitle.trim() || isSubmitting || lifeAreas.length === 0}
            onClick={handleStartSession}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating session...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" /> Start Coaching Session
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
