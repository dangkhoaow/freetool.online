import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Plus, Loader2 } from "lucide-react";
import { 
  useTaskComments, 
  useCreateTaskComment, 
  useUpdateTaskComment, 
  useDeleteTaskComment 
} from "@/lib/services/projly/use-task-comments";
import { CommentEditor } from "./CommentEditor";
import { CommentItem } from "./CommentItem";

interface TaskCommentsSectionProps {
  taskId: string;
  className?: string;
}

export function TaskCommentsSection({ taskId, className = "" }: TaskCommentsSectionProps) {
  const [showNewCommentEditor, setShowNewCommentEditor] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState('');
  
  // Hooks for managing comments
  const { data: comments = [], isLoading, error, refetch } = useTaskComments(taskId);
  const createCommentMutation = useCreateTaskComment();
  const updateCommentMutation = useUpdateTaskComment();
  const deleteCommentMutation = useDeleteTaskComment();
  
  // Ensure comments is always an array (additional safety check)
  const safeComments = Array.isArray(comments) ? comments : [];
  
  console.log('[TASK_COMMENTS_SECTION] Comments data:', comments, 'Safe comments:', safeComments);
  
  const handleCreateComment = async () => {
    if (!newCommentContent.trim()) return;
    
    try {
      await createCommentMutation.mutateAsync({
        taskId,
        data: { content: newCommentContent }
      });
      
      // Reset the form
      setNewCommentContent('');
      setShowNewCommentEditor(false);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };
  
  const handleUpdateComment = async (commentId: string, content: string) => {
    if (!content.trim()) return;
    
    try {
      await updateCommentMutation.mutateAsync({
        taskId,
        commentId,
        data: { content }
      });
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync({
        taskId,
        commentId
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  
  const handleCancelNewComment = () => {
    setNewCommentContent('');
    setShowNewCommentEditor(false);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-gray-500">Loading comments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              Failed to load comments: {error.message}
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Comments
          </CardTitle>
          
          {!showNewCommentEditor && (
            <Button 
              onClick={() => setShowNewCommentEditor(true)}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Comment
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* New Comment Editor */}
        {showNewCommentEditor && (
          <div className="mb-6">
            <CommentEditor
              initialContent={newCommentContent}
              onContentChange={setNewCommentContent}
              onSubmit={handleCreateComment}
              onCancel={handleCancelNewComment}
              placeholder="Write a comment..."
              submitButtonText="Post Comment"
              isLoading={createCommentMutation.isPending}
              disabled={createCommentMutation.isPending}
            />
          </div>
        )}
        
        {showNewCommentEditor && safeComments.length > 0 && (
          <Separator className="my-6" />
        )}
        
        {/* Comments List */}
        {safeComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              No comments yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Be the first to add a comment to this task
            </p>
            {!showNewCommentEditor && (
              <Button 
                onClick={() => setShowNewCommentEditor(true)}
                size="sm"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Comment
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {safeComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onEdit={handleUpdateComment}
                onDelete={handleDeleteComment}
                isEditing={updateCommentMutation.isPending}
                isDeleting={deleteCommentMutation.isPending}
              />
            ))}
          </div>
        )}
        
        {/* Load more indicator or pagination can be added here in the future */}
        {safeComments.length > 0 && (
          <div className="text-center pt-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {safeComments.length} comment{safeComments.length !== 1 ? 's' : ''} total
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 