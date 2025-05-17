
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "./jwt-auth-adapter";

// Using relative import for api-client to avoid module resolution issues
import apiClient from "../../api-client";

// Define API response types
interface ApiResponse<T> {
  data: T | null;
  error: string | { message: string } | null;
  success: boolean;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Log import paths for debugging
console.log('[use-projects] Importing useSession from "./jwt-auth-adapter"');

// Log initialization of hook for debugging
console.log('[HOOK] use-projects hook initialized');

export function useProjects() {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log("[HOOK:PROJECTS] No user session found in useProjects");
        return [];
      }
      
      const userId = session.user.id;
      console.log("[HOOK:PROJECTS] Fetching projects for user:", userId);
      
      // Call API endpoint using the configured endpoint
      const response = await apiClient.get<Project[]>('api/projly/projects');
      console.log("[HOOK:PROJECTS] API response received:", response.success ? 'Success' : 'Error');
      
      if (!response.success) {
        console.error("[HOOK:PROJECTS] Error fetching projects:", response.error);
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : typeof response.error === 'object' && response.error !== null 
            ? response.error.message || String(response.error) 
            : 'Failed to fetch projects';
        
        toast({
          title: "Error fetching projects",
          description: errorMessage,
          variant: "destructive"
        });
        return [];
      }
      return response.data || [];
    },
    enabled: !!session?.user?.id
  });
}

export function useProject(id: string | undefined) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id || !session?.user?.id) {
        console.log("[HOOK:PROJECTS] No project ID or user session found in useProject");
        return null;
      }
      
      console.log("[HOOK:PROJECTS] Fetching project with ID:", id);
      // Call API endpoint with the correct path (no leading slash as the base URL is already included)
      const response = await apiClient.get(`api/projly/projects/${id}`);
      console.log("[HOOK:PROJECTS] API response received for project details:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:PROJECTS] Error fetching project:", response.error);
        toast({
          title: "Error fetching project",
          description: response.error.message,
          variant: "destructive"
        });
        return null;
      }
      return response.data;
    },
    enabled: !!id && !!session?.user?.id
  });
}

export function useProjectMembers(projectId: string | undefined) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      if (!projectId || !session?.user?.id) {
        console.log("[HOOK:PROJECTS] No project ID or user session found in useProjectMembers");
        return [];
      }
      
      console.log("[HOOK:PROJECTS] Fetching members for project with ID:", projectId);
      // Call API endpoint instead of service directly
      const response = await apiClient.get(`teams/${projectId}/members`);
      console.log("[HOOK:PROJECTS] API response received for project members:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:PROJECTS] Error fetching project members:", response.error);
        toast({
          title: "Error fetching project members",
          description: response.error.message,
          variant: "destructive"
        });
        return [];
      }
      return response.data || [];
    },
    enabled: !!projectId
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: async (project: { name: string } & Partial<any>) => {
      if (!session?.user?.id) {
        console.error("[HOOK:PROJECTS] No user session found in useCreateProject");
        throw new Error("You must be logged in to create a project");
      }
      
      console.log("[HOOK:PROJECTS] Creating new project:", project.name);
      // Call API endpoint instead of service directly
      const response = await apiClient.post('projects', project);
      console.log("[HOOK:PROJECTS] API response received for project creation:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:PROJECTS] Error creating project:", response.error);
        throw new Error(response.error.message || "Failed to create project");
      }
      
      return response;
    },
    onSuccess: () => {
      console.log("[HOOK:PROJECTS] Project created successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Project created",
        description: "Your project has been created successfully."
      });
    },
    onError: (error: any) => {
      console.error("[HOOK:PROJECTS] Error in create project mutation:", error);
      toast({
        title: "Error creating project",
        description: error.message || "An error occurred while creating the project.",
        variant: "destructive"
      });
    }
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<any>) => {
      if (!session?.user?.id) {
        console.error("[HOOK:PROJECTS] No user session found in useUpdateProject");
        throw new Error("You must be logged in to update a project");
      }
      
      console.log("[HOOK:PROJECTS] Updating project with ID:", id);
      // Call API endpoint instead of service directly
      const response = await apiClient.put(`projects/${id}`, updates);
      console.log("[HOOK:PROJECTS] API response received for project update:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:PROJECTS] Error updating project:", response.error);
        throw new Error(response.error.message || "Failed to update project");
      }
      
      return response;
    },
    onSuccess: (_, variables) => {
      console.log("[HOOK:PROJECTS] Project updated successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
      toast({
        title: "Project updated",
        description: "Your project has been updated successfully."
      });
    },
    onError: (error: any) => {
      console.error("[HOOK:PROJECTS] Error in update project mutation:", error);
      toast({
        title: "Error updating project",
        description: error.message || "An error occurred while updating the project.",
        variant: "destructive"
      });
    }
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!session?.user?.id) {
        console.error("[HOOK:PROJECTS] No user session found in useDeleteProject");
        throw new Error("You must be logged in to delete a project");
      }
      
      console.log("[HOOK:PROJECTS] Deleting project with ID:", id);
      // Call API endpoint instead of service directly
      const response = await apiClient.delete(`projects/${id}`);
      console.log("[HOOK:PROJECTS] API response received for project deletion:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:PROJECTS] Error deleting project:", response.error);
        throw new Error(response.error.message || "Failed to delete project");
      }
      
      return response;
    },
    onSuccess: () => {
      console.log("[HOOK:PROJECTS] Project deleted successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully."
      });
    },
    onError: (error: any) => {
      console.error("[HOOK:PROJECTS] Error in delete project mutation:", error);
      toast({
        title: "Error deleting project",
        description: error.message || "An error occurred while deleting the project.",
        variant: "destructive"
      });
    }
  });
}
