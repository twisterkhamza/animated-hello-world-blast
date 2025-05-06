
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

export default function LifeAreas() {
  const navigate = useNavigate();
  const [lifeAreas] = useState<LifeArea[]>(mockLifeAreas);

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate('/ai-coach')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to AI Coach
      </Button>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Life Areas</h1>
          <p className="text-muted-foreground mt-2">
            Manage the different areas of your life for AI coaching.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Area
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lifeAreas.map((area) => (
          <Card key={area.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: area.color || '#e2e8f0' }}
                  >
                    <span className="text-white">{area.icon}</span>
                  </div>
                  <CardTitle>{area.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{area.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
