import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { UserRole, UserWithSettings, UserRoleUpdateParams, ActivationStatusUpdateParams, PasswordResetParams } from "./types";
import { useCallback, useState, useEffect } from "react";
import { useSession } from "./jwt-auth-adapter";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/app/projly/config/apiConfig";

// Log API endpoints for debugging
console.log('[HOOK:USER-ROLES] API_ENDPOINTS.TEAMS.BASE:', API_ENDPOINTS.TEAMS.BASE);
import { isInEditMode } from "@/app/projly/utils/editModeDetection";

// Define ApiResponse interface locally to avoid import errors
interface ApiResponse<T = any> {
  data: T | null;
  error: ApiError | null;
  message?: string;
  status?: number;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Define the AppRole type instead of importing from Prisma
type AppRole = 'admin' | 'manager' | 'editor' | 'user' | 'guest' | 'site_owner' | 'regular_user';

// Using the imported UserWithSettings type from @/types instead
// Adding a mock type that matches our expected format for edit mode
type MockUserWithSettings = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  activationStatus: string;
  createdAt: string;
  updatedAt: string;
  profile?: {
    id: string;
    userId: string;
    bio?: string | null;
    avatarUrl?: string | null;
  } | null;
};

// Log initialization of hook for debugging
console.log('[HOOK] use-user-roles hook initialized');

// Mock data for edit mode - updated to match the new API response structure
const MOCK_USER_WITH_SETTINGS: UserWithSettings[] = [{
  passwordHash: "mock-password-hash",
  id: "edit-mode-user-1",
  email: "admin@example.com",
  firstName: "Edit",
  lastName: "Mode",
  role: "admin" as UserRole,
  activationStatus: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  profile: {
    id: "profile-1",
    userId: "edit-mode-user-1",
    bio: "Admin user for edit mode",
    avatarUrl: null
  }
},
{
  id: "edit-mode-user-2",
  email: "user@example.com",
  firstName: "Regular",
  lastName: "User",
  role: "regular_user" as UserRole,
  activationStatus: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  profile: {
    id: "profile-2",
    userId: "edit-mode-user-2",
    bio: "Regular user for edit mode",
    avatarUrl: null
  }
},
{
  id: "edit-mode-user-3",
  email: "owner@example.com",
  firstName: "Site",
  lastName: "Owner",
  role: "site_owner" as UserRole,
  activationStatus: "unverified",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  profile: {
    id: "profile-3",
    userId: "edit-mode-user-3",
    bio: "Site owner for edit mode",
    avatarUrl: null
  }
}];

export function useUserRoles() {
  const queryClient = useQueryClient();
  const { data: session, update: refreshSession } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localEditMode, setLocalEditMode] = useState(false);
  // Optional edit mode override for testing/development
  const [editModeOverride, setEditModeOverride] = useState<boolean | null>(null);

  // Enhanced edit mode detection
  useEffect(() => {
    const detectEditMode = () => {
      // Check multiple indicators for edit mode
      const url = window.location.href;
      const isLovableDomain = url.includes('lovable.dev') || 
                             url.includes('lovableproject.com');
                             
      const editPatterns = ['/edit', '?editMode=true', '/edit/'];
      const hasEditPattern = editPatterns.some(pattern => url.includes(pattern));
      
      const storedEditMode = localStorage.getItem('lovable_edit_mode') === 'true';
      const queryParams = new URLSearchParams(window.location.search);
      const queryEditMode = queryParams.get('editMode') === 'true';
      
      const detectedEditMode = (isLovableDomain && (hasEditPattern || queryEditMode)) || 
                              storedEditMode || 
                              (() => { const result = isInEditMode(); console.log('[USER-ROLES] isInEditMode result:', result); return result; })() || 
                              (window as any).LOVABLE_EDIT_MODE === true;
      
      console.log("useUserRoles: Checking for edit mode indicators", {
        url,
        isLovableDomain,
        hasEditPattern,
        storedEditMode,
        queryEditMode,
        detectedEditMode,
        contextIsEditMode: (() => { const result = isInEditMode(); console.log('[USER-ROLES] isInEditMode result:', result); return result; })(),
        windowEditMode: (window as any).LOVABLE_EDIT_MODE,
        localEditMode,
        timestamp: new Date().toISOString()
      });
      
      if (detectedEditMode && !localEditMode) {
        console.log("useUserRoles: Edit mode detected! Setting flag", {
          timestamp: new Date().toISOString()
        });
        setLocalEditMode(true);
        localStorage.setItem('lovable_edit_mode', 'true');
        try {
          (window as any).LOVABLE_EDIT_MODE = true;
        } catch (e) {
          // Ignore errors
        }
      }
    };
    
    detectEditMode();
    
    // Listen for URL changes
    window.addEventListener('popstate', detectEditMode);
    return () => {
      window.removeEventListener('popstate', detectEditMode);
    };
  }, [localEditMode]);
  
  // Function to handle auth errors
  const handleAuthError = async () => {
    const effectiveEditMode = (() => { const result = isInEditMode(); console.log('[USER-ROLES] isInEditMode result:', result); return result; })() || localEditMode || (window as any).LOVABLE_EDIT_MODE === true;
    
    if (isRefreshing) return false;
    
    setIsRefreshing(true);
    console.log("useUserRoles: Handling auth error, attempting to refresh session", {
      isEditMode: (() => { const result = isInEditMode(); console.log('[USER-ROLES] isInEditMode result:', result); return result; })(),
      localEditMode,
      effectiveEditMode,
      href: window.location.href,
      windowEditMode: (window as any).LOVABLE_EDIT_MODE,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Skip the actual refresh if in edit mode
      if (effectiveEditMode) {
        console.log("useUserRoles: In edit mode, skipping actual session refresh", {
          timestamp: new Date().toISOString()
        });
        setIsRefreshing(false);
        return true;
      }
      
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
    const effectiveEditMode = (() => { const result = isInEditMode(); console.log('[USER-ROLES] isInEditMode result:', result); return result; })() || localEditMode || (window as any).LOVABLE_EDIT_MODE === true;
    
    console.log(`useUserRoles: Checking if user has role: ${role}`, {
      isEditMode: effectiveEditMode,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    // In Edit mode, we assume the user has all roles
    if (effectiveEditMode) {
      console.log(`useUserRoles: Edit mode detected, assuming user has role: ${role}`, {
        timestamp: new Date().toISOString()
      });
      return true;
    }
    
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
        const isAuthError = typeof response.error === 'object' && response.error !== null && 'message' in response.error && 
                           (response.error.message.includes("JWT") || 
                            response.error.message.includes("auth") ||
                            response.error.message.includes("token") ||
                            response.error.message.includes("session"));
        
        console.log("useUserRoles: Got error while checking role, is it auth error?", isAuthError, {
          errorMessage: typeof response.error === 'object' && response.error !== null ? 
            response.error.message : String(response.error),
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
  }, [handleAuthError, localEditMode]);

  return {
    users: useQuery<UserWithSettings[], Error>({
      queryKey: ["user-roles"],
      queryFn: async (): Promise<UserWithSettings[]> => {
        const effectiveEditMode = (() => { const result = isInEditMode(); console.log('[USER-ROLES] isInEditMode result:', result); return result; })() || localEditMode || (window as any).LOVABLE_EDIT_MODE === true;
        
        console.log("useUserRoles: Fetching user roles", {
          isEditMode: effectiveEditMode,
          href: window.location.href
        });
        
        // In Edit mode, return mock data to prevent API calls
        if (effectiveEditMode) {
          console.log("useUserRoles: Edit mode detected, returning mock user roles data");
          return MOCK_USER_WITH_SETTINGS;
        }
        
        try {
          console.log("useUserRoles: Making API call to fetch all users with settings");
          // Call API endpoint instead of service directly
          console.log('[HOOK:USER-ROLES] Using API endpoint: /api/projly/user-roles/all-with-settings');
          const response = await apiClient.get('/api/projly/user-roles/all-with-settings');
          console.log("useUserRoles: API response for all users:", {
            success: !response.error,
            errorStatus: typeof response.error === 'object' && response.error !== null ? response.error.status : undefined,
            errorMessage: typeof response.error === 'object' && response.error !== null ? response.error.message : String(response.error),
            dataCount: Array.isArray(response.data) ? response.data.length : 0
          });
          
          if (response.error) {
            // If this is an auth error, try to refresh the session
            const isAuthError = typeof response.error === 'object' && response.error !== null && 
                              ((response.error.status === 401) || 
                               ('message' in response.error && typeof response.error.message === 'string' && response.error.message.includes("JWT")));
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
                  // In edit mode, return mock data even on error
                  if (effectiveEditMode) {
                    console.log("useUserRoles: Returning mock data on error in edit mode");
                    return MOCK_USER_WITH_SETTINGS as unknown as UserWithSettings[];
                  }
                  throw retryResponse.error;
                }
                return (retryResponse.data || []) as UserWithSettings[];
              }
            }
            
            console.error("useUserRoles: Error fetching user roles:", response.error);
            
            // In edit mode, return mock data even on error
            if (effectiveEditMode) {
              console.log("useUserRoles: Returning mock data on error in edit mode");
              return MOCK_USER_WITH_SETTINGS;
            }
            
            toast({
              title: "Error fetching users",
              description: typeof response.error === 'object' && response.error !== null ? response.error.message : String(response.error),
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
            
            console.log(`[PROJLY:USER_ROLES] Processing user ${user.id} with role: ${user.role || 'none'}, status from API: ${user.status}, mapped activation status: ${activationStatus}`);
            
            return {
              ...user,
              // Ensure role is set from the direct role field added by the backend
              // or from userRole.role if available, defaulting to regular_user
              role: user.role || (user.userRole?.role as UserRole) || 'regular_user',
              // Use the actual status from the API response
              activationStatus: activationStatus
            };
          }) : [];
          
          return processedData as UserWithSettings[];
        } catch (error) {
          console.error("useUserRoles: Exception in user roles fetch:", error);
          
          // In edit mode, return mock data even on error
          if (effectiveEditMode) {
            console.log("useUserRoles: Returning mock data on exception in edit mode");
            return MOCK_USER_WITH_SETTINGS;
          }
          
          return [];
        }
      },
      staleTime: 30000, // 30 seconds cache to prevent too frequent refetches
      retry: 1, // Only retry once to prevent infinite refresh loops
    }),
    
    currentUserRole: useQuery<UserRole, Error>({
      queryKey: ["current-user-role"],
      queryFn: async (): Promise<UserRole> => {
        const effectiveEditMode = (() => { const result = isInEditMode(); console.log('[USER-ROLES] isInEditMode result:', result); return result; })() || localEditMode || (window as any).LOVABLE_EDIT_MODE === true;
        
        console.log("useUserRoles: Fetching current user role", {
          isEditMode: effectiveEditMode,
          href: window.location.href
        });
        
        // In Edit mode, return a default high-privilege role
        if (effectiveEditMode) {
          console.log("useUserRoles: Edit mode detected, returning mock 'admin' role");
          return "admin" as UserRole; 
        }
        
        try {
          console.log("useUserRoles: Making API call to fetch current user role");
          // Call API endpoint instead of service directly
          console.log('[HOOK:USER-ROLES] Using API endpoint: /api/projly/user-roles/current');
          const response = await apiClient.get('/api/projly/user-roles/current');
          console.log("useUserRoles: API response for current role:", {
            success: !response.error,
            role: response.data,
            errorStatus: response.error?.status,
            errorMessage: response.error?.message
          });
          
          if (response.error) {
            // If this is an auth error, try to refresh the session
            const isAuthError = typeof response.error === 'object' && response.error !== null && 
                              ((response.error.status === 401) || 
                               ('message' in response.error && typeof response.error.message === 'string' && response.error.message.includes("JWT")));
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
                  
                  // In edit mode, return mock data even on error
                  if (effectiveEditMode) {
                    console.log("useUserRoles: Returning mock admin role on error in edit mode");
                    return "admin" as UserRole;
                  }
                  
                  throw retryResponse.error;
                }
                return retryResponse.data as UserRole;
              }
            }
            
            console.error("useUserRoles: Error fetching current user role:", response.error);
            
            // In edit mode, return mock admin role even on error
            if (effectiveEditMode) {
              console.log("useUserRoles: Returning mock admin role on error in edit mode");
              return "admin" as UserRole;
            }
            
            return 'regular_user' as UserRole;
          }
          
          console.log("useUserRoles: Current user role fetched:", response.data);
          return response.data as UserRole;
        } catch (error) {
          console.error("useUserRoles: Exception in current role fetch:", error);
          
          // In edit mode, return mock admin role even on exception
          if (effectiveEditMode) {
            console.log("useUserRoles: Returning mock admin role on exception in edit mode");
            return "admin" as UserRole;
          }
          
          throw error;
        }
      },
      staleTime: 30000, // 30 seconds cache to prevent too frequent refetches
      retry: 1, // Only retry once to prevent infinite refresh loops
    }),
    
    updateRole: useMutation({
      mutationFn: async ({ userId, role }: UserRoleUpdateParams) => {
        console.log("[HOOK:USER-ROLES] Assigning role:", { userId, role });
        
        // Call API endpoint instead of service directly
        return await apiClient.post('user-roles/assign', { userId, role });
      },
      onSuccess: (result: ApiResponse<any>) => {
        if (result.error) {
          toast({
            title: "Error updating user role",
            description: result.error.message,
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
      mutationFn: async ({ userId, password }: PasswordResetParams) => {
        console.log("[HOOK:USER-ROLES] Resetting password for user:", userId);
        
        // Call API endpoint instead of service directly
        return await apiClient.put(`user-roles/${userId}/reset-password`, { password });
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
