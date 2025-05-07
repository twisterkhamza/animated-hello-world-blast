
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { AICoachMessage, AICoachSession, LifeArea } from '@/types';
import { fetchMessages, sendMessage, transcribeAudio } from '@/services/aiChatService';
import { fetchLifeAreas, fetchSessions } from '@/services/aiCoachService';
import { ChatMessage } from '@/components/ai-coach/ChatMessage';
import { VoiceRecorder } from '@/components/ai-coach/VoiceRecorder';
import { useJournal } from '@/contexts/JournalContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useJournal();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [session, setSession] = useState<AICoachSession | null>(null);
  const [lifeArea, setLifeArea] = useState<LifeArea | null>(null);
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Redirect to authentication page if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // Fetch session details and messages
  useEffect(() => {
    const loadSessionData = async () => {
      if (!id || !isAuthenticated) return;
      
      try {
        setIsLoading(true);
        
        // Fetch session data
        const sessions = await fetchSessions();
        const currentSession = sessions.find(s => s.id === id);
        
        if (!currentSession) {
          toast({
            title: 'Session not found',
            description: 'The requested coaching session could not be found',
            variant: 'destructive',
          });
          navigate('/ai-coach');
          return;
        }
        
        setSession(currentSession);
        
        // Fetch life area data
        if (currentSession.lifeAreaId) {
          const areas = await fetchLifeAreas();
          const area = areas.find(a => a.id === currentSession.lifeAreaId);
          if (area) setLifeArea(area);
        }
        
        // Fetch messages
        const sessionMessages = await fetchMessages(id);
        setMessages(sessionMessages);
        
      } catch (error) {
        console.error('Error loading session data:', error);
        toast({
          title: 'Error loading session',
          description: 'There was a problem loading the coaching session',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSessionData();
  }, [id, isAuthenticated, navigate, toast]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !id) return;
    
    const messageContent = inputValue.trim();
    setInputValue('');
    setIsSending(true);
    
    try {
      // Optimistically add the user message
      const userMessage: AICoachMessage = {
        id: 'temp-' + Date.now(),
        sessionId: id,
        role: 'user',
        content: messageContent,
        tokensUsed: null,
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Add temporary assistant message showing typing indicator
      const tempAssistantMessage: AICoachMessage = {
        id: 'temp-assistant-' + Date.now(),
        sessionId: id,
        role: 'assistant',
        content: '...',
        tokensUsed: null,
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, tempAssistantMessage]);
      
      // Send to backend and get real response
      const response = await sendMessage(id, messageContent);
      
      // Replace temporary assistant message with real response
      setMessages(prev => prev
        .filter(msg => msg.id !== 'temp-assistant-' + Date.now())
        .concat(response)
      );
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        description: 'Your message could not be sent. Please try again.',
        variant: 'destructive',
      });
      
      // Remove the temporary messages
      setMessages(prev => prev.filter(
        msg => !msg.id.startsWith('temp-')
      ));
      
      // Restore the input value
      setInputValue(messageContent);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter (without shift key for newline)
    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleTranscriptionComplete = (text: string) => {
    setInputValue(prev => prev + (prev ? ' ' : '') + text);
    toast({
      title: 'Voice transcription complete',
      description: 'Your voice has been transcribed to text.',
    });
  };
  
  const handleTranscriptionError = (error: Error) => {
    toast({
      title: 'Transcription error',
      description: error.message || 'Failed to transcribe audio',
      variant: 'destructive',
    });
  };
  
  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading coaching session...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The coaching session you requested could not be found.
          </p>
          <Button onClick={() => navigate('/ai-coach')}>
            Back to AI Coach
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost"
          onClick={() => navigate('/ai-coach')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sessions
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold">{session.title}</h1>
          {lifeArea && (
            <div className="flex items-center mt-1">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: lifeArea.color || 'currentColor' }} 
              />
              <span className="text-sm text-muted-foreground">
                {lifeArea.name}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <Card className="mb-4">
        <CardContent className="p-0 relative">
          <div className="h-[60vh] overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <p>Start your coaching conversation by sending a message.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(message => (
                  <ChatMessage key={message.id} message={message} user={user} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <div className="p-4 border-t bg-background sticky bottom-0">
            <div className="flex flex-col gap-3">
              <Textarea
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                className="resize-none"
                disabled={isSending}
              />
              
              <div className="flex justify-between items-center">
                <VoiceRecorder
                  onTranscriptionComplete={handleTranscriptionComplete}
                  onTranscriptionError={handleTranscriptionError}
                  transcribeFunction={transcribeAudio}
                />
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isSending}
                >
                  {isSending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
