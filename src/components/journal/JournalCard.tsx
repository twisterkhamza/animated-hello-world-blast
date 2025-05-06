
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Entry } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';

interface JournalCardProps {
  entry: Entry;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({ entry, onEdit, onDelete }) => {
  const isEveningEntry = entry.templateId === '2';
  
  // Get the first answer as preview
  const previewAnswer = Object.values(entry.answers)[0]?.value || '';
  const preview = previewAnswer.length > 100 
    ? `${previewAnswer.substring(0, 100)}...` 
    : previewAnswer;
  
  const formattedDate = formatDistanceToNow(entry.timestamp, { addSuffix: true });
  
  return (
    <Card className={`mb-4 hover:shadow-md transition-shadow ${isEveningEntry ? 'border-l-4 border-l-journal-purple' : 'border-l-4 border-l-journal-softBlue'}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-medium">
            {isEveningEntry ? 'Evening Reflection' : 'Morning Reflection'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEdit(entry.id)}
          >
            <Edit size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-2">{preview}</p>
        {entry.ratings.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {entry.ratings.map((rating) => (
              <div 
                key={rating.id} 
                className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground flex items-center gap-1"
              >
                <span>{rating.category === '1' ? 'Energy' : 
                       rating.category === '2' ? 'Mood' : 
                       rating.category === '3' ? 'Productivity' :
                       rating.category === '4' ? 'Stress' : 'Satisfaction'}:</span>
                <span className="font-medium">{rating.value}/10</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
