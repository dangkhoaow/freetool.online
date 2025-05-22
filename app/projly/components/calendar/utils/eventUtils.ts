
import { format } from 'date-fns';
import { TaskWithDetails } from '@/services/tasks';
import { parseDateSafe, createUTCDateAtNoon, formatDateForInput } from '@/utils/dateUtils';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  resourceId: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    description?: string;
    assignee?: string;
    status: string;
    taskId: string;
  }
}

/**
 * Transforms tasks data into FullCalendar event format
 */
export const transformTasksToEvents = (tasks: TaskWithDetails[] | null): CalendarEvent[] => {
  if (!tasks || tasks.length === 0) return [];
  
  console.log('Transforming tasks to events:', tasks);
  
  return tasks.map(task => {
    // Handle missing dates - if no dates are provided, skip the task
    console.log(`[EVENT UTILS] Creating calendar event for task: ${task.id}`);
    
    if (!task.startDate && !task.dueDate) {
      console.log(`[EVENT UTILS] Task has no dates: ${task.id}`);
      console.log(`Task ${task.id} has no dates, skipping`);
      return null;
    }
    
    // Create proper date objects at noon UTC to avoid timezone issues using our date utilities
    const startDate = task.startDate ? createUTCDateAtNoon(task.startDate) : 
                      task.dueDate ? createUTCDateAtNoon(task.dueDate) : null;
    const endDate = task.dueDate ? createUTCDateAtNoon(task.dueDate) : 
                   task.startDate ? createUTCDateAtNoon(task.startDate) : null;
    
    console.log(`[EVENT UTILS] Date conversion for task ${task.id}:`, {
      originalStartDate: task.startDate,
      originalDueDate: task.dueDate,
      convertedStartDate: startDate,
      convertedEndDate: endDate
    });
    
    if (!startDate || !endDate) {
      console.log(`Task ${task.id} has invalid dates, skipping`);
      return null;
    }
    
    // Add one day to end date for proper rendering (FullCalendar uses exclusive end dates)
    const endDateAdjusted = new Date(endDate);
    endDateAdjusted.setDate(endDateAdjusted.getDate() + 1);
    
    // Get colors based on status
    const { backgroundColor, borderColor } = getTaskStatusColors(task.status);
    
    console.log(`Transformed task ${task.title}:`, {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDateAdjusted, 'yyyy-MM-dd')
    });
    
    return {
      id: task.id,
      title: task.title,
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDateAdjusted, 'yyyy-MM-dd'),
      resourceId: task.projectId,
      backgroundColor,
      borderColor,
      textColor: '#ffffff',
      extendedProps: {
        description: task.description,
        assignee: task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned',
        status: task.status,
        taskId: task.id
      }
    };
  }).filter(Boolean) as CalendarEvent[];
};

// We're now using the createUTCDateAtNoon function from our dateUtils module
// This comment is kept for documentation purposes

/**
 * Define a consistent color scheme matching our status badges across the application
 */
export type StatusColorKey = 'completed' | 'in progress' | 'in review' | 'not started' | 
  'on hold' | 'pending' | 'active' | 'planned' | 'cancelled' | 'canceled' | 
  'archived' | 'overdue' | 'to do' | 'default';

export const STATUS_COLORS: Record<StatusColorKey, { bg: string; border: string }> = {
  'completed': { bg: '#16a34a', border: '#15803d' }, // green-600/700
  'in progress': { bg: '#2563eb', border: '#1d4ed8' }, // blue-600/700
  'in review': { bg: '#a855f7', border: '#9333ea' }, // purple-500/600
  'not started': { bg: '#6b7280', border: '#4b5563' }, // gray-500/600
  'on hold': { bg: '#f97316', border: '#ea580c' }, // orange-500/600
  'pending': { bg: '#f59e0b', border: '#d97706' }, // amber-500/600
  'active': { bg: '#2563eb', border: '#1d4ed8' }, // blue-600/700 (same as In Progress)
  'planned': { bg: '#8b5cf6', border: '#7c3aed' }, // violet-500/600
  'cancelled': { bg: '#ef4444', border: '#dc2626' }, // red-500/600
  'canceled': { bg: '#ef4444', border: '#dc2626' }, // red-500/600 (alternative spelling)
  'archived': { bg: '#6b7280', border: '#4b5563' }, // gray-500/600 (same as Not Started)
  'overdue': { bg: '#ef4444', border: '#dc2626' }, // red-500/600
  'to do': { bg: '#6b7280', border: '#4b5563' }, // gray-500/600
  'default': { bg: '#9ca3af', border: '#6b7280' }, // gray-400/500
};

/**
 * Gets background and border colors based on task status
 */
export const getTaskStatusColors = (status: string): { backgroundColor: string; borderColor: string } => {
  const normalizedStatus = (status || 'default').toLowerCase();
  // Use a type assertion to handle any status string safely
  const colors = STATUS_COLORS[normalizedStatus as StatusColorKey] || STATUS_COLORS.default;
  
  // Add detailed logging for debugging
  console.log(`[EVENT UTILS] Getting colors for status: ${status}, normalized: ${normalizedStatus}`, {
    backgroundColor: colors.bg,
    borderColor: colors.border
  });
  
  return {
    backgroundColor: colors.bg,
    borderColor: colors.border
  };
};

/**
 * Format event title for tooltip/popover 
 */
export const formatEventContent = (eventInfo: any): string => {
  const { event } = eventInfo;
  const { extendedProps } = event;
  
  return `
    <div class="p-2">
      <div class="font-semibold">${event.title}</div>
      ${extendedProps.description ? `<div class="text-xs mt-1">${extendedProps.description}</div>` : ''}
      <div class="text-xs mt-1">
        <span class="font-medium">Assignee:</span> ${extendedProps.assignee}
      </div>
      <div class="text-xs">
        <span class="font-medium">Status:</span> ${extendedProps.status}
      </div>
    </div>
  `;
};
