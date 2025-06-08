import React from 'react';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FormItem } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RelatedTasksFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  availableTasks: Array<{ id: string; title: string }>;
  isLoading?: boolean;
  currentTaskId?: string;
}

export function RelatedTasksField({ 
  value = [], 
  onChange, 
  availableTasks = [],
  isLoading = false,
  currentTaskId
}: RelatedTasksFieldProps) {
  const [open, setOpen] = React.useState(false);

  // Filter out the current task from available tasks
  const filteredTasks = availableTasks.filter(task => task.id !== currentTaskId);
  
  // Handle selection of a task
  const handleSelect = (taskId: string) => {
    const isAlreadySelected = value.includes(taskId);
    
    if (isAlreadySelected) {
      // If already selected, remove it
      const newValue = value.filter(id => id !== taskId);
      onChange(newValue);
    } else {
      // If not selected, add it
      const newValue = [...value, taskId];
      onChange(newValue);
    }
  };
  
  // Helper function to get task title by ID
  const getTaskTitle = (taskId: string): string => {
    const task = availableTasks.find(t => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  };
  
  // Log for debugging
  console.log('[RelatedTasksField] Current values:', value);
  console.log('[RelatedTasksField] Available tasks:', availableTasks.length);

  return (
    <FormItem>
      <div className="space-y-2">
        <Label htmlFor="relatedTasks">Related Tasks</Label>
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={isLoading}
            >
              {value.length === 0 ? (
                "Select related tasks..."
              ) : (
                <div className="flex flex-wrap gap-1 max-w-[90%] overflow-hidden">
                  {value.slice(0, 2).map((taskId) => (
                    <Badge key={taskId} variant="secondary" className="mr-1">
                      {getTaskTitle(taskId)}
                    </Badge>
                  ))}
                  {value.length > 2 && (
                    <Badge variant="secondary">+{value.length - 2} more</Badge>
                  )}
                </div>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search tasks..." />
              <CommandEmpty>No tasks found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-64">
                  {filteredTasks.map((task) => (
                    <CommandItem
                      key={task.id}
                      onSelect={() => handleSelect(task.id)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(task.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{task.title}</span>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {value.map((taskId) => (
              <Badge 
                key={taskId} 
                variant="outline"
                className="flex items-center gap-1"
              >
                {getTaskTitle(taskId)}
                <button 
                  className="ml-1 text-xs rounded-full h-4 w-4 inline-flex items-center justify-center"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelect(taskId);
                  }}
                >
                  ✕
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </FormItem>
  );
} 