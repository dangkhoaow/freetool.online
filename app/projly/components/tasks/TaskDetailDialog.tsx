'use client';

import React, { useMemo } from "react";
import { Dialog } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { useMediaQuery } from "@/hooks/use-media-query";
import { X, Maximize2 } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

// Dynamically import the TaskDetailsPage component without loading component
const TaskDetailsPage = dynamic(
  () => import('@/app/projly/tasks/[id]/page').then(mod => mod.default),
  { ssr: false }
);

interface TaskDetailDialogProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

/**
 * TaskDetailDialog component
 * 
 * This dialog reuses the TaskDetailsPage component to display task details
 * in a popup dialog when a task is clicked in the ResourceTimelineView.
 */
export function TaskDetailDialog({ taskId, isOpen, onClose, onTaskUpdated }: TaskDetailDialogProps) {
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
  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

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
  
  return (
    <Dialog open={isOpen && !!taskId} onOpenChange={handleClose}>
      <CustomDialogContent 
        className={cn(
          "overflow-y-auto",
          responsiveClasses.contentClass,
          `data-view-mode=${responsiveClasses.viewMode}`
        )}
      >
        {/* Render the TaskDetailsPage component if we have a taskId */}
        {taskId && (
          <div className={cn(
            "w-full overflow-x-auto",
            responsiveClasses.containerClass
          )}>
            <TaskDetailsPage 
              id={taskId} 
              inDialogMode={true} 
              onDialogClose={handleClose}
              onTaskUpdated={onTaskUpdated}
            />
          </div>
        )}
      </CustomDialogContent>
    </Dialog>
  );
}

export default TaskDetailDialog;
