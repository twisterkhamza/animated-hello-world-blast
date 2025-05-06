
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EntryForm } from '@/components/journal/EntryForm';
import { TemplateType } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const NewEntry = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  
  // Validate type parameter
  const type: TemplateType = typeParam === 'sod' || typeParam === 'eod' ? typeParam : 'sod';
  
  // Set page title
  useEffect(() => {
    document.title = type === 'sod' 
      ? 'New Morning Journal Entry | Echo of Self' 
      : 'New Evening Journal Entry | Echo of Self';
  }, [type]);

  return (
    <div className="animate-fade-in pb-12">
      <h1 className="text-3xl font-bold mb-2">
        {type === 'sod' ? 'Morning Journal Entry' : 'Evening Journal Entry'}
      </h1>
      <p className="text-muted-foreground mb-8">
        {type === 'sod' 
          ? 'Start your day with intention and clarity' 
          : 'Reflect on your day and acknowledge your experiences'}
      </p>
      
      <Alert className="mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Tip</AlertTitle>
        <AlertDescription>
          {type === 'sod' 
            ? 'Taking a few minutes for morning reflection can positively impact your entire day.' 
            : 'Evening reflection helps you process the day and set yourself up for a restful night.'}
        </AlertDescription>
      </Alert>
      
      <EntryForm type={type} />
    </div>
  );
};

export default NewEntry;
