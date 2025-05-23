import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "./jwt-auth-adapter";
import { taskService } from "./task-service";
import { Task, TaskFilters } from "./types";

// Log initialization of hook for debugging
console.log('[HOOK] use-tasks hook initialized');

// Helper function to calculate task progress
const calculateTaskProgress = (task: Task): number => {
  if (!task.subTasks || task.subTasks.length === 0) {
    return 0;
  }

  const completedSubTasks = task.subTasks.filter(
    (subTask) => subTask.status === 'completed'
  ).length;

  return Math.round((completedSubTasks / task.subTasks.length) * 100);
};

// Helper function to validate parent task selection
const validateParentTask = (task: Task, parentTaskId: string): boolean => {
  if (task.id === parentTaskId) {
    return false; // Cannot be its own parent
  }

  if (task.subTasks) {
    // Check if the selected parent is a sub-task of this task
    const isSubTask = task.subTasks.some(
      (subTask) => subTask.id === parentTaskId
    );
    if (isSubTask) {
      return false; // Cannot be a sub-task's parent
    }
  }

  return true;
};

export function useTasks(filters?: TaskFilters) {
  const { data: session } = useSession();
  
  return useQuery<Task[], Error>({
    queryKey: ["tasks", filters],
    queryFn: () => taskService.getTasks(filters),
    enabled: !!session?.user?.id
  });
}

export function useTask(id: string) {
  const { data: session } = useSession();
  
  return useQuery<Task | null, Error>({
    queryKey: ["task", id],
    queryFn: () => taskService.getTaskById(id),
    enabled: !!id && !!session?.user?.id
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation<Task, Error, Omit<Task, 'id'>>({
    mutationFn: (taskData) => taskService.createTask(taskData),
    onSuccess: (data) => {
      console.log('[HOOK:TASKS] Invalidating cache after task creation:', data?.id);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      }
      toast({
        title: "Task created successfully",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('[HOOK:TASKS] Error creating task:', error);
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation<Task, Error, { id: string; data: Partial<Task> }>({
    mutationFn: ({ id, data }) => taskService.updateTask(id, data),
    onSuccess: (updatedTask) => {
      console.log('[HOOK:TASKS] Invalidating cache after task update:', updatedTask.id);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', updatedTask.id] });
      toast({
        title: "Task updated successfully",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('[HOOK:TASKS] Error updating task:', error);
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation<void, Error, string>({
    mutationFn: (id) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task deleted successfully",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('[HOOK:TASKS] Error deleting task:', error);
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

// Helper functions
export function getTaskStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'todo':
      return 'bg-gray-100 text-gray-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'done':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getTaskPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function formatTaskDate(date: Date | string | null | undefined): string {
  if (!date) return 'No date';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  return dueDate < today && task.status !== 'done';
}
