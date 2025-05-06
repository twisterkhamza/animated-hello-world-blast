
import React from 'react';
import { Input } from '@/components/ui/input';

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({ value, onChange }) => {
  return (
    <div className="flex gap-2 items-center">
      <div
        className="w-8 h-8 rounded border cursor-pointer"
        style={{ backgroundColor: value || '#e2e8f0' }}
        onClick={() => {
          const newColor = prompt('Enter color hex code (e.g. #4CAF50):', value);
          if (newColor) onChange(newColor);
        }}
      />
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1"
      />
    </div>
  );
};
