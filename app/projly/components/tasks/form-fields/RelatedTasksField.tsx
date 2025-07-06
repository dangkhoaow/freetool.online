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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  parentTaskId?: string;
}

interface RelatedTasksFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  availableTasks: Task[];
  isLoading?: boolean;
  currentTaskId?: string;
}

// Utility function to build parent hierarchy chain
const buildParentHierarchy = (taskId: string, allTasks: Task[]): Task[] => {
  const hierarchy: Task[] = [];
  let currentTask: Task | undefined = allTasks.find(t => t.id === taskId);
  
  // Build the hierarchy chain from child to root
  while (currentTask) {
    hierarchy.unshift(currentTask); // Add to beginning to maintain order
    
    // Find the parent task
    if (currentTask && currentTask.parentTaskId) {
      const parentTaskId = currentTask.parentTaskId;
      currentTask = allTasks.find(t => t.id === parentTaskId);
    } else {
      break; // We've reached the root
    }
    
    // Safety check to prevent infinite loops
    if (hierarchy.length > 10) {
      console.warn('[PROJLY:RELATED_TASKS] Hierarchy depth exceeded 10 levels, breaking to prevent infinite loop');
      break;
    }
  }
  
  return hierarchy;
};

// Function to format hierarchy display
const formatHierarchyDisplay = (task: Task, allTasks: Task[]): string => {
  const hierarchy = buildParentHierarchy(task.id, allTasks);
  
  if (hierarchy.length <= 1) {
    return task.title; // No parent hierarchy, just show the task title
  }
  
  // Create the hierarchy display excluding the current task (last item)
  const parentPath = hierarchy.slice(0, -1).map(t => t.title).join(' → ');
  
  // Return the complete path with the current task
  return `${parentPath} → ${task.title}`;
};

// Function to get just the task title by ID
const getTaskTitle = (taskId: string, allTasks: Task[]): string => {
  const task = allTasks.find(t => t.id === taskId);
  return task ? task.title : 'Unknown Task';
};

// Function to get the full hierarchy path for a task
const getFullHierarchyPath = (taskId: string, allTasks: Task[]): string => {
  const task = allTasks.find(t => t.id === taskId);
  if (!task) return 'Unknown Task';
  
  if (!task.parentTaskId) {
    return task.title; // Top-level task
  }
  
  return formatHierarchyDisplay(task, allTasks);
};

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
  
  // Log for debugging
  console.log('[RelatedTasksField] Current values:', value);
  console.log('[RelatedTasksField] Available tasks:', availableTasks.length);

  return (
    <TooltipProvider>
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
                    {value.slice(0, 2).map((taskId) => {
                      const taskTitle = getTaskTitle(taskId, availableTasks);
                      const fullPath = getFullHierarchyPath(taskId, availableTasks);
                      const hasParents = fullPath !== taskTitle;
                      
                      return (
                        <React.Fragment key={taskId}>
                          {hasParents ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="secondary" className="mr-1 truncate max-w-[100px]">
                                  {taskTitle}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs break-words">{fullPath}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Badge variant="secondary" className="mr-1 truncate max-w-[100px]">
                              {taskTitle}
                            </Badge>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {value.length > 2 && (
                      <Badge variant="secondary">+{value.length - 2} more</Badge>
                    )}
                  </div>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 max-w-[90vw]" align="start">
              <Command>
                <CommandInput placeholder="Search tasks..." />
                <CommandEmpty>No tasks found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-64">
                    {filteredTasks.map((task) => {
                      const hasParents = task.parentTaskId;
                      const displayText = hasParents ? formatHierarchyDisplay(task, availableTasks) : task.title;
                      const showTooltip = hasParents && displayText.length > 50;
                      
                      return (
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
                          {showTooltip ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate block max-w-full">
                                  {displayText}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs break-words">{displayText}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="truncate block max-w-full">
                              {displayText}
                            </span>
                          )}
                        </CommandItem>
                      );
                    })}
                  </ScrollArea>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          
          {value.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {value.map((taskId) => {
                const taskTitle = getTaskTitle(taskId, availableTasks);
                const fullPath = getFullHierarchyPath(taskId, availableTasks);
                const hasParents = fullPath !== taskTitle;
                
                return (
                  <React.Fragment key={taskId}>
                    {hasParents ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant="outline"
                            className="flex items-center gap-1 max-w-[200px]"
                          >
                            <span className="truncate">{taskTitle}</span>
                            <button 
                              className="ml-1 text-xs rounded-full h-4 w-4 inline-flex items-center justify-center hover:bg-gray-200"
                              onClick={(e) => {
                                e.preventDefault();
                                handleSelect(taskId);
                              }}
                            >
                              ✕
                            </button>
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs break-words">{fullPath}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge 
                        variant="outline"
                        className="flex items-center gap-1 max-w-[200px]"
                      >
                        <span className="truncate">{taskTitle}</span>
                        <button 
                          className="ml-1 text-xs rounded-full h-4 w-4 inline-flex items-center justify-center hover:bg-gray-200"
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelect(taskId);
                          }}
                        >
                          ✕
                        </button>
                      </Badge>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </FormItem>
    </TooltipProvider>
  );
} 