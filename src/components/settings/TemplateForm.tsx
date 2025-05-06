
import React, { useState } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { Template, Question, TemplateType, QuestionType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface TemplateFormProps {
  onSave: () => void;
  initialTemplate?: Template;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({ onSave, initialTemplate }) => {
  const { addTemplate, updateTemplate } = useJournal();
  
  const [template, setTemplate] = useState<Omit<Template, 'id'>>({
    name: initialTemplate?.name || '',
    type: initialTemplate?.type || 'sod',
    questions: initialTemplate?.questions || [
      { id: uuidv4(), text: '', type: 'text', order: 0 }
    ]
  });
  
  const handleTypeChange = (value: string) => {
    setTemplate(prev => ({
      ...prev,
      type: value as TemplateType
    }));
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplate(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  
  const handleQuestionTextChange = (index: number, text: string) => {
    setTemplate(prev => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], text };
      return { ...prev, questions };
    });
  };
  
  const handleQuestionTypeChange = (index: number, type: string) => {
    setTemplate(prev => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], type: type as QuestionType };
      return { ...prev, questions };
    });
  };
  
  const addQuestion = () => {
    setTemplate(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { id: uuidv4(), text: '', type: 'text', order: prev.questions.length }
      ]
    }));
  };
  
  const removeQuestion = (index: number) => {
    setTemplate(prev => {
      const questions = prev.questions.filter((_, i) => i !== index);
      // Reorder questions
      const reorderedQuestions = questions.map((q, i) => ({ ...q, order: i }));
      return { ...prev, questions: reorderedQuestions };
    });
  };
  
  const moveQuestionUp = (index: number) => {
    if (index === 0) return;
    
    setTemplate(prev => {
      const questions = [...prev.questions];
      [questions[index - 1], questions[index]] = [questions[index], questions[index - 1]];
      // Update order
      return { ...prev, questions: questions.map((q, i) => ({ ...q, order: i })) };
    });
  };
  
  const moveQuestionDown = (index: number) => {
    if (index === template.questions.length - 1) return;
    
    setTemplate(prev => {
      const questions = [...prev.questions];
      [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]];
      // Update order
      return { ...prev, questions: questions.map((q, i) => ({ ...q, order: i })) };
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!template.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    
    if (template.questions.some(q => !q.text.trim())) {
      toast.error('All questions must have text');
      return;
    }
    
    try {
      if (initialTemplate) {
        updateTemplate({
          ...template,
          id: initialTemplate.id
        });
        toast.success('Template updated successfully');
      } else {
        addTemplate(template);
        toast.success('New template created');
      }
      onSave();
    } catch (error) {
      toast.error('There was an error saving the template');
      console.error('Error saving template:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {initialTemplate ? 'Edit Template' : 'Create New Template'}
          </CardTitle>
          <CardDescription>
            Define the questions for your journal entries
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={template.name}
              onChange={handleNameChange}
              placeholder="e.g., Morning Reflection"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template-type">Template Type</Label>
            <Select
              value={template.type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger id="template-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sod">Morning (Start of Day)</SelectItem>
                <SelectItem value="eod">Evening (End of Day)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <Label>Questions</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addQuestion}
              >
                <Plus size={16} className="mr-1" /> Add Question
              </Button>
            </div>
            
            {template.questions.map((question, index) => (
              <div key={question.id} className="border p-4 rounded-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`question-${index}`}>Question Text</Label>
                  <Input
                    id={`question-${index}`}
                    value={question.text}
                    onChange={(e) => handleQuestionTextChange(index, e.target.value)}
                    placeholder="Enter question here..."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`question-type-${index}`}>Question Type</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value) => handleQuestionTypeChange(index, value)}
                  >
                    <SelectTrigger id={`question-type-${index}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Long Text</SelectItem>
                      <SelectItem value="yesno">Yes/No</SelectItem>
                      <SelectItem value="slider">Slider (1-10)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between mt-4">
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveQuestionUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUp size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveQuestionDown(index)}
                      disabled={index === template.questions.length - 1}
                    >
                      <ArrowDown size={16} />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeQuestion(index)}
                    disabled={template.questions.length === 1}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onSave}>
          Cancel
        </Button>
        <Button type="submit">
          {initialTemplate ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
};
