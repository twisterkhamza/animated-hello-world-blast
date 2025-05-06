
import React, { useState } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { JournalCard } from '@/components/journal/JournalCard';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { TemplateType } from '@/types';

const CalendarView = () => {
  const { state, deleteEntry } = useJournal();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Group entries by date
  const entriesByDate = state.entries.reduce<Record<string, typeof state.entries>>((acc, entry) => {
    const dateKey = format(entry.timestamp, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {});
  
  // Get entries for selected date
  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const selectedDateEntries = entriesByDate[selectedDateKey] || [];
  
  // Get morning and evening entries for the selected date
  const morningEntries = selectedDateEntries.filter(entry => entry.templateId === '1');
  const eveningEntries = selectedDateEntries.filter(entry => entry.templateId === '2');
  
  // Handler for calendar date with entries
  const hasMorningEntry = (day: Date): boolean => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return entriesByDate[dateStr]?.some(entry => entry.templateId === '1') || false;
  };
  
  const hasEveningEntry = (day: Date): boolean => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return entriesByDate[dateStr]?.some(entry => entry.templateId === '2') || false;
  };
  
  // Format date for display
  const formattedDate = selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : '';
  
  const handleEditEntry = (id: string) => {
    navigate(`/entry/edit/${id}`);
  };
  
  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      deleteEntry(id);
      toast.success('Journal entry deleted');
    }
  };
  
  // Create new entry for selected date
  const createEntryForDate = (type: TemplateType) => {
    if (selectedDate) {
      navigate(`/entry/new?type=${type}&date=${format(selectedDate, 'yyyy-MM-dd')}`);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Calendar View</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Journal Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiersStyles={{
                selected: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'white'
                }
              }}
              modifiers={{
                morning: (day) => hasMorningEntry(day),
                evening: (day) => hasEveningEntry(day),
              }}
              components={{
                DayContent: (props) => {
                  const isMorning = hasMorningEntry(props.date);
                  const isEvening = hasEveningEntry(props.date);
                  
                  return (
                    <div className="relative flex items-center justify-center w-full h-full">
                      <div>{props.date.getDate()}</div>
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                        {isMorning && (
                          <div className="w-1.5 h-1.5 rounded-full bg-journal-softBlue" />
                        )}
                        {isEvening && (
                          <div className="w-1.5 h-1.5 rounded-full bg-journal-purple" />
                        )}
                      </div>
                    </div>
                  );
                }
              }}
            />
          </CardContent>
        </Card>
        
        <div className="col-span-1 lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-2xl font-medium mb-2">{formattedDate}</h2>
            <div className="flex space-x-4">
              {!morningEntries.length && (
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => createEntryForDate('sod')}
                >
                  + Add Morning Entry
                </Badge>
              )}
              {!eveningEntries.length && (
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => createEntryForDate('eod')}
                >
                  + Add Evening Entry
                </Badge>
              )}
            </div>
          </div>
          
          {selectedDateEntries.length === 0 ? (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <p className="text-muted-foreground">No entries for this date</p>
            </div>
          ) : (
            <div className="space-y-6">
              {morningEntries.length > 0 && (
                <>
                  <h3 className="text-lg font-medium text-journal-softBlue">Morning Entry</h3>
                  {morningEntries.map(entry => (
                    <JournalCard
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEditEntry}
                      onDelete={handleDeleteEntry}
                    />
                  ))}
                </>
              )}
              
              {eveningEntries.length > 0 && (
                <>
                  <h3 className="text-lg font-medium text-journal-purple">Evening Entry</h3>
                  {eveningEntries.map(entry => (
                    <JournalCard
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEditEntry}
                      onDelete={handleDeleteEntry}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
