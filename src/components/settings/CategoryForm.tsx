
import React, { useState } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { Category, TemplateType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';

interface CategoryFormProps {
  onSave: () => void;
  initialCategory?: Category;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ onSave, initialCategory }) => {
  const { addCategory } = useJournal();
  
  const [category, setCategory] = useState<Omit<Category, 'id'>>({
    name: initialCategory?.name || '',
    type: initialCategory?.type || 'sod'
  });
  
  const handleTypeChange = (value: string) => {
    setCategory(prev => ({
      ...prev,
      type: value as TemplateType
    }));
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      addCategory(category);
      toast.success('New category created');
      onSave();
    } catch (error) {
      toast.error('There was an error saving the category');
      console.error('Error saving category:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {initialCategory ? 'Edit Category' : 'Create New Category'}
          </CardTitle>
          <CardDescription>
            Add a new category to rate in your journal entries
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              value={category.name}
              onChange={handleNameChange}
              placeholder="e.g., Energy, Mood, Productivity"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category-type">Journal Type</Label>
            <Select
              value={category.type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger id="category-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sod">Morning Journal</SelectItem>
                <SelectItem value="eod">Evening Journal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onSave}>
          Cancel
        </Button>
        <Button type="submit">
          {initialCategory ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
};
