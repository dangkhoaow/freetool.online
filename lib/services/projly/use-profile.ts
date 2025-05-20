import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "./jwt-auth-adapter";
import apiClient from "@/lib/api-client";

// Define types for API responses
interface ApiError {
  message: string;
  [key: string]: any;
}

interface ApiResponse<T = any> {
  data: T;
  error?: string | ApiError;
  success: boolean;
}

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
      // Call API endpoint with the correct path including leading slash
      const response: ApiResponse = await apiClient.get('http://localhost:3001/api/projly/auth/me');
      console.log("[HOOK:PROFILE] API response received for user profile:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error as ApiError)?.message || 'Failed to fetch profile';
        console.error("[HOOK:PROFILE] Error fetching user profile:", errorMessage);
        toast({
          title: "Error fetching profile",
          description: errorMessage,
          variant: "destructive"
        });
        throw new Error(errorMessage);
      }
      
      console.log("[HOOK:PROFILE] Successfully fetched user profile");
      // Map the nested user data into a flat structure
      return {
        ...response.data,
        email: response.data.user?.email || response.data.email,
        firstName: response.data.user?.firstName || response.data.firstName,
        lastName: response.data.user?.lastName || response.data.lastName,
        id: response.data.userId || response.data.id
      };
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
      // Call API endpoint with the correct path including leading slash
      const response = await apiClient.get('/api/projly/profiles');
      console.log("[HOOK:PROFILE] API response received for profiles list:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:PROFILE] Error fetching profiles:", response.error);
        const errorMessage = typeof response.error === 'object' && response.error !== null && 'message' in response.error 
          ? (response.error as ApiError).message 
          : typeof response.error === 'string' 
            ? response.error 
            : 'Failed to fetch profiles';
        toast({
          title: "Error fetching profiles",
          description: errorMessage,
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
      // Call API endpoint with the correct path
      const response: ApiResponse = await apiClient.put(`/api/projly/auth/update-user`, {
        id,
        firstName: updates.firstName,
        lastName: updates.lastName
      });
      console.log("[HOOK:PROFILE] Update request sent with data:", { id, firstName: updates.firstName, lastName: updates.lastName });
      console.log("[HOOK:PROFILE] API response received for profile update:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:PROFILE] Error updating profile:", response.error);
        const errorMessage = typeof response.error === 'object' && response.error !== null && 'message' in response.error 
          ? (response.error as ApiError).message 
          : typeof response.error === 'string' 
            ? response.error 
            : 'Failed to update profile';
        throw new Error(errorMessage);
      }
      
      return response;
    },
    onSuccess: async (data, variables) => {
      console.log("[HOOK:PROFILE] Profile updated successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["profile", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      console.log("[HOOK:PROFILE] Invalidated 'me' query key to refresh AuthContext user data");
      
      // Update AuthContext with new user data
      // Define expected structure for type safety
      interface UserData {
        firstName?: string;
        lastName?: string;
        email?: string;
        [key: string]: any;
      }
      
      interface ApiResponseWithUser {
        user?: UserData;
        [key: string]: any;
      }
      
      // Check for nested user structure in response
      let updatedUserData: UserData | undefined;
      if (data && 'user' in data && (data as ApiResponseWithUser).user) {
        updatedUserData = (data as ApiResponseWithUser).user;
        console.log("[HOOK:PROFILE] Extracted nested user data from response:", updatedUserData);
      } else if (data) {
        // If no nested user object, use the top-level data
        updatedUserData = data as UserData;
        console.log("[HOOK:PROFILE] Using top-level data as user data:", updatedUserData);
      }
      
      if (updatedUserData) {
        const authContext = queryClient.getQueryData(['me']);
        console.log("[HOOK:PROFILE] Current AuthContext data:", authContext);
        
        if (authContext && typeof authContext === 'object') {
          // Check if authContext has a nested 'user' property
          let currentUserData: UserData;
          if ('user' in authContext && authContext.user) {
            currentUserData = authContext.user as UserData;
          } else {
            currentUserData = authContext as UserData;
          }
          
          const updatedUser = {
            ...authContext,
            // Update the top level fields if they exist in response
            firstName: variables.updates.firstName || updatedUserData.firstName || currentUserData.firstName || '',
            lastName: variables.updates.lastName || updatedUserData.lastName || currentUserData.lastName || '',
            email: variables.updates.email || updatedUserData.email || currentUserData.email || '',
            // Also update nested user object if it exists in the structure
            user: 'user' in authContext ? {
              ...(authContext.user || {}),
              firstName: variables.updates.firstName || updatedUserData.firstName || currentUserData.firstName || '',
              lastName: variables.updates.lastName || updatedUserData.lastName || currentUserData.lastName || '',
              email: variables.updates.email || updatedUserData.email || currentUserData.email || ''
            } : undefined
          };
          queryClient.setQueryData(['me'], updatedUser);
          console.log("[HOOK:PROFILE] Updated AuthContext with new user data:", updatedUser);
          
          // Directly update AuthContext to ensure components re-render
          try {
            // Use the updateUser function from AuthContext if available
            const authContextInstance = (window as any).__AUTH_CONTEXT;
            if (authContextInstance && typeof authContextInstance.updateUser === 'function') {
              await authContextInstance.updateUser({
                firstName: variables.updates.firstName || updatedUserData.firstName || currentUserData.firstName || '',
                lastName: variables.updates.lastName || updatedUserData.lastName || currentUserData.lastName || '',
                email: variables.updates.email || updatedUserData.email || currentUserData.email || ''
              });
              console.log("[HOOK:PROFILE] Directly called updateUser on AuthContext instance");
            } else {
              console.warn("[HOOK:PROFILE] Could not find AuthContext instance to directly update user data");
            }
          } catch (error) {
            console.error("[HOOK:PROFILE] Error when trying to directly update AuthContext:", error);
          }
          
          // Force a refetch to ensure data consistency with backend
          try {
            await queryClient.refetchQueries({ queryKey: ['me'] });
            console.log("[HOOK:PROFILE] Forced refetch of 'me' query to update user data from backend");
          } catch (error) {
            console.error("[HOOK:PROFILE] Error when trying to refetch user data:", error);
          }
        }
      }
      
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
