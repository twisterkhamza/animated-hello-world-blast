
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Entry } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar } from 'lucide-react';

interface JournalTimelineProps {
  entries: Entry[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const JournalTimeline: React.FC<JournalTimelineProps> = ({
  entries,
  onEdit,
  onDelete,
}) => {
  // Group entries by month and year
  const groupedEntries = entries.reduce<Record<string, Entry[]>>((acc, entry) => {
    const date = new Date(entry.timestamp);
    const key = format(date, 'MMMM yyyy');
    
    if (!acc[key]) {
      acc[key] = [];
    }
    
    acc[key].push(entry);
    return acc;
  }, {});
  
  // Sort entries within each group by date (newest first)
  Object.keys(groupedEntries).forEach(key => {
    groupedEntries[key].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  });
  
  // Sort groups by date (newest first)
  const sortedGroups = Object.keys(groupedEntries).sort((a, b) => {
    const dateA = new Date(groupedEntries[a][0].timestamp);
    const dateB = new Date(groupedEntries[b][0].timestamp);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-8">
      {sortedGroups.map(group => (
        <div key={group} className="relative">
          <h3 className="text-xl font-semibold mb-4 sticky top-0 bg-background/95 backdrop-blur-sm py-2">
            {group}
          </h3>
          
          <div className="space-y-4">
            {groupedEntries[group].map(entry => {
              const date = new Date(entry.timestamp);
              const day = format(date, 'd');
              const dayName = format(date, 'EEE').toUpperCase();
              const timeStr = format(date, 'HH:mm');
              
              // Get the first answer as preview
              const previewAnswer = Object.values(entry.answers)[0]?.value || '';
              const previewText = previewAnswer.replace(/<[^>]*>?/gm, '');
              const preview = previewText.length > 120 
                ? `${previewText.substring(0, 120)}...` 
                : previewText;
              
              const isEveningEntry = entry.templateId === '2';
              
              return (
                <div key={entry.id} className="flex gap-4">
                  {/* Date column */}
                  <div className="w-16 flex flex-col items-center pt-2">
                    <div className="text-center">
                      <div className="font-medium">{dayName}</div>
                      <div className="text-2xl font-bold">{day}</div>
                      <div className="text-xs text-muted-foreground">{timeStr}</div>
                    </div>
                  </div>
                  
                  {/* Content column */}
                  <div className="flex-grow">
                    <Card className={`${isEveningEntry ? 'border-l-4 border-l-journal-purple' : 'border-l-4 border-l-journal-softBlue'} hover:shadow-md transition-shadow`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">
                            {isEveningEntry ? 'Evening Reflection' : 'Morning Reflection'}
                          </h4>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => onEdit(entry.id)}
                              className="h-8 w-8"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => onDelete(entry.id)}
                              className="h-8 w-8"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm line-clamp-3">{preview}</p>
                        
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {sortedGroups.length === 0 && (
        <div className="text-center my-12 py-8">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-1">No journal entries yet</h3>
          <p className="text-muted-foreground">Start journaling to see your entries here</p>
        </div>
      )}
    </div>
  );
};
