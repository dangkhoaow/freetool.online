import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "./jwt-auth-adapter";
import { taskCommentsService, TaskComment, CreateCommentData, UpdateCommentData } from "./task-comments-service";

// Log initialization for debugging
console.log('[HOOK] use-task-comments hook initialized');

/**
 * Hook to get all comments for a task
 */
export function useTaskComments(taskId: string) {
  const { data: session } = useSession();
  
  return useQuery<TaskComment[], Error>({
    queryKey: ["task-comments", taskId],
    queryFn: async () => {
      try {
        const comments = await taskCommentsService.getComments(taskId);
        // Ensure we always return an array
        return Array.isArray(comments) ? comments : [];
      } catch (error) {
        console.error('[HOOK:TASK_COMMENTS] Error in queryFn:', error);
        // Return empty array to prevent map errors
        return [];
      }
    },
    enabled: !!taskId && !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: 'always', // Always fetch comments when component mounts
    // Add retry configuration
    retry: (failureCount, error) => {
      console.log(`[HOOK:TASK_COMMENTS] Query failed ${failureCount} times:`, error);
      return failureCount < 2; // Retry up to 2 times
    },
  });
}

/**
 * Hook to create a new comment
 */
export function useCreateTaskComment() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation<TaskComment, Error, { taskId: string; data: CreateCommentData }>({
    mutationFn: ({ taskId, data }) => taskCommentsService.createComment(taskId, data),
    onSuccess: (data, variables) => {
      console.log('[HOOK:TASK_COMMENTS] Invalidating cache after comment creation:', data?.id);
      // Invalidate and refetch comments for this task
      queryClient.invalidateQueries({ queryKey: ['task-comments', variables.taskId] });
      toast({
        title: "Comment added successfully",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('[HOOK:TASK_COMMENTS] Error creating comment:', error);
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

/**
 * Hook to update an existing comment
 */
export function useUpdateTaskComment() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation<TaskComment, Error, { taskId: string; commentId: string; data: UpdateCommentData }>({
    mutationFn: ({ taskId, commentId, data }) => taskCommentsService.updateComment(taskId, commentId, data),
    onSuccess: (data, variables) => {
      console.log('[HOOK:TASK_COMMENTS] Invalidating cache after comment update:', data?.id);
      // Invalidate and refetch comments for this task
      queryClient.invalidateQueries({ queryKey: ['task-comments', variables.taskId] });
      toast({
        title: "Comment updated successfully",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('[HOOK:TASK_COMMENTS] Error updating comment:', error);
      toast({
        title: "Error updating comment",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

/**
 * Hook to delete a comment
 */
export function useDeleteTaskComment() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation<void, Error, { taskId: string; commentId: string }>({
    mutationFn: ({ taskId, commentId }) => taskCommentsService.deleteComment(taskId, commentId),
    onSuccess: (data, variables) => {
      console.log('[HOOK:TASK_COMMENTS] Invalidating cache after comment deletion');
      // Invalidate and refetch comments for this task
      queryClient.invalidateQueries({ queryKey: ['task-comments', variables.taskId] });
      toast({
        title: "Comment deleted successfully",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('[HOOK:TASK_COMMENTS] Error deleting comment:', error);
      toast({
        title: "Error deleting comment",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

/**
 * Helper function to get user display name
 */
export function getUserDisplayName(user: TaskComment['createdBy']): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  if (user.lastName) {
    return user.lastName;
  }
  return user.email;
}

/**
 * Helper function to format comment date
 */
export function formatCommentDate(date: string): string {
  const commentDate = new Date(date);
  const now = new Date();
  const diffInSeconds = (now.getTime() - commentDate.getTime()) / 1000;
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return commentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 