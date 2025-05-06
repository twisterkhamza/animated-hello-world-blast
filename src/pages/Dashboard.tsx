
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useJournal } from '@/contexts/JournalContext';
import { JournalCard } from '@/components/journal/JournalCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/sonner';
import { Calendar, Plus } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { state, deleteEntry, user } = useJournal();
  const navigate = useNavigate();
  
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Get today's date
  const today = new Date();
  const dateString = format(today, 'EEEE, MMMM d, yyyy');
  
  // Group entries by date (YYYY-MM-DD)
  const entriesByDate = state.entries.reduce<Record<string, typeof state.entries>>((acc, entry) => {
    const dateKey = format(entry.timestamp, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {});
  
  // Sort dates in descending order
  const sortedDates = Object.keys(entriesByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });
  
  const handleEditEntry = (id: string) => {
    navigate(`/entry/edit/${id}`);
  };
  
  const handleDeleteEntry = (id: string) => {
    setEntryToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteEntry = () => {
    if (entryToDelete) {
      deleteEntry(entryToDelete);
      toast.success('Journal entry deleted');
      setIsDeleteDialogOpen(false);
      setEntryToDelete(null);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="text-muted-foreground mt-1">{dateString}</p>
        </div>
        
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link to="/entry/new?type=sod">
            <Button className="flex items-center">
              <Plus size={16} className="mr-2" />
              Morning Entry
            </Button>
          </Link>
          <Link to="/entry/new?type=eod">
            <Button variant="outline" className="flex items-center">
              <Plus size={16} className="mr-2" />
              Evening Entry
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Journal Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{state.entries.length}</p>
            <p className="text-muted-foreground text-sm">Total entries</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{state.categories.length}</p>
            <p className="text-muted-foreground text-sm">Rating categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/calendar" className="flex items-center text-primary">
              <Calendar size={18} className="mr-2" />
              <span className="hover:underline">View monthly calendar</span>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Entries</TabsTrigger>
          <TabsTrigger value="morning">Morning</TabsTrigger>
          <TabsTrigger value="evening">Evening</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {sortedDates.length > 0 ? (
            sortedDates.map(dateKey => (
              <div key={dateKey} className="mb-8">
                <h2 className="text-lg font-medium mb-4 text-muted-foreground">
                  {format(new Date(dateKey), 'MMMM d, yyyy')}
                </h2>
                {entriesByDate[dateKey].map(entry => (
                  <JournalCard
                    key={entry.id}
                    entry={entry}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                  />
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No journal entries yet. Create your first entry!</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="morning" className="mt-6">
          {sortedDates.some(dateKey => entriesByDate[dateKey].some(entry => entry.templateId === '1')) ? (
            sortedDates.map(dateKey => {
              const morningEntries = entriesByDate[dateKey].filter(entry => entry.templateId === '1');
              if (morningEntries.length === 0) return null;
              
              return (
                <div key={dateKey} className="mb-8">
                  <h2 className="text-lg font-medium mb-4 text-muted-foreground">
                    {format(new Date(dateKey), 'MMMM d, yyyy')}
                  </h2>
                  {morningEntries.map(entry => (
                    <JournalCard
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEditEntry}
                      onDelete={handleDeleteEntry}
                    />
                  ))}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No morning entries yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="evening" className="mt-6">
          {sortedDates.some(dateKey => entriesByDate[dateKey].some(entry => entry.templateId === '2')) ? (
            sortedDates.map(dateKey => {
              const eveningEntries = entriesByDate[dateKey].filter(entry => entry.templateId === '2');
              if (eveningEntries.length === 0) return null;
              
              return (
                <div key={dateKey} className="mb-8">
                  <h2 className="text-lg font-medium mb-4 text-muted-foreground">
                    {format(new Date(dateKey), 'MMMM d, yyyy')}
                  </h2>
                  {eveningEntries.map(entry => (
                    <JournalCard
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEditEntry}
                      onDelete={handleDeleteEntry}
                    />
                  ))}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No evening entries yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this journal entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEntry}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
