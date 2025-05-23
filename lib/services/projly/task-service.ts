import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/app/projly/config/apiConfig';
import { ApiResponse } from '@/lib/api-client';
import { Task, TaskFilters } from './types';

// Define response data interfaces
interface TasksResponseData {
  tasks: Task[];
}

interface TaskResponseData {
  task: Task;
}

class TaskService {
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    try {
      console.log("[TaskService] Fetching tasks with filters:", filters);
      const response = await apiClient.get<TasksResponseData>(
        API_ENDPOINTS.TASKS.ALL,
        { params: filters }
      );

      if (!response.data?.tasks) {
        console.warn("[TaskService] No tasks found in response");
        return [];
      }

      console.log("[TaskService] Fetched tasks:", response.data?.tasks);
      return response.data?.tasks || [];
    } catch (error) {
      console.error("[TaskService] Error fetching tasks:", error);
      throw error;
    }
  }

  async getTaskById(id: string): Promise<Task | null> {
    try {
      console.log("[TaskService] Fetching task:", id);
      const response = await apiClient.get<TaskResponseData>(
        API_ENDPOINTS.TASKS.BY_ID.replace(':id', id)
      );

      if (!response.data?.task) {
        console.warn("[TaskService] No task found in response");
        return null;
      }

      console.log("[TaskService] Fetched task:", response.data?.task);
      return response.data?.task || null;
    } catch (error) {
      console.error(`[TaskService] Error fetching task ${id}:`, error);
      throw error;
    }
  }

  async createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
    try {
      console.log("[TaskService] Creating task:", taskData);
      const response = await apiClient.post<TaskResponseData>(
        API_ENDPOINTS.TASKS.CREATE,
        taskData
      );

      if (!response.data?.task) {
        throw new Error("Failed to create task");
      }

      console.log("[TaskService] Created task:", response.data?.task);
      return response.data?.task;
    } catch (error) {
      console.error("[TaskService] Error creating task:", error);
      throw error;
    }
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    try {
      console.log("[TaskService] Updating task:", id, taskData);
      const response = await apiClient.put<TaskResponseData>(
        API_ENDPOINTS.TASKS.UPDATE.replace(':id', id),
        taskData
      );

      if (!response.data?.task) {
        throw new Error("Failed to update task");
      }

      console.log("[TaskService] Updated task:", response.data?.task);
      return response.data?.task;
    } catch (error) {
      console.error("[TaskService] Error updating task:", error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      console.log("[TaskService] Deleting task:", id);
      await apiClient.delete(
        API_ENDPOINTS.TASKS.DELETE.replace(':id', id)
      );
      console.log("[TaskService] Deleted task:", id);
    } catch (error) {
      console.error("[TaskService] Error deleting task:", error);
      throw error;
    }
  }
}

export const taskService = new TaskService();
