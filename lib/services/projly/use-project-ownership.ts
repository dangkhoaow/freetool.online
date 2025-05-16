
import { useQuery } from "@tanstack/react-query";
import { useSession } from "./jwt-auth-adapter";
import apiClient from "@/lib/api-client";

// Log initialization of hook for debugging
console.log('[HOOK] use-project-ownership hook initialized');

/**
 * Custom hook to check if the current user owns any projects
 */
export function useProjectOwnership() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  return useQuery({
    queryKey: ["project-ownership", userId],
    queryFn: async () => {
      console.log("Checking if user owns any projects or is a member at", new Date().toISOString());
      
      if (!userId) {
        console.log("No active user session found");
        return false;
      }
      
      console.log("[HOOK:PROJECT-OWNERSHIP] Current user ID:", userId);
      
      // Use the API client instead of Prisma service directly
      try {
        // Get all projects accessible to the user (both owned and member)
        const response = await apiClient.get('projects');
        console.log("[HOOK:PROJECT-OWNERSHIP] API response received:", response.error ? 'Error' : 'Success');
        
        if (response.error) {
          console.error("[HOOK:PROJECT-OWNERSHIP] Error checking project access:", response.error);
          throw response.error;
        }
        
        const hasProjects = Array.isArray(response.data) && response.data.length > 0;
        console.log("[HOOK:PROJECT-OWNERSHIP] User has access to projects:", hasProjects, "Count:", Array.isArray(response.data) ? response.data.length : 0);
        
        return hasProjects;
      } catch (error) {
        console.error("Error in useProjectOwnership:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: true, // Ensure we refetch when window regains focus
    refetchOnMount: true // Ensure we refetch when component mounts
  });
}
