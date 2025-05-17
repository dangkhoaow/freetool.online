import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "./jwt-auth-adapter";
import { toast } from "@/components/ui/use-toast";
import apiClient from "@/lib/api-client";

// Define types here instead of importing from backend services
export type CreateResourceParams = {
  name: string;
  url?: string | null;
  filePath?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  projectId?: string;
  quantity?: number | null;
};

export type UpdateResourceParams = {
  name?: string;
  url?: string | null;
  filePath?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  projectId?: string;
  quantity?: number | null;
};

console.log('[USE-RESOURCES] Exported CreateResourceParams and UpdateResourceParams for better reusability and to resolve import errors');

console.log('[USE-RESOURCES] Updated CreateResourceParams and UpdateResourceParams to include fileSize, fileType, filePath and allow "quantity" as number | null for backend consistency and type safety');

console.log(`[HOOK:RESOURCES] Updated CreateResourceParams type to include quantity and remove userId`);

// Log initialization of hook for debugging
console.log('[HOOK] use-resources hook initialized');

export function useResources() {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      console.log("[HOOK:RESOURCES] Fetching resources");
      
      if (!session?.user?.id) {
        console.log("[HOOK:RESOURCES] No user session found in useResources");
        return { data: [], count: 0, error: null };
      }
      
      // Call API endpoint with the correct path (no leading slash as the base URL is already included)
      const response = await apiClient.get('api/projly/resources');
      console.log("[HOOK:RESOURCES] API response received:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:RESOURCES] Error fetching resources:", response.error);
        let errorMessage = 'Failed to fetch resources';
        
        if (typeof response.error === 'string') {
          errorMessage = response.error;
        } else if (response.error && typeof response.error === 'object') {
          const errorObj = response.error as Record<string, any>;
          errorMessage = errorObj.message ? String(errorObj.message) : 'An unknown error occurred';
        }
        
        toast({
          title: "Error fetching resources",
          description: errorMessage,
          variant: "destructive"
        });
        return { data: [], count: 0, error: errorMessage };
      }
      
      // Log the complete response for debugging
      console.log("[HOOK:RESOURCES] Complete response:", response);
      
      // Handle different response formats
      if (response.data) {
        // If response has a data property that contains an array of resources
        if (Array.isArray(response.data)) {
          console.log("[HOOK:RESOURCES] Response data is an array with", response.data.length, "items");
          return { data: response.data, count: response.data.length, error: null };
        } else if (typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
          // If response.data has a nested data property that's an array (common API pattern)
          console.log("[HOOK:RESOURCES] Response has nested data array with", response.data.data.length, "items");
          return response.data; // Return the complete response object with { data, count, error }
        } else if (typeof response.data === 'object') {
          // If response.data is an object but doesn't have a nested data array
          console.log("[HOOK:RESOURCES] Response data is an object:", response.data);
          return { data: [response.data], count: 1, error: null };
        }
      }
      
      console.log("[HOOK:RESOURCES] No valid resource data found in response");
      return { data: [], count: 0, error: null };
    },
    enabled: !!session?.user?.id
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: async (newResource: Partial<CreateResourceParams>) => {
      console.log('[HOOK:RESOURCES] Creating resource with input:', newResource);
      
      if (!session?.user?.id) {
        console.error('[HOOK:RESOURCES] No user session found in useCreateResource');
        throw new Error('You must be logged in to create a resource');
      }
      
      // Validate and filter input to only include expected fields
      const expectedKeys = ['name', 'url', 'filePath', 'fileType', 'projectId', 'quantity'];
      const filteredResource = Object.fromEntries(
        Object.entries(newResource).filter(([key]) => expectedKeys.includes(key))
      );
      console.log(`[HOOK:RESOURCES] Filtered resource data:`, filteredResource);
      
      const response = await apiClient.post('api/projly/resources', filteredResource);
      console.log('[HOOK:RESOURCES] API response received for resource creation:', response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error('[HOOK:RESOURCES] Error creating resource:', response.error);
        throw response.error;
      }
      
      return response;
    },
    onSuccess: (result) => {
      console.log('[HOOK:RESOURCES] Resource created successfully, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast({
        title: 'Resource created',
        description: 'The resource has been created successfully.'
      });
    },
    onError: (error: any) => {
      console.error('[HOOK:RESOURCES] Error in create resource mutation:', error);
      toast({
        title: 'Error creating resource',
        description: error.message || 'An error occurred while creating the resource.',
        variant: 'destructive'
      });
    }
  });
}

export function useUpdateResource(resourceId?: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: async (updatedResource: UpdateResourceParams) => {
      console.log("[HOOK:RESOURCES] Updating resource with ID:", resourceId, "Updates:", updatedResource);
      
      if (!resourceId) {
        console.error("[HOOK:RESOURCES] No resource ID provided to useUpdateResource");
        throw new Error("Resource ID is required");
      }
      
      if (!session?.user?.id) {
        console.error("[HOOK:RESOURCES] No user session found in useUpdateResource");
        throw new Error("You must be logged in to update a resource");
      }
      
      // Log and update field names if necessary, but types are changed to 'fileType'
      const expectedKeys = ['name', 'url', 'filePath', 'fileType', 'projectId', 'quantity'];
      const filteredUpdate = Object.fromEntries(
        Object.entries(updatedResource).filter(([key]) => expectedKeys.includes(key))
      );
      console.log(`[HOOK:RESOURCES] Filtered update data:`, filteredUpdate);
      
      const response = await apiClient.put(`api/projly/resources/${resourceId}`, filteredUpdate);
      console.log("[HOOK:RESOURCES] API response received for resource update:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:RESOURCES] Error updating resource:", response.error);
        throw response.error;
      }
      
      return response;
    },
    onSuccess: () => {
      console.log("[HOOK:RESOURCES] Resource updated successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast({
        title: "Resource updated",
        description: "The resource has been updated successfully."
      });
    },
    onError: (error: any) => {
      console.error("[HOOK:RESOURCES] Error in update resource mutation:", error);
      toast({
        title: "Error updating resource",
        description: error.message || "An error occurred while updating the resource.",
        variant: "destructive"
      });
    }
  });
}

export function useDeleteResource(resourceId?: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: async () => {
      console.log("[HOOK:RESOURCES] Deleting resource with ID:", resourceId);
      
      if (!resourceId) {
        console.error("[HOOK:RESOURCES] No resource ID provided to useDeleteResource");
        throw new Error("Resource ID is required");
      }
      
      if (!session?.user?.id) {
        console.error("[HOOK:RESOURCES] No user session found in useDeleteResource");
        throw new Error("You must be logged in to delete a resource");
      }
      
      const response = await apiClient.delete(`api/projly/resources/${resourceId}`);
      console.log("[HOOK:RESOURCES] API response received for resource deletion:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:RESOURCES] Error deleting resource:", response.error);
        throw response.error;
      }
      
      return response;
    },
    onSuccess: () => {
      console.log("[HOOK:RESOURCES] Resource deleted successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast({
        title: "Resource deleted",
        description: "The resource has been deleted successfully."
      });
    },
    onError: (error: any) => {
      console.error("[HOOK:RESOURCES] Error in delete resource mutation:", error);
      toast({
        title: "Error deleting resource",
        description: error.message || "An error occurred while deleting the resource.",
        variant: "destructive"
      });
    }
  });
}
