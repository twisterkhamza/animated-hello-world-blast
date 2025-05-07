
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Check,
  Square,
  PaintBucket,
  Type,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your thoughts here...",
  className = "",
}) => {
  const [editorContent, setEditorContent] = useState(value);
  const [checkboxItems, setCheckboxItems] = useState<{ id: string; text: string; checked: boolean }[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setEditorContent(newContent);
    onChange(newContent);
  };

  const applyFormat = (format: string) => {
    document.execCommand(format, false);
    setSelectedFormat(format);
  };

  const applyHeading = (level: number) => {
    document.execCommand('formatBlock', false, `h${level}`);
  };

  const insertList = (ordered: boolean) => {
    document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList', false);
  };
  
  const insertCheckbox = () => {
    const newItem = {
      id: `checkbox-${Date.now()}`,
      text: '',
      checked: false
    };
    setCheckboxItems([...checkboxItems, newItem]);
    
    const checkbox = document.createElement('div');
    checkbox.innerHTML = `
      <div class="flex items-center gap-2 mb-2" data-checkbox-id="${newItem.id}">
        <span contenteditable="false">
          <input type="checkbox" class="h-4 w-4 rounded border-gray-300" id="${newItem.id}">
        </span>
        <label for="${newItem.id}" class="text-sm" contenteditable="true">Checkbox item</label>
      </div>
    `;
    
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      range.insertNode(checkbox);
      range.setStartAfter(checkbox);
    }
  };

  const insertDynamicQuestion = () => {
    const questionId = `question-${Date.now()}`;
    const questionElement = document.createElement('div');
    questionElement.className = 'border rounded p-3 my-3 question-container';
    questionElement.setAttribute('data-question-id', questionId);
    questionElement.innerHTML = `
      <div class="mb-2">
        <input type="text" class="w-full border-b border-gray-300 bg-transparent focus:outline-none" placeholder="Enter your question here...">
      </div>
      <div class="min-h-[100px]" contenteditable="true" data-placeholder="Write your answer here..."></div>
    `;
    
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      range.insertNode(questionElement);
      range.setStartAfter(questionElement);
    }
  };

  const applyFontColor = (color: string) => {
    document.execCommand('foreColor', false, color);
  };

  const applyBackgroundColor = (color: string) => {
    document.execCommand('hiliteColor', false, color);
  };

  // Color options for both text and background
  const colorOptions = [
    '#000000', // Black
    '#ffffff', // White
    '#e53e3e', // Red
    '#38a169', // Green
    '#3182ce', // Blue
    '#d69e2e', // Yellow
    '#805ad5', // Purple
    '#DD6B20', // Orange
    '#718096', // Gray
  ];

  return (
    <div className={`border rounded-md overflow-hidden ${className}`}>
      <div className="bg-muted/50 p-1 border-b flex flex-wrap gap-1 items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => applyFormat('bold')}
          className={selectedFormat === 'bold' ? 'bg-muted' : ''}
        >
          <Bold size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => applyFormat('italic')}
          className={selectedFormat === 'italic' ? 'bg-muted' : ''}
        >
          <Italic size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => applyFormat('underline')}
          className={selectedFormat === 'underline' ? 'bg-muted' : ''}
        >
          <Underline size={16} />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => applyHeading(1)}
        >
          <Heading1 size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => applyHeading(2)}
        >
          <Heading2 size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => applyHeading(3)}
        >
          <Heading3 size={16} />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => insertList(false)}
        >
          <List size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => insertList(true)}
        >
          <ListOrdered size={16} />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => document.execCommand('formatBlock', false, 'blockquote')}
        >
          <Quote size={16} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={insertCheckbox}
        >
          <Square size={16} />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Type size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-3 gap-1">
              {colorOptions.map((color) => (
                <Button
                  key={`text-${color}`}
                  variant="outline"
                  className="h-6 w-6 p-0"
                  style={{ backgroundColor: color }}
                  onClick={() => applyFontColor(color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <PaintBucket size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-3 gap-1">
              {colorOptions.map((color) => (
                <Button
                  key={`bg-${color}`}
                  variant="outline"
                  className="h-6 w-6 p-0"
                  style={{ backgroundColor: color }}
                  onClick={() => applyBackgroundColor(color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="ml-auto flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={insertDynamicQuestion}
          >
            Add Question
          </Button>
        </div>
      </div>
      
      <div
        className="p-3 min-h-[200px] focus:outline-none"
        contentEditable
        dangerouslySetInnerHTML={{ __html: editorContent }}
        onInput={handleChange}
        data-placeholder={placeholder}
      />
    </div>
  );
};
