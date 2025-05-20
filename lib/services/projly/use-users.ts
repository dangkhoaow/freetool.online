import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useCallback, useState } from "react";
import { useSession } from "./jwt-auth-adapter";
import apiClient from "@/lib/api-client";

// Define user types
export type User = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
  activationStatus?: string;
  status?: string; // Added to match the backend model
  createdAt?: string;
  profile?: {
    id: string;
    userId: string;
    bio?: string | null;
    avatarUrl?: string | null;
    jobTitle?: string | null;
    department?: string | null;
  } | null;
};

// Define input types
export type CreateUserInput = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  activationStatus?: string;
};

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'email'>> & {
  email?: string;
};

/**
 * Hook for managing users
 * Provides functions for fetching, creating, updating, and deleting users
 */
export function useUsers() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Log initialization of hook for debugging
  console.log('[HOOK:USE-USERS] use-users hook initialized');

  // Function to handle errors and refresh token if needed
  const handleAuthError = useCallback(async (error: any) => {
    // Implementation similar to other hooks
    return false;
  }, []);

  // Get all users
  const users = useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => {
      console.log("[HOOK:USE-USERS] Fetching all users");
      
      try {
        // Call API endpoint 
        console.log('[HOOK:USE-USERS] Using API endpoint: /api/projly/users');
        const response = await apiClient.get('/api/projly/users');
        
        if (response.error) {
          console.error("[HOOK:USE-USERS] Error fetching users:", response.error);
          throw new Error(typeof response.error === 'object' && response.error !== null && 'message' in response.error ? 
          (response.error as { message: string }).message : 
          String(response.error));
        }
        
        console.log("[HOOK:USE-USERS] Users fetched successfully:", { 
          count: Array.isArray(response.data) ? response.data.length : 0
        });
        
        return response.data || [];
      } catch (error) {
        console.error("[HOOK:USE-USERS] Exception in users fetch:", error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds cache
    retry: 1, // Only retry once
    enabled: !!session, // Only run if authenticated
  });

  // Get user by ID
  const getUserById = useCallback(async (userId: string): Promise<User | null> => {
    console.log(`[HOOK:USE-USERS] Fetching user with ID: ${userId}`);
    
    try {
      // Call API endpoint
      console.log(`[HOOK:USE-USERS] Using API endpoint: /api/projly/users/id/${userId}`);
      const response = await apiClient.get(`/api/projly/users/id/${userId}`);
      
      if (response.error) {
        console.error(`[HOOK:USE-USERS] Error fetching user with ID ${userId}:`, response.error);
        return null;
      }
      
      console.log(`[HOOK:USE-USERS] User with ID ${userId} fetched successfully`);
      return response.data;
    } catch (error) {
      console.error(`[HOOK:USE-USERS] Exception in getUserById for ID ${userId}:`, error);
      return null;
    }
  }, []);

  // Create user mutation
  const createUser = useMutation({
    mutationFn: async (userData: CreateUserInput) => {
      console.log("[HOOK:USE-USERS] Creating new user:", { ...userData, password: '***' });
      
      // Call API endpoint
      console.log('[HOOK:USE-USERS] Using API endpoint: /api/projly/users');
      const response = await apiClient.post('/api/projly/users', userData);
      
      if (response.error) {
        console.error("[HOOK:USE-USERS] Error creating user:", response.error);
        throw new Error(typeof response.error === 'object' && response.error !== null && 'message' in response.error ? 
          (response.error as { message: string }).message : 
          String(response.error));
      }
      
      console.log("[HOOK:USE-USERS] User created successfully:", response.data?.id);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      toast({
        title: "User created",
        description: "The user has been created successfully."
      });
    },
    onError: (error: Error) => {
      console.error("[HOOK:USE-USERS] Error in createUser mutation:", error);
      
      toast({
        title: "Error creating user",
        description: error.message || "There was a problem creating the user.",
        variant: "destructive"
      });
    }
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async ({ userId, userData }: { userId: string, userData: UpdateUserInput }) => {
      console.log(`[HOOK:USE-USERS] Updating user with ID: ${userId}`, { 
        ...userData, 
        password: userData.password ? '***' : undefined 
      });
      
      // Call API endpoint
      console.log(`[HOOK:USE-USERS] Using API endpoint: /api/projly/users/id/${userId}`);
      const response = await apiClient.put(`/api/projly/users/id/${userId}`, userData);
      
      if (response.error) {
        console.error(`[HOOK:USE-USERS] Error updating user with ID ${userId}:`, response.error);
        throw new Error(typeof response.error === 'object' && response.error !== null && 'message' in response.error ? 
          (response.error as { message: string }).message : 
          String(response.error));
      }
      
      console.log(`[HOOK:USE-USERS] User with ID ${userId} updated successfully`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      toast({
        title: "User updated",
        description: "The user has been updated successfully."
      });
    },
    onError: (error: Error) => {
      console.error("[HOOK:USE-USERS] Error in updateUser mutation:", error);
      
      toast({
        title: "Error updating user",
        description: error.message || "There was a problem updating the user.",
        variant: "destructive"
      });
    }
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      console.log(`[HOOK:USE-USERS] Deleting user with ID: ${userId}`);
      
      // Call API endpoint
      console.log(`[HOOK:USE-USERS] Using API endpoint: /api/projly/users/id/${userId}`);
      const response = await apiClient.delete(`/api/projly/users/id/${userId}`);
      
      if (response.error) {
        console.error(`[HOOK:USE-USERS] Error deleting user with ID ${userId}:`, response.error);
        throw new Error(typeof response.error === 'object' && response.error !== null && 'message' in response.error ? 
          (response.error as { message: string }).message : 
          String(response.error));
      }
      
      console.log(`[HOOK:USE-USERS] User with ID ${userId} deleted successfully`);
      return true;
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully."
      });
    },
    onError: (error: Error) => {
      console.error("[HOOK:USE-USERS] Error in deleteUser mutation:", error);
      
      toast({
        title: "Error deleting user",
        description: error.message || "There was a problem deleting the user.",
        variant: "destructive"
      });
    }
  });

  // Function to refresh users data
  const refreshUsers = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    console.log("[HOOK:USE-USERS] Manually refreshing users data");
    
    try {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await users.refetch();
      
      console.log("[HOOK:USE-USERS] Users data refreshed successfully");
      
      toast({
        title: "Data refreshed",
        description: "User data has been refreshed."
      });
    } catch (error) {
      console.error("[HOOK:USE-USERS] Error refreshing users data:", error);
      
      toast({
        title: "Error refreshing data",
        description: "There was a problem refreshing the user data.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, queryClient, users]);

  return {
    users,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
    isRefreshing
  };
}
