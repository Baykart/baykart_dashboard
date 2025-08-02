import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  touched?: boolean;
  className?: string;
}

export const TimePicker = ({ 
  value, 
  onChange, 
  placeholder = "Select time", 
  label,
  error,
  touched,
  className 
}: TimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Generate time options (24-hour format)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
        options.push({ value: timeString, label: displayTime });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const formatDisplayTime = (timeString: string) => {
    if (!timeString) return placeholder;
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-base">{label}</Label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && touched && "border-destructive"
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {formatDisplayTime(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0" align="start">
          <div className="max-h-60 overflow-y-auto">
            {timeOptions.map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                className="w-full justify-start text-left font-normal h-10 px-3"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {error && touched && (
        <span className="text-destructive text-xs">{error}</span>
      )}
    </div>
  );
}; 