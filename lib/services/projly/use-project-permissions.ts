import { useAuth } from "@/app/projly/contexts/AuthContextCustom";
import { useCallback } from "react";

// Use relative imports for local services
import { useUserRoles } from "./use-user-roles";

// Log the import of AuthContext to confirm correct path resolution
console.log('[PROJECT_PERMISSIONS] Loading project permissions hook');

// Define types locally to avoid external dependencies
type UserRole = 'admin' | 'manager' | 'editor' | 'user' | 'guest' | 'site_owner' | 'regular_user';
type AppRole = 'admin' | 'manager' | 'editor' | 'user' | 'guest' | 'site_owner' | 'regular_user';

/**
 * Hook to check project-related permissions for the current user
 * This provides a centralized way to manage project permissions
 */
export function useProjectPermissions() {
  const { user } = useAuth();
  const { currentUserRole, hasRole } = useUserRoles();
  
  // Extract the current role data
  const currentRole = currentUserRole?.data;
  
  /**
   * Check if the current user can delete a project
   * User can delete a project if they are:
   * 1. The project owner
   * 2. A site owner
   * 3. An admin
   * 
   * @param projectOwnerId - The ID of the project owner
   * @returns boolean indicating if the user can delete the project
   */
  const canDeleteProject = useCallback((projectOwnerId?: string | null) => {
    // If there's no user, they definitely can't delete
    if (!user?.id) {
      console.log("[PROJECT PERMISSIONS] No user logged in, can't delete project");
      return false;
    }
    
    // Check if user is the project owner
    const isProjectOwner = projectOwnerId === user.id;
    console.log(`[PROJECT PERMISSIONS] User ${user.id} is project owner: ${isProjectOwner}`);
    
    // Check if user is a site owner or admin
    const isSiteOwner = currentRole === 'site_owner';
    const isAdmin = currentRole === 'admin';
    console.log(`[PROJECT PERMISSIONS] User is site owner: ${isSiteOwner}, is admin: ${isAdmin}`);
    
    // User can delete if they are the project owner, a site owner, or an admin
    return isProjectOwner || isSiteOwner || isAdmin;
  }, [user, currentRole]);
  
  return {
    canDeleteProject
  };
}
