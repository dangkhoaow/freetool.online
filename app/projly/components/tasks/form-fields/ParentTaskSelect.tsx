import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks } from "@/lib/services/projly/use-tasks";
import { TaskFormValues } from "../schemas/taskSchema";
import { Spinner } from "@/components/ui/spinner";

interface ParentTaskSelectProps {
  projectId: string;
  currentTaskId?: string;
}

export function ParentTaskSelect({ projectId, currentTaskId }: ParentTaskSelectProps) {
  const form = useFormContext<TaskFormValues>();
  const { data: tasks, isLoading } = useTasks({
    projectId,
    parentOnly: true, // Only show parent tasks
  });

  // Filter out current task and its sub-tasks
  const availableParentTasks = tasks?.filter(task => {
    if (currentTaskId && task.id === currentTaskId) return false;
    if (task.parentTaskId) return false;
    return true;
  }) || [];

  if (isLoading) {
    return (
      <FormItem>
        <FormLabel>Parent Task</FormLabel>
        <FormControl>
          <div className="flex items-center justify-center p-2">
            <Spinner />
          </div>
        </FormControl>
      </FormItem>
    );
  }

  return (
    <FormField
      control={form.control}
      name="parentTaskId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Parent Task</FormLabel>
          <Select
            value={field.value}
            onValueChange={field.onChange}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select parent task" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {availableParentTasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 