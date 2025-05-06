
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LifeArea } from '@/types';
import { fetchLifeAreas, createLifeArea, updateLifeArea, deleteLifeArea } from '@/services/aiCoachService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ColorInput } from '@/components/ui/color-input';

// ColorInput component for color selection
const ColorInput = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
  return (
    <div className="flex gap-2 items-center">
      <div
        className="w-8 h-8 rounded border cursor-pointer"
        style={{ backgroundColor: value || '#e2e8f0' }}
        onClick={() => {
          const newColor = prompt('Enter color hex code (e.g. #4CAF50):', value);
          if (newColor) onChange(newColor);
        }}
      />
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1"
      />
    </div>
  );
};

export default function LifeAreas() {
  const navigate = useNavigate();
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingArea, setEditingArea] = useState<LifeArea | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#4CAF50');
  const [icon, setIcon] = useState('🏋️');
  
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

  const resetForm = () => {
    setName('');
    setDescription('');
    setColor('#4CAF50');
    setIcon('🏋️');
    setEditingArea(null);
  };

  const handleOpenDialog = (area?: LifeArea) => {
    if (area) {
      setEditingArea(area);
      setName(area.name);
      setDescription(area.description || '');
      setColor(area.color || '#4CAF50');
      setIcon(area.icon || '🏋️');
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveArea = async () => {
    try {
      setIsSubmitting(true);
      
      const areaData = {
        name,
        description,
        color,
        icon,
        is_active: true,
      };
      
      let savedArea;
      
      if (editingArea) {
        savedArea = await updateLifeArea(editingArea.id, areaData);
        toast({
          title: 'Life area updated',
          description: `"${name}" has been updated successfully`,
        });
      } else {
        savedArea = await createLifeArea(areaData);
        toast({
          title: 'Life area created',
          description: `"${name}" has been added to your life areas`,
        });
      }
      
      // Update the state
      setLifeAreas(prev => {
        if (editingArea) {
          return prev.map(area => area.id === editingArea.id ? savedArea : area);
        } else {
          return [...prev, savedArea];
        }
      });
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving life area:', error);
      toast({
        title: 'Error saving life area',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArea = async (areaId: string) => {
    if (!confirm('Are you sure you want to delete this life area?')) return;
    
    try {
      await deleteLifeArea(areaId);
      setLifeAreas(prev => prev.filter(area => area.id !== areaId));
      toast({
        title: 'Life area deleted',
        description: 'The life area has been removed',
      });
    } catch (error) {
      console.error('Error deleting life area:', error);
      toast({
        title: 'Error deleting life area',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading life areas...</p>
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
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Life Areas</h1>
          <p className="text-muted-foreground mt-2">
            Manage the different areas of your life for AI coaching.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Area
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingArea ? 'Edit Life Area' : 'Create New Life Area'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Health & Fitness"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Physical wellbeing, exercise, nutrition, and habits"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <ColorInput 
                    value={color} 
                    onChange={setColor} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="🏋️"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveArea} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {lifeAreas.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium mb-2">No life areas found</h3>
          <p className="text-muted-foreground mb-4">Create your first life area to get started with AI coaching.</p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Life Area
          </Button>
        </div>
      ) : (
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
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleOpenDialog(area)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteArea(area.id)}
                    >
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
      )}
    </div>
  );
}
