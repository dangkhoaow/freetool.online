import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { UserRole, UserWithSettings, UserRoleUpdateParams, ActivationStatusUpdateParams, PasswordResetParams } from "./types";
import { useCallback, useState } from "react";
import { useSession } from "./jwt-auth-adapter";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/app/projly/config/apiConfig";

// Log API endpoints for debugging
console.log('[HOOK:USER-ROLES] API_ENDPOINTS.TEAMS.BASE:', API_ENDPOINTS.TEAMS.BASE);

// Import the ApiResponse type from the API client to ensure compatibility
import type { ApiResponse } from '@/lib/api-client';

// Define the AppRole type instead of importing from Prisma
type AppRole = 'admin' | 'manager' | 'editor' | 'user' | 'guest' | 'site_owner' | 'regular_user';

// Log initialization of hook for debugging
console.log('[HOOK] use-user-roles hook initialized');

export function useUserRoles() {
  const queryClient = useQueryClient();
  const { data: session, update: refreshSession } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Function to handle auth errors
  const handleAuthError = async () => {
    if (isRefreshing) return false;
    
    setIsRefreshing(true);
    console.log("useUserRoles: Handling auth error, attempting to refresh session", {
      href: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    try {
      await refreshSession();
      const refreshed = true; // JWT refresh always succeeds unless it throws an error
      console.log("useUserRoles: Session refresh result:", refreshed, {
        timestamp: new Date().toISOString()
      });
      
      if (refreshed) {
        console.log("useUserRoles: Session refreshed successfully", {
          timestamp: new Date().toISOString()
        });
        return true;
      } else {
        console.log("useUserRoles: Session refresh failed", {
          timestamp: new Date().toISOString()
        });
        return false;
      }
    } catch (error) {
      const errorObj = error as Error;
      console.error("useUserRoles: Error refreshing session:", {
        message: errorObj.message,
        timestamp: new Date().toISOString()
      });
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const hasRoleCallback = useCallback(async (role: UserRole): Promise<boolean> => {
    console.log("useUserRoles.hasRole: Checking if user has role", {
      role,
      href: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    try {
      console.log(`useUserRoles: Making API call to check role: ${role}`, {
        timestamp: new Date().toISOString()
      });
      // Call API endpoint instead of service directly
      console.log(`[HOOK:USER-ROLES] Using API endpoint: /api/projly/user-roles/check/${role}`);
      const response = await apiClient.get(`/api/projly/user-roles/check/${role}`);
      console.log(`useUserRoles: Role check API response:`, {
        data: response.data,
        error: response.error ? true : false,
        timestamp: new Date().toISOString()
      });
      
      if (response.error) {
        // If this is an auth error, try to refresh the session
        const isAuthError = response.error && typeof response.error === 'string' && 
                           (response.error.includes("JWT") || 
                            response.error.includes("auth") ||
                            response.error.includes("token") ||
                            response.error.includes("session"));
        
        console.log("useUserRoles: Got error while checking role, is it auth error?", isAuthError, {
          errorMessage: response.error ? String(response.error) : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        
        if (isAuthError) {
          const refreshed = await handleAuthError();
          
          if (refreshed) {
            // Try again after refresh
            console.log("useUserRoles: Retrying role check after session refresh", {
              timestamp: new Date().toISOString()
            });
            // Call API endpoint instead of service directly
            console.log(`[HOOK:USER-ROLES] Using API endpoint (retry): /api/projly/user-roles/check/${role}`);
            const retryResponse = await apiClient.get(`/api/projly/user-roles/check/${role}`);
            console.log("useUserRoles: Role check retry response:", {
              data: retryResponse.data,
              error: retryResponse.error ? true : false,
              timestamp: new Date().toISOString()
            });
            return (retryResponse.data as boolean) || false;
          }
        }
        return false;
      }
      
      console.log(`useUserRoles: User has role ${role}:`, response.data, {
        timestamp: new Date().toISOString()
      });
      return (response.data as boolean) || false;
    } catch (error) {
      const errorObj = error as Error;
      console.error(`useUserRoles: Error checking if user has role ${role}:`, {
        message: errorObj.message,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }, [handleAuthError]);

  return {
    users: useQuery<UserWithSettings[], Error>({
      // Use a stable queryKey to prevent infinite loops
      queryKey: ["user-roles"],
      // Prevent automatic refetching
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      // Increase staleTime to reduce frequency of refetches
      staleTime: 60000, // 1 minute
      // Only retry once to prevent infinite refresh loops
      retry: 1,
      queryFn: async (): Promise<UserWithSettings[]> => {
        console.log("useUserRoles: Fetching user roles", {
          href: window.location.href,
          timestamp: new Date().toISOString()
        });
        
        try {
          console.log("useUserRoles: Making API call to fetch all users with settings");
          // Call API endpoint instead of service directly
          console.log('[HOOK:USER-ROLES] Using API endpoint: /api/projly/user-roles/all-with-settings');
          const response = await apiClient.get('/api/projly/user-roles/all-with-settings');
          console.log("useUserRoles: API response for all users:", {
            success: !response.error,
            errorMessage: response.error ? String(response.error) : undefined,
            dataCount: Array.isArray(response.data) ? response.data.length : 0,
            firstUserRole: Array.isArray(response.data) && response.data.length > 0 ? response.data[0].role : 'none',
            rawData: response.data, // Log raw data for debugging
          });
          
          if (response.error) {
            // If this is an auth error, try to refresh the session
            const isAuthError = response.error && typeof response.error === 'string' && response.error.includes("JWT");
            if (isAuthError) {
              console.log("useUserRoles: Got auth error while fetching users, refreshing session");
              const refreshed = await handleAuthError();
              
              if (refreshed) {
                // Try again after refresh
                console.log("useUserRoles: Retrying users fetch after session refresh");
                // Call API endpoint instead of service directly
                console.log('[HOOK:USER-ROLES] Using API endpoint (retry): /api/projly/user-roles/all-with-settings');
                const retryResponse = await apiClient.get('/api/projly/user-roles/all-with-settings');
                if (retryResponse.error) {
                  console.error("useUserRoles: Error on retry fetch:", retryResponse.error);
                  throw retryResponse.error;
                }
                return (retryResponse.data || []) as UserWithSettings[];
              }
            }
            
            console.error("useUserRoles: Error fetching user roles:", response.error);
            
            toast({
              title: "Error fetching users",
              description: typeof response.error === 'object' && response.error !== null ? String((response.error as any).message || response.error) : String(response.error),
              variant: "destructive"
            });
            
            return [];
          }
          
          console.log("useUserRoles: Users with settings fetched successfully:", { 
            count: Array.isArray(response.data) ? response.data.length : 0
          });
          
          // Process the API response to ensure each user has the required fields
          const processedData = Array.isArray(response.data) ? response.data.map(user => {
            // Use the status field from the API response if available, otherwise determine based on profile
            const activationStatus = user.status || (user.profile ? 'Active' : 'Unverified');
            
            // Log detailed user information for debugging
            console.log(`[PROJLY:USER_ROLES] Processing user ${user.id}:`, {
              userEmail: user.email,
              userRole: user.role,
              userRoleObject: user.userRole,
              status: user.status,
              mappedStatus: activationStatus,
              fullUser: user
            });
            
            // IMPORTANT: We preserve the original role from the API response
            // and make sure we don't accidentally overwrite it
            const roleToUse = user.role || (user.userRole?.role as UserRole) || 'regular_user';
            
            console.log(`[PROJLY:USER_ROLES] Final role for user ${user.email}: ${roleToUse}`);
            
            return {
              ...user,
              // Explicitly set the role property
              role: roleToUse,
              // Use the actual status from the API response
              activationStatus: activationStatus
            };
          }) : [];
          
          // Log processed data for debugging
          console.log('[PROJLY:USER_ROLES] Processed user data:', 
            processedData.map(u => ({ id: u.id, email: u.email, role: u.role }))
          );
          
          return processedData as UserWithSettings[];
        } catch (error) {
          console.error("useUserRoles: Exception in user roles fetch:", error);
          return [];
        }
      }
    }),
    
    currentUserRole: useQuery<UserRole, Error>({
      queryKey: ["current-user-role"], // Use stable queryKey to prevent infinite loops
      // Prevent automatic refetching
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      // Increase staleTime to reduce frequency of refetches
      staleTime: 60000, // 1 minute
      // Only retry once to prevent infinite refresh loops
      retry: 1,
      queryFn: async (): Promise<UserRole> => {
        console.log("useUserRoles: Fetching current user role", {
          href: window.location.href,
          timestamp: new Date().toISOString()
        });
        
        try {
          console.log("useUserRoles: Making API call to fetch current user role");
          // Call API endpoint instead of service directly
          console.log('[HOOK:USER-ROLES] Using API endpoint: /api/projly/user-roles/current');
          const response = await apiClient.get('/api/projly/user-roles/current');
          console.log("useUserRoles: API response for current role:", {
            success: !response.error,
            role: response.data,
            error: response.error ? String(response.error) : undefined
          });
          
          if (response.error) {
            // If this is an auth error, try to refresh the session
            const isAuthError = response.error && typeof response.error === 'string' && response.error.includes("JWT");
            if (isAuthError) {
              console.log("useUserRoles: Got auth error while fetching current role, refreshing session");
              const refreshed = await handleAuthError();
              
              if (refreshed) {
                // Try again after refresh
                console.log("useUserRoles: Retrying current role fetch after session refresh");
                // Call API endpoint instead of service directly
                console.log('[HOOK:USER-ROLES] Using API endpoint (retry): /api/projly/user-roles/current');
                const retryResponse = await apiClient.get('/api/projly/user-roles/current');
                if (retryResponse.error) {
                  console.error("useUserRoles: Error on retry current role fetch:", retryResponse.error);
                  throw retryResponse.error;
                }
                return retryResponse.data as UserRole;
              }
            }
            
            console.error("useUserRoles: Error fetching current user role:", response.error);
            
            return 'regular_user' as UserRole;
          }
          
          console.log("useUserRoles: Current user role fetched:", response.data);
          return response.data as UserRole;
        } catch (error) {
          console.error("useUserRoles: Exception in current role fetch:", error);
          
          // Return a default role on error
          console.log("useUserRoles: Returning default role on exception");
          return "regular_user" as UserRole;
        }
      }
    }),
    
    updateRole: useMutation({
      mutationFn: async ({ userId, role }: UserRoleUpdateParams) => {
        console.log("[HOOK:USER-ROLES] Assigning role:", { userId, role });
        
        // Use the correct API endpoint path with the /api/projly prefix
        const endpoint = '/api/projly/user-roles/assign';
        console.log(`[HOOK:USER-ROLES] Calling endpoint: ${endpoint}`);
        
        // Call API endpoint instead of service directly
        return await apiClient.post(endpoint, { userId, role });
      },
      onSuccess: (result: ApiResponse<any>) => {
        if (result.error) {
          toast({
            title: "Error updating user role",
            description: typeof result.error === 'object' ? String((result.error as any).message || JSON.stringify(result.error)) : String(result.error),
            variant: "destructive"
          });
          return;
        }
        
        queryClient.invalidateQueries({ queryKey: ["user-roles"] });
        queryClient.invalidateQueries({ queryKey: ["current-user-role"] });
        toast({
          title: "Role updated",
          description: "The user's role has been updated successfully."
        });
      }
    }),
    
    updateActivationStatus: useMutation({
      mutationFn: async ({ userId, status }: ActivationStatusUpdateParams) => {
        console.log("[HOOK:USER-ROLES] Attempting to update activation status for userId: " + userId + " with status: " + status);
        // Use the fully qualified API path to avoid URL resolution issues
        console.log("[HOOK:USER-ROLES] Using API endpoint: " + API_ENDPOINTS.USER_STATUS);
        // Ensure we're using /api/projly prefix by using the full path
        const response = await apiClient.put("/api/projly/user-status", { userId, status });
        console.log("[HOOK:USER-ROLES] Response from status update API: ", response);
        return response;
      },
      onError: (error) => {
        toast({
          title: "Error updating activation status",
          description: typeof error === 'object' && error !== null ? error.message : String(error),
          variant: "destructive"
        });
      },
      onSuccess: (result, variables) => {
        if (result.error) {
          toast({
            title: "Error updating activation status",
            description: typeof result.error === 'object' && result.error !== null ? result.error.message : String(result.error),
            variant: "destructive"
          });
          return;
        }
        
        // Force refetch to ensure we have the latest data
        queryClient.invalidateQueries({ queryKey: ["user-roles"] });
        
        // Show a success message
        toast({
          title: "Activation status updated",
          description: `User's activation status has been set to ${variables.status}.`
        });
      }
    }),
    
    resetPassword: useMutation({
      mutationFn: async ({ token, password }: { token: string, password: string }) => {
        // Log input
        console.log("[HOOK:USER-ROLES] Resetting password with token:", token);
        // Use correct endpoint and POST method from apiConfig
        try {
          const endpoint = `/api/projly/auth/reset-password`;
          console.log("[HOOK:USER-ROLES] Calling endpoint:", endpoint);
          const response = await apiClient.post(endpoint, { token, password });
          console.log("[HOOK:USER-ROLES] Password reset API response:", response);
          return response;
        } catch (error) {
          console.error("[HOOK:USER-ROLES] Error in password reset API call:", error);
          throw error;
        }
      },
      onSuccess: (result) => {
        if (result.error) {
          toast({
            title: "Error resetting password",
            description: result.error.message,
            variant: "destructive"
          });
          return;
        }
        
        toast({
          title: "Password reset",
          description: "The user's password has been reset successfully."
        });
      }
    }),
    
    hasRole: hasRoleCallback
  };
}
