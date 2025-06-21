import React, { useState } from "react";
import { TaskComment } from "@/lib/services/projly/task-comments-service";
import { getUserDisplayName, formatCommentDate } from "@/lib/services/projly/use-task-comments";
import { CommentEditor } from "./CommentEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { useSession } from "@/lib/services/projly/jwt-auth-adapter";

interface CommentItemProps {
  comment: TaskComment;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  isEditing?: boolean;
  isDeleting?: boolean;
}

export function CommentItem({ 
  comment, 
  onEdit, 
  onDelete, 
  isEditing = false, 
  isDeleting = false 
}: CommentItemProps) {
  const { data: session } = useSession();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const currentUserId = session?.user?.id;
  const isOwner = currentUserId === comment.createdById;
  const displayName = getUserDisplayName(comment.createdBy);
  const formattedDate = formatCommentDate(comment.createdAt);
  
  // Get user initials for avatar
  const getInitials = (user: TaskComment['createdBy']): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user.lastName) {
      return user.lastName[0].toUpperCase();
    }
    return user.email[0].toUpperCase();
  };
  
  const handleEditSubmit = () => {
    if (editContent.trim()) {
      onEdit(comment.id, editContent);
      setIsEditMode(false);
    }
  };
  
  const handleEditCancel = () => {
    setEditContent(comment.content);
    setIsEditMode(false);
  };
  
  const handleDeleteConfirm = () => {
    onDelete(comment.id);
    setShowDeleteDialog(false);
  };
  
  // Render comment content with proper HTML formatting
  const renderCommentContent = (content: string) => {
    return (
      <div 
        className="prose prose-sm dark:prose-invert max-w-none break-words"
        dangerouslySetInnerHTML={{ __html: content }}
        style={{ 
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
      />
    );
  };

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* User Avatar */}
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs">
                {getInitials(comment.createdBy)}
              </AvatarFallback>
            </Avatar>
            
            {/* Comment Content */}
            <div className="flex-1 min-w-0">
              {/* User Info and Actions */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {displayName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formattedDate}
                  </span>
                  {comment.createdAt !== comment.updatedAt && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                      (edited)
                    </span>
                  )}
                </div>
                
                {/* Actions Menu - Only show for comment owner */}
                {isOwner && !isEditMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => setIsEditMode(true)}
                        disabled={isEditing || isDeleting}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={isEditing || isDeleting}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              {/* Comment Content or Editor */}
              {isEditMode ? (
                <CommentEditor
                  initialContent={editContent}
                  onContentChange={setEditContent}
                  onSubmit={handleEditSubmit}
                  onCancel={handleEditCancel}
                  submitButtonText="Save Changes"
                  isLoading={isEditing}
                  disabled={isEditing}
                  minHeight="80px"
                />
              ) : (
                <div className="mt-2">
                  {renderCommentContent(comment.content)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 