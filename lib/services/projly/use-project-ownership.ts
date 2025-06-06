import { useQuery } from "@tanstack/react-query";
import { useSession } from "./jwt-auth-adapter";
import apiClient from "@/lib/api-client";
import { useEffect, useState } from 'react';

// Helper functions for caching project data
const getProjectsCache = () => {
  try {
    if (typeof window === 'undefined') return null;
    
    const cachedData = sessionStorage.getItem('projly_projects_cache');
    if (!cachedData) {
      console.log('[CACHE:PROJECTS] No cached projects found');
      return null;
    }
    
    const { data, expiry } = JSON.parse(cachedData);
    const now = new Date().getTime();
    
    if (now > expiry) {
      console.log('[CACHE:PROJECTS] Cache expired, will fetch fresh data');
      sessionStorage.removeItem('projly_projects_cache');
      return null;
    }
    
    console.log(`[CACHE:PROJECTS] Using cached projects data (${data.length} projects)`);
    return data;
  } catch (error) {
    console.error('[CACHE:PROJECTS] Error reading cache:', error);
    return null;
  }
};

const setProjectsCache = (data: any[]) => {
  try {
    if (typeof window === 'undefined') return;
    
    // Get expiry time from env var or default to 1 minute
    const expiryMinutes = process.env.NEXT_PUBLIC_PROJECT_LIST_CACHE_EXPIRY_MINUTES 
      ? parseInt(process.env.NEXT_PUBLIC_PROJECT_LIST_CACHE_EXPIRY_MINUTES) 
      : 1;
    
    const now = new Date().getTime();
    const expiry = now + (expiryMinutes * 60 * 1000);
    
    sessionStorage.setItem('projly_projects_cache', JSON.stringify({ data, expiry }));
    console.log(`[CACHE:PROJECTS] Cached ${data.length} projects with ${expiryMinutes} minute expiry`);
  } catch (error) {
    console.error('[CACHE:PROJECTS] Error setting cache:', error);
  }
};

// Log initialization of hook for debugging
console.log('[HOOK] use-project-ownership hook initialized');

/**
 * Custom hook to check if the current user owns any projects or is a member of any projects
 */
export function useProjectOwnership() {
  // Get the current user session to check for site_owner role
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
      
      // Check if user has site_owner role and grant immediate access if they do
      // Use type assertion to access the role property which might not be in the type definition
      const userRole = (session?.user as any)?.role;
      const isSiteOwner = userRole === 'site_owner' || String(userRole || '').toLowerCase() === 'site_owner';
      
      console.log("[HOOK:PROJECT-OWNERSHIP] User role check:", {
        userId,
        userRole,
        isSiteOwner,
        sessionData: !!session
      });
      
      // Site owners always have project access regardless of direct ownership
      if (isSiteOwner) {
        console.log("[HOOK:PROJECT-OWNERSHIP] User is a site_owner, granting project access");
        return true;
      }
      
      console.log("[HOOK:PROJECT-OWNERSHIP] Current user ID:", userId);
      
      // Use the API client instead of Prisma service directly
      try {
        // Check cache first
        const cachedProjects = getProjectsCache();
        let response;
        
        if (cachedProjects) {
          console.log("[HOOK:PROJECT-OWNERSHIP] Using cached projects data");
          response = { data: cachedProjects, success: true };
        } else {
          // Get all projects accessible to the user (both owned and member)
          // Use the correct API endpoint with /api/projly/ prefix
          console.log("[HOOK:PROJECT-OWNERSHIP] Making API call to /api/projly/projects");
          response = await apiClient.get('/api/projly/projects');
          console.log("[HOOK:PROJECT-OWNERSHIP] API response received:", response.error ? 'Error' : 'Success');
          
          // Cache the successful response
          if (!response.error && Array.isArray(response.data)) {
            setProjectsCache(response.data);
          }
        }
        
        if (response.error) {
          console.error("[HOOK:PROJECT-OWNERSHIP] Error checking project access:", {
            error: response.error,
            status: typeof response.error === 'object' && response.error !== null && 'status' in response.error ? 
              (response.error as { status: any }).status : 'unknown',
            message: typeof response.error === 'object' && response.error !== null && 'message' in response.error ? 
              (response.error as { message: string }).message : String(response.error),
            timestamp: new Date().toISOString()
          });
          
          // Don't throw the error, return false instead to prevent breaking the UI
          // This is more resilient as the Sidebar will still work even if project access check fails
          console.log("[HOOK:PROJECT-OWNERSHIP] Returning false due to API error");
          return false;
        }
        
        // Log the projects data for debugging
        if (Array.isArray(response.data) && response.data.length > 0) {
          console.log(`[HOOK:PROJECT-OWNERSHIP] Projects data:`, {
            count: response.data.length,
            firstProject: response.data[0] ? {
              id: response.data[0].id,
              name: response.data[0].name,
              ownerId: response.data[0].ownerId,
              ownerEmail: response.data[0].owner?.email
            } : null
          });
        } else {
          console.log(`[HOOK:PROJECT-OWNERSHIP] No projects found for user`);
        }
        
        const hasProjects = Array.isArray(response.data) && response.data.length > 0;
        console.log(`[HOOK:PROJECT-OWNERSHIP] User has ${hasProjects ? response.data.length : 0} projects`);
        
        return hasProjects;
      } catch (error) {
        console.error("[HOOK:PROJECT-OWNERSHIP] Exception in useProjectOwnership:", {
          error,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
        
        // Don't throw the error, return false instead to prevent breaking the UI
        return false;
      }
    },
    refetchOnWindowFocus: true, // Ensure we refetch when window regains focus
    refetchOnMount: true // Ensure we refetch when component mounts
  });
}
