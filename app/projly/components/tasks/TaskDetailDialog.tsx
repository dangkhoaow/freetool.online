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
  mainFilters?: any; // Filters from the main task hub to pass to subtasks
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
export function TaskDetailDialog({ taskId, isOpen, onClose, onTaskUpdated, mainFilters }: TaskDetailDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogMounted, setIsDialogMounted] = useState(false);
  const [taskNotFound, setTaskNotFound] = useState(false);
  const lastTaskIdRef = useRef<string | null>(null);
  
  // Enhanced saving state management for anti-flashing
  const [saving, setSaving] = useState(false);
  const [savingMessage, setSavingMessage] = useState('Saving...');
  const savingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
  
  // Track recent activity to prevent flashing on close
  const lastActivityTimeRef = useRef<number>(0);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  
  // Enhanced saving state management with delay for flashing prevention
  const setSavingWithDelay = useCallback((isSaving: boolean, message: string = 'Saving...') => {
    log(`Setting saving state: ${isSaving}, message: ${message}`);
    setSaving(isSaving);
    setSavingMessage(message);
    markActivity(`saving-${isSaving ? 'start' : 'end'}`);
    
    // Clear any existing timeout
    if (savingTimeoutRef.current) {
      clearTimeout(savingTimeoutRef.current);
      savingTimeoutRef.current = null;
    }
    
    // When saving ends, delay the state change to mask cascading renders
    if (!isSaving) {
      savingTimeoutRef.current = setTimeout(() => {
        setSaving(false);
        log('Saving state cleared after delay');
      }, 800); // 800ms delay to ensure all cascading renders are complete
    }
  }, []);
  
  // Mark activity for comprehensive flashing prevention
  const markActivity = useCallback((source: string) => {
    lastActivityTimeRef.current = Date.now();
    log(`Activity marked: ${source}`);
  }, []);
  
  // Track various activity sources that can cause flashing
  useEffect(() => {
    if (isTaskLoading) markActivity('task-loading');
  }, [isTaskLoading, markActivity]);
  
  useEffect(() => {
    if (taskData) markActivity('task-data-change');
  }, [taskData, markActivity]);
  
  useEffect(() => {
    if (taskError) markActivity('task-error');
  }, [taskError, markActivity]);
  
  // Track saving state changes as activity
  useEffect(() => {
    if (saving) markActivity('saving-active');
  }, [saving, markActivity]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      if (savingTimeoutRef.current) {
        clearTimeout(savingTimeoutRef.current);
        savingTimeoutRef.current = null;
      }
      setIsClosing(false);
      setSaving(false);
    };
  }, []);
  
  // Handle task update callback with enhanced error handling and optimistic updates
  const handleTaskUpdated = useCallback(async (updatedTask?: any) => {
    log('Task updated callback triggered', updatedTask?.id);
    markActivity('task-update');
    
    try {
      if (taskId && updatedTask) {
        // Optimistically update the cache to prevent re-fetching
        log('Updating query cache optimistically');
        queryClient.setQueryData(['task', taskId], updatedTask);
        markActivity('cache-update');
      }
      
      // Invalidate related queries
      if (taskId) {
        markActivity('query-invalidation');
        await queryClient.invalidateQueries({ queryKey: ['tasks'] });
        await queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      }
      
      // Call parent callback
      if (onTaskUpdated) {
        markActivity('parent-callback');
        onTaskUpdated();
      }
      
    } catch (error) {
      log('Error handling task update:', error);
      markActivity('task-update-error');
      toast({
        title: 'Update Error',
        description: 'There was an error updating the task.',
        variant: 'destructive'
      });
    }
  }, [taskId, queryClient, onTaskUpdated, toast, markActivity]);
  // Memoize media query results to prevent unnecessary re-renders
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  
  // Memoize responsive classes to prevent recalculation
  const responsiveClasses = useMemo(() => ({
    contentClass: isMobile ? "p-2 w-full" : "p-4",
    viewMode: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
    containerClass: isMobile ? "p-1" : "p-2"
  }), [isMobile, isTablet]);

  // Handle dialog close with comprehensive flashing prevention
  const handleClose = useCallback(() => {
    log('Dialog close requested');
    
    // Clear any existing close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    // Check if we should delay close to prevent flashing
    const timeSinceActivity = Date.now() - lastActivityTimeRef.current;
    const hasRecentActivity = timeSinceActivity < 1200; // Activity in last 1200ms (increased window)
    const isCurrentlyLoading = isTaskLoading;
    const isCurrentlySaving = saving;
    
    const shouldDelay = hasRecentActivity || isCurrentlyLoading || isClosing || isCurrentlySaving;
    
    if (shouldDelay && !isClosing) {
      const delayReason = isCurrentlySaving ? 'saving' : isCurrentlyLoading ? 'loading' : 'recent activity';
      const delay = isCurrentlySaving ? 1000 : isCurrentlyLoading ? 500 : Math.max(300, 1200 - timeSinceActivity);
      
      log(`Delaying close by ${delay}ms due to ${delayReason} (${timeSinceActivity}ms since activity)`);
      
      // Show closing overlay to mask any flashing
      setIsClosing(true);
      
      closeTimeoutRef.current = setTimeout(() => {
        log('Delayed close executing');
        setIsDialogMounted(false);
        setTaskNotFound(false);
        setIsClosing(false);
        onClose();
        closeTimeoutRef.current = null;
      }, delay);
    } else if (!isClosing) {
      log('Closing immediately - no flashing risk detected');
      setIsDialogMounted(false);
      setTaskNotFound(false);
      onClose();
    }
    // If already closing, ignore additional close requests
  }, [onClose, isTaskLoading, isClosing]);
  
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
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-500 transition-all" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          // Enhanced responsive classes
          "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-2 border bg-background shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:duration-500 transition-all",
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
        {/* Required DialogTitle and Description for accessibility */}
        <VisuallyHidden.Root>
          <DialogPrimitive.Title>Task Details</DialogPrimitive.Title>
          <DialogPrimitive.Description>
            View and edit task details, including title, description, status, priority, assignee, dates, and subtasks.
          </DialogPrimitive.Description>
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
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
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
            "w-full overflow-x-auto transition-all duration-500 ease-in-out",
            (isClosing || saving) && "opacity-95 pointer-events-none",
            responsiveClasses.containerClass
          )}>
            <TaskDetailsPage 
              id={taskId} 
              inDialogMode={true} 
              onDialogClose={handleClose}
              onTaskUpdated={handleTaskUpdated}
              mainFilters={mainFilters}
              initialTask={taskData}
              saving={saving}
              setSaving={setSavingWithDelay}
            />
          </div>
        )}
        
        {/* Enhanced anti-flashing overlay during close delay and saves */}
        {(isClosing || saving) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/85 backdrop-blur-[2px] z-50 rounded-lg">
            <div className="flex flex-col items-center gap-3 p-6 bg-background/95 rounded-xl border shadow-lg">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <p className="text-sm text-muted-foreground font-medium">
                {saving ? savingMessage : 'Closing...'}
              </p>
            </div>
          </div>
        )}
      </CustomDialogContent>
    </Dialog>
  );
}

export default TaskDetailDialog;
