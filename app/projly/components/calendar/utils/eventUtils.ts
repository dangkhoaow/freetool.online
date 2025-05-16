
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
 * Gets background and border colors based on task status
 */
export const getTaskStatusColors = (status: string): { backgroundColor: string; borderColor: string } => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return { backgroundColor: '#10b981', borderColor: '#059669' }; // Green
    case 'in progress':
      return { backgroundColor: '#f97316', borderColor: '#ea580c' }; // Orange
    case 'on hold':
      return { backgroundColor: '#6366f1', borderColor: '#4f46e5' }; // Indigo
    case 'cancelled':
      return { backgroundColor: '#ef4444', borderColor: '#dc2626' }; // Red
    case 'not started':
    case 'to do':
    case 'pending':
    default:
      return { backgroundColor: '#3b82f6', borderColor: '#2563eb' }; // Blue
  }
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
