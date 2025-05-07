
import React, { useState } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { JournalCard } from '@/components/journal/JournalCard';
import { JournalTimeline } from '@/components/journal/JournalTimeline';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sun, Moon, AlertCircle, Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Dashboard = () => {
  const { state, deleteEntry } = useJournal();
  const navigate = useNavigate();
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('timeline');
  
  const handleNewEntry = (type: 'sod' | 'eod') => {
    navigate(`/entry/new?type=${type}`);
  };
  
  const handleEditEntry = (id: string) => {
    navigate(`/entry/edit/${id}`);
  };
  
  const confirmDelete = (id: string) => {
    setEntryToDelete(id);
  };
  
  const handleDeleteEntry = () => {
    if (entryToDelete) {
      deleteEntry(entryToDelete);
      setEntryToDelete(null);
    }
  };
  
  const sortedEntries = [...state.entries].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return (
    <div className="animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Your Journal</h1>
          <p className="text-muted-foreground">
            Record your daily reflections and track your well-being
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={() => handleNewEntry('sod')} variant="outline" className="flex-1 md:flex-none">
            <Sun className="mr-2 h-4 w-4" />
            Morning Entry
          </Button>
          <Button onClick={() => handleNewEntry('eod')} className="flex-1 md:flex-none">
            <Moon className="mr-2 h-4 w-4" />
            Evening Entry
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="timeline" className="mb-8">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-4">
          <JournalTimeline 
            entries={sortedEntries}
            onEdit={handleEditEntry}
            onDelete={confirmDelete}
          />
        </TabsContent>
        
        <TabsContent value="cards" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {sortedEntries.map(entry => (
              <JournalCard 
                key={entry.id} 
                entry={entry}
                onEdit={handleEditEntry}
                onDelete={confirmDelete}
              />
            ))}
            
            {sortedEntries.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <p className="text-muted-foreground">No journal entries yet. Start your journaling journey today!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Show tip only if there are no entries */}
      {sortedEntries.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Getting Started</AlertTitle>
          <AlertDescription>
            Try creating a morning entry to set intentions for your day, or an evening entry to reflect on your experiences.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your journal entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntry} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
