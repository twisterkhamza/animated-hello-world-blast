
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LifeArea } from '@/types';
import { fetchLifeAreas } from '@/services/aiCoachService';

export function AICoachSettings() {
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  
  const { toast } = useToast();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load life areas
        const areas = await fetchLifeAreas();
        setLifeAreas(areas);
        
        // Load existing prompts
        const { data: promptsData, error: promptsError } = await supabase
          .from('ai_coach_prompts')
          .select('life_area_id, system_prompt')
          .eq('is_active', true);
        
        if (promptsError) throw promptsError;
        
        // Create a map of life area ID to prompt
        const promptsMap: Record<string, string> = {};
        promptsData?.forEach(p => {
          promptsMap[p.life_area_id] = p.system_prompt;
        });
        
        setPrompts(promptsMap);
      } catch (error) {
        console.error('Error loading AI coach settings:', error);
        toast({
          title: 'Error loading settings',
          description: 'Failed to load AI coach settings',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);
  
  const handleSavePrompt = async (lifeAreaId: string) => {
    try {
      setIsSaving(prev => ({ ...prev, [lifeAreaId]: true }));
      
      const prompt = prompts[lifeAreaId] || '';
      
      // Get the authenticated user
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session?.user) {
        throw new Error('User not authenticated');
      }
      
      const userId = sessionData.session.user.id;
      
      // Check if prompt exists
      const { data: existingPrompt, error: checkError } = await supabase
        .from('ai_coach_prompts')
        .select('id')
        .eq('life_area_id', lifeAreaId)
        .eq('is_active', true)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingPrompt) {
        // Update existing prompt
        const { error: updateError } = await supabase
          .from('ai_coach_prompts')
          .update({ 
            system_prompt: prompt,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPrompt.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new prompt
        const { error: insertError } = await supabase
          .from('ai_coach_prompts')
          .insert({
            life_area_id: lifeAreaId,
            system_prompt: prompt,
            created_by: userId,
            is_active: true
          });
        
        if (insertError) throw insertError;
      }
      
      toast({
        title: 'Prompt saved',
        description: 'The AI coach prompt has been updated',
      });
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: 'Error saving prompt',
        description: 'Failed to save the AI coach prompt',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(prev => ({ ...prev, [lifeAreaId]: false }));
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // Helper function to get default prompt for life area
  const getDefaultPrompt = (area: LifeArea) => {
    return `You are an AI coach specializing in ${area.name}. 
Your goal is to help users improve in this area through thoughtful guidance, 
practical advice, and insightful questions. Be supportive, encouraging, and 
focused on helping the user make progress.`;
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">AI Coach System Prompts</h2>
        <p className="text-muted-foreground mb-6">
          Customize the AI coach system prompts for each life area. These prompts guide the AI's behavior and responses during coaching sessions.
        </p>
        
        <div className="space-y-6">
          {lifeAreas.map(area => (
            <Card key={area.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <span 
                    className="inline-block w-5 h-5 rounded-full" 
                    style={{ backgroundColor: area.color || 'currentColor' }}
                  />
                  {area.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor={`prompt-${area.id}`}>System Prompt</Label>
                  <Textarea
                    id={`prompt-${area.id}`}
                    rows={8}
                    placeholder={getDefaultPrompt(area)}
                    value={prompts[area.id] || ''}
                    onChange={e => setPrompts(prev => ({ ...prev, [area.id]: e.target.value }))}
                  />
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={() => handleSavePrompt(area.id)}
                      disabled={isSaving[area.id]}
                    >
                      {isSaving[area.id] ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Prompt
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {lifeAreas.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No life areas found. Add life areas to customize AI coach prompts.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
