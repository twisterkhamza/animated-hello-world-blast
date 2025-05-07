
import React, { useState, useEffect } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { Template, Question, Category, Rating, TemplateType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DialogClose } from '@/components/ui/dialog';

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
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
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
        text: template.questions.find(q => q.id === questionId)?.text || 
              customQuestions.find(q => q.id === questionId)?.text || '',
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
      
      navigate('/dashboard');
    } catch (error) {
      toast.error('There was an error saving your entry');
      console.error('Error saving entry:', error);
    }
  };

  const handleAddCustomQuestion = () => {
    if (!newQuestion.trim()) return;
    
    const customQuestion: Question = {
      id: `custom-${Date.now()}`,
      text: newQuestion,
      type: 'text',
      order: template.questions.length + customQuestions.length + 1,
    };
    
    setCustomQuestions([...customQuestions, customQuestion]);
    setNewQuestion('');
    setDialogOpen(false);
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
            {/* Template questions */}
            {template.questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={question.id}>{question.text}</Label>
                <RichTextEditor
                  value={answers[question.id]?.value || ''}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  placeholder="Type your answer here..."
                />
              </div>
            ))}
            
            {/* Custom questions */}
            {customQuestions.map((question) => (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={question.id}>{question.text}</Label>
                <RichTextEditor
                  value={answers[question.id]?.value || ''}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  placeholder="Type your answer here..."
                />
              </div>
            ))}
            
            {/* Add custom question button - only shown once at the bottom */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mt-6" type="button">
                  <Plus className="mr-2 h-4 w-4" /> Add Custom Question
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Question</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-question">Question</Label>
                    <Input
                      id="custom-question"
                      placeholder="Enter your question"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCustomQuestion} type="button">
                    Add Question
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
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
