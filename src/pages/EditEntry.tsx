
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EntryForm } from '@/components/journal/EntryForm';
import { useJournal } from '@/contexts/JournalContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const EditEntry = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useJournal();
  const navigate = useNavigate();
  
  // Find the entry
  const entry = state.entries.find(e => e.id === id);
  
  // If entry not found, redirect to dashboard
  useEffect(() => {
    if (id && !entry) {
      navigate('/');
    }
  }, [id, entry, navigate]);
  
  // Determine entry type
  const type = entry?.templateId === '1' ? 'sod' : 'eod';
  
  // Set page title
  useEffect(() => {
    document.title = 'Edit Journal Entry | Echo of Self';
  }, []);

  if (!entry) {
    return null;
  }

  return (
    <div className="animate-fade-in pb-12">
      <h1 className="text-3xl font-bold mb-2">Edit Journal Entry</h1>
      <p className="text-muted-foreground mb-8">
        Update your journal entry
      </p>
      
      <Alert variant="default" className="mb-8">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Note</AlertTitle>
        <AlertDescription>
          You're editing your {type === 'sod' ? 'morning' : 'evening'} entry from {entry.timestamp.toLocaleDateString()}
        </AlertDescription>
      </Alert>
      
      <EntryForm type={type} entryId={id} />
    </div>
  );
};

export default EditEntry;
