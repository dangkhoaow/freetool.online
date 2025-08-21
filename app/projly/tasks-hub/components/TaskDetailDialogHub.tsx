/**
 * TaskDetailDialogHub Component - Optimized for Fast Loading
 * 
 * An optimized task detail dialog that loads minimal data first for fast popup
 * opening, then progressively loads additional data sections as needed.
 * 
 * Key optimizations:
 * - Light mode initial load for minimal data
 * - Progressive loading of heavy sections
 * - Lazy loading of relations and descriptions
 * - Reuse existing UI components for consistency
 * 
 * @created 2025-08-21
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { tasksHubService } from '@/lib/services/projly/tasks/hub/new-task-service';
import { Calendar, Clock, User, Tag, BarChart3, FileText, Link, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/app/projly/contexts/AuthContextCustom';

// Log function for debugging
const log = (...args: any[]) => console.log('[TaskDetailDialogHub]', ...args);

interface TaskDetailDialogHubProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskChange?: () => void;
}

export function TaskDetailDialogHub({ 
  taskId, 
  open, 
  onOpenChange, 
  onTaskChange 
}: TaskDetailDialogHubProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [lightTask, setLightTask] = useState<any>(null);
  const [fullTask, setFullTask] = useState<any>(null);
  const [isLightLoading, setIsLightLoading] = useState(true);
  const [isFullLoading, setIsFullLoading] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load light task data immediately when dialog opens
  useEffect(() => {
    if (!open || !taskId) return;
    
    const loadLightTask = async () => {
      try {
        setIsLightLoading(true);
        setError(null);
        log('Loading light task data for:', taskId);
        
        const task = await tasksHubService.getTaskById(taskId, { light: true });
        setLightTask(task);
        log('Light task data loaded:', task?.title);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load task';
        log('Error loading light task:', errorMessage);
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      } finally {
        setIsLightLoading(false);
      }
    };
    
    loadLightTask();
  }, [open, taskId, toast]);
  
  // Load full task data when user requests more details
  const loadFullDetails = async () => {
    if (fullTask || isFullLoading) return;
    
    try {
      setIsFullLoading(true);
      log('Loading full task data for:', taskId);
      
      const task = await tasksHubService.getTaskById(taskId, { light: false });
      setFullTask(task);
      setShowFullDetails(true);
      log('Full task data loaded:', task?.title);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load full task details';
      log('Error loading full task:', errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsFullLoading(false);
    }
  };
  
  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setLightTask(null);
      setFullTask(null);
      setIsLightLoading(true);
      setIsFullLoading(false);
      setShowFullDetails(false);
      setError(null);
    }
  }, [open]);
  
  // Get the task data to display (full if available, light otherwise)
  const currentTask = fullTask || lightTask;
  
  // Check if current user can delete task
  const canDeleteTask = () => {
    if (!user?.id || !currentTask) return false;
    return currentTask.assigneeId === user.id || currentTask.createdById === user.id;
  };
  
  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!taskId || !canDeleteTask()) return;
    
    try {
      log('Deleting task:', taskId);
      await tasksHubService.deleteTask(taskId);
      
      toast({
        title: 'Task deleted',
        description: 'Task has been successfully deleted.',
        variant: 'default'
      });
      
      onOpenChange(false);
      onTaskChange?.();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      log('Error deleting task:', errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };
  
  // Format date helper
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'Not set';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {isLightLoading ? (
                <Skeleton className="h-6 w-64" />
              ) : (
                currentTask?.title || 'Task Details'
              )}
            </DialogTitle>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {canDeleteTask() && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDeleteTask}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        {error ? (
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : isLightLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : currentTask ? (
          <div className="space-y-6">
            {/* Quick overview - always visible */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Overview</CardTitle>
                  {!showFullDetails && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadFullDetails}
                      disabled={isFullLoading}
                    >
                      {isFullLoading ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Status */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(currentTask.status)}>
                      {currentTask.status || 'Not set'}
                    </Badge>
                  </div>
                  
                  {/* Priority */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Priority</p>
                    <Badge className={getPriorityColor(currentTask.priority)}>
                      {currentTask.priority || 'Medium'}
                    </Badge>
                  </div>
                  
                  {/* Progress */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Progress</p>
                    <div className="flex items-center gap-2">
                      <Progress value={currentTask.percentProgress || 0} className="flex-1" />
                      <span className="text-sm text-muted-foreground">
                        {currentTask.percentProgress || 0}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Label */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Label</p>
                    {currentTask.label ? (
                      <Badge variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {currentTask.label}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">No label</span>
                    )}
                  </div>
                </div>
                
                {/* Dates and project */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due Date
                    </p>
                    <p className="text-sm">{formatDate(currentTask.dueDate)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Assignee
                    </p>
                    <p className="text-sm">
                      {currentTask.assignee 
                        ? `${currentTask.assignee.firstName || ''} ${currentTask.assignee.lastName || ''}`.trim() || currentTask.assignee.email
                        : 'Unassigned'
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Project</p>
                    <p className="text-sm">{currentTask.project?.name || 'No project'}</p>
                  </div>
                </div>
                
                {/* Subtask count if available */}
                {currentTask._count?.subTasks > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      This task has {currentTask._count.subTasks} subtask{currentTask._count.subTasks === 1 ? '' : 's'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Full details section - loaded progressively */}
            {showFullDetails && fullTask && (
              <>
                {/* Description */}
                {fullTask.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p>{fullTask.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Subtasks */}
                {fullTask.subTasks && fullTask.subTasks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Subtasks ({fullTask.subTasks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {fullTask.subTasks.map((subtask: any) => (
                          <div key={subtask.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(subtask.status)} variant="outline">
                                {subtask.status}
                              </Badge>
                              <span className="text-sm">{subtask.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {subtask.percentProgress && (
                                <span>{subtask.percentProgress}%</span>
                              )}
                              {subtask.assignee && (
                                <span>
                                  {subtask.assignee.firstName} {subtask.assignee.lastName}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Related Tasks */}
                {fullTask.relatedTasks && fullTask.relatedTasks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Link className="h-5 w-5" />
                        Related Tasks ({fullTask.relatedTasks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {fullTask.relatedTasks.map((relatedTask: any) => (
                          <div key={relatedTask.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(relatedTask.status)} variant="outline">
                                {relatedTask.status}
                              </Badge>
                              <span className="text-sm">{relatedTask.title}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {relatedTask.project?.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
            
            {/* Loading state for full details */}
            {isFullLoading && (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No task data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
