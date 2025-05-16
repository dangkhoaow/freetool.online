import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "./jwt-auth-adapter";
import apiClient from "@/lib/api-client";

// Log initialization of hook for debugging
console.log('[HOOK] use-tasks hook initialized');

export function useTasks(filters?: { projectId?: string; assignedTo?: string; status?: string }) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      console.log("[HOOK:TASKS] Fetching tasks with filters:", filters);
      
      if (!session?.user?.id) {
        console.log("[HOOK:TASKS] No user session found in useTasks");
        return [];
      }
      
      // Prepare query parameters for API request
      const queryParams: Record<string, any> = {};
      if (filters) {
        if (filters.projectId) queryParams.projectId = filters.projectId;
        if (filters.assignedTo) queryParams.assignedTo = filters.assignedTo;
        if (filters.status) queryParams.status = filters.status;
      }
      
      console.log("[HOOK:TASKS] Making API request with params:", queryParams);
      
      // Call API endpoint instead of service directly
      const response = await apiClient.get('tasks', queryParams);
      console.log("[HOOK:TASKS] API response received:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:TASKS] Error fetching tasks:", response.error);
        toast({
          title: "Error fetching tasks",
          description: response.error.message,
          variant: "destructive"
        });
        return [];
      }
      console.log("[HOOK:TASKS] Tasks data received, count:", Array.isArray(response.data) ? response.data.length : 0);
      return response.data || [];
    },
    enabled: !!session?.user?.id
  });
}

export function useTask(id: string | undefined) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      console.log("[HOOK:TASKS] Fetching task with ID:", id);
      
      if (!id || !session?.user?.id) {
        console.log("[HOOK:TASKS] No task ID or user session found in useTask");
        return null;
      }
      
      // Call API endpoint instead of service directly
      const response = await apiClient.get(`tasks/${id}`);
      console.log("[HOOK:TASKS] API response received for task details:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:TASKS] Error fetching task:", response.error);
        toast({
          title: "Error fetching task",
          description: response.error.message,
          variant: "destructive"
        });
        return null;
      }
      console.log("Task data response:", response.data);
      return response.data;
    },
    enabled: !!id && !!session?.user?.id
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: async (task: { 
      title: string;
      projectId?: string;
      description?: string;
      assignedTo?: string;
      dueDate?: Date;
      startDate?: Date;
      status?: string;
    }) => {
      console.log("[HOOK:TASKS] Creating task:", task);
      if (!session?.user?.id) {
        console.error("[HOOK:TASKS] No user session found in useCreateTask");
        throw new Error("You must be logged in to create a task");
      }
      
      // Call API endpoint instead of service directly
      const response = await apiClient.post('tasks', task);
      console.log("[HOOK:TASKS] API response received for task creation:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:TASKS] Error creating task:", response.error);
        throw new Error(response.error.message || "Failed to create task");
      }
      
      return response;
    },
    onSuccess: (result) => {
      console.log("[HOOK:TASKS] Task created successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      
      // Safe type check for response data
      const taskId = result.data && typeof result.data === 'object' && 'id' in result.data ? 
        (result.data as { id: string }).id : undefined;
        
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      }
      toast({
        title: "Task created",
        description: "The task has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating task",
        description: error.message || "An error occurred while creating the task.",
        variant: "destructive"
      });
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      console.log('[HOOK:TASKS][useUpdateTask] mutationFn called with:', { id, updates });
      if (typeof updates === 'undefined') {
        console.error('[HOOK:TASKS][useUpdateTask] ERROR: updates is undefined!');
      } else {
        console.log('[HOOK:TASKS][useUpdateTask] updates keys:', updates && typeof updates === 'object' ? Object.keys(updates) : updates);
      }
      console.log("Updating task with ID:", id, "Updates:", updates);
      if (updates && typeof updates === 'object') {
        Object.entries(updates).forEach(([k, v]) => {
          console.log(`[HOOK:TASKS][useUpdateTask] update field: ${k} ->`, v, 'Type:', typeof v);
        });
      }
      
      if (!session?.user?.id) {
        throw new Error("You must be logged in to update a task");
      }
      
      // Call API endpoint instead of service directly
      console.log('[HOOK:TASKS][useUpdateTask] Sending PUT request to tasks/' + id + ' with updates:', updates);
      const response = await apiClient.put(`tasks/${id}`, updates);
      console.log('[HOOK:TASKS][useUpdateTask] PUT response:', response);
      console.log("[HOOK:TASKS] API response received for task update:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:TASKS] Error updating task:", response.error);
        throw new Error(response.error.message || "Failed to update task");
      }
      
      return response;
    },
    onSuccess: (result, variables) => {
      console.log("[HOOK:TASKS] Task updated successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      
      // Use variables.id which we know is valid, and also invalidate with data.id if available
      queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
      
      // Additionally check response data
      const taskId = result.data && typeof result.data === 'object' && 'id' in result.data ? 
        (result.data as { id: string }).id : undefined;
        
      if (taskId && taskId !== variables.id) {
        queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      }
      toast({
        title: "Task updated",
        description: "The task has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating task",
        description: error.message || "An error occurred while updating the task.",
        variant: "destructive"
      });
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log("[HOOK:TASKS] Deleting task:", id);
      if (!session?.user?.id) {
        console.error("[HOOK:TASKS] No user session found in useDeleteTask");
        throw new Error("You must be logged in to delete a task");
      }
      
      // Call API endpoint instead of service directly
      const response = await apiClient.delete(`tasks/${id}`);
      console.log("[HOOK:TASKS] API response received for task deletion:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:TASKS] Error deleting task:", response.error);
        throw new Error(response.error.message || "Failed to delete task");
      }
      
      return response;
    },
    onSuccess: (result, id) => {
      console.log("[HOOK:TASKS] Task deleted successfully, invalidating queries");
      // For delete operations, we know the ID from the variables
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.removeQueries({ queryKey: ["task", id] });
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting task",
        description: error.message || "An error occurred while deleting the task.",
        variant: "destructive"
      });
    }
  });
}
