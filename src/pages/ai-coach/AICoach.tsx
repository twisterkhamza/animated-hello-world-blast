
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Plus, List } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AICoach() {
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
              <Button variant="outline" size="sm">
                <span className="mr-1">🏋️</span> Health & Fitness
              </Button>
              <Button variant="outline" size="sm">
                <span className="mr-1">💼</span> Career Growth
              </Button>
              <Button variant="outline" size="sm">
                <span className="mr-1">💖</span> Relationships
              </Button>
              <Button variant="outline" size="sm">
                <span className="mr-1">💰</span> Personal Finance
              </Button>
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
              <p className="text-muted-foreground text-sm">No recent coaching sessions found.</p>
              <Button variant="link" size="sm" asChild>
                <Link to="/ai-coach/new">Start your first session</Link>
              </Button>
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
