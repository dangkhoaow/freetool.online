import { Label } from "@/components/ui/label";
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
}

interface ParentTaskFieldProps {
  value: string;
  parentTasks: Task[];
  onChange: (value: string) => void;
}

export function ParentTaskField({ value, parentTasks, onChange }: ParentTaskFieldProps) {
  const [open, setOpen] = React.useState(false);
  
  console.log('[PROJLY:TASK_FORM] Rendering ParentTaskField component with', parentTasks.length, 'parent tasks');
  
  // Get the selected task title for display
  const selectedTaskTitle = value && value !== 'none' ? 
    parentTasks.find(t => t.id === value)?.title || 'Unknown Task' : null;
  
  // Handle selection of a task
  const handleSelect = (taskId: string) => {
    onChange(taskId);
    setOpen(false);
  };
  
  return (
    <div>
      <Label htmlFor="parentTaskId">Parent Task (Optional)</Label>
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
              <span className="truncate flex-1 text-left">
                {selectedTaskTitle}
              </span>
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
                {parentTasks.map((task) => (
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
                    <span className="truncate block max-w-full">
                      {task.title}
                    </span>
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
