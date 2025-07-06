import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import React from "react";

interface Task {
  id: string;
  title: string;
  parentTaskId?: string;
}

interface ParentTaskFieldWithToggleProps {
  value: string;
  parentTasks: Task[];
  allTasks: Task[];
  onChange: (value: string) => void;
  showAllTasks: boolean;
  onToggleShowAllTasks: (checked: boolean) => void;
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
      console.warn('[PROJLY:TASK_FORM] Hierarchy depth exceeded 10 levels, breaking to prevent infinite loop');
      break;
    }
  }
  
  return hierarchy;
};

// Function to format hierarchy display (excluding the current task)
const formatHierarchyDisplay = (task: Task, allTasks: Task[]): string => {
  const hierarchy = buildParentHierarchy(task.id, allTasks);
  
  if (hierarchy.length <= 1) {
    return task.title; // No parent hierarchy, just show the task title
  }
  
  // Create the hierarchy display excluding the current task (last item)
  // Show only the parent path: "Root Parent → Parent 1 → Parent 2"
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

export function ParentTaskFieldWithToggle({ 
  value, 
  parentTasks, 
  allTasks,
  onChange,
  showAllTasks,
  onToggleShowAllTasks
}: ParentTaskFieldWithToggleProps) {
  const [open, setOpen] = React.useState(false);
  
  console.log('[PROJLY:TASK_FORM] Rendering ParentTaskFieldWithToggle component with', parentTasks.length, 'parent tasks, showAllTasks:', showAllTasks);
  
  // Get the selected task title and full path for display
  const selectedTaskTitle = value && value !== 'none' ? getTaskTitle(value, allTasks) : null;
  const selectedTaskFullPath = value && value !== 'none' ? getFullHierarchyPath(value, allTasks) : null;
  const hasSelectedTaskParents = selectedTaskTitle && selectedTaskFullPath && selectedTaskFullPath !== selectedTaskTitle;
  
  // Handle selection of a task
  const handleSelect = (taskId: string) => {
    onChange(taskId);
    setOpen(false);
  };
  
  return (
    <TooltipProvider>
      <div className="grid w-full items-center gap-1.5">
        <div className="flex justify-between items-center">
          <Label htmlFor="parentTaskId">Parent Task (Optional)</Label>
          <div className="flex items-center space-x-2">
            <Label htmlFor="show-all-tasks" className="text-xs text-muted-foreground cursor-pointer">
              {showAllTasks ? "Showing all tasks" : "Showing only top-level tasks"}
            </Label>
            <Switch
              id="show-all-tasks"
              checked={showAllTasks}
              onCheckedChange={onToggleShowAllTasks}
            />
          </div>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {value === 'none' || !value ? (
                "Select a parent task"
              ) : (
                <div className="flex items-center w-full">
                  {hasSelectedTaskParents ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate flex-1 text-left">
                          {selectedTaskTitle}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs break-words">{selectedTaskFullPath}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="truncate flex-1 text-left">
                      {selectedTaskTitle}
                    </span>
                  )}
                </div>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 max-w-[90vw]" align="start">
            <Command>
              <CommandInput placeholder="Search parent tasks..." />
              <CommandEmpty>No parent tasks found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-64">
                  <CommandItem
                    onSelect={() => handleSelect('none')}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === 'none' ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>No Parent Task</span>
                  </CommandItem>
                  {parentTasks.map((task) => {
                    const hasParents = task.parentTaskId;
                    const displayText = hasParents ? formatHierarchyDisplay(task, allTasks) : task.title;
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
                            value === task.id ? "opacity-100" : "opacity-0"
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
      </div>
    </TooltipProvider>
  );
}
