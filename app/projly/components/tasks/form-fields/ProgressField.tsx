import React from 'react';
import { Label } from '@/components/ui/label';
import { FormItem } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface ProgressFieldProps {
  value: number | null;
  onChange: (value: number) => void;
}

export function ProgressField({ 
  value = 0, 
  onChange 
}: ProgressFieldProps) {
  // Ensure value is within 0-100 range and not null
  const safeValue = value === null ? 0 : Math.max(0, Math.min(100, value));
  
  // Get color based on progress value
  const getProgressColor = (value: number): string => {
    if (value < 25) return 'bg-red-100 text-red-800 border-red-200';
    if (value < 50) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (value < 75) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };
  
  // Handle slider change
  const handleSliderChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };
  
  return (
    <FormItem className="space-y-4">
      <div className="flex justify-between items-center">
        <Label htmlFor="progress">Progress</Label>
        <Badge 
          variant="outline" 
          className={`${getProgressColor(safeValue)}`}
        >
          {safeValue}%
        </Badge>
      </div>
      
      <Slider
        id="progress"
        value={[safeValue]}
        max={100}
        step={1}
        onValueChange={handleSliderChange}
        className="cursor-pointer"
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </FormItem>
  );
} 