"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useTask } from "@/lib/services/projly/use-tasks";
import { CreateTaskForm } from "@/app/projly/components/tasks/CreateTaskForm";
import { Task } from "@/lib/services/projly/types";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
  projectId: string;
  onTaskChange?: () => Promise<void>;
}

export function TaskDialog({ open, onOpenChange, taskId, projectId, onTaskChange }: TaskDialogProps) {
  const [error, setError] = useState("");
  
  // Determine if we're in edit or create mode
  const mode = taskId && taskId !== "new" ? 'edit' : 'create';
  console.log("[TaskDialog] Rendering in mode:", mode, "with taskId:", taskId, "projectId:", projectId);
  
  // Only fetch task data if we're editing an existing task
  const validTaskId = taskId && taskId !== 'new' ? taskId : '';
  const { data: taskData, isLoading: isTaskLoading } = useTask(validTaskId);
  
  // Handle form success (create or update)
  const handleSuccess = async () => {
    console.log("[TaskDialog] Task saved successfully");
    
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
  };
  
  // Map the task data to form values
  const getInitialData = () => {
    if (mode === 'edit' && taskData) {
      console.log("[TaskDialog] Preparing initial data for edit mode:", taskData);
      return {
        title: taskData.title || "",
        description: taskData.description || "",
        status: taskData.status || "Not Started",
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        startDate: taskData.startDate ? new Date(taskData.startDate) : undefined,
        projectId: taskData.projectId || projectId || "",
        assignedTo: taskData.assignedTo || ""
      };
    }
    
    // For create mode, just use the projectId
    return {
      projectId: projectId || ""
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Update the task details below.' : 'Fill in the details to create a new task for this project.'}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-md mb-4 text-red-800 text-sm">
            {error}
          </div>
        )}
        
        {isTaskLoading && mode === 'edit' ? (
          <div className="flex justify-center p-4">
            <p>Loading task data...</p>
          </div>
        ) : (
          <CreateTaskForm
            mode={mode}
            inDialog={true}
            hideProjectField={!!projectId} // Hide project field if projectId is provided
            projectId={projectId}
            taskId={validTaskId}
            initialData={getInitialData()}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
            submitButtonText={mode === 'edit' ? 'Save Task' : 'Create Task'}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
