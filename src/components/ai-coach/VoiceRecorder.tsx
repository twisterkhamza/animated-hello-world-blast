
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onTranscriptionError: (error: Error) => void;
  transcribeFunction: (audioBlob: Blob) => Promise<string>;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptionComplete,
  onTranscriptionError,
  transcribeFunction
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Clean up timer on unmount
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          setIsTranscribing(true);
          const text = await transcribeFunction(audioBlob);
          onTranscriptionComplete(text);
        } catch (error) {
          console.error('Transcription error:', error);
          onTranscriptionError(error instanceof Error ? error : new Error('Transcription failed'));
        } finally {
          setIsTranscribing(false);
          
          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone Access Error',
        description: 'Please allow microphone access to use voice recording.',
        variant: 'destructive',
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <>
          <div className="text-sm font-medium flex items-center gap-2 text-destructive animate-pulse">
            <span className="h-2 w-2 rounded-full bg-destructive"></span>
            {formatTime(recordingTime)}
          </div>
          <Button 
            variant="destructive"
            size="sm"
            onClick={stopRecording}
            aria-label="Stop recording"
          >
            <Square size={14} className="mr-1" />
            Stop
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="icon"
          onClick={startRecording}
          disabled={isTranscribing}
          aria-label="Start voice recording"
          className={isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {isTranscribing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Mic size={16} />
          )}
        </Button>
      )}
    </div>
  );
};
