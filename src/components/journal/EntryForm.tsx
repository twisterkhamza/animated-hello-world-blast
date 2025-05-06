
import React, { useState, useEffect } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { Template, Question, Category, Rating, TemplateType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';

interface EntryFormProps {
  type: TemplateType;
  entryId?: string;
}

export const EntryForm: React.FC<EntryFormProps> = ({ type, entryId }) => {
  const { state, createEntry, updateEntry } = useJournal();
  const navigate = useNavigate();
  
  // Find the template to use based on type
  const template = state.templates.find(t => t.type === type) || state.templates[0];
  
  // Find relevant categories
  const categories = state.categories.filter(c => c.type === type);
  
  // State for form values
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  
  // If we're editing, fetch the existing entry
  useEffect(() => {
    if (entryId) {
      const entry = state.entries.find(e => e.id === entryId);
      if (entry) {
        setAnswers(entry.answers);
        
        // Set ratings
        const ratingValues: Record<string, number> = {};
        entry.ratings.forEach(r => {
          ratingValues[r.category] = r.value;
        });
        setRatings(ratingValues);
      }
    }
  }, [entryId, state.entries]);
  
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        text: template.questions.find(q => q.id === questionId)?.text || '',
        value
      }
    }));
  };
  
  const handleRatingChange = (categoryId: string, value: number) => {
    setRatings(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert ratings to array format
    const ratingsArray = Object.entries(ratings).map(([category, value]) => ({
      category,
      value
    }));
    
    try {
      if (entryId) {
        updateEntry(entryId, answers, ratingsArray);
        toast.success('Journal entry updated successfully');
      } else {
        createEntry(template.id, answers, ratingsArray);
        toast.success('New journal entry created');
      }
      
      navigate('/');
    } catch (error) {
      toast.error('There was an error saving your entry');
      console.error('Error saving entry:', error);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {type === 'sod' ? 'Morning Reflection' : 'Evening Reflection'}
            </CardTitle>
            <CardDescription>
              {type === 'sod' 
                ? 'Start your day with a moment of reflection' 
                : 'Reflect on your day and acknowledge your achievements'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {template.questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={question.id}>{question.text}</Label>
                
                {question.type === 'text' ? (
                  <Textarea
                    id={question.id}
                    value={answers[question.id]?.value || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[100px]"
                  />
                ) : (
                  <Input
                    id={question.id}
                    value={answers[question.id]?.value || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Type your answer here..."
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
        
        {categories.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>How do you feel?</CardTitle>
              <CardDescription>
                Rate how you're feeling in these areas (1-10)
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {categories.map((category) => (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>{category.name}</Label>
                    <span className="text-sm font-medium">
                      {ratings[category.id] || 5}/10
                    </span>
                  </div>
                  <Slider
                    defaultValue={[ratings[category.id] || 5]}
                    max={10}
                    min={1}
                    step={1}
                    onValueChange={(value) => handleRatingChange(category.id, value[0])}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button type="submit">
            {entryId ? 'Update Entry' : 'Save Entry'}
          </Button>
        </div>
      </form>
    </div>
  );
};
