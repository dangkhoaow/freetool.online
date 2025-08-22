/**
 * Tasks Hub Service - Optimized for server-side filtering and performance
 * 
 * This service targets the /api/projly/tasks-hub endpoints for improved
 * performance with server-side search, filtering, and pagination.
 */

import apiClient from '@/lib/api-client';
import { getAuthToken } from '@/app/projly/utils/auth-utils';

// Base API endpoints for tasks hub
const TASKS_HUB_ENDPOINTS = {
  BASE: '/api/projly/tasks-hub',
  BY_ID: (id) => `/api/projly/tasks-hub/${id}`,
  LIGHT: (id) => `/api/projly/tasks-hub/${id}?light=true`,
  LABELS: '/api/projly/tasks-hub/labels',
  MEMBERS: '/api/projly/tasks-hub/members'
};

// Consistent log prefix for all hub service operations
const LOG_PREFIX = '[TasksHubService]';

/**
 * Tasks Hub Service class providing optimized methods for task management
 */
export class TasksHubService {
  /**
   * Get tasks with server-side filtering, search, and pagination
   * @param {Object} filters - Filters to apply on the server
   * @param {string} filters.q - Search query (title, ID, label)
   * @param {string} filters.status - Task status filter
   * @param {string} filters.projectId - Project ID filter
   * @param {string} filters.assignedTo - Assignee filter ('current' for current user)
   * @param {boolean} filters.parentOnly - Show only parent tasks
   * @param {boolean} filters.includeSubTasks - Include subtasks
   * @param {number} filters.page - Page number for pagination
   * @param {number} filters.pageSize - Items per page
   * @param {string} filters.sort - Sort field and direction (e.g., 'title:asc')
   * @returns {Promise<{tasks: Array, meta: Object}>} Tasks with pagination metadata
   */
  async getTasks(filters = {}) {
    try {
      console.log(`${LOG_PREFIX} Fetching tasks with server-side filters:`, filters);
      
      // Build query parameters for server-side processing
      const queryParams = {};
      
      if (filters.q && filters.q.trim()) {
        queryParams.q = filters.q.trim();
      }
      if (filters.status && filters.status !== 'all') {
        queryParams.status = filters.status;
      }
      if (filters.projectId && filters.projectId !== 'all') {
        queryParams.projectId = filters.projectId;
      }
      if (filters.assignedTo && filters.assignedTo !== 'all') {
        // Handle multiple assignees
        if (Array.isArray(filters.assignedTo)) {
          queryParams.assignedTo = filters.assignedTo.join(',');
        } else {
          queryParams.assignedTo = filters.assignedTo;
        }
      }
      if (filters.label && filters.label !== 'all') {
        queryParams.label = filters.label;
      }
      if (filters.hideParentTasksByStatus && filters.hideParentTasksByStatus.length > 0) {
        queryParams.hideParentTasksByStatus = filters.hideParentTasksByStatus.join(',');
      }
      if (filters.hideChildTasksByStatus && filters.hideChildTasksByStatus.length > 0) {
        queryParams.hideChildTasksByStatus = filters.hideChildTasksByStatus.join(',');
      }
      if (filters.parentOnly) {
        queryParams.parentOnly = 'true';
      }
      if (filters.includeSubTasks) {
        queryParams.includeSubTasks = 'true';
      }
      if (filters.page) {
        queryParams.page = filters.page.toString();
      }
      if (filters.pageSize) {
        queryParams.pageSize = filters.pageSize.toString();
      }
      if (filters.sort) {
        queryParams.sort = filters.sort;
      }
      
      console.log(`${LOG_PREFIX} Query parameters:`, queryParams);
      
      const response = await apiClient.get(TASKS_HUB_ENDPOINTS.BASE, queryParams);
      
      console.log(`${LOG_PREFIX} Server response:`, {
        tasksCount: response.data?.tasks?.length || 0,
        meta: response.data?.meta
      });
      
      if (response.error) {
        console.error(`${LOG_PREFIX} API returned an error:`, response.error);
        throw new Error(response.error.message || "Failed to fetch tasks");
      }
      
      // Return the server response which includes { tasks, meta }
      return response.data || { tasks: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 0 } };
    } catch (error) {
      console.error(`${LOG_PREFIX} Error fetching tasks:`, error);
      throw error;
    }
  }

  /**
   * Get a single task by ID with optional light mode for fast popup loading
   * @param {string} taskId - The task ID
   * @param {Object} options - Options for the request
   * @param {boolean} options.light - Use light mode for minimal data
   * @returns {Promise<Object>} Task data
   */
  async getTaskById(taskId, options = {}) {
    try {
      const endpoint = options.light 
        ? TASKS_HUB_ENDPOINTS.LIGHT(taskId)
        : TASKS_HUB_ENDPOINTS.BY_ID(taskId);
      
      console.log(`${LOG_PREFIX} Fetching task ${taskId}, light mode: ${options.light}`);
      
      const response = await apiClient.get(endpoint);
      
      if (response.error) {
        console.error(`${LOG_PREFIX} API returned an error:`, response.error);
        throw new Error(response.error.message || "Failed to fetch task");
      }
      
      console.log(`${LOG_PREFIX} Successfully fetched task ${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`${LOG_PREFIX} Error fetching task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new task
   * @param {Object} taskData - Task data to create
   * @returns {Promise<Object>} Created task data
   */
  async createTask(taskData) {
    try {
      console.log(`${LOG_PREFIX} Creating task:`, {
        title: taskData.title,
        projectId: taskData.projectId,
        status: taskData.status
      });
      
      const response = await apiClient.post(TASKS_HUB_ENDPOINTS.BASE, taskData);
      
      if (response.error) {
        console.error(`${LOG_PREFIX} API returned an error:`, response.error);
        throw new Error(response.error.message || "Failed to create task");
      }
      
      console.log(`${LOG_PREFIX} Successfully created task:`, response.data?.id);
      return response.data;
    } catch (error) {
      console.error(`${LOG_PREFIX} Error creating task:`, error);
      throw error;
    }
  }

  /**
   * Update a task
   * @param {string} taskId - The task ID to update
   * @param {Object} taskData - Updated task data
   * @returns {Promise<Object>} Updated task data
   */
  async updateTask(taskId, taskData) {
    try {
      console.log(`${LOG_PREFIX} Updating task ${taskId}:`, {
        title: taskData.title,
        status: taskData.status,
        percentProgress: taskData.percentProgress
      });
      
      const response = await apiClient.put(TASKS_HUB_ENDPOINTS.BY_ID(taskId), taskData);
      
      if (response.error) {
        console.error(`${LOG_PREFIX} API returned an error:`, response.error);
        throw new Error(response.error.message || "Failed to update task");
      }
      
      console.log(`${LOG_PREFIX} Successfully updated task ${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`${LOG_PREFIX} Error updating task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a task
   * @param {string} taskId - The task ID to delete
   * @returns {Promise<void>}
   */
  async deleteTask(taskId) {
    try {
      console.log(`${LOG_PREFIX} Deleting task ${taskId}`);
      
      const response = await apiClient.delete(TASKS_HUB_ENDPOINTS.BY_ID(taskId));
      
      if (response.error) {
        console.error(`${LOG_PREFIX} API returned an error:`, response.error);
        throw new Error(response.error.message || "Failed to delete task");
      }
      
      console.log(`${LOG_PREFIX} Successfully deleted task ${taskId}`);
      return;
    } catch (error) {
      console.error(`${LOG_PREFIX} Error deleting task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Get tasks for a specific project with server-side filtering
   * @param {string} projectId - The project ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<{tasks: Array, meta: Object}>} Tasks with pagination metadata
   */
  async getProjectTasks(projectId, filters = {}) {
    return this.getTasks({ ...filters, projectId });
  }

  /**
   * Get user tasks with server-side filtering
   * @param {Object} filters - Filters to apply
   * @returns {Promise<{tasks: Array, meta: Object}>} Tasks with pagination metadata
   */
  async getUserTasks(filters = {}) {
    return this.getTasks(filters);
  }

  /**
   * Get all available labels from tasks accessible to the user
   * @returns {Promise<Array>} Array of unique labels
   */
  async getLabels() {
    try {
      console.log(`${LOG_PREFIX} Fetching available labels`);
      
      const response = await apiClient.get(TASKS_HUB_ENDPOINTS.LABELS);
      
      if (response.error) {
        console.error(`${LOG_PREFIX} API returned an error:`, response.error);
        throw new Error(response.error.message || "Failed to fetch labels");
      }
      
      console.log(`${LOG_PREFIX} Successfully fetched ${response.data?.length || 0} labels`);
      return response.data || [];
    } catch (error) {
      console.error(`${LOG_PREFIX} Error fetching labels:`, error);
      throw error;
    }
  }

  /**
   * Get all available members/assignees from tasks accessible to the user
   * @returns {Promise<Array>} Array of unique members with { id, name, email }
   */
  async getMembers() {
    try {
      console.log(`${LOG_PREFIX} Fetching available members`);
      
      const response = await apiClient.get(TASKS_HUB_ENDPOINTS.MEMBERS);
      
      if (response.error) {
        console.error(`${LOG_PREFIX} API returned an error:`, response.error);
        throw new Error(response.error.message || "Failed to fetch members");
      }
      
      console.log(`${LOG_PREFIX} Successfully fetched ${response.data?.length || 0} members`);
      return response.data || [];
    } catch (error) {
      console.error(`${LOG_PREFIX} Error fetching members:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const tasksHubService = new TasksHubService();

// Default export
export default tasksHubService;

