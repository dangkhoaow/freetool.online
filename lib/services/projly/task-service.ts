import { Task } from './use-tasks';
import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/app/projly/config/apiConfig';

import { ApiResponse } from '@/lib/api-client';

// Define response data interfaces
interface TasksResponseData {
  tasks: Task[];
}

interface TaskResponseData {
  task: Task;
}

class TaskService {
  async getTasks(filters?: { projectId?: string; assignedTo?: string; status?: string }): Promise<Task[]> {
    try {
      const response = await apiClient.get<TasksResponseData>(
        API_ENDPOINTS.TASKS.ALL,
        filters
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // Return the tasks array or empty array if not available
      return response.data?.tasks || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getTaskById(id: string): Promise<Task | null> {
    try {
      const response = await apiClient.get<TaskResponseData>(
        API_ENDPOINTS.TASKS.BY_ID.replace(':id', id)
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // Return the task or null if not available
      return response.data?.task || null;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const response = await apiClient.post<TaskResponseData>(
        API_ENDPOINTS.TASKS.CREATE,
        taskData
      );

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data?.task) {
        throw new Error('No task data returned from server');
      }

      return response.data.task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(
    id: string,
    taskData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Task> {
    try {
      const response = await apiClient.put<TaskResponseData>(
        API_ENDPOINTS.TASKS.BY_ID.replace(':id', id),
        taskData
      );

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data?.task) {
        throw new Error('No task data returned from server');
      }

      return response.data.task;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<{ error?: string }>(
        API_ENDPOINTS.TASKS.BY_ID.replace(':id', id)
      );

      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  }
}

export const taskService = new TaskService();
