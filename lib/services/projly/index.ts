/**
 * Projly Services Index
 * 
 * This file exports all Projly services to be consumed by the frontend components.
 * It centralizes service exports and implements services that don't have their own files.
 */

// Using absolute imports to resolve path issues
import { API_ENDPOINTS } from '@/app/projly/config/apiConfig';
import { getAuthToken, setAuthToken, clearAuthToken } from '@/app/projly/utils/auth-utils';
import { signIn, signOut, useSession, getSession } from './jwt-auth-adapter';
import apiClient, { ApiResponse } from '@/lib/api-client';

// Define Project type
interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Define registration data interface
interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  timezone?: number; // Optional timezone offset in hours from UTC, defaults to 7 (GMT+7) on the backend
}

// Export hooks
export * from './use-analytics';
export * from './use-members';
export * from './use-notifications';
export * from './use-pages';
export * from './use-pages-api';
export * from './use-profile';
export * from './use-project-ownership';
export * from './use-project-permissions';
export * from './use-projects';
export * from './use-resources';
export * from './use-search';
export * from './use-storage';
export * from './use-tasks';
export * from './use-team';
export * from './use-toast';
export * from './use-user-extended';
export * from './use-user-roles';

// Export task service from consolidated location
export { taskService, tasksService, projlyTasksService } from './tasks/tasks-service';

// Re-export JWT auth adapter
export { useSession, getSession, signIn, signOut };

/**
 * Authentication Service
 * Provides authentication operations for the Projly application
 */
export const projlyAuthService = {
  /**
   * Check if the user is authenticated
   * @returns Promise resolving to boolean indicating authentication status
   */
  async isAuthenticated(): Promise<boolean> {
    console.log('[PROJLY:AUTH] Checking authentication status');
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:AUTH] No token found, user is not authenticated');
        return false;
      }

      // Check session storage cache first
      const cachedAuth = this.getAuthCache();
      if (cachedAuth !== null) {
        console.log('[PROJLY:AUTH] Using cached authentication status:', cachedAuth);
        return cachedAuth;
      }

      // No valid cache found, validate token by making a call to the backend
      console.debug('[PROJLY:AUTH] Using profile endpoint:', API_ENDPOINTS.AUTH.ME);
      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const isAuthenticated = response.ok;
      console.log(`[PROJLY:AUTH] Authentication check result: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
      
      // Cache the authentication result
      this.setAuthCache(isAuthenticated);
      
      return isAuthenticated;
    } catch (error) {
      console.error('[PROJLY:AUTH] Error checking authentication:', error);
      return false;
    }
  },

  /**
   * Get cached authentication status from session storage
   * @returns Boolean indicating authentication status or null if no valid cache exists
   */
  getAuthCache(): boolean | null {
    try {
      const cachedData = sessionStorage.getItem('projly_auth_cache');
      if (!cachedData) return null;
      
      const { value, expiry } = JSON.parse(cachedData);
      
      // Check if cache is expired
      if (expiry < Date.now()) {
        console.log('[PROJLY:AUTH] Cache expired, removing');
        sessionStorage.removeItem('projly_auth_cache');
        return null;
      }
      
      return value;
    } catch (error) {
      console.error('[PROJLY:AUTH] Error reading auth cache:', error);
      return null;
    }
  },

  /**
   * Set authentication status in session storage cache with expiration
   * @param value Boolean authentication status to cache
   * @param expiryMinutes Minutes until cache expires (uses USER_CACHE_EXPIRY_MINUTES env var or defaults to 5)
   */
  setAuthCache(value: boolean, expiryMinutes?: number): void {
    try {
      // Use environment variable if available, otherwise use provided value or default to 5
      const envExpiryMinutes = typeof window !== 'undefined' && window.process?.env?.USER_CACHE_EXPIRY_MINUTES ? 
        parseInt(window.process.env.USER_CACHE_EXPIRY_MINUTES, 10) : 
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_USER_CACHE_EXPIRY_MINUTES ? 
          parseInt(process.env.NEXT_PUBLIC_USER_CACHE_EXPIRY_MINUTES, 10) : 
          (expiryMinutes || 5));
      
      const expiry = Date.now() + (envExpiryMinutes * 60 * 1000);
      const cacheData = JSON.stringify({ value, expiry });
      
      sessionStorage.setItem('projly_auth_cache', cacheData);
      console.log(`[PROJLY:AUTH] Cached authentication status for ${envExpiryMinutes} minutes (from env: ${typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_USER_CACHE_EXPIRY_MINUTES ? 'yes' : 'no'})`);
    } catch (error) {
      console.error('[PROJLY:AUTH] Error setting auth cache:', error);
    }
  },

  /**
   * Sign in a user
   * @param credentials User credentials (email and password)
   * @returns Promise resolving to authentication result
   */
  async signIn(credentials: { email: string; password: string }): Promise<{ success: boolean; error?: string }> {
    console.log('[PROJLY:AUTH] Attempting sign in for user:', credentials.email);
    try {
      console.log('[PROJLY:AUTH] Using login endpoint:', API_ENDPOINTS.AUTH.LOGIN);
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[PROJLY:AUTH] Sign in failed:', data.error || response.statusText);
        return {
          success: false,
          error: data.error?.message || data.message || 'Authentication failed'
        };
      }

      if (data.token) {
        setAuthToken(data.token);
        console.log('[PROJLY:AUTH] Token stored successfully after login');
      }

      console.log('[PROJLY:AUTH] Sign in successful');
      return { success: true };
    } catch (error) {
      console.error('[PROJLY:AUTH] Sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sign in'
      };
    }
  },

  /**
   * Register a new user
   * @param userData User registration data including email, password, firstName, lastName, and optional timezone
   * @returns Promise resolving to registration result
   */
  async register(userData: RegistrationData): Promise<{ success: boolean; error?: string }> {
    console.log('[PROJLY:AUTH] Attempting to register new user:', userData.email);
    try {
      console.log('[PROJLY:AUTH] Using register endpoint:', API_ENDPOINTS.AUTH.REGISTER);
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[PROJLY:AUTH] Registration failed:', data.error || response.statusText);
        return {
          success: false,
          error: data.error?.message || data.message || 'Registration failed'
        };
      }

      if (data.token) {
        setAuthToken(data.token);
        console.log('[PROJLY:AUTH] Token stored successfully after registration');
      }

      console.log('[PROJLY:AUTH] Registration successful');
      return { success: true };
    } catch (error) {
      console.error('[PROJLY:AUTH] Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register'
      };
    }
  },

  /**
   * Sign out the current user
   * @returns Promise resolving to sign out result
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    console.log('[PROJLY:AUTH] Signing out user');
    try {
      // Call the logout endpoint
      console.log('[PROJLY:AUTH] Using logout endpoint:', API_ENDPOINTS.AUTH.LOGOUT);
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }).catch(err => {
        console.warn('[PROJLY:AUTH] Error calling logout endpoint:', err);
        // Continue with client-side logout even if server call fails
      });

      // Clear token regardless of server response
      clearAuthToken();
      console.log('[PROJLY:AUTH] Sign out completed, token cleared');
      return { success: true };
    } catch (error) {
      console.error('[PROJLY:AUTH] Sign out error:', error);
      // Still clear the token on error
      clearAuthToken();
      return { success: true }; // Return success anyway since we've cleared the token
    }
  },

  /**
   * Refresh the authentication session
   * @returns Promise resolving to refresh result
   */
  async refreshSession(): Promise<{ success: boolean; error?: string }> {
    console.log('[PROJLY:AUTH] Refreshing authentication session');
    try {
      console.log('[PROJLY:AUTH] Using refresh endpoint:', API_ENDPOINTS.AUTH.REFRESH);
      const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[PROJLY:AUTH] Session refresh failed:', data.error || response.statusText);
        return {
          success: false,
          error: data.error?.message || data.message || 'Session refresh failed'
        };
      }

      if (data.token) {
        setAuthToken(data.token);
        console.log('[PROJLY:AUTH] Token refreshed successfully');
      }

      return { success: true };
    } catch (error) {
      console.error('[PROJLY:AUTH] Session refresh error:', error);
      
      // Clear browser session and cookies when refresh fails
      const clearCookies = () => {
        console.log('[PROJLY:AUTH] Clearing cookies and session storage');
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqIndex = cookie.indexOf('=');
          const name = eqIndex > -1 ? cookie.substring(0, eqIndex).trim() : cookie.trim();
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      };
      
      // Clear all session storage items
      sessionStorage.clear();
      clearCookies();
      
      // Prepare error message
      const errorMessage = error instanceof Error ? error.message : 'Session expired or error. Please login again or clear browser cache if needed before login';
      
      // Redirect to login page with error message if we're in a browser environment
      if (typeof window !== 'undefined') {
        const loginPath = '/projly/login';
        const encodedError = encodeURIComponent(errorMessage);
        window.location.href = `${loginPath}?sessionError=${encodedError}`;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  /**
   * Get cached user data from session storage
   * @returns User data object or null if no valid cache exists
   */
  getUserCache(): any | null {
    try {
      const cachedData = sessionStorage.getItem('projly_user_cache');
      if (!cachedData) return null;
      
      const { value, expiry } = JSON.parse(cachedData);
      
      // Check if cache is expired
      if (expiry < Date.now()) {
        console.log('[PROJLY:AUTH] User cache expired, removing');
        sessionStorage.removeItem('projly_user_cache');
        return null;
      }
      
      console.log('[PROJLY:AUTH] Using cached user data');
      return value;
    } catch (error) {
      console.error('[PROJLY:AUTH] Error reading user cache:', error);
      return null;
    }
  },

  /**
   * Set user data in session storage cache with expiration
   * @param value User data object to cache
   * @param expiryMinutes Minutes until cache expires (uses USER_CACHE_EXPIRY_MINUTES env var or defaults to 5)
   */
  setUserCache(value: any, expiryMinutes?: number): void {
    try {
      // Use environment variable if available, otherwise use provided value or default to 5
      const envExpiryMinutes = typeof window !== 'undefined' && window.process?.env?.USER_CACHE_EXPIRY_MINUTES ? 
        parseInt(window.process.env.USER_CACHE_EXPIRY_MINUTES, 10) : 
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_USER_CACHE_EXPIRY_MINUTES ? 
          parseInt(process.env.NEXT_PUBLIC_USER_CACHE_EXPIRY_MINUTES, 10) : 
          (expiryMinutes || 5));
      
      const expiry = Date.now() + (envExpiryMinutes * 60 * 1000);
      const cacheData = JSON.stringify({ value, expiry });
      
      sessionStorage.setItem('projly_user_cache', cacheData);
      console.log(`[PROJLY:AUTH] Cached user data for ${envExpiryMinutes} minutes (from env: ${typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_USER_CACHE_EXPIRY_MINUTES ? 'yes' : 'no'})`);
    } catch (error) {
      console.error('[PROJLY:AUTH] Error setting user cache:', error);
    }
  },

  /**
   * Get the current user data
   * @returns Promise resolving to user data
   */
  async getCurrentUser(): Promise<any> {
    console.log('[PROJLY:AUTH] Getting current user data');
    try {
      // Check for token
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:AUTH] No token found when getting current user');
        return null;
      }

      // Check cache first
      const cachedUser = this.getUserCache();
      if (cachedUser) {
        console.log('[PROJLY:AUTH] Using cached user data instead of API call');
        return cachedUser;
      }

      // No valid cache, make API call
      console.log('[PROJLY:AUTH] No valid cache found, using profile endpoint:', API_ENDPOINTS.AUTH.PROFILE);
      const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('[PROJLY:AUTH] Failed to get current user:', response.statusText);
        return null;
      }

      const userData = await response.json();
      const userDataResult = userData.data;
      console.log('[PROJLY:AUTH] Current user data retrieved successfully');
      
      // Cache the user data
      this.setUserCache(userDataResult);
      
      return userDataResult;
    } catch (error) {
      console.error('[PROJLY:AUTH] Error getting current user:', error);
      return null;
    }
  },
};

/**
 * Helper functions for project caching
 */
// Get cached projects data from session storage
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

// Set projects data in session storage cache with expiration
const setProjectsCache = (data: Project[]) => {
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

/**
 * Projects Service
 * Provides operations for managing projects in the Projly application
 */
export const projlyProjectsService = {
  /**
   * Get all projects for the current user
   * @returns Promise resolving to an array of projects
   */
  async getProjects(): Promise<Project[]> {
    console.log('[PROJLY:PROJECTS] Getting all projects for current user');
    try {
      // Check cache first
      const cachedProjects = getProjectsCache();
      if (cachedProjects) {
        console.log(`[PROJLY:PROJECTS] Using ${cachedProjects.length} projects from cache`);
        return cachedProjects;
      }

      // No cache or expired, fetch from API
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:PROJECTS] No token found when getting projects');
        throw new Error('Authentication token not found');
      }

      // Using API client with full API path for consistent error handling
      const apiUrl = '/api/projly/projects';
      console.log(`[PROJLY:PROJECTS] Fetching projects from API: ${apiUrl}`);
      
      // Import apiClient dynamically to avoid circular dependencies
      const apiClient = (await import('../../api-client')).default;
      const response = await apiClient.get<Project[]>(apiUrl);
      
      if (!response.success) {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : 'Failed to fetch projects';
        console.error('[PROJLY:PROJECTS] Failed to get projects:', errorMessage);
        throw new Error(errorMessage);
      }

      const projects = Array.isArray(response.data) ? response.data : [];
      console.log(`[PROJLY:PROJECTS] Successfully retrieved ${projects.length} projects`);
      
      // Cache the successful response
      setProjectsCache(projects);
      
      return projects;
    } catch (error) {
      console.error('[PROJLY:PROJECTS] Error in getProjects:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch projects');
    }
  },

  /**
   * Get a project by ID
   * @param id Project ID
   * @returns Promise resolving to project data
   */
  async getProject(id: string): Promise<Project | null> {
    console.log(`[PROJLY:PROJECTS] Getting project with ID: ${id}`);
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:PROJECTS] No token found when getting project');
        return null;
      }

      // Using API client for consistent error handling
      const apiUrl = `/api/projly/projects/${id}`;
      console.log(`[PROJLY:PROJECTS] Fetching project from API: ${apiUrl}`);
      
      // Import apiClient dynamically to avoid circular dependencies
      const apiClient = (await import('../../api-client')).default;
      const response = await apiClient.get<Project>(apiUrl);
      
      if (!response.success) {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : `Failed to fetch project ${id}`;
        console.error('[PROJLY:PROJECTS] Failed to get project:', errorMessage);
        throw new Error(errorMessage);
      }

      const project = response.data;
      console.log(`[PROJLY:PROJECTS] Successfully retrieved project: ${id}`);
      return project || null;
    } catch (error) {
      console.error(`[PROJLY:PROJECTS] Error getting project ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new project
   * @param projectData Project data to create
   * @returns Promise resolving to created project
   */
  async createProject(projectData: any): Promise<any> {
    console.log('[PROJLY:PROJECTS] Creating new project:', projectData.name);
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:PROJECTS] No token found when creating project');
        throw new Error('Authentication required to create a project');
      }

      // Using API client for consistent error handling
      const apiUrl = '/api/projly/projects';
      console.log(`[PROJLY:PROJECTS] Creating project via API: ${apiUrl}`, projectData);
      
      // Import apiClient dynamically to avoid circular dependencies
      const apiClient = (await import('../../api-client')).default;
      const response = await apiClient.post(apiUrl, projectData);
      
      if (!response.success) {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : 'Failed to create project';
        console.error('[PROJLY:PROJECTS] Failed to create project:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log(`[PROJLY:PROJECTS] Successfully created project:`, response.data);
      return response.data;
    } catch (error) {
      console.error('[PROJLY:PROJECTS] Error creating project:', error);
      throw error;
    }
  },

  /**
   * Update an existing project
   * @param id Project ID
   * @param projectData Project data to update
   * @returns Promise resolving to updated project
   */
  async updateProject(id: string, projectData: any): Promise<any> {
    console.log(`[PROJLY:PROJECTS] Updating project with ID: ${id}`, projectData);
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:PROJECTS] No token found when updating project');
        throw new Error('Authentication required to update a project');
      }

      // Using API client for consistent error handling
      const apiUrl = `/api/projly/projects/${id}`;
      console.log(`[PROJLY:PROJECTS] Updating project via API: ${apiUrl}`, projectData);
      
      // Import apiClient dynamically to avoid circular dependencies
      const apiClient = (await import('../../api-client')).default;
      const response = await apiClient.put(apiUrl, projectData);
      
      if (!response.success) {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : `Failed to update project ${id}`;
        console.error('[PROJLY:PROJECTS] Failed to update project:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log(`[PROJLY:PROJECTS] Successfully updated project:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[PROJLY:PROJECTS] Error updating project ${id}:`, error);
      throw error;
    }
  },

  /**
   * Archive a project (set status to 'Archived')
   * @param id Project ID to archive
   * @returns Promise resolving to archive result
   */
  async archiveProject(id: string): Promise<any> {
    console.log(`[PROJLY:PROJECTS] Archiving project with ID: ${id}`);
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:PROJECTS] No token found when archiving project');
        throw new Error('Authentication required to archive a project');
      }

      // Using API client for consistent error handling
      const apiUrl = `/api/projly/projects/${id}/archive`;
      console.log(`[PROJLY:PROJECTS] Archiving project via API: ${apiUrl}`);
      
      // Import apiClient dynamically to avoid circular dependencies
      const apiClient = (await import('../../api-client')).default;
      const response = await apiClient.put(apiUrl, {});
      
      if (!response.success) {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : `Failed to archive project ${id}`;
        console.error('[PROJLY:PROJECTS] Failed to archive project:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log(`[PROJLY:PROJECTS] Successfully archived project: ${id}`);
      return response.data;
    } catch (error) {
      console.error(`[PROJLY:PROJECTS] Error archiving project ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a project
   * @param id Project ID to delete
   * @returns Promise resolving to deletion result
   */
  async deleteProject(id: string): Promise<any> {
    console.log(`[PROJLY:PROJECTS] Deleting project with ID: ${id}`);
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:PROJECTS] No token found when deleting project');
        throw new Error('Authentication required to delete a project');
      }

      // Using API client for consistent error handling
      const apiUrl = `/api/projly/projects/${id}`;
      console.log(`[PROJLY:PROJECTS] Deleting project via API: ${apiUrl}`);
      
      // Import apiClient dynamically to avoid circular dependencies
      const apiClient = (await import('../../api-client')).default;
      const response = await apiClient.delete(apiUrl);
      
      if (!response.success) {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : `Failed to delete project ${id}`;
        console.error('[PROJLY:PROJECTS] Failed to delete project:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log(`[PROJLY:PROJECTS] Successfully deleted project: ${id}`);
      return response.data;
    } catch (error) {
      console.error(`[PROJLY:PROJECTS] Error deleting project ${id}:`, error);
      throw error;
    }
  }
};

/**
 * Tasks Service
 * Provides operations for managing tasks in the Projly application
 */
// Task service implementation has been moved to ./tasks/tasks-service.ts
// Export is handled through the import at the top of this file

/**
 * Analytics Service
 * Provides operations for retrieving analytics data in the Projly application
 */
export const projlyAnalyticsService = {
  /**
   * Get combined analytics data from all endpoints
   * @returns Promise resolving to analytics data
   */
  async getAnalytics(): Promise<any> {
    console.log('[PROJLY:ANALYTICS] Fetching combined analytics data');
    try {
      // Fetch data from all available analytics endpoints
      const [projectStatus, taskStatus, taskDueDate, resources, teamTaskDistribution, taskTimeline] = await Promise.allSettled([
        this.getProjectStatusAnalytics(),
        this.getTaskStatusAnalytics(),
        this.getTaskDueDateAnalytics(),
        this.getResourcesAnalytics(),
        this.getTeamTaskDistributionAnalytics(),
        this.getTaskTimelineAnalytics()
      ]);
      
      // Combine all analytics data
      const analyticsData = {
        projects: {
          byStatus: projectStatus.status === 'fulfilled' ? projectStatus.value : [],
          byMonth: taskTimeline.status === 'fulfilled' ? taskTimeline.value?.projects || [] : []
        },
        tasks: {
          byStatus: taskStatus.status === 'fulfilled' ? taskStatus.value : [],
          byPriority: [],
          byDueDate: taskDueDate.status === 'fulfilled' ? taskDueDate.value : [],
          byAssignee: teamTaskDistribution.status === 'fulfilled' ? teamTaskDistribution.value : []
        },
        resources: resources.status === 'fulfilled' ? resources.value : []
      };
      
      console.log('[PROJLY:ANALYTICS] Combined analytics data prepared');
      return analyticsData;
    } catch (error) {
      console.error('[PROJLY:ANALYTICS] Error combining analytics data:', error);
      // Return null to let the caller handle with mock data if needed
      return null;
    }
  },
  
  /**
   * Get project status analytics
   * @returns Promise resolving to project status analytics data
   */
  async getProjectStatusAnalytics(): Promise<any> {
    console.log('[PROJLY:ANALYTICS] Fetching project status analytics');
    try {
      const response = await apiClient.get<any>('api/projly/analytics/project-status');
      
      if (response.error) {
        console.error('[PROJLY:ANALYTICS] Error fetching project status analytics:', response.error);
        throw new Error(response.error);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('[PROJLY:ANALYTICS] Error fetching project status analytics:', error);
      return [];
    }
  },
  
  /**
   * Get task status analytics
   * @returns Promise resolving to task status analytics data
   */
  async getTaskStatusAnalytics(): Promise<any> {
    console.log('[PROJLY:ANALYTICS] Fetching task status analytics');
    try {
      const response = await apiClient.get<any>('api/projly/analytics/task-status');
      
      if (response.error) {
        console.error('[PROJLY:ANALYTICS] Error fetching task status analytics:', response.error);
        throw new Error(response.error);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('[PROJLY:ANALYTICS] Error fetching task status analytics:', error);
      return [];
    }
  },
  
  /**
   * Get task due date analytics
   * @returns Promise resolving to task due date analytics data
   */
  async getTaskDueDateAnalytics(): Promise<any> {
    console.log('[PROJLY:ANALYTICS] Fetching task due date analytics');
    try {
      const response = await apiClient.get<any>('api/projly/analytics/task-due-date');
      
      if (response.error) {
        console.error('[PROJLY:ANALYTICS] Error fetching task due date analytics:', response.error);
        throw new Error(response.error);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('[PROJLY:ANALYTICS] Error fetching task due date analytics:', error);
      return [];
    }
  },
  
  /**
   * Get resources analytics
   * @returns Promise resolving to resources analytics data
   */
  async getResourcesAnalytics(): Promise<any> {
    console.log('[PROJLY:ANALYTICS] Fetching resources analytics');
    try {
      const response = await apiClient.get<any>('api/projly/analytics/resources');
      
      if (response.error) {
        console.error('[PROJLY:ANALYTICS] Error fetching resources analytics:', response.error);
        throw new Error(response.error);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('[PROJLY:ANALYTICS] Error fetching resources analytics:', error);
      return [];
    }
  },
  
  /**
   * Get team task distribution analytics
   * @returns Promise resolving to team task distribution analytics data
   */
  async getTeamTaskDistributionAnalytics(): Promise<any> {
    console.log('[PROJLY:ANALYTICS] Fetching team task distribution analytics');
    try {
      const response = await apiClient.get<any>('api/projly/analytics/team-task-distribution');
      
      if (response.error) {
        console.error('[PROJLY:ANALYTICS] Error fetching team task distribution analytics:', response.error);
        throw new Error(response.error);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('[PROJLY:ANALYTICS] Error fetching team task distribution analytics:', error);
      return [];
    }
  },
  
  /**
   * Get task timeline analytics
   * @returns Promise resolving to task timeline analytics data
   */
  async getTaskTimelineAnalytics(): Promise<any> {
    console.log('[PROJLY:ANALYTICS] Fetching task timeline analytics');
    try {
      const response = await apiClient.get<any>('api/projly/analytics/task-timeline');
      
      if (response.error) {
        console.error('[PROJLY:ANALYTICS] Error fetching task timeline analytics:', response.error);
        throw new Error(response.error);
      }
      
      return response.data || { projects: [], tasks: [] };
    } catch (error) {
      console.error('[PROJLY:ANALYTICS] Error fetching task timeline analytics:', error);
      return { projects: [], tasks: [] };
    }
  }
};

// Log initialization
console.log('[PROJLY:SERVICES] Services initialized and exported');
