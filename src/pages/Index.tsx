
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Echo of Self</CardTitle>
          <CardDescription className="text-lg mt-2">
            A daily journal for self-reflection and personal growth
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Record your thoughts, track your mood, and discover patterns that help you grow.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col items-center p-4 rounded-lg bg-primary/10">
              <h3 className="font-medium">Morning Reflections</h3>
              <p className="text-sm text-center text-muted-foreground mt-2">
                Set intentions and prepare for a purposeful day
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-primary/10">
              <h3 className="font-medium">Evening Reviews</h3>
              <p className="text-sm text-center text-muted-foreground mt-2">
                Reflect on accomplishments and learn from challenges
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Link to="/dashboard">
            <Button size="lg">
              Start Journaling
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;
