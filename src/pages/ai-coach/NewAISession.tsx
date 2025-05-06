
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowLeft } from 'lucide-react';
import { LifeArea } from '@/types';

// Mock life areas data - would come from your context or API in a real implementation
const mockLifeAreas: LifeArea[] = [
  {
    id: '1',
    name: 'Health & Fitness',
    description: 'Physical wellbeing, exercise, nutrition, and habits',
    color: '#4CAF50',
    icon: '🏋️',
    isActive: true
  },
  {
    id: '2',
    name: 'Career Growth',
    description: 'Professional development, skills, and work satisfaction',
    color: '#2196F3',
    icon: '💼',
    isActive: true
  },
  {
    id: '3',
    name: 'Relationships',
    description: 'Connections with family, friends, and partners',
    color: '#E91E63',
    icon: '💖',
    isActive: true
  },
  {
    id: '4',
    name: 'Personal Finance',
    description: 'Budgeting, saving, investing, and financial goals',
    color: '#FF9800',
    icon: '💰',
    isActive: true
  }
];

export default function NewAISession() {
  const [selectedArea, setSelectedArea] = useState<LifeArea | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const navigate = useNavigate();
  
  const handleStartSession = () => {
    // In a real implementation, you would:
    // 1. Create a new session in your database
    // 2. Navigate to the session interaction page
    
    // For now, we'll just navigate back to the main AI Coach page
    navigate('/ai-coach');
  };

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockLifeAreas.map(area => (
                <Card 
                  key={area.id}
                  className={`cursor-pointer transition-all ${
                    selectedArea?.id === area.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedArea(area)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl" role="img" aria-label={area.name}>
                        {area.icon}
                      </span>
                      <CardTitle className="text-lg">{area.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{area.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
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
            disabled={!selectedArea || !sessionTitle.trim()}
            onClick={handleStartSession}
          >
            <Bot className="mr-2 h-4 w-4" /> Start Coaching Session
          </Button>
        </div>
      </div>
    </div>
  );
}
