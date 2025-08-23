'use client';

import React, { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { useMediaQuery } from "@/hooks/use-media-query";
import { X, Maximize2 } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { projlyTasksService } from '@/lib/services/projly';
import { PageLoading } from '@/app/projly/components/ui/PageLoading';
import { useToast } from '@/components/ui/use-toast';

// Dynamically import the TaskDetailsPage component with loading fallback
const TaskDetailsPage = dynamic(
  () => import('@/app/projly/tasks/[id]/page').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <PageLoading standalone={true} height="60vh" logContext="TASK_DETAIL_DIALOG:LOADING" />
  }
);

interface TaskDetailDialogProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

// Create a detailed log function for debugging
const log = (...args: any[]) => console.log('[TaskDetailDialog]', ...args);

/**
 * TaskDetailDialog component - Enhanced to prevent double loading
 * 
 * This dialog reuses the TaskDetailsPage component to display task details
 * in a popup dialog. Enhanced with React Query caching to prevent double loading
 * and flashing issues when tasks are updated.
 */
export function TaskDetailDialog({ taskId, isOpen, onClose, onTaskUpdated }: TaskDetailDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogMounted, setIsDialogMounted] = useState(false);
  const [taskNotFound, setTaskNotFound] = useState(false);
  const lastTaskIdRef = useRef<string | null>(null);
  
  // Reset states when taskId changes
  useEffect(() => {
    if (taskId !== lastTaskIdRef.current) {
      setTaskNotFound(false);
      lastTaskIdRef.current = taskId;
      log('Task ID changed to:', taskId);
    }
  }, [taskId]);
  
  // Track dialog mount state
  useEffect(() => {
    if (isOpen && taskId) {
      setIsDialogMounted(true);
      log('Dialog mounted for task:', taskId);
    } else {
      setIsDialogMounted(false);
      setTaskNotFound(false);
      log('Dialog unmounted');
    }
  }, [isOpen, taskId]);
  
  // Pre-fetch task data with React Query to prevent double loading
  const {
    data: taskData,
    isLoading: isTaskLoading,
    error: taskError,
    refetch: refetchTask
  } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!taskId) return null;
      log('Pre-fetching task data for:', taskId);
      try {
        const data = await projlyTasksService.getTask(taskId);
        log('Pre-fetched task data successfully:', data?.id);
        return data;
      } catch (error) {
        log('Error pre-fetching task:', error);
        setTaskNotFound(true);
        throw error;
      }
    },
    enabled: !!taskId && isDialogMounted,
    staleTime: 30 * 1000, // 30 seconds - fresh data for dialog
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  // Handle task update callback with enhanced error handling
  const handleTaskUpdated = useCallback(async () => {
    log('Task updated callback triggered');
    try {
      // Invalidate and refetch the specific task
      if (taskId) {
        await queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        await refetchTask();
      }
      
      // Call parent callback
      if (onTaskUpdated) {
        onTaskUpdated();
      }
      
      // Show success toast
      toast({
        title: 'Task Updated',
        description: 'Task has been updated successfully.',
      });
    } catch (error) {
      log('Error handling task update:', error);
      toast({
        title: 'Update Error',
        description: 'There was an error updating the task.',
        variant: 'destructive'
      });
    }
  }, [taskId, queryClient, refetchTask, onTaskUpdated, toast]);
  // Memoize media query results to prevent unnecessary re-renders
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  
  // Memoize responsive classes to prevent recalculation
  const responsiveClasses = useMemo(() => ({
    contentClass: isMobile ? "p-2 w-full" : "p-4",
    viewMode: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
    containerClass: isMobile ? "p-1" : "p-2"
  }), [isMobile, isTablet]);

  // Handle dialog close - memoized to prevent recreation
  const handleClose = useCallback(() => {
    log('Dialog close requested');
    setIsDialogMounted(false);
    setTaskNotFound(false);
    onClose();
  }, [onClose]);
  
  // Determine if we should show loading state
  const shouldShowLoading = isTaskLoading && !taskData && !taskError && !taskNotFound;
  
  // Determine if we should show error state
  const shouldShowError = taskError || taskNotFound;
  
  // Determine if we should show content
  const shouldShowContent = taskData && !shouldShowLoading && !shouldShowError;

  // Custom DialogContent without close button - with enhanced responsive behavior
  const CustomDialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
  >(({ className, children, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          // Enhanced responsive classes
          "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-2 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          // Mobile optimizations
          "p-2 max-h-[85vh] max-w-[98vw] sm:p-4 sm:max-w-xl md:max-w-3xl lg:max-w-5xl sm:rounded-lg",
          className
        )}
        {...props}
      >
        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          {/* Full task detail view button */}
          <button
            type="button"
            className="rounded-sm p-1 opacity-70 hover:opacity-100 focus:outline-none hover:bg-primary hover:text-white transition-colors"
            aria-label="Open full task detail in new tab"
            title="Open full task detail in new tab"
            onClick={() => {
              if (taskId) {
                window.open(`/projly/tasks/${taskId}`, '_blank');
              }
            }}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          
          {/* Close button */}
          <DialogPrimitive.Close asChild>
            <button
              type="button"
              className="rounded-sm p-1 opacity-70 hover:opacity-100 focus:outline-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogPrimitive.Close>
        </div>
        {/* Required DialogTitle for accessibility */}
        <VisuallyHidden.Root>
          <DialogPrimitive.Title>Task Details</DialogPrimitive.Title>
        </VisuallyHidden.Root>
        {children}
        {/* No close button here */}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ));
  
  // Don't render dialog if no taskId
  if (!taskId) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <CustomDialogContent 
        className={cn(
          "overflow-y-auto",
          responsiveClasses.contentClass,
          `data-view-mode=${responsiveClasses.viewMode}`
        )}
      >
        {/* Enhanced content rendering with proper loading states */}
        {shouldShowLoading && (
          <div className={cn(
            "w-full flex items-center justify-center",
            responsiveClasses.containerClass
          )}>
            <PageLoading 
              standalone={true} 
              height="50vh" 
              logContext="TASK_DETAIL_DIALOG:CONTENT_LOADING"
            />
          </div>
        )}
        
        {shouldShowError && (
          <div className={cn(
            "w-full flex flex-col items-center justify-center p-8 text-center",
            responsiveClasses.containerClass
          )}>
            <div className="text-destructive mb-4">
              <h3 className="text-lg font-semibold mb-2">Task Not Found</h3>
              <p className="text-sm text-muted-foreground">
                {taskError?.message || 'Task not found or you do not have permission to view it.'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        )}
        
        {shouldShowContent && taskId && (
          <div className={cn(
            "w-full overflow-x-auto",
            responsiveClasses.containerClass
          )}>
            <TaskDetailsPage 
              id={taskId} 
              inDialogMode={true} 
              onDialogClose={handleClose}
              onTaskUpdated={handleTaskUpdated}
            />
          </div>
        )}
      </CustomDialogContent>
    </Dialog>
  );
}

export default TaskDetailDialog;
