
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Bot, Book, Calendar, LineChart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Echo of Self</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Your personal journal and AI coach to help you reflect, grow, and achieve your goals.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          {isAuthenticated ? (
            <Button size="lg" asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link to="/auth">Sign In / Sign Up</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
          <Book className="h-12 w-12 mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Daily Journal</h2>
          <p className="text-muted-foreground">
            Capture your thoughts, feelings, and experiences with morning and evening reflections.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
          <Bot className="h-12 w-12 mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">AI Coach</h2>
          <p className="text-muted-foreground">
            Get personalized guidance and insights from your AI coach based on your journal entries.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
          <Calendar className="h-12 w-12 mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Calendar View</h2>
          <p className="text-muted-foreground">
            Track your progress and see patterns over time with the interactive calendar.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card md:col-span-2 lg:col-span-3">
          <LineChart className="h-12 w-12 mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Insights Dashboard</h2>
          <p className="text-muted-foreground max-w-xl">
            Discover patterns, track your progress, and gain valuable insights about your habits, moods, and personal growth journey.
          </p>
        </div>
      </div>

      <div className="text-center mt-12">
        <p className="text-muted-foreground mb-4">
          Start your personal growth journey today
        </p>
        {isAuthenticated ? (
          <Button size="lg" asChild>
            <Link to="/entry/new">Create First Entry</Link>
          </Button>
        ) : (
          <Button size="lg" asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Index;
