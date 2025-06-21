import apiClient from '../../api-client';

export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface CreateCommentData {
  content: string;
}

export interface UpdateCommentData {
  content: string;
}

export const taskCommentsService = {
  /**
   * Get all comments for a task
   */
  async getComments(taskId: string): Promise<TaskComment[]> {
    console.log(`[TASK_COMMENTS_SERVICE] Getting comments for task: ${taskId}`);
    
    try {
      const response = await apiClient.get(`/api/projly/tasks/${taskId}/comments`);
      
      if (response.success) {
        console.log(`[TASK_COMMENTS_SERVICE] Retrieved ${response.data.length} comments`);
        return response.data;
      } else {
        console.error('[TASK_COMMENTS_SERVICE] Failed to get comments:', response.error);
        throw new Error(response.error || 'Failed to get comments');
      }
    } catch (error: any) {
      console.error('[TASK_COMMENTS_SERVICE] Error getting comments:', error);
      throw new Error(error.response?.data?.error?.message || error.message || 'Failed to get comments');
    }
  },

  /**
   * Create a new comment
   */
  async createComment(taskId: string, commentData: CreateCommentData): Promise<TaskComment> {
    console.log(`[TASK_COMMENTS_SERVICE] Creating comment for task: ${taskId}`);
    
    try {
      const response = await apiClient.post(`/api/projly/tasks/${taskId}/comments`, commentData);
      
      if (response.success) {
        console.log(`[TASK_COMMENTS_SERVICE] Created comment: ${response.data.id}`);
        return response.data;
      } else {
        console.error('[TASK_COMMENTS_SERVICE] Failed to create comment:', response.error);
        throw new Error(response.error || 'Failed to create comment');
      }
    } catch (error: any) {
      console.error('[TASK_COMMENTS_SERVICE] Error creating comment:', error);
      throw new Error(error.response?.data?.error?.message || error.message || 'Failed to create comment');
    }
  },

  /**
   * Update an existing comment
   */
  async updateComment(taskId: string, commentId: string, updates: UpdateCommentData): Promise<TaskComment> {
    console.log(`[TASK_COMMENTS_SERVICE] Updating comment: ${commentId}`);
    
    try {
      const response = await apiClient.put(`/api/projly/tasks/${taskId}/comments/${commentId}`, updates);
      
      if (response.success) {
        console.log(`[TASK_COMMENTS_SERVICE] Updated comment: ${commentId}`);
        return response.data;
      } else {
        console.error('[TASK_COMMENTS_SERVICE] Failed to update comment:', response.error);
        throw new Error(response.error || 'Failed to update comment');
      }
    } catch (error: any) {
      console.error('[TASK_COMMENTS_SERVICE] Error updating comment:', error);
      throw new Error(error.response?.data?.error?.message || error.message || 'Failed to update comment');
    }
  },

  /**
   * Delete a comment
   */
  async deleteComment(taskId: string, commentId: string): Promise<void> {
    console.log(`[TASK_COMMENTS_SERVICE] Deleting comment: ${commentId}`);
    
    try {
      const response = await apiClient.delete(`/api/projly/tasks/${taskId}/comments/${commentId}`);
      
      if (response.success) {
        console.log(`[TASK_COMMENTS_SERVICE] Deleted comment: ${commentId}`);
      } else {
        console.error('[TASK_COMMENTS_SERVICE] Failed to delete comment:', response.error);
        throw new Error(response.error || 'Failed to delete comment');
      }
    } catch (error: any) {
      console.error('[TASK_COMMENTS_SERVICE] Error deleting comment:', error);
      throw new Error(error.response?.data?.error?.message || error.message || 'Failed to delete comment');
    }
  }
}; 