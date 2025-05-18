import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskFormValues } from "../schemas/taskSchema";
import { useAuth } from "../../../contexts/AuthContext";
import { useProfiles } from "@/lib/services/projly/use-profile";
// Log initialization for debugging
console.log('[useTaskForm] useProfiles hook imported and initialized');
import { Profile } from "@/app/projly/projects/new/page";
// Log import for debugging
console.log('[useTaskForm] Profile type imported from app/projly/projects/new/page');
import { useState } from "react";
import { parseDateSafe, toISOStringSafe, formatDateForInput, createUTCDateAtNoon } from "../../../utils/dateUtils";

// If the TaskWithDetails import is causing TypeScript errors, we can create a simplified type here:
interface TaskWithDetails {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  dueDate?: string | Date | null;
  startDate?: string | Date | null;
  projectId?: string | null;
  assignedTo?: string | null;
  project?: {
    id: string;
    name: string;
  } | null;
  assignee?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  } | null;
}

export const useTaskForm = (
  defaultValues?: Partial<TaskFormValues>,
  onSuccess?: (data: TaskFormValues) => void
) => {
  const { user } = useAuth();
  const { data: profiles, isLoading: isLoadingProfiles } = useProfiles();
  const [isPending, setIsPending] = useState(false);

  // Prepare default values
  const preparedDefaults: Partial<TaskFormValues> = {
    title: "",
    description: "",
    status: "toDo" as const, // Explicitly typed as a literal
    dueDate: null,
    startDate: null,
    projectId: null,
    assignedTo: null,
    ...defaultValues
  };

  console.log("Prepared form defaults:", preparedDefaults);
  
  if (preparedDefaults.dueDate) {
    console.log("Due date type:", Object.prototype.toString.call(preparedDefaults.dueDate));
    // Safely get ISO string
    const dueIso = toISOStringSafe(preparedDefaults.dueDate);
    console.log("Due date ISO (safe):", dueIso);
  }
  
  if (preparedDefaults.startDate) {
    console.log("Start date type:", Object.prototype.toString.call(preparedDefaults.startDate));
    // Safely get ISO string
    const startIso = toISOStringSafe(preparedDefaults.startDate);
    console.log("Start date ISO (safe):", startIso);
  }

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: preparedDefaults,
  });

  const handleSubmit = async (data: TaskFormValues) => {
    try {
      console.log("Form submitted with data:", data);
      
      if (data.dueDate) {
        // Safely get ISO string
        const dueIso = toISOStringSafe(data.dueDate);
        console.log("Submitted due date ISO (safe):", dueIso);
      }
      
      if (data.startDate) {
        // Safely get ISO string
        const startIso = toISOStringSafe(data.startDate);
        console.log("Submitted start date ISO (safe):", startIso);
      }
      
      setIsPending(true);
      if (onSuccess) {
        await onSuccess(data);
      }
    } finally {
      setIsPending(false);
    }
  };

  // Ensure profiles is always an array and convert to the correct Profile type if needed
  const safeProfiles: Profile[] = Array.isArray(profiles) ? profiles.map(profile => {
    // Make sure each profile has the required userId field
    if (!('userId' in profile) && profile.id) {
      return {
        ...profile,
        userId: profile.id, // Use id as userId if not present
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || ''
      } as Profile;
    }
    return profile as Profile;
  }) : [];
  console.log("[useTaskForm] Profiles data:", safeProfiles.length, "profiles available");
  
  return {
    form,
    profiles: safeProfiles,
    isLoadingProfiles,
    isPending,
    onSubmit: handleSubmit,
  };
};
