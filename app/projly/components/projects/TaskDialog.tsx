import React, { useState, useEffect } from "react";
import { Task } from "../../types/task";
import { TaskCreateInput, TaskUpdateInput } from "@/lib/services/projly/tasks-service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTask, useUpdateTask, useCreateTask, useTasks } from "../../hooks/use-tasks";
import { useProfile, useProfiles } from "../../hooks/use-profile";
import { useProjects, useProjectMembers } from "../../hooks/use-projects";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Utility functions for date handling
const formatDateForInput = (date: Date | string): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Helper to safely format a date for an input field
const formatDateSafe = (dateValue: any): string => {
  if (!dateValue) return '';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
};

// Utility functions for safe data handling
const safeString = (value: any, defaultValue: string = ''): string => {
  return value === null || value === undefined ? defaultValue : String(value);
};

const safeId = (value: any, defaultValue: any = null): string | null => {
  return value === null || value === undefined || value === '' ? defaultValue : String(value);
};

const safeDate = (value: any): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const isEmpty = (value: any): boolean => {
  return value === null || value === undefined || value === '';
};

const logDataTransformation = (label: string, source: any, transformed: any): void => {
  console.log(`[DATA TRANSFORM] ${label}:`);
  console.log('Original:', source);
  console.log('Transformed:', transformed);
};

interface TaskDialogProps {
  projectId: string;
  taskId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDialog({ projectId, taskId, open, onOpenChange }: TaskDialogProps) {
  const isNewTask = !taskId;
  const title = isNewTask ? "Create Task" : "Edit Task";

  // Fetch task data from API (as fallback)
  const { data: task, isLoading: singleTaskLoading } = useTask(taskId);
  // Fetch all tasks for the project to find the task by ID
  const { data: projectTasks, isLoading: tasksLoading } = useTasks({ projectId });
  const { data: profile } = useProfile();
  // Fetch project members for assignee dropdown
  const { data: projectMembers, isLoading: membersLoading } = useProjectMembers(projectId);
  // Keep allProfiles for backward compatibility
  const { data: allProfiles, isLoading: profilesLoading } = useProfiles();
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  
  console.log("[TASK DIALOG] Available projects:", projects);
  console.log("[TASK DIALOG] Project tasks:", projectTasks);
  
  // Find task in project tasks if available
  const taskFromList = taskId && Array.isArray(projectTasks) ? 
    projectTasks.find((t: Task) => t.id === taskId) : undefined;
  
  // Use task from project tasks list if available, otherwise use the task from API
  const taskData = taskFromList || task;
  console.log("[TASK DIALOG] Task data source:", taskFromList ? "project tasks list" : "API");
  console.log("[TASK DIALOG] Task data:", taskData);
  
  // Type assertion for task data to ensure proper property access
  const typedTask = taskData as Task | undefined;
  
  // Form state with field names that match the task service
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Not Started",
    dueDate: "",
    assigneeId: "unassigned", // Updated from assignedTo to assigneeId
    projectId: projectId // Initialize with the current projectId
  });
  
  // Original data for comparison
  const [originalData, setOriginalData] = useState({});
  
  // Combine loading states
  const isLoading = singleTaskLoading || tasksLoading || loadingProjects || profilesLoading || membersLoading;
  const isSubmitting = isUpdating || isCreating;
  
  // Log available project members for debugging
  useEffect(() => {
    if (projectMembers && Array.isArray(projectMembers)) {
      console.log("[TASK DIALOG] Available project members for assignee selection:", projectMembers);
    }
  }, [projectMembers]);
  
  console.log("[TASK DIALOG] Initialized component with camelCase field names");
  
  // Update form when task data is loaded
  useEffect(() => {
    console.log("[TASK DIALOG] Task data loaded:", typedTask);

    // If we have task data, update the form
    if (typedTask) {
      console.log("[TASK DIALOG] Raw task data:", typedTask);
      console.log("[TASK DIALOG] Task assignee:", typedTask.assigneeId);
      
      // Use safe utility functions to ensure consistent data handling
      // Use safe utility functions to ensure consistent data handling
      const formattedData = {
        title: safeString(typedTask.title),
        description: safeString(typedTask.description),
        status: safeString(typedTask.status || 'Not Started'),
        // Format the date for input field (YYYY-MM-DD)
        dueDate: formatDateSafe(typedTask.dueDate),
        assigneeId: safeString(typedTask.assigneeId || 'unassigned'),
        projectId: safeString(typedTask.projectId || projectId)
      };
      
      // Log the data transformation for debugging
      console.log("[TASK DIALOG] Creating formData from task data");
      logDataTransformation("Task to Form", typedTask, formattedData);
      console.log("[TASK DIALOG] Processed assigneeId value:", formattedData.assigneeId);
      console.log("[TASK DIALOG] Loaded task data with camelCase fields:", formattedData);

      setFormData(formattedData);
      setOriginalData(formattedData); // Store original data for comparison
    } else if (isNewTask) {
      // Set up default values for a new task
      const defaultFormData = {
        title: "",
        description: "",
        status: "Not Started",
        dueDate: "",
        assigneeId: (profile as any)?.id || "unassigned",
        projectId: projectId // Use the current projectId for new tasks
      };

      console.log("[TASK DIALOG] Created default form data for new task with camelCase fields");

      setFormData(defaultFormData);
    }
  }, [task, isNewTask, profile]);

  const handleChange = (field: string, value: string) => {
    console.log(`TaskDialog - changing field ${field} to:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper function to check if data has changed
  const hasDataChanged = () => {
    return Object.keys(formData).some(key => {
      return formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData];
    });
  };

  const handleSubmit = () => {
    // Validate required fields
    if (isEmpty(formData.title)) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive"
      });
      return;
    }

    // Check if any data has changed to avoid unnecessary updates
    const hasChanges = Object.keys(formData).some(
      key => formData[key as keyof typeof formData] !== (originalData as any)[key]
    );

    if (!hasChanges && !isNewTask) {
      console.log("No changes detected, closing dialog");
      onOpenChange(false);
      return;
    }

    // Prepare data for submission with proper type conversions
    // Use safe utility functions to ensure consistent data handling
    const data = {
      title: safeString(formData.title),
      description: safeString(formData.description),
      status: safeString(formData.status, "Not Started"),
      // Convert string date to Date object if present
      dueDate: isEmpty(formData.dueDate) ? undefined : new Date(formData.dueDate),
      // Convert 'unassigned' to undefined for API
      assigneeId: formData.assigneeId === 'unassigned' ? undefined : safeId(formData.assigneeId),
      projectId: safeString(projectId),
    };
    
    // Ensure no null values for assigneeId since the API expects string or undefined
    if (data.assigneeId === null) {
      data.assigneeId = undefined;
    }
    
    // Log the transformation for debugging
    logDataTransformation("Task submission data for API", formData, data);
    console.log("[TASK DIALOG] Task data prepared for API:", data);

    // Create a new task
    if (isNewTask) {
      console.log("[TASK DIALOG] Creating new task with data:", data);
      
      // Create a properly typed task input
      // Create a properly typed task input that matches the service expectations
      const createData: TaskCreateInput = {
        title: data.title,
        description: data.description,
        status: data.status,
        projectId: data.projectId,
        // Make sure dueDate is either string, Date, or undefined (not null)
        dueDate: data.dueDate || undefined,
        assigneeId: data.assigneeId as string | undefined
      };
      
      createTask(createData, {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("Error creating task:", error);
          // Toast is already handled in the mutation
        },
      });
    } else if (taskId) {
      console.log("[TASK DIALOG] Updating task with ID:", taskId, "and data:", data);

      // Format the update data as expected by the API
      // Prepare the data with id for updates
      // Prepare the update payload according to TaskUpdateInput type
      const updateData: { id: string } & Partial<{ 
        title: string;
        description: string;
        status: string;
        dueDate: Date | undefined;
        assigneeId: string | undefined;
      }> = {
        id: taskId as string, // We know it exists as this is the update branch
        title: data.title,
        description: data.description,
        status: data.status,
        dueDate: data.dueDate,
        assigneeId: data.assigneeId as string | undefined // Cast to ensure no null values
      };
      
      updateTask(updateData, {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("Error updating task:", error);
          // Toast is already handled in the mutation
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                    onBlur={() => {
                      console.log("[TASK DIALOG] Due date value after blur:", formData.dueDate);
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assigneeId">Assigned To</Label>
                <Select
                  value={formData.assigneeId || "unassigned"}
                  onValueChange={(value) => handleChange("assigneeId", value)}
                >
                  <SelectTrigger id="assigneeId">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    
                    {/* Show project members (including owner) */}
                    {projectMembers && Array.isArray(projectMembers) && projectMembers.map(member => {
                      // Skip if no user data
                      if (!member.user) {
                        console.log("[TASK DIALOG] Skipping member without user data");
                        return null;
                      }
                      
                      const isCurrentUser = profile && member.userId === (profile as any).id;
                      console.log(`[TASK DIALOG] Processing member ${member.user.firstName} ${member.user.lastName}, isCurrentUser: ${isCurrentUser}`);
                      
                      return (
                        <SelectItem key={member.userId} value={member.userId}>
                          {member.user.firstName} {member.user.lastName}
                          {isCurrentUser ? " (You)" : ""}
                          {member.role === "owner" ? " (Owner)" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    {isNewTask ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  isNewTask ? "Create Task" : "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
