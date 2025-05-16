
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "./jwt-auth-adapter";
import apiClient from "@/lib/api-client";

// Log initialization of hook for debugging
console.log('[HOOK] use-profile hook initialized');

export function useUserProfile() {
  const { data: session } = useSession();
  const user = session?.user;
  
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) {
        console.log("[HOOK:PROFILE] No user session found in useUserProfile");
        return null;
      }
      
      console.log("[HOOK:PROFILE] Fetching profile for user ID:", user.id);
      // Call API endpoint instead of service directly
      const response = await apiClient.get(`profiles/me`);
      console.log("[HOOK:PROFILE] API response received for user profile:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:PROFILE] Error fetching profile:", response.error);
        toast({
          title: "Error fetching profile",
          description: response.error.message,
          variant: "destructive"
        });
        return null;
      }
      
      console.log("[HOOK:PROFILE] Successfully fetched user profile");
      return response.data;
    },
    enabled: !!user
  });
}

// Add the useProfile function that was missing
export function useProfile() {
  // This is an alias for useUserProfile to maintain backward compatibility
  return useUserProfile();
}

export function useProfiles() {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log("[HOOK:PROFILE] No user session found in useProfiles");
        return [];
      }
      
      console.log("[HOOK:PROFILE] Fetching all profiles");
      // Call API endpoint instead of service directly
      const response = await apiClient.get('profiles');
      console.log("[HOOK:PROFILE] API response received for profiles list:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:PROFILE] Error fetching profiles:", response.error);
        toast({
          title: "Error fetching profiles",
          description: response.error.message,
          variant: "destructive"
        });
        return [];
      }
      
      console.log("[HOOK:PROFILE] Successfully fetched profiles, count:", Array.isArray(response.data) ? response.data.length : 0);
      return response.data || [];
    },
    enabled: !!session?.user?.id
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, any>) => {
      if (!session?.user?.id) {
        console.error("[HOOK:PROFILE] No user session found in useUpdateProfile");
        throw new Error("You must be logged in to update your profile");
      }
      
      // Security check - users can only update their own profile
      if (id !== session.user.id) {
        console.error("[HOOK:PROFILE] Security violation: User trying to update another user's profile");
        throw new Error("You can only update your own profile");
      }
      
      console.log("[HOOK:PROFILE] Updating profile with ID:", id);
      // Call API endpoint instead of service directly
      const response = await apiClient.put(`profiles/${id}`, updates);
      console.log("[HOOK:PROFILE] API response received for profile update:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:PROFILE] Error updating profile:", response.error);
        throw new Error(response.error.message || "Failed to update profile");
      }
      
      return response;
    },
    onSuccess: (_, variables) => {
      console.log("[HOOK:PROFILE] Profile updated successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["profile", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    },
    onError: (error: any) => {
      console.error("[HOOK:PROFILE] Error in update profile mutation:", error);
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive"
      });
    }
  });
}
