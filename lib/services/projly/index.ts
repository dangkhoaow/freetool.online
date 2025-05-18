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
import { ApiResponse } from '@/lib/api-client';

// Define Project type
interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
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

      // Validate token by making a call to the backend
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
      return isAuthenticated;
    } catch (error) {
      console.error('[PROJLY:AUTH] Error checking authentication:', error);
      return false;
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
   * @param userData User registration data
   * @returns Promise resolving to registration result
   */
  async register(userData: any): Promise<{ success: boolean; error?: string }> {
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
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh session'
      };
    }
  },

  /**
   * Get the current user data
   * @returns Promise resolving to user data
   */
  async getCurrentUser(): Promise<any> {
    console.log('[PROJLY:AUTH] Getting current user data');
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:AUTH] No token found when getting current user');
        return null;
      }

      console.log('[PROJLY:AUTH] Using profile endpoint:', API_ENDPOINTS.AUTH.PROFILE);
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
      console.log('[PROJLY:AUTH] Current user data retrieved successfully');
      return userData.data;
    } catch (error) {
      console.error('[PROJLY:AUTH] Error getting current user:', error);
      return null;
    }
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
export const projlyTasksService = {
  /**
   * Get all tasks for the current user (used by components)
   * @returns Promise resolving to an array of tasks
   */
  async getMyTasks(): Promise<any[]> {
    console.log('[PROJLY:TASKS] Getting my tasks');
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:TASKS] No auth token found');
        return [];
      }

      console.log('[PROJLY:TASKS] Calling API endpoint:', API_ENDPOINTS.TASKS.ALL);
      const response = await fetch(API_ENDPOINTS.TASKS.ALL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[PROJLY:TASKS] Error fetching tasks:', errorData);
        return [];
      }

      const data = await response.json();
      console.log('[PROJLY:TASKS] Tasks fetched successfully, count:', data.data?.length || 0);
      return data.data || [];
    } catch (error) {
      console.error('[PROJLY:TASKS] Error in getMyTasks:', error);
      return [];
    }
  },

  /**
   * Get all tasks for the current user
   * @returns Promise resolving to an array of tasks
   */
  async getUserTasks(): Promise<any[]> {
    console.log('[PROJLY:TASKS] Getting all tasks for current user');
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:TASKS] No token found when getting tasks');
        return [];
      }

      // Using API client for consistent error handling with proper endpoint
      const apiUrl = API_ENDPOINTS.TASKS.ALL;
      console.log(`[PROJLY:TASKS] Fetching tasks from API: ${apiUrl}`);
      
      // Import apiClient dynamically to avoid circular dependencies
      const apiClient = (await import('../../api-client')).default;
      const response = await apiClient.get(apiUrl);
      
      if (response.error) {
        console.error('[PROJLY:TASKS] Failed to get tasks:', response.error);
        throw new Error(response.error);
      }

      console.log(`[PROJLY:TASKS] Successfully retrieved ${response.data?.length || 0} tasks`);
      return response.data || [];
    } catch (error) {
      console.error('[PROJLY:TASKS] Error getting tasks:', error);
      throw error;
    }
  },

  /**
   * Get tasks for a specific project
   * @param projectId Project ID
   * @returns Promise resolving to an array of tasks
   */
  async getProjectTasks(projectId: string): Promise<any[]> {
    console.log(`[PROJLY:TASKS] Getting tasks for project: ${projectId}`);
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:TASKS] No token found when getting project tasks');
        return [];
      }

      // Using API client for consistent error handling
      const apiUrl = `projects/${projectId}/tasks`;
      console.log(`[PROJLY:TASKS] Fetching project tasks from API: ${apiUrl}`);
      
      // Import apiClient dynamically to avoid circular dependencies
      const apiClient = (await import('../../api-client')).default;
      const response = await apiClient.get(apiUrl);
      
      if (response.error) {
        console.error('[PROJLY:TASKS] Failed to get project tasks:', response.error);
        throw new Error(response.error);
      }

      console.log(`[PROJLY:TASKS] Successfully retrieved ${response.data?.length || 0} tasks for project ${projectId}`);
      return response.data || [];
    } catch (error) {
      console.error(`[PROJLY:TASKS] Error getting tasks for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get a task by ID
   * @param id Task ID
   * @returns Promise resolving to task data
   */
  async getTask(id: string): Promise<any> {
    console.log(`[PROJLY:TASKS] Getting task with ID: ${id}`);
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:TASKS] No token found when getting task');
        return null;
      }

      // Using API client for consistent error handling
      const apiUrl = `tasks/${id}`;
      console.log(`[PROJLY:TASKS] Fetching task from API: ${apiUrl}`);
      
      // Import apiClient dynamically to avoid circular dependencies
      const apiClient = (await import('../../api-client')).default;
      const response = await apiClient.get(apiUrl);
      
      if (response.error) {
        console.error('[PROJLY:TASKS] Failed to get task:', response.error);
        throw new Error(response.error);
      }

      console.log(`[PROJLY:TASKS] Successfully retrieved task: ${id}`);
      return response.data;
    } catch (error) {
      console.error(`[PROJLY:TASKS] Error getting task ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new task
   * @param taskData Task data to create
   * @returns Promise resolving to created task
   */
  async createTask(taskData: any): Promise<any> {
    console.log('[PROJLY:TASKS] Creating new task:', taskData.title);
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:TASKS] No token found when creating task');
        throw new Error('Authentication required to create a task');
      }

      // Using API client for consistent error handling
      const apiUrl = 'tasks';
      console.log(`[PROJLY:TASKS] Creating task via API: ${apiUrl}`);
      
      // Import apiClient dynamically to avoid circular dependencies
      const apiClient = (await import('../../api-client')).default;
      const response = await apiClient.post(apiUrl, taskData);
      
      if (response.error) {
        console.error('[PROJLY:TASKS] Failed to create task:', response.error);
        throw new Error(response.error);
      }

      console.log(`[PROJLY:TASKS] Successfully created task: ${response.data?.id}`);
      return response.data;
    } catch (error) {
      console.error('[PROJLY:TASKS] Error creating task:', error);
      throw error;
    }
  },

  /**
   * Update an existing task
   * @param id Task ID
   * @param taskData Task data to update
   * @returns Promise resolving to updated task
   */
  async updateTask(id: string, taskData: any): Promise<any> {
    console.log(`[PROJLY:TASKS] Updating task with ID: ${id}`);
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:TASKS] No token found when updating task');
        throw new Error('Authentication required to update a task');
      }

      // Using API client for consistent error handling
      const apiUrl = `tasks/${id}`;
      console.log(`[PROJLY:TASKS] Updating task via API: ${apiUrl}`);
      
      // Import apiClient dynamically to avoid circular dependencies
      const apiClient = (await import('../../api-client')).default;
      const response = await apiClient.put(apiUrl, taskData);
      
      if (response.error) {
        console.error('[PROJLY:TASKS] Failed to update task:', response.error);
        throw new Error(response.error);
      }

      console.log(`[PROJLY:TASKS] Successfully updated task: ${id}`);
      return response.data;
    } catch (error) {
      console.error(`[PROJLY:TASKS] Error updating task ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a task
   * @param id Task ID to delete
   * @returns Promise resolving to deletion result
   */
  async deleteTask(id: string): Promise<any> {
    console.log(`[PROJLY:TASKS] Deleting task with ID: ${id}`);
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:TASKS] No token found when deleting task');
        throw new Error('Authentication required to delete a task');
      }

      // Using API client for consistent error handling
      const apiUrl = `tasks/${id}`;
      console.log(`[PROJLY:TASKS] Deleting task via API: ${apiUrl}`);
      
      // Import apiClient dynamically to avoid circular dependencies
      const apiClient = (await import('../../api-client')).default;
      const response = await apiClient.delete(apiUrl);
      
      if (response.error) {
        console.error('[PROJLY:TASKS] Failed to delete task:', response.error);
        throw new Error(response.error);
      }

      console.log(`[PROJLY:TASKS] Successfully deleted task: ${id}`);
      return response.data;
    } catch (error) {
      console.error(`[PROJLY:TASKS] Error deleting task ${id}:`, error);
      throw error;
    }
  }
};

// Log initialization
console.log('[PROJLY:SERVICES] Services initialized and exported');
