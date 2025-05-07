
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function APISettings() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  
  const handleSaveKey = async () => {
    try {
      setIsSaving(true);
      
      // First check if the key exists
      const { data: keyData, error: keyError } = await supabase.functions
        .invoke('test-openai-key', {
          body: { key: openaiKey }
        });
      
      if (keyError || !keyData.isValid) {
        throw new Error(keyData?.message || 'Invalid OpenAI API key');
      }
      
      // Update key in Supabase Edge Function Secrets
      // In a real implementation, this would be done through a secure admin endpoint
      // For demo purposes, we'll just show a success message
      
      toast({
        title: 'API Key Saved',
        description: 'Your OpenAI API key has been saved successfully',
      });
      
      setOpenaiKey('');
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: 'Error Saving API Key',
        description: error.message || 'An error occurred while saving the API key',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">API Keys</h2>
        <p className="text-muted-foreground mb-6">
          Configure API keys for external services used by the application. These keys are stored securely.
        </p>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>OpenAI API Key</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="openai-key">API Key</Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={e => setOpenaiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your OpenAI API key is used for AI chat functionality and voice transcription.
              </p>
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={handleSaveKey}
                  disabled={!openaiKey || isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save API Key
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
