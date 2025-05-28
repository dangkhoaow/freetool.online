/**
 * Projly Tasks Service
 * 
 * This file provides a consolidated task service for the Projly application.
 * It combines functionality from both the previous TaskService class and the
 * projlyTasksService object to provide a single source of truth for task operations.
 * 
 * @updated 2025-05-24
 */

import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/app/projly/config/apiConfig';
import { getAuthToken } from '@/app/projly/utils/auth-utils';
import { Task, TaskFilters } from '../types';

// Consistent log prefix for all task service operations
const LOG_PREFIX = '[TasksService]';

/**
 * TasksService class providing methods for task management
 */
class TasksService {
  /**
   * Get a list of tasks with optional filters
   * @param filters Optional filters to apply to the task list
   * @returns Promise resolving to an array of tasks
   */
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    try {
      console.log(`${LOG_PREFIX} Fetching tasks with filters:`, filters);
      // Pass filters directly to apiClient.get instead of wrapping in a params object
      const response = await apiClient.get(
        API_ENDPOINTS.TASKS.ALL,
        filters
      );

      console.log(`${LOG_PREFIX} Tasks response:`, response.data);
      
      // Handle API response structure
      if (response.error) {
        console.error(`${LOG_PREFIX} API returned an error:`, response.error);
        throw new Error(response.error || "Failed to fetch tasks");
      }
      
      // API returns { data: Task[] } directly
      const tasksData = response.data || [];
      
      console.log(`${LOG_PREFIX} Processed tasks data:`, tasksData);
      return tasksData as Task[];
    } catch (error) {
      console.error(`${LOG_PREFIX} Error fetching tasks:`, error);
      throw error;
    }
  }

  /**
   * Check if a task exists without retrieving the full task data
   * @param id Task ID to check
   * @returns Promise resolving to a boolean indicating if the task exists
   */
  async checkTaskExists(id: string): Promise<boolean> {
    try {
      console.log(`${LOG_PREFIX} Checking if task exists:`, id);
      
      // Try to get the task and return true if it exists
      const task = await this.getTaskById(id);
      return !!task;
    } catch (error) {
      console.error(`${LOG_PREFIX} Error checking if task exists:`, error);
      return false;
    }
  }

  /**
   * Get a specific task by ID
   * @param id Task ID to retrieve
   * @returns Promise resolving to a task or null if not found
   */
  async getTaskById(id: string): Promise<Task | null> {
    try {
      console.log(`${LOG_PREFIX} Fetching task:`, id);
      
      // Ensure we have authentication
      const token = getAuthToken();
      if (!token) {
        console.log(`${LOG_PREFIX} No token found when fetching task`);
        throw new Error('Authentication required to fetch a task');
      }
      
      const response = await apiClient.get(
        API_ENDPOINTS.TASKS.BY_ID.replace(':id', id)
      );

      console.log(`${LOG_PREFIX} Task fetch response:`, response);
      
      // Handle API response structure
      if (response.error) {
        console.error(`${LOG_PREFIX} API returned an error:`, response.error);
        
        // Check if this is a 404/400 error indicating task not found
        if (response.status === 404 || response.status === 400) {
          console.warn(`${LOG_PREFIX} Task not found (${response.status}):`, id);
          return null; // Return null instead of throwing for not found
        }
        
        throw new Error(response.error || `Failed to fetch task ${id}`);
      }
      
      // API returns { data: Task } directly
      const taskData = response.data;
      if (!taskData) {
        console.warn(`${LOG_PREFIX} No task found in response for ID: ${id}`);
        return null;
      }

      console.log(`${LOG_PREFIX} Successfully retrieved task:`, taskData);
      return taskData as Task;
    } catch (error) {
      console.error(`${LOG_PREFIX} Error fetching task ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new task
   * @param taskData Task data to create
   * @returns Promise resolving to the created task
   */
  async createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
    try {
      console.log(`${LOG_PREFIX} Creating task:`, taskData);
      
      // Ensure we have authentication
      const token = getAuthToken();
      if (!token) {
        console.log(`${LOG_PREFIX} No token found when creating task`);
        throw new Error('Authentication required to create a task');
      }
      
      const response = await apiClient.post(
        API_ENDPOINTS.TASKS.CREATE,
        taskData
      );

      // Debug the actual API response structure
      console.log(`${LOG_PREFIX} Task creation raw response:`, response);
      
      // Handle error response
      if (response.error) {
        console.error(`${LOG_PREFIX} API returned an error:`, response.error);
        throw new Error(response.error || "Failed to create task");
      }
      
      // Extract the task data from the response
      const taskResult = response.data;
      
      if (!taskResult) {
        console.error(`${LOG_PREFIX} No task data in response:`, response);
        throw new Error("Failed to create task: No data returned");
      }

      console.log(`${LOG_PREFIX} Successfully created task: ${taskResult.id}`);
      return taskResult as Task;
    } catch (error) {
      console.error(`${LOG_PREFIX} Error creating task:`, error);
      throw error;
    }
  }

  /**
   * Update an existing task
   * @param id Task ID to update
   * @param taskData Partial task data to update
   * @returns Promise resolving to the updated task
   */
  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    try {
      console.log(`${LOG_PREFIX} Updating task:`, id, taskData);
      
      // Ensure we have authentication
      const token = getAuthToken();
      if (!token) {
        console.log(`${LOG_PREFIX} No token found when updating task`);
        throw new Error('Authentication required to update a task');
      }
      
      const response = await apiClient.put(
        API_ENDPOINTS.TASKS.UPDATE.replace(':id', id),
        taskData
      );

      console.log(`${LOG_PREFIX} Task update response:`, response);
      
      // Handle API response structure
      if (response.error) {
        console.error(`${LOG_PREFIX} API returned an error:`, response.error);
        throw new Error(response.error || `Failed to update task ${id}`);
      }
      
      // API returns { data: Task }
      if (!response.data) {
        console.error(`${LOG_PREFIX} No task data in update response:`, response);
        throw new Error(`Failed to update task ${id}: No data returned`);
      }

      console.log(`${LOG_PREFIX} Successfully updated task: ${id}`);
      return response.data as Task;
    } catch (error) {
      console.error(`${LOG_PREFIX} Error updating task:`, error);
      throw error;
    }
  }

  /**
   * Delete a task
   * @param id Task ID to delete
   * @returns Promise resolving to void
   */
  async deleteTask(id: string): Promise<void> {
    try {
      console.log(`${LOG_PREFIX} Deleting task:`, id);
      
      // Ensure we have authentication
      const token = getAuthToken();
      if (!token) {
        console.log(`${LOG_PREFIX} No token found when deleting task`);
        throw new Error('Authentication required to delete a task');
      }
      
      const response = await apiClient.delete(
        API_ENDPOINTS.TASKS.DELETE.replace(':id', id)
      );
      
      console.log(`${LOG_PREFIX} Task deletion response:`, response);
      
      // Handle API response structure
      if (response.error) {
        console.error(`${LOG_PREFIX} API returned an error:`, response.error);
        throw new Error(response.error || `Failed to delete task ${id}`);
      }
      
      console.log(`${LOG_PREFIX} Successfully deleted task: ${id}`);
    } catch (error) {
      console.error(`${LOG_PREFIX} Error deleting task:`, error);
      throw error;
    }
  }

  /**
   * Get tasks for the current user
   * @returns Promise resolving to an array of tasks
   */
  async getMyTasks(): Promise<Task[]> {
    try {
      console.log(`${LOG_PREFIX} Fetching my tasks`);
      return this.getTasks({ assignedTo: 'me' });
    } catch (error) {
      console.error(`${LOG_PREFIX} Error fetching my tasks:`, error);
      throw error;
    }
  }

  /**
   * Get all user tasks
   * @param filters Optional filters to apply to the task list
   * @returns Promise resolving to an array of tasks
   */
  async getUserTasks(filters?: TaskFilters): Promise<Task[]> {
    try {
      console.log(`${LOG_PREFIX} Fetching all user tasks with filters:`, filters);
      return this.getTasks(filters);
    } catch (error) {
      console.error(`${LOG_PREFIX} Error fetching user tasks:`, error);
      throw error;
    }
  }

  /**
   * Get tasks for a specific project
   * @param projectId Project ID to get tasks for
   * @param filters Optional additional filters to apply to the task list
   * @returns Promise resolving to an array of tasks
   */
  async getProjectTasks(projectId: string, filters?: TaskFilters): Promise<Task[]> {
    try {
      console.log(`${LOG_PREFIX} Fetching tasks for project:`, projectId, 'with filters:', filters);
      const combinedFilters: TaskFilters = { ...filters, projectId };
      return this.getTasks(combinedFilters);
    } catch (error) {
      console.error(`${LOG_PREFIX} Error fetching project tasks:`, error);
      throw error;
    }
  }

  /**
   * Get a task by ID - alias for getTaskById for backward compatibility
   * @param id Task ID to retrieve
   * @returns Promise resolving to a task or null
   */
  async getTask(id: string): Promise<Task | null> {
    return this.getTaskById(id);
  }
}

// Create a singleton instance
export const tasksService = new TasksService();

// For backward compatibility with existing code
export const taskService = tasksService;
export const projlyTasksService = tasksService;

// Default export for module imports
export default tasksService;
