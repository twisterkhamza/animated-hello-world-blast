import React from 'react';
import { AICoachMessage } from '@/types';
import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: AICoachMessage;
  user: {
    firstName?: string;
    avatarUrl?: string;
  } | null;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, user }) => {
  const isUser = message.role === 'user';
  
  // Process message content to ensure proper rendering
  const processContent = (content: string) => {
    // If the content contains HTML tags, render it as HTML
    if (content.includes('<div>') || content.includes('<br>')) {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }
    
    // Otherwise render as plain text with preserved line breaks
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i !== content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };
  
  return (
    <div className={cn(
      'flex gap-3 mb-4',
      isUser ? 'flex-row-reverse' : ''
    )}>
      {isUser ? (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user?.firstName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      ) : (
        <Avatar className="h-8 w-8 mt-1 bg-journal-purple">
          <AvatarFallback className="bg-journal-purple text-white">
            <Bot size={16} />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        'max-w-[80%] rounded-xl px-4 py-3',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
      )}>
        <div className="text-sm whitespace-pre-wrap">
          {processContent(message.content)}
        </div>
        <div className={cn(
          'text-xs mt-1',
          isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          {format(new Date(message.createdAt), 'h:mm a')}
        </div>
      </div>
    </div>
  );
};
