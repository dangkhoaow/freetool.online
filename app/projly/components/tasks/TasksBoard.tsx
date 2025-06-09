/**
 * TasksBoard Component
 * 
 * A board view for tasks organized by status columns with drag-and-drop functionality.
 * Provides an alternative to the list view in TasksTable.
 * 
 * @created 2025-05-29
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task } from './TasksTable'; // Reuse Task interface from TasksTable
// Fix import path for TaskCard to use relative path
import TaskCard from '@/app/projly/components/tasks/TaskCard';
import { tasksService } from '@/lib/services/projly/tasks/tasks-service';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/projly/contexts/AuthContextCustom';
// Import the Task type from the service
import { Task as ServiceTask } from '@/lib/services/projly/types';

// Define detailed log function for debugging
const log = (...args: any[]) => console.log('[TasksBoard]', ...args);

// Define available status columns
const STATUS_COLUMNS = [
  'Not Started',
  'In Progress',
  'In Review',
  'Completed',
  'On Hold',
  'Pending',
  'Cancelled'
];

// Define status colors for visual consistency
const STATUS_COLORS: Record<string, string> = {
  'Not Started': 'bg-slate-100 hover:bg-slate-200 text-slate-700',
  'In Progress': 'bg-blue-100 hover:bg-blue-200 text-blue-700',
  'In Review': 'bg-purple-100 hover:bg-purple-200 text-purple-700',
  'Completed': 'bg-green-100 hover:bg-green-200 text-green-700',
  'On Hold': 'bg-amber-100 hover:bg-amber-200 text-amber-700',
  'Pending': 'bg-orange-100 hover:bg-orange-200 text-orange-700',
  'Cancelled': 'bg-red-100 hover:bg-red-200 text-red-700',
};

// Define drag item types
const ItemTypes = {
  TASK: 'task',
};

// Props for TasksBoard
export interface TasksBoardProps {
  tasks: Task[];
  initialFilters?: any;
  onOperationComplete?: (filters?: any) => void;
  compact?: boolean;
  context?: 'main' | 'project' | 'task';
}

// StatusColumn component
interface StatusColumnProps {
  status: string;
  tasks: Task[];
  onTaskDrop: (taskId: string, newStatus: string) => Promise<void>;
  compact?: boolean;
}

const StatusColumn: React.FC<StatusColumnProps> = ({ status, tasks, onTaskDrop, compact }) => {
  // Set up drop target
  const [{ isOver }, dropRef] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item: { id: string }) => {
      log(`Task ${item.id} dropped in ${status} column`);
      onTaskDrop(item.id, status);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  // Create a ref function that calls the drop ref
  const drop = (element: HTMLDivElement | null) => {
    dropRef(element);
  };

  // Get status color
  const statusColor = STATUS_COLORS[status] || 'bg-gray-100 hover:bg-gray-200 text-gray-700';

  return (
    <div
      ref={drop}
      className={`flex flex-col h-full min-h-[300px] ${isOver ? 'bg-blue-50' : 'bg-gray-50'} rounded-md p-2 transition-colors`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">{status}</h3>
        <Badge variant="outline" className={statusColor}>
          {tasks.length}
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            compact={compact}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-gray-400 text-sm italic">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};

export function TasksBoard({
  tasks,
  initialFilters = {},
  onOperationComplete,
  compact = false,
  context = 'main',
}: TasksBoardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Apply all filters to tasks for board view
  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    const { search, label, projectId, status, assignedTo, taskHierarchy } = initialFilters || {};
    
    // Search filter (client-side)
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      log(`Applying search filter: "${searchTerm}" to ${tasks.length} tasks in board view`);
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm) ||
        task.id?.toLowerCase().includes(searchTerm)
      );
      log(`After search filter: ${filtered.length} tasks remaining`);
    }
    
    // Label filter
    if (label) {
      log(`Applying label filter: "${label}" to board view`);
      filtered = filtered.filter(task => task.label === label);
      log(`After label filter: ${filtered.length} tasks remaining`);
    }
    
    // Project filter
    if (projectId) {
      log(`Applying project filter: "${projectId}" to board view`);
      filtered = filtered.filter(task => task.projectId === projectId);
      log(`After project filter: ${filtered.length} tasks remaining`);
    }
    
    // Status filter
    if (status) {
      log(`Applying status filter: "${status}" to board view`);
      filtered = filtered.filter(task => task.status === status);
      log(`After status filter: ${filtered.length} tasks remaining`);
    }
    
    // Assignee filter
    if (assignedTo) {
      log(`Applying assignee filter: "${assignedTo}" to board view`);
      filtered = filtered.filter(task => {
        const id = task.assignedTo ?? task.assignee?.id;
        if (assignedTo === 'current') {
          return id === user?.id;
        } else if (assignedTo === 'unassigned') {
          return !id;
        } else if (assignedTo === 'all') {
          return true;
        }
        return id === assignedTo;
      });
      log(`After assignee filter: ${filtered.length} tasks remaining`);
    }
    
    // Task hierarchy filter
    if (taskHierarchy) {
      log(`Applying task hierarchy filter: "${taskHierarchy}" to board view`);
      if (taskHierarchy === 'parent_only') {
        filtered = filtered.filter(task => !task.parentTaskId);
      }
      // 'include_subtasks' and default 'all' include everything
      log(`After hierarchy filter: ${filtered.length} tasks remaining`);
    }
    
    return filtered;
  }, [tasks, initialFilters?.search, initialFilters?.label, initialFilters?.projectId, initialFilters?.status, initialFilters?.assignedTo, initialFilters?.taskHierarchy, user?.id]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    // Initialize all status columns with empty arrays
    STATUS_COLUMNS.forEach(status => {
      grouped[status] = [];
    });
    
    // Group filtered tasks by status
    filteredTasks.forEach(task => {
      const status = task.status || 'Not Started';
      if (grouped[status]) {
        grouped[status].push(task);
      } else {
        // Handle any status not in our predefined list
        grouped[status] = [task];
      }
    });
    
    return grouped;
  }, [filteredTasks]);

  // Handle task drop (status change)
  const handleTaskDrop = async (taskId: string, newStatus: string) => {
    try {
      // Find the task
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        log(`Task ${taskId} not found`);
        return;
      }
      
      // Skip if status is already the same
      if (task.status === newStatus) {
        log(`Task ${taskId} already has status ${newStatus}`);
        return;
      }
      
      log(`Updating task ${taskId} status from ${task.status} to ${newStatus}`);
      setIsUpdating(true);
      setUpdatingTaskId(taskId);
      
      // Based on the backend implementation, we need to include only the necessary fields
      // The backend maps assignedTo to assigneeId, so we need to preserve that field
      const updatePayload = {
        // Include the minimum required fields
        title: task.title,
        status: newStatus,
        projectId: task.projectId,
        // Preserve the assignee information
        assignedTo: task.assignedTo, // Use assignedTo instead of assigneeId to match Task type
        // Include description if available
        description: task.description || '',
        // Preserve parent task relationship
        parentTaskId: task.parentTaskId, // This will be undefined if not present, which is fine
        // Include additional fields
        label: task.label || undefined,
        // Convert null to undefined for API compatibility
        percentProgress: task.percentProgress !== null ? task.percentProgress : undefined
      } as Partial<ServiceTask>;
      
      log('Sending update payload to API:', updatePayload);
      
      // Update task status with the properly formatted payload
      await tasksService.updateTask(taskId, updatePayload);
      
      // Process the initialFilters to handle 'current' user ID before passing to onOperationComplete
      // This ensures that when the TasksContainer refreshes, it uses the correct user ID
      if (onOperationComplete) {
        // Create a copy of the initialFilters
        const processedFilters = { ...initialFilters };
        
        // Handle the 'current' user ID in assignedTo filter
        if (processedFilters.assignedTo === 'current' && user?.id) {
          log(`[TasksBoard] Replacing 'current' assignee with actual user ID: ${user.id} for refresh`);
          // We don't modify the original initialFilters, just the copy we're passing
          // This preserves the UI state while ensuring the API call uses the correct ID
          processedFilters.assignedTo = user.id;
        }
        
        log('[TasksBoard] Calling onOperationComplete with processed filters:', processedFilters);
        onOperationComplete(processedFilters);
      }
      
      // Show success toast
      toast({
        title: 'Task updated',
        description: `Task status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('[TasksBoard] Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
      setUpdatingTaskId(null);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[800px]">
          {STATUS_COLUMNS.map((status) => (
            <Card key={status} className={`${compact ? 'shadow-none border-0' : ''}`}>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm font-medium">{status}</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <StatusColumn
                  status={status}
                  tasks={tasksByStatus[status] || []}
                  onTaskDrop={handleTaskDrop}
                  compact={compact}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

export default TasksBoard;
