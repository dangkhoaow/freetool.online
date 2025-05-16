import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "./jwt-auth-adapter";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from '@/app/projly/config/apiConfig';

// Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  assignedTo?: string;
  dueDate?: Date | string;
  startDate?: Date | string;
  status?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

// Log initialization of hook for debugging
console.log('[HOOK] use-tasks hook initialized');

export function useTasks(filters?: { projectId?: string; assignedTo?: string; status?: string }) {
  const { data: session } = useSession();
  
  return useQuery<Task[], Error>({
    queryKey: ["tasks", filters],
    queryFn: async (): Promise<Task[]> => {
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
      
      try {
        const response = await apiClient.get<ApiResponse<Task[]>>(API_ENDPOINTS.TASKS.ALL, queryParams);
        console.log("[HOOK:TASKS] API response received:", response.error ? 'Error' : 'Success');
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (!response.data) {
          return [];
        }
        
        console.log("[HOOK:TASKS] Tasks data received, count:", response.data.length);
        return response.data;
      } catch (error) {
        console.error("[HOOK:TASKS] Error fetching tasks:", error);
        toast({
          title: "Error fetching tasks",
          description: error instanceof Error ? error.message : 'Failed to fetch tasks',
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!session?.user?.id
  });
}

export function useTask(id: string | undefined) {
  const { data: session } = useSession();
  
  return useQuery<Task | null, Error>({
    queryKey: ["task", id],
    queryFn: async (): Promise<Task | null> => {
      console.log("[HOOK:TASKS] Fetching task with ID:", id);
      
      if (!id || !session?.user?.id) {
        console.log("[HOOK:TASKS] No task ID or user session found in useTask");
        return null;
      }
      
      try {
        const response = await apiClient.get<ApiResponse<Task>>(
          API_ENDPOINTS.TASKS.BY_ID.replace(':id', id)
        );
        
        console.log("[HOOK:TASKS] API response received for task details:", response.error ? 'Error' : 'Success');
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (!response.data) {
          return null;
        }
        
        console.log("Task data response:", response.data);
        return response.data;
      } catch (error) {
        console.error("[HOOK:TASKS] Error fetching task:", error);
        toast({
          title: "Error fetching task",
          description: error instanceof Error ? error.message : 'Failed to fetch task',
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: !!id && !!session?.user?.id
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation<Task, Error, Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>({
    mutationFn: async (task) => {
      console.log("[HOOK:TASKS] Creating task:", task);
      
      if (!session?.user?.id) {
        throw new Error("Authentication required");
      }

      try {
        const response = await apiClient.post<ApiResponse<Task>>(
          API_ENDPOINTS.TASKS.CREATE, 
          task
        );
        
        console.log("[HOOK:TASKS] API response received:", response.error ? 'Error' : 'Success');

        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.data) {
          throw new Error('No data returned from server');
        }

        console.log("[HOOK:TASKS] Task created successfully:", response.data);
        return response.data;
      } catch (error) {
        console.error("[HOOK:TASKS] Error creating task:", error);
        toast({
          title: "Error creating task",
          description: error instanceof Error ? error.message : 'Failed to create task',
          variant: "destructive"
        });
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });
}
