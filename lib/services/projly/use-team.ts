import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "./jwt-auth-adapter";

// Using relative import for api-client to avoid module resolution issues
import apiClient from "../../api-client";
import { API_ENDPOINTS } from "@/app/projly/config/apiConfig";

// Log API endpoints for debugging
console.log('[HOOK:TEAMS] API_ENDPOINTS.TEAMS.BASE:', API_ENDPOINTS.TEAMS.BASE);

// Log import paths for debugging
console.log('[use-team] Importing useSession from "./jwt-auth-adapter"');

// Removed duplicate `useQuery` import and incorrect `Team` type import

// Types moved from services to avoid direct imports
type TeamMemberWithUser = {
  id: string;
  teamId: string;
  userId: string;
  role?: string;
  department?: string;
  createdAt?: Date;
  updatedAt?: Date;
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
};

export type TeamWithProject = {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  project?: {
    id: string;
    name: string;
    description?: string;
    ownerId?: string;
  };
  members?: TeamMemberWithUser[];
};

// Log initialization of hook for debugging
console.log('[HOOK] use-team hook initialized');

// Define Team type for consistency
export type Team = {
  id: string;
  name: string;
  description?: string;
  ownerId?: string;
  allowSendAllRemindEmail?: boolean; // Toggle for sending email reminders to all team members
  createdAt?: Date;
  updatedAt?: Date;
  owner?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  project?: {
    id: string;
    name: string;
    description?: string;
    ownerId?: string;
  };
  projects?: {
    id: string;
    teamId: string;
    projectId: string;
    createdAt?: Date;
    updatedAt?: Date;
    project: {
      id: string;
      name: string;
      description?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
      createdAt?: Date;
      updatedAt?: Date;
      ownerId?: string;
    };
  }[];
  members?: TeamMemberWithUser[];
};

export const useTeams = () => {
  const { data: session } = useSession();
  
  return useQuery<Team[], Error>({
    queryKey: ["teams"],
    queryFn: async () => {
      console.log("[HOOK:TEAMS] Fetching all teams");
      
      if (!session?.user?.id) {
        console.log("[HOOK:TEAMS] No user session found in useTeams");
        return [] as Team[];
      }
      
      // Call API endpoint instead of service directly
      // Use the proper API path from API_ENDPOINTS
      console.log('[HOOK:TEAMS] Using API endpoint:', '/api/projly/teams');
      const response = await apiClient.get('/api/projly/teams');
      console.log("[HOOK:TEAMS] API response received:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:TEAMS] Error fetching teams:", response.error);
        toast({
          title: "Error fetching teams",
          description: typeof response.error === 'string' ? response.error : (response.error as Error).message || "Unknown error",
          variant: "destructive"
        });
        throw response.error;
      }
      
      return (response.data || []) as Team[];
    },
    enabled: !!session?.user?.id
  });
};

export const useTeam = (id: string) => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["teams", id],
    queryFn: async () => {
      console.log("[HOOK:TEAMS] Fetching team with ID:", id);
      
      if (!id || !session?.user?.id) {
        console.log("[HOOK:TEAMS] No team ID or user session found in useTeam");
        return null;
      }
      
      // Call API endpoint instead of service directly
      console.log(`[HOOK:TEAMS] Using API endpoint: /api/projly/teams/${id}`);
      const response = await apiClient.get(`/api/projly/teams/${id}`);
      console.log("[HOOK:TEAMS] API response received for team details:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:TEAMS] Error fetching team:", response.error);
        toast({
          title: "Error fetching team",
          description: typeof response.error === 'string' ? response.error : (response.error as Error).message || "Unknown error",
          variant: "destructive"
        });
        throw response.error;
      }
      
      return response.data as TeamWithProject;
    },
    enabled: !!id && !!session?.user?.id
  });
};

export const useTeamMembers = (teamId: string) => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["teams", teamId, "members"],
    queryFn: async () => {
      console.log("[HOOK:TEAMS] Fetching members for team with ID:", teamId);
      
      if (!teamId || !session?.user?.id) {
        console.log("[HOOK:TEAMS] No team ID or user session found in useTeamMembers");
        return [];
      }
      
      // Call API endpoint instead of service directly
      console.log(`[HOOK:TEAMS] Using API endpoint: /api/projly/teams/${teamId}/members`);
      const response = await apiClient.get(`/api/projly/teams/${teamId}/members`);
      console.log("[HOOK:TEAMS] API response received for team members:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:TEAMS] Error fetching team members:", response.error);
        toast({
          title: "Error fetching team members",
          description: typeof response.error === 'string' ? response.error : (response.error as Error).message || "Unknown error",
          variant: "destructive"
        });
        throw response.error;
      }
      
      return response.data || [];
    },
    enabled: !!teamId && !!session?.user?.id
  });
};

// Define an interface for the project data to fix the TypeScript errors
interface ProjectData {
  id: string;
  name: string;
  ownerId?: string;
}

export const useTeamMembersCount = (teamId: string, projectId?: string) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["teams", teamId, "members-count", projectId],
    queryFn: async () => {
      console.log(`[HOOK:TEAMS] Fetching member count for team: ${teamId}, projectId: ${projectId || 'none'}`);
      
      if (!teamId || !session?.user?.id) {
        console.log("[HOOK:TEAMS] No team ID or user session found in useTeamMembersCount");
        return 0;
      }
      
      // Get team members via API client
      console.log(`[HOOK:TEAMS] Using API endpoint: /api/projly/teams/${teamId}/members`);
      const membersResponse = await apiClient.get(`/api/projly/teams/${teamId}/members`);
      if (membersResponse.error) {
        console.error("[HOOK:TEAMS] Error fetching team members:", membersResponse.error);
        toast({
          title: "Error fetching team members",
          description: typeof membersResponse.error === 'string' ? membersResponse.error : (membersResponse.error as Error).message || "Unknown error",
          variant: "destructive"
        });
        throw membersResponse.error;
      }
      
      const membersData = (membersResponse.data || []) as TeamMemberWithUser[];
      let count = membersData.length || 0;
      console.log(`[HOOK:TEAMS] Team ${teamId} has ${count} direct members`);
      
      // If team is associated with a project, include project owner in count
      if (projectId) {
        // First try to get project data from cache
        const projectData = queryClient.getQueryData<ProjectData>(["project", projectId]);
        if (projectData) {
          console.log("[HOOK:TEAMS] Found project data in cache");
          // Project data is in cache, use it
          if (projectData.ownerId) {
            // Check if owner is not already counted in team members
            const isOwnerAlreadyMember = membersData?.some(
              member => member.userId === projectData.ownerId
            );
            
            if (!isOwnerAlreadyMember) {
              count += 1;
              console.log(`[HOOK:TEAMS] Added project owner to count, new count: ${count}`);
            }
          }
        } else {
          // Fetch project data via API to get owner
          console.log("[HOOK:TEAMS] Fetching project data for owner information");
          const projectResponse = await apiClient.get(`projects/${projectId}`);
          if (!projectResponse.error && projectResponse.data) {
            const projectFetchData = projectResponse.data as ProjectData;
            const isOwnerAlreadyMember = membersData?.some(
              member => member.userId === projectFetchData.ownerId
            );
            
            if (!isOwnerAlreadyMember && projectFetchData.ownerId) {
              count += 1;
              console.log(`[HOOK:TEAMS] Added project owner to count, new count: ${count}`);
            }
          }
        }
      }
      
      return count;
    },
    enabled: !!teamId && !!session?.user?.id
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (team: { 
      name: string; 
      description?: string; 
      projectId?: string;
      projectIds?: string[];
      allowSendAllRemindEmail?: boolean; // Added new field for email notification toggle
    }) => {
      console.log("[HOOK:TEAMS] Creating team:", team);
      if (!session?.user?.id) {
        console.error("[HOOK:TEAMS] No user session found in useCreateTeam");
        throw new Error("You must be logged in to create a team");
      }
      
      // Call API endpoint instead of service directly
      console.log('[HOOK:TEAMS] Using API endpoint: /api/projly/teams');
      const response = await apiClient.post('/api/projly/teams', team);
      console.log("[HOOK:TEAMS] API response received for team creation:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:TEAMS] Error creating team:", response.error);
        throw response.error;
      }
      
      return response.data as Team;
    },
    onSuccess: () => {
      console.log("[HOOK:TEAMS] Team created successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Team created",
        description: "Team has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("[HOOK:TEAMS] Error in create team mutation:", error);
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : (error as Error).message || "Failed to create team",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string; 
      data: { 
        name?: string; 
        description?: string; 
        projectId?: string;
        projectIds?: string[];
        allowSendAllRemindEmail?: boolean; // Added new field for email notification toggle
      } 
    }) => {
      console.log(`[HOOK:TEAMS] Updating team ${id} with data:`, data);
      if (!session?.user?.id) {
        console.error("[HOOK:TEAMS] No user session found in useUpdateTeam");
        throw new Error("You must be logged in to update a team");
      }
      
      // Format the data correctly for the API, including the allowSendAllRemindEmail field
      const teamData = {
        name: data.name,
        description: data.description,
        projectId: data.projectId,
        projectIds: data.projectIds,
        allowSendAllRemindEmail: data.allowSendAllRemindEmail
      };
      
      console.log(`[HOOK:TEAMS] Sending project IDs:`, data.projectIds);
      
      // Log the complete data being sent to ensure allowSendAllRemindEmail is included
      console.log(`[HOOK:TEAMS] Using API endpoint: /api/projly/teams/${id}`, JSON.stringify(teamData));
      const response = await apiClient.put(`/api/projly/teams/${id}`, teamData);
      console.log("[HOOK:TEAMS] API response received for team update:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:TEAMS] Error updating team:", response.error);
        throw response.error;
      }
      
      return response.data as Team;
    },
    onSuccess: (_, variables) => {
      console.log("[HOOK:TEAMS] Team updated successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["teams", variables.id] });
      toast({
        title: "Team updated",
        description: "Team has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("[HOOK:TEAMS] Error in update team mutation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update team.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("[HOOK:TEAMS] Deleting team with ID:", id);
      
      if (!session?.user?.id) {
        console.error("[HOOK:TEAMS] No user session found in useDeleteTeam");
        throw new Error("You must be logged in to delete a team");
      }
      
      // Call API endpoint instead of service directly
      console.log(`[HOOK:TEAMS] Using API endpoint: /api/projly/teams/${id}`);
      const response = await apiClient.delete(`/api/projly/teams/${id}`);
      console.log("[HOOK:TEAMS] API response received for team deletion:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:TEAMS] Error deleting team:", response.error);
        throw response.error;
      }
      
      return true;
    },
    onSuccess: () => {
      console.log("[HOOK:TEAMS] Team deleted successfully, invalidating queries");
      // Refresh teams list
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      // Also refresh members list to remove members of deleted team
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({
        title: "Success",
        description: "Team has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error("[HOOK:TEAMS] Error in delete team mutation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete team.",
        variant: "destructive",
      });
    },
  });
};
