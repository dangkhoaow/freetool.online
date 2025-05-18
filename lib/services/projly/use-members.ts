import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "./jwt-auth-adapter";

// Using relative import for api-client to avoid module resolution issues
import apiClient from "../../api-client";
import { API_ENDPOINTS } from "@/app/projly/config/apiConfig";
import { useProjectMembers } from "./use-projects"; // Import useProjectMembers for the new hook

// Log import paths for debugging
console.log('[use-members] Importing useSession and apiClient');
console.log('[HOOK:MEMBERS] API_ENDPOINTS.TEAMS.BASE:', API_ENDPOINTS.TEAMS.BASE);

// Types moved from services to avoid direct imports
export type TeamMemberWithUser = {
  id: string;
  teamId: string;
  userId: string;
  role?: string;
  department?: string;
  createdAt?: Date;
  updatedAt?: Date;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    image?: string;
  };
};

// Log initialization of hook for debugging
console.log('[HOOK] use-members hook initialized');

export const useAccessibleMembers = () => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["accessible-members"],
    queryFn: async () => {
      console.log("[HOOK:MEMBERS] Fetching accessible members (from teams user is part of)");
      if (!session?.user?.id) {
        console.log("[HOOK:MEMBERS] No user session found in useAccessibleMembers");
        return [];
      }
      
      // Call the new API endpoint that filters members by user's team associations
      console.log('[HOOK:MEMBERS] Using API endpoint: /api/projly/members/accessible');
      const response = await apiClient.get('/api/projly/members/accessible');
      console.log("[HOOK:MEMBERS] API response received for accessible members:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:MEMBERS] Error fetching accessible members:", response.error);
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error && typeof response.error === 'object' && response.error !== null && 'message' in response.error) 
            ? (response.error as { message: string }).message 
            : 'Unknown error';
            
        toast({
          title: "Error fetching accessible members",
          description: errorMessage,
          variant: "destructive"
        });
        throw response.error;
      }
      
      console.log(`[HOOK:MEMBERS] Successfully fetched ${response.data?.length || 0} accessible members`);
      return response.data as TeamMemberWithUser[];
    },
    enabled: !!session?.user?.id
  });
};

/**
 * Hook to fetch accessible project members - combines accessible members with project filtering
 * @param projectId - The ID of the project to filter members by
 * @returns Query result with accessible members filtered by project
 */
export const useAccessibleProjectMembers = (projectId: string | undefined) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ["accessible-project-members", projectId],
    queryFn: async () => {
      console.log(`[HOOK:MEMBERS] Fetching accessible project members for project: ${projectId}`);
      
      if (!projectId) {
        console.log("[HOOK:MEMBERS] No project ID provided for useAccessibleProjectMembers");
        return [];
      }
      
      if (!session?.user?.id) {
        console.log("[HOOK:MEMBERS] No user session found in useAccessibleProjectMembers");
        return [];
      }
      
      try {
        // Fetch project members directly
        console.log(`[HOOK:MEMBERS] Fetching members for project: ${projectId}`);
        const response = await apiClient.get(`/api/projly/projects/${projectId}/members`);
        if (response.error) {
          console.error('[HOOK:MEMBERS] Error fetching project members:', response.error);
          toast({
            title: 'Error fetching project members',
            description: typeof response.error === 'string' ? response.error : (response.error as any).message || 'Unknown error',
            variant: 'destructive'
          });
          return [];
        }
        return response.data || [];
      } catch (error) {
        console.error('[HOOK:MEMBERS] Error in useAccessibleProjectMembers:', error);
        // Fall back to project members if there's an error
        try {
          console.log(`[HOOK:MEMBERS] Falling back to direct project members fetch for project: ${projectId}`);
          const fallbackResponse = await apiClient.get(`api/projly/projects/${projectId}/members`);
          return fallbackResponse.data || [];
        } catch (fallbackError) {
          console.error('[HOOK:MEMBERS] Fallback also failed:', fallbackError);
          return [];
        }
      }
    },
    enabled: !!projectId && !!session?.user?.id,
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes - using gcTime instead of deprecated cacheTime
    // This ensures the query refreshes when the project ID changes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false
  });
};

export const useMembers = (teamId?: string) => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["members", teamId],
    queryFn: async () => {
      console.log("[HOOK:MEMBERS] Fetching all members");
      if (!session?.user?.id) {
        console.log("[HOOK:MEMBERS] No user session found in useMembers");
        return [];
      }
      
      // Call API endpoint with optional teamId filter
      const params = teamId ? { teamId } : undefined;
      console.log('[HOOK:MEMBERS] Using API endpoint: /api/projly/members');
      const response = await apiClient.get('/api/projly/members', params);
      console.log("[HOOK:MEMBERS] API response received:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:MEMBERS] Error fetching members:", response.error);
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error && typeof response.error === 'object' && response.error !== null && 'message' in response.error) 
            ? (response.error as { message: string }).message 
            : 'Unknown error';
            
        toast({
          title: "Error fetching members",
          description: errorMessage,
          variant: "destructive"
        });
        throw response.error;
      }
      
      // Extract members from teams response
      if (Array.isArray(response.data)) {
        console.log("[HOOK:MEMBERS] Processing teams response to extract members");
        
        // Check if the response is an array of teams with nested members
        if (response.data.length > 0 && 'members' in response.data[0]) {
          // Extract and flatten all members from all teams
          const allMembers = response.data.flatMap(team => {
            // Ensure team.members is an array before mapping
            if (Array.isArray(team.members)) {
              return team.members;
            }
            return [];
          });
          
          console.log(`[HOOK:MEMBERS] Extracted ${allMembers.length} members from ${response.data.length} teams`);
          
          // Filter by teamId if specified
          const filteredMembers = teamId 
            ? allMembers.filter(member => member.teamId === teamId)
            : allMembers;
            
          return filteredMembers as TeamMemberWithUser[];
        }
      }
      
      // If the response is already in the expected format, return it directly
      return response.data as TeamMemberWithUser[];
    },
    enabled: !!session?.user?.id
  });
};

export const useMember = (id: string) => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["members", id],
    queryFn: async () => {
      console.log("[HOOK:MEMBERS] Fetching member with ID:", id);
      if (!id || !session?.user?.id) {
        console.log("[HOOK:MEMBERS] No member ID or user session found in useMember");
        return null;
      }
      
      // Call API endpoint instead of service directly
      console.log(`[HOOK:MEMBERS] Using API endpoint: /api/projly/members/${id}`);
      const response = await apiClient.get(`/api/projly/members/${id}`);
      console.log("[HOOK:MEMBERS] API response received for member details:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:MEMBERS] Error fetching member:", response.error);
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error && typeof response.error === 'object' && response.error !== null && 'message' in response.error) 
            ? (response.error as { message: string }).message 
            : 'Unknown error';
            
        toast({
          title: "Error fetching member",
          description: errorMessage,
          variant: "destructive"
        });
        throw response.error;
      }
      
      return response.data as TeamMemberWithUser;
    },
    enabled: !!id && !!session?.user?.id
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (member: { userId: string; teamId: string; role?: string; department?: string }) => {
      console.log("[HOOK:MEMBERS] Creating member:", member);
      if (!session?.user?.id) {
        console.error("[HOOK:MEMBERS] No user session found in useCreateMember");
        throw new Error("You must be logged in to add a team member");
      }
      
      // Call API endpoint instead of service directly
      console.log('[HOOK:MEMBERS] Using API endpoint: /api/projly/members');
      const response = await apiClient.post('/api/projly/members', member);
      console.log("[HOOK:MEMBERS] API response received for member creation:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:MEMBERS] Error creating member:", response.error);
        throw response.error;
      }
      
      return response.data as TeamMemberWithUser;
    },
    onSuccess: () => {
      console.log("[HOOK:MEMBERS] Member created successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Success",
        description: "Team member has been added successfully.",
      });
    },
    onError: (error: any) => {
      console.error("[HOOK:MEMBERS] Error in create member mutation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add team member.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { role?: string; department?: string } }) => {
      console.log("[HOOK:MEMBERS] Updating member with ID:", id, "Updates:", data);
      
      if (!session?.user?.id) {
        console.error("[HOOK:MEMBERS] No user session found in useUpdateMember");
        throw new Error("You must be logged in to update a team member");
      }
      
      // Call API endpoint instead of service directly
      console.log(`[HOOK:MEMBERS] Using API endpoint: /api/projly/members/${id}`);
      const response = await apiClient.put(`/api/projly/members/${id}`, data);
      console.log("[HOOK:MEMBERS] API response received for member update:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:MEMBERS] Error updating member:", response.error);
        throw response.error;
      }
      
      return response.data as TeamMemberWithUser;
    },
    onSuccess: (_, variables) => {
      console.log("[HOOK:MEMBERS] Member updated successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["members", variables.id] });
      toast({
        title: "Success",
        description: "Team member has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("[HOOK:MEMBERS] Error in update member mutation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update team member.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("[HOOK:MEMBERS] Deleting member with ID:", id);
      
      if (!session?.user?.id) {
        console.error("[HOOK:MEMBERS] No user session found in useDeleteMember");
        throw new Error("You must be logged in to remove a team member");
      }
      
      // Call API endpoint instead of service directly
      console.log(`[HOOK:MEMBERS] Using API endpoint: /api/projly/members/${id}`);
      const response = await apiClient.delete(`/api/projly/members/${id}`);
      console.log("[HOOK:MEMBERS] API response received for member deletion:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:MEMBERS] Error deleting member:", response.error);
        throw response.error;
      }
      
      return response.data;
    },
    onSuccess: () => {
      console.log("[HOOK:MEMBERS] Member deleted successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Success",
        description: "Team member has been removed successfully.",
      });
    },
    onError: (error: any) => {
      console.error("[HOOK:MEMBERS] Error in delete member mutation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member.",
        variant: "destructive",
      });
    },
  });
};
