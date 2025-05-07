
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Pause, Play, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onTranscriptionError: (error: Error) => void;
  transcribeFunction: (audioBase64: string) => Promise<string>;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptionComplete,
  onTranscriptionError,
  transcribeFunction
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      onTranscriptionError(new Error('Could not start recording. Please check microphone permissions.'));
    }
  };
  
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      // Pause timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      mediaRecorderRef.current.onstop = async () => {
        try {
          setIsTranscribing(true);
          
          // Stop all audio tracks
          mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop());
          
          // Combine audio chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          reader.onloadend = async () => {
            try {
              const base64Audio = reader.result?.toString().split(',')[1];
              
              if (base64Audio) {
                // Send for transcription
                const transcribedText = await transcribeFunction(base64Audio);
                onTranscriptionComplete(transcribedText);
              } else {
                throw new Error('Error converting audio to base64');
              }
            } catch (error) {
              console.error('Transcription error:', error);
              onTranscriptionError(error instanceof Error ? error : new Error('Unknown transcription error'));
            } finally {
              setIsRecording(false);
              setIsPaused(false);
              setIsTranscribing(false);
            }
          };
          
          reader.onerror = () => {
            console.error('Error reading audio file');
            onTranscriptionError(new Error('Error reading audio file'));
            setIsRecording(false);
            setIsPaused(false);
            setIsTranscribing(false);
          };
          
        } catch (error) {
          console.error('Error processing recording:', error);
          onTranscriptionError(error instanceof Error ? error : new Error('Error processing recording'));
          setIsRecording(false);
          setIsPaused(false);
          setIsTranscribing(false);
        }
      };
    }
  };
  
  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          variant="secondary"
          size="icon"
          onClick={startRecording}
          disabled={isTranscribing}
          aria-label="Start recording"
        >
          <Mic className="h-4 w-4" />
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium flex items-center">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            <span>{formatTime(recordingTime)}</span>
          </div>
          
          {isPaused ? (
            <Button
              variant="outline"
              size="icon"
              onClick={resumeRecording}
              aria-label="Resume recording"
            >
              <Play className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={pauseRecording}
              aria-label="Pause recording"
            >
              <Pause className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="destructive"
            size="icon"
            onClick={stopRecording}
            aria-label="Stop recording"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {isTranscribing && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Transcribing...</span>
        </div>
      )}
    </div>
  );
};
