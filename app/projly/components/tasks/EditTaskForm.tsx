import React from "react";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";

// Define Task interface to match API response structure
interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  projectId: string;
  assignedTo?: string;
  startDate?: string;
  dueDate?: string;
  project?: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  };
}
import { useTaskForm } from "./hooks/useTaskForm";
import { TaskTitleField } from "./form-fields/TaskTitleField";
import { TaskDescriptionField } from "./form-fields/TaskDescriptionField";
import { TaskProjectField } from "./form-fields/TaskProjectField";
import { TaskAssigneeField } from "./form-fields/TaskAssigneeField";
import { TaskDateField } from "./form-fields/TaskDateField";
import { TaskStatusField } from "./form-fields/TaskStatusField";
import { TaskFormActions } from "./form-fields/TaskFormActions";
import { useUpdateTask } from "@/app/projly/hooks/use-tasks";
import { parseDateSafe, toISOStringSafe, formatDateForInput, createUTCDateAtNoon } from "@/app/projly/utils/dateUtils";
import { useRouter } from "next/navigation";

interface EditTaskFormProps {
  task: Task;
  onSuccess?: () => void;
}

export function EditTaskForm({ task, onSuccess }: EditTaskFormProps) {
  const { mutate: updateTask } = useUpdateTask();
  const router = useRouter();
  
  // Transform the task data to match the expected types in the form
  // Use the dateUtils functions to safely parse dates
  const transformedTask = {
    id: task.id,
    title: task.title,
    description: task.description,
    status: transformStatus(task.status),
    projectId: task.projectId,
    assignedTo: task.assignedTo,
    // Use createUTCDateAtNoon to ensure consistent date handling
    startDate: task.startDate ? createUTCDateAtNoon(task.startDate) : null,
    dueDate: task.dueDate ? createUTCDateAtNoon(task.dueDate) : null
  };
  
  console.log("Original task status:", task.status);
  console.log("Original startDate:", task.startDate);
  console.log("Original dueDate:", task.dueDate);
  console.log("Transformed task for form:", transformedTask);
  
  const { 
    form, 
    profiles = [], // Provide default empty array to fix type error
    isLoadingProfiles, 
    isPending,
    onSubmit 
  } = useTaskForm(transformedTask, (data) => {
    console.log("Submitting task update:", data);
    
    // Convert the enum values back to database values for submission
    const submitData = {
      ...data,
      status: transformStatusForSubmit(data.status),
      // Format dates as ISO strings for the API
      startDate: data.startDate ? toISOStringSafe(data.startDate) : null,
      dueDate: data.dueDate ? toISOStringSafe(data.dueDate) : null
    };
    
    console.log("Submitting with transformed status and dates:", submitData);
    
    // Create a properly typed update payload that matches TaskUpdateInput
    const updatePayload = {
      id: task.id,
      title: submitData.title,
      description: submitData.description,
      status: submitData.status,
      // Convert null to undefined for assigneeId to match TaskUpdateInput type
      assigneeId: submitData.assignedTo === null ? undefined : submitData.assignedTo,
      // Convert null to undefined for dueDate to match TaskUpdateInput type
      dueDate: submitData.dueDate === null ? undefined : submitData.dueDate
    };
    
    console.log("[EditTaskForm] Calling updateTask with:", updatePayload);
    updateTask(updatePayload);
    
    if (onSuccess) onSuccess();
    
    // If project assignment changed, navigate to that project page
    if (submitData.projectId && submitData.projectId !== task.projectId) {
      router.push(`/projly/projects/${submitData.projectId}`);
    }  
    return;
  });

  if (isLoadingProfiles) {
    return (
      <div className="flex justify-center p-4">
        <Spinner />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TaskTitleField />
        <TaskDescriptionField />
        <TaskProjectField />
        <TaskAssigneeField 
          profiles={profiles} 
          isLoading={isLoadingProfiles} 
        />
        <TaskDateField 
          name="startDate" 
          label="Start Date" 
        />
        <TaskDateField 
          name="dueDate" 
          label="Due Date" 
        />
        <TaskStatusField />
        <TaskFormActions isPending={isPending} />
      </form>
    </Form>
  );
}

// Helper function to transform database status string to the enum values expected by the form
function transformStatus(status: string): "toDo" | "inProgress" | "completed" | "onHold" | "cancelled" {
  // Convert the status string to the expected enum values in camelCase
  console.log("[EditTaskForm] Transforming status from API:", status);
  
  switch (status?.toLowerCase()) {
    case "completed":
      return "completed";
    case "in progress":
      return "inProgress";
    case "on hold":
      return "onHold";
    case "cancelled":
      return "cancelled";
    case "not started":
      return "toDo";
    case "pending":
      return "toDo";
    default:
      console.log("[EditTaskForm] Status not recognized, defaulting to toDo:", status);
      return "toDo"; // Default to toDo if not matching
  }
}

// Helper function to transform form enum values back to database values
function transformStatusForSubmit(status: string): string {
  console.log("[EditTaskForm] Transforming status for submission:", status);
  
  switch (status) {
    case "completed":
      return "Completed";
    case "inProgress":
      return "In Progress";
    case "onHold":
      return "On Hold";
    case "cancelled":
      return "Cancelled";
    case "toDo":
      return "Not Started";
    default:
      console.log("[EditTaskForm] Status not recognized for submission, defaulting to Pending:", status);
      return "Pending"; // Default if not matching
  }
}
