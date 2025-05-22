"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useTask, useCreateTask, useUpdateTask } from "@/lib/services/projly/use-tasks";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
  projectId: string;
  onTaskChange?: () => Promise<void>;
}

export function TaskDialog({ open, onOpenChange, taskId, projectId, onTaskChange }: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [dueDate, setDueDate] = useState("");

  // Use React Query hooks
  const { data: taskData, isLoading: isTaskLoading } = useTask(taskId);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Debug logging for state changes
  useEffect(() => {
    console.log("[TaskDialog] Description state changed:", description);
  }, [description]);

  console.log("[TaskDialog] Rendering with props:", { open, taskId, projectId });
  
  useEffect(() => {
    console.log("[TaskDialog] useEffect triggered with taskId:", taskId, "open:", open);
    if (!open) return;
    
    if (!taskId || taskId === "new") {
      console.log("[TaskDialog] Resetting form for new task");
      setTitle("");
      setDescription("");
      setStatus("Not Started");
      setDueDate("");
      setError("");
      return;
    }
    
    if (taskData) {
      console.log("[TaskDialog] Loading task data for editing:", taskData);
      setTitle(taskData.title || "");
      // Explicitly log the description to ensure it's being loaded correctly
      console.log("[TaskDialog] Setting description from API data:", taskData.description);
      setDescription(taskData.description || "");
      
      // Map API status values to our dropdown values if needed
      const apiStatus = taskData.status || "Not Started";
      setStatus(apiStatus);
      
      // Format date from ISO string to YYYY-MM-DD for input
      if (taskData.dueDate) {
        const date = new Date(taskData.dueDate);
        const formattedDate = date.toISOString().split('T')[0];
        setDueDate(formattedDate);
      } else {
        setDueDate("");
      }
      
      setError("");
    }
  }, [taskId, open, taskData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[TaskDialog] Submitting form");
    setError("");
    setIsSubmitting(true);
    
    try {
      // Log all form field values before submission to verify data
      console.log("[TaskDialog] Current form values before submission:", {
        title,
        description,
        status,
        dueDate,
        projectId
      });
      
      const formattedTaskData = {
        title,
        description,
        status,
        dueDate: dueDate || undefined,
        projectId
      };
      
      console.log("[TaskDialog] Task data to submit:", formattedTaskData);
      
      if (taskId && taskId !== "new") {
        // Update existing task using the hook
        console.log(`[TaskDialog] Updating task with ID ${taskId} using useUpdateTask hook`);
        await updateTaskMutation.mutateAsync({ id: taskId, updates: formattedTaskData });
      } else {
        // Create new task using the hook
        console.log("[TaskDialog] Creating new task using useCreateTask hook");
        await createTaskMutation.mutateAsync(formattedTaskData);
      }
      
      // Refresh tasks data if callback provided
      if (onTaskChange) {
        console.log("[TaskDialog] Calling onTaskChange to refresh data");
        try {
          await onTaskChange();
          console.log("[TaskDialog] Successfully completed onTaskChange callback");
        } catch (callbackError) {
          console.error("[TaskDialog] Error in onTaskChange callback:", callbackError);
        }
      } else {
        console.warn("[TaskDialog] No onTaskChange callback provided, tasks will not auto-refresh");
      }
      
      // Close the dialog
      onOpenChange(false);
    } catch (err) {
      console.error("[TaskDialog] Error saving task:", err);
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{taskId && taskId !== "new" ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {taskId && taskId !== "new" ? 'Update the task details below.' : 'Fill in the details to create a new task.'}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-md mb-4 text-red-800 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                console.log("[TaskDialog] Description field onChange event:", e.target.value);
                setDescription(e.target.value);
              }}
              placeholder="Task description"
              rows={3}
              onBlur={() => console.log("[TaskDialog] Description field onBlur, current value:", description)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting || isTaskLoading || createTaskMutation.isPending || updateTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isTaskLoading || createTaskMutation.isPending || updateTaskMutation.isPending}
            >
              {(isSubmitting || createTaskMutation.isPending || updateTaskMutation.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
