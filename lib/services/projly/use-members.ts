import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "./jwt-auth-adapter";

// Using relative import for api-client to avoid module resolution issues
import apiClient from "../../api-client";

// Log import paths for debugging
console.log('[use-members] Importing useSession and apiClient');

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
      const response = await apiClient.get('members', params);
      console.log("[HOOK:MEMBERS] API response received:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:MEMBERS] Error fetching members:", response.error);
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error && typeof response.error === 'object' && 'message' in response.error) 
            ? response.error.message 
            : 'Unknown error';
            
        toast({
          title: "Error fetching members",
          description: errorMessage,
          variant: "destructive"
        });
        throw response.error;
      }
      
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
      const response = await apiClient.get(`members/${id}`);
      console.log("[HOOK:MEMBERS] API response received for member details:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:MEMBERS] Error fetching member:", response.error);
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error && typeof response.error === 'object' && 'message' in response.error) 
            ? response.error.message 
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
      const response = await apiClient.post('members', member);
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
      const response = await apiClient.put(`members/${id}`, data);
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
      const response = await apiClient.delete(`members/${id}`);
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
