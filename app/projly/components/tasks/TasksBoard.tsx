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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAssigneeInitials } from './TasksContainer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tag } from 'lucide-react';

// Define detailed log function for debugging
const log = (...args: any[]) => console.log('[TasksBoard]', ...args);

// Define available status columns
const STATUS_COLUMNS = [
  'Not Started',
  'In Progress',
  'In Review',
  'Completed',
  'Golive',
  'On Hold',
  'Pending',
  'Cancelled'
];

// Define ordered labels following the industry categories dictionary
const ORDERED_LABELS = [
  // Business & Management
  'Research',
  'Business Requirements',
  'Business Analysis',
  'Project Management',
  'Resource Planning',
  'Stakeholder Management',
  'Risk Assessment',
  'Budget Management',
  'Change Management',
  'Strategy Planning',
  // Design & Creative
  'UI/UX Design',
  'Graphic Design',
  'Content Creation',
  'Video Production',
  'Animation',
  'Illustration',
  'Brand Identity',
  // IT & Development
  'System Architecture',
  'Cloud Infrastructure',
  'DevOps',
  'Database Management',
  'Backend Development',
  'API Development',
  'Frontend Development',
  'Mobile App Development',
  'QA & Testing',
  'Security Implementation',
  // Marketing & Sales
  'Content Marketing',
  'Social Media',
  'SEO/SEM',
  'Email Marketing',
  'Sales',
  'Customer Relations',
  'Market Research',
  'Brand Development',
  'Campaign Management',
  // Other
  'Documentation',
  'Training',
  'Support',
  'Custom',
];

// Define status colors for visual consistency
const STATUS_COLORS: Record<string, string> = {
  'Not Started': 'bg-slate-100 hover:bg-slate-200 text-slate-700',
  'In Progress': 'bg-blue-100 hover:bg-blue-200 text-blue-700',
  'In Review': 'bg-purple-100 hover:bg-purple-200 text-purple-700',
  'Completed': 'bg-green-100 hover:bg-green-200 text-green-700',
  'Golive': 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700',
  'On Hold': 'bg-amber-100 hover:bg-amber-200 text-amber-700',
  'Pending': 'bg-orange-100 hover:bg-orange-200 text-orange-700',
  'Cancelled': 'bg-red-100 hover:bg-red-200 text-red-700',
};

// Define label colors for visual consistency
const LABEL_COLORS: Record<string, string> = {
  'Planning': 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700',
  'Design': 'bg-purple-100 hover:bg-purple-200 text-purple-700',
  'Development': 'bg-blue-100 hover:bg-blue-200 text-blue-700',
  'Testing': 'bg-amber-100 hover:bg-amber-200 text-amber-700',
  'Review': 'bg-orange-100 hover:bg-orange-200 text-orange-700',
  'Documentation': 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  'Deployment': 'bg-green-100 hover:bg-green-200 text-green-700',
  'Maintenance': 'bg-teal-100 hover:bg-teal-200 text-teal-700',
  'Bug': 'bg-red-100 hover:bg-red-200 text-red-700',
  'Feature': 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700',
  'Enhancement': 'bg-cyan-100 hover:bg-cyan-200 text-cyan-700',
  'Refactoring': 'bg-violet-100 hover:bg-violet-200 text-violet-700',
};

// Define drag item types
const ItemTypes = {
  TASK: 'task',
};

// Define grouping options
type GroupingOption = 'status' | 'assignee' | 'label';

// Props for TasksBoard
export interface TasksBoardProps {
  tasks: Task[];
  initialFilters?: any;
  onOperationComplete?: (filters?: any) => void;
  compact?: boolean;
  context?: 'main' | 'project' | 'task';
}

// LabelColumn component
interface LabelColumnProps {
  label: string | null;
  tasks: Task[];
  onTaskDrop: (taskId: string, newStatus: string, newAssigneeId?: string | null, newLabel?: string | null) => Promise<void>;
  compact?: boolean;
}

const LabelColumn: React.FC<LabelColumnProps> = ({ label, tasks, onTaskDrop, compact }) => {
  // Set up drop target
  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item: { id: string }) => {
      log(`Task ${item.id} dropped in ${label || 'Unlabeled'} column`);
      onTaskDrop(item.id, tasks[0]?.status || 'Not Started', undefined, label);
    },
    canDrop: (item: { id: string }) => {
      // Allow dropping if the task doesn't already have this label
      const task = tasks.find(t => t.id === item.id);
      return task ? task.label !== label : true;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });
  
  // Create a ref function that calls the drop ref
  const drop = (element: HTMLDivElement | null) => {
    dropRef(element);
  };

  // Get only top-level tasks or orphaned subtasks (parent not in current group)
  const topLevelTasks = tasks.filter(task =>
    !task.parentTaskId || !tasks.some(t => t.id === task.parentTaskId)
  );

  // Create a map of parent tasks with their subtasks
  const taskMap = useMemo(() => {
    const map = new Map<string, Task[]>();
    
    // Group tasks by parentTaskId
    tasks.forEach(task => {
      if (task.parentTaskId) {
        if (!map.has(task.parentTaskId)) {
          map.set(task.parentTaskId, []);
        }
        map.get(task.parentTaskId)?.push(task);
      }
    });
    
    // Attach subtasks to their parent tasks
    topLevelTasks.forEach(parentTask => {
      parentTask.subTasks = map.get(parentTask.id) || [];
    });
    
    return map;
  }, [tasks]);

  // Get label color
  const labelColor = label ? (LABEL_COLORS[label] || 'bg-gray-100 hover:bg-gray-200 text-gray-700') : 'bg-gray-100 hover:bg-gray-200 text-gray-700';

  return (
    <div
      ref={drop}
      className={`flex flex-col h-full min-h-[300px] rounded-md p-1 transition-all duration-200 ease-in-out ${
        isOver && canDrop 
          ? 'bg-blue-50 border-2 border-blue-300 shadow-lg transform scale-[1.02]' 
          : isOver
            ? 'bg-red-50 border-2 border-red-300'
            : 'bg-gray-50 border-2 border-transparent'
      }`}
      style={{
        ...(isOver && canDrop && {
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
        })
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${label ? labelColor.split(' ')[0] : 'bg-gray-300'}`}></div>
        <h3 className="text-sm font-medium flex-1">{label || 'Unlabeled'}</h3>
        <Badge variant="outline" className={labelColor}>
          {tasks.length}
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Only render top-level tasks and let TaskCard handle subtasks */}
        {topLevelTasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            compact={compact} 
            renderSubtasks={true}
          />
        ))}
        {topLevelTasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-gray-400 text-sm italic">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};

// AssigneeColumn component
interface AssigneeColumnProps {
  assignee: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  tasks: Task[];
  onTaskDrop: (taskId: string, newStatus: string, newAssigneeId?: string | null) => Promise<void>;
  compact?: boolean;
}

const AssigneeColumn: React.FC<AssigneeColumnProps> = ({ assignee, tasks, onTaskDrop, compact }) => {
  // Set up drop target
  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item: { id: string }) => {
      log(`Task ${item.id} dropped in ${assignee?.name || 'Unassigned'} column`);
      onTaskDrop(item.id, tasks[0]?.status || 'Not Started', assignee?.id);
    },
    canDrop: (item: { id: string }) => {
      // Allow dropping if the task is not already assigned to this assignee
      const task = tasks.find(t => t.id === item.id);
      return task ? (task.assignedTo !== assignee?.id && task.assignee?.id !== assignee?.id) : true;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });
  
  // Create a ref function that calls the drop ref
  const drop = (element: HTMLDivElement | null) => {
    dropRef(element);
  };

  // Get only top-level tasks (tasks without parentTaskId)
  const topLevelTasks = tasks.filter(task => !task.parentTaskId);

  // Create a map of parent tasks with their subtasks
  const taskMap = useMemo(() => {
    const map = new Map<string, Task[]>();
    
    // Group tasks by parentTaskId
    tasks.forEach(task => {
      if (task.parentTaskId) {
        if (!map.has(task.parentTaskId)) {
          map.set(task.parentTaskId, []);
        }
        map.get(task.parentTaskId)?.push(task);
      }
    });
    
    // Attach subtasks to their parent tasks
    topLevelTasks.forEach(parentTask => {
      parentTask.subTasks = map.get(parentTask.id) || [];
    });
    
    return map;
  }, [tasks]);

  // Get assignee display name
  const getAssigneeName = () => {
    if (assignee) {
      if (assignee.firstName && assignee.lastName) {
        return `${assignee.firstName} ${assignee.lastName}`;
      } else if (assignee.name) {
        return assignee.name;
      } else {
        return assignee.email || 'Unknown';
      }
    }
    return 'Unassigned';
  };

  return (
    <div
      ref={drop}
      className={`flex flex-col h-full min-h-[300px] rounded-md p-1 transition-all duration-200 ease-in-out ${
        isOver && canDrop 
          ? 'bg-blue-50 border-2 border-blue-300 shadow-lg transform scale-[1.02]' 
          : isOver
            ? 'bg-red-50 border-2 border-red-300'
            : 'bg-gray-50 border-2 border-transparent'
      }`}
      style={{
        ...(isOver && canDrop && {
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
        })
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        {assignee ? (
          <Avatar className="h-6 w-6">
            {assignee.avatar && (
              <AvatarImage src={assignee.avatar} alt={getAssigneeName()} />
            )}
            <AvatarFallback className="text-xs" title={getAssigneeName()}>
              {getAssigneeInitials(assignee)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">?</span>
          </div>
        )}
        <h3 className="text-sm font-medium flex-1">{getAssigneeName()}</h3>
        <Badge variant="outline" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
          {tasks.length}
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Only render top-level tasks and let TaskCard handle subtasks */}
        {topLevelTasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            compact={compact} 
            renderSubtasks={true}
          />
        ))}
        {topLevelTasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-gray-400 text-sm italic">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};

// StatusColumn component
interface StatusColumnProps {
  status: string;
  tasks: Task[];
  onTaskDrop: (taskId: string, newStatus: string) => Promise<void>;
  compact?: boolean;
}

const StatusColumn: React.FC<StatusColumnProps> = ({ status, tasks, onTaskDrop, compact }) => {
  // Set up drop target
  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item: { id: string }) => {
      log(`Task ${item.id} dropped in ${status} column`);
      onTaskDrop(item.id, status);
    },
    canDrop: (item: { id: string }) => {
      // Allow dropping if the task is not already in this status
      const task = tasks.find(t => t.id === item.id);
      return task ? task.status !== status : true;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });
  
  // Create a ref function that calls the drop ref
  const drop = (element: HTMLDivElement | null) => {
    dropRef(element);
  };

  // Get status color
  const statusColor = STATUS_COLORS[status] || 'bg-gray-100 hover:bg-gray-200 text-gray-700';

  // Get only top-level tasks (tasks without parentTaskId)
  const topLevelTasks = tasks.filter(task => !task.parentTaskId);

  // Create a map of parent tasks with their subtasks
  const taskMap = useMemo(() => {
    const map = new Map<string, Task[]>();
    
    // Group tasks by parentTaskId
    tasks.forEach(task => {
      if (task.parentTaskId) {
        if (!map.has(task.parentTaskId)) {
          map.set(task.parentTaskId, []);
        }
        map.get(task.parentTaskId)?.push(task);
      }
    });
    
    // Attach subtasks to their parent tasks
    topLevelTasks.forEach(parentTask => {
      parentTask.subTasks = map.get(parentTask.id) || [];
    });
    
    return map;
  }, [tasks]);

  return (
    <div
      ref={drop}
      className={`flex flex-col h-full min-h-[300px] rounded-md p-1 transition-all duration-200 ease-in-out ${
        isOver && canDrop 
          ? 'bg-blue-50 border-2 border-blue-300 shadow-lg transform scale-[1.02]' 
          : isOver
            ? 'bg-red-50 border-2 border-red-300'
            : 'bg-gray-50 border-2 border-transparent'
      }`}
      style={{
        ...(isOver && canDrop && {
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
        })
      }}
    >
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Only render top-level tasks and let TaskCard handle subtasks */}
        {topLevelTasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            compact={compact} 
            renderSubtasks={true}
            initiallyCollapsed={false}
          />
        ))}
        {topLevelTasks.length === 0 && (
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
  const [groupBy, setGroupBy] = useState<GroupingOption>('assignee');

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

  // Prepare the task hierarchy by attaching subtasks to their parent tasks
  const preparedTasks = useMemo(() => {
    // Create a deep copy of the filtered tasks to avoid mutating the original array
    const tasksCopy = JSON.parse(JSON.stringify(filteredTasks)) as Task[];
    
    // Create a map of parent tasks with their subtasks
    const taskMap = new Map<string, Task[]>();
    
    // Group tasks by parentTaskId
    tasksCopy.forEach(task => {
      if (task.parentTaskId) {
        if (!taskMap.has(task.parentTaskId)) {
          taskMap.set(task.parentTaskId, []);
        }
        taskMap.get(task.parentTaskId)?.push(task);
      }
    });
    
    // Attach subtasks to their parent tasks
    tasksCopy.forEach(task => {
      task.subTasks = taskMap.get(task.id) || [];
    });
    
    return tasksCopy;
  }, [filteredTasks]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    // Initialize all status columns with empty arrays
    STATUS_COLUMNS.forEach(status => {
      grouped[status] = [];
    });
    
    // Group filtered tasks by status
    preparedTasks.forEach(task => {
      const status = task.status || 'Not Started';
      if (grouped[status]) {
        grouped[status].push(task);
      } else {
        // Handle any status not in our predefined list
        grouped[status] = [task];
      }
    });
    
    return grouped;
  }, [preparedTasks]);

  // Group tasks by assignee
  const tasksByAssignee = useMemo(() => {
    // Create a map to store tasks by assignee ID
    const grouped = new Map<string | null, Task[]>();
    
    // Group tasks by assignee ID
    preparedTasks.forEach(task => {
      const assigneeId = task.assignedTo ?? task.assignee?.id ?? null;
      if (!grouped.has(assigneeId)) {
        grouped.set(assigneeId, []);
      }
      grouped.get(assigneeId)?.push(task);
    });
    
    return grouped;
  }, [preparedTasks]);

  // Group tasks by label
  const tasksByLabel = useMemo(() => {
    // Create a map to store tasks by label
    const grouped = new Map<string | null, Task[]>();
    
    // Initialize predefined labels with empty arrays
    ORDERED_LABELS.forEach(label => {
      grouped.set(label, []);
    });
    
    // Group tasks by label
    preparedTasks.forEach(task => {
      const label = task.label || null;
      if (!grouped.has(label)) {
        grouped.set(label, []);
      }
      grouped.get(label)?.push(task);
    });
    
    return grouped;
  }, [preparedTasks]);

  // Get unique labels from tasks and order them according to ORDERED_LABELS
  const orderedLabels = useMemo(() => {
    const uniqueLabels = new Set<string | null>();
    
    // Add all predefined ordered labels
    ORDERED_LABELS.forEach(label => uniqueLabels.add(label));
    
    // Add any additional labels from tasks
    preparedTasks.forEach(task => {
      if (task.label) uniqueLabels.add(task.label);
    });
    
    // Add null for unlabeled tasks
    uniqueLabels.add(null);
    
    // Convert to array and sort according to ORDERED_LABELS
    return Array.from(uniqueLabels).sort((a, b) => {
      if (a === null) return 1; // Null (unlabeled) always at the end
      if (b === null) return -1;
      
      const indexA = ORDERED_LABELS.indexOf(a);
      const indexB = ORDERED_LABELS.indexOf(b);
      
      if (indexA === -1 && indexB === -1) return a.localeCompare(b); // Both custom labels, sort alphabetically
      if (indexA === -1) return 1; // Custom label after predefined labels
      if (indexB === -1) return -1; // Predefined label before custom labels
      
      return indexA - indexB; // Sort by predefined order
    });
  }, [preparedTasks]);

  // Get unique assignees from tasks
  const assignees = useMemo(() => {
    const uniqueAssignees = new Map();
    
    preparedTasks.forEach(task => {
      if (task.assignee) {
        uniqueAssignees.set(task.assignee.id, task.assignee);
      }
    });
    
    return Array.from(uniqueAssignees.values());
  }, [preparedTasks]);

  // Handle task reordering within the same column/group
  const handleTaskReorder = async (taskId: string, newDisplayOrder: number, context: 'status' | 'assignee' | 'label', contextValue: string | null = null) => {
    try {
      // Find the task
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        log(`Task ${taskId} not found for reordering`);
        return;
      }
      
      log(`Reordering task ${taskId} to position ${newDisplayOrder} in ${context} context: ${contextValue || 'all'}`);
      setIsUpdating(true);
      setUpdatingTaskId(taskId);
      
      // Prepare update payload with new displayOrder
      const updatePayload = {
        title: task.title,
        status: task.status,
        projectId: task.projectId,
        assignedTo: task.assignedTo,
        description: task.description || '',
        parentTaskId: task.parentTaskId,
        label: task.label || undefined,
        percentProgress: task.percentProgress !== null ? task.percentProgress : undefined,
        displayOrder: newDisplayOrder
      } as Partial<ServiceTask>;
      
      log('Sending reorder payload to API:', updatePayload);
      
      // Update task with new displayOrder
      await tasksService.updateTask(taskId, updatePayload);
      
      // Refresh the task list
      if (onOperationComplete) {
        const processedFilters = { ...initialFilters };
        if (processedFilters.assignedTo === 'current' && user?.id) {
          processedFilters.assignedTo = user.id;
        }
        onOperationComplete(processedFilters);
      }
      
      toast({
        title: 'Task reordered',
        description: 'Task order updated successfully',
      });
    } catch (error) {
      console.error('[TasksBoard] Error reordering task:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder task',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
      setUpdatingTaskId(null);
    }
  };

  // Handle task drop (status change, assignee change, or label change)
  const handleTaskDrop = async (taskId: string, newStatus: string, newAssigneeId?: string | null, newLabel?: string | null) => {
    try {
      // Find the task
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        log(`Task ${taskId} not found`);
        return;
      }
      
      // Skip if status, assignee, and label are already the same
      if (task.status === newStatus && 
          (newAssigneeId === undefined || task.assignedTo === newAssigneeId) &&
          (newLabel === undefined || task.label === newLabel)) {
        log(`Task ${taskId} already has status ${newStatus}, assignee ${newAssigneeId}, and label ${newLabel}`);
        return;
      }
      
      log(`Updating task ${taskId} status from ${task.status} to ${newStatus}${
        newAssigneeId !== undefined ? ` and assignee to ${newAssigneeId}` : ''
      }${
        newLabel !== undefined ? ` and label to ${newLabel}` : ''
      }`);
      setIsUpdating(true);
      setUpdatingTaskId(taskId);
      
      // Based on the backend implementation, we need to include only the necessary fields
      // The backend maps assignedTo to assigneeId, so we need to preserve that field
      const updatePayload = {
        // Include the minimum required fields
        title: task.title,
        status: newStatus,
        projectId: task.projectId,
        // Preserve the assignee information or update if provided
        assignedTo: newAssigneeId !== undefined ? newAssigneeId : task.assignedTo,
        // Include description if available
        description: task.description || '',
        // Preserve parent task relationship
        parentTaskId: task.parentTaskId, // This will be undefined if not present, which is fine
        // Include additional fields
        label: newLabel !== undefined ? newLabel : task.label || undefined,
        // Convert null to undefined for API compatibility
        percentProgress: task.percentProgress !== null ? task.percentProgress : undefined,
        // Preserve displayOrder when moving between columns
        displayOrder: task.displayOrder !== null ? task.displayOrder : undefined
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
      let changeDescription = '';
      if (newStatus !== task.status) {
        changeDescription += `status changed to ${newStatus}`;
      }
      if (newAssigneeId !== undefined && newAssigneeId !== task.assignedTo) {
        changeDescription += changeDescription ? ' and ' : '';
        changeDescription += 'assignee changed';
      }
      if (newLabel !== undefined && newLabel !== task.label) {
        changeDescription += changeDescription ? ' and ' : '';
        changeDescription += `label changed to ${newLabel || 'unlabeled'}`;
      }
      
      toast({
        title: 'Task updated',
        description: changeDescription || 'Task updated successfully',
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
      <div className="w-full">
        <div className="flex justify-end mb-4">
          <Select value={groupBy} onValueChange={(value: GroupingOption) => setGroupBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Group by Status</SelectItem>
              <SelectItem value="assignee">Status by Assignee</SelectItem>
              <SelectItem value="label">Status by Label</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          {groupBy === 'assignee' ? (
            // Group by assignee based on status - show assignees vertically
            <div className="space-y-8">
              {/* Unassigned tasks */}
              {tasksByAssignee.get(null) && tasksByAssignee.get(null)!.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold">Unassigned</h3>
                    <Badge variant="outline" className="text-xs">
                      {tasksByAssignee.get(null)?.length || 0} tasks
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 min-w-[600px]">
                    {STATUS_COLUMNS.map((status) => {
                      const statusTasks = (tasksByAssignee.get(null) || []).filter(task => task.status === status);
                      return (
                        <Card key={status} className={`${compact ? 'shadow-none border-0' : ''} min-w-[160px]`}>
                          <CardHeader className="py-1 px-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xs font-medium">{status}</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {statusTasks.length}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-1">
                            <StatusColumn
                              status={status}
                              tasks={statusTasks}
                              onTaskDrop={handleTaskDrop}
                              compact={compact}
                            />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Assignee task boards */}
              {assignees.map((assignee) => {
                const assigneeTasks = tasksByAssignee.get(assignee.id) || [];
                if (assigneeTasks.length === 0) return null;
                
                return (
                  <div key={assignee.id} className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Avatar className="h-8 w-8">
                        {assignee.avatar && (
                          <AvatarImage src={assignee.avatar} alt={assignee.name || assignee.email || ''} />
                        )}
                        <AvatarFallback className="text-sm">
                          {getAssigneeInitials(assignee)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-semibold">
                        {assignee.firstName && assignee.lastName 
                          ? `${assignee.firstName} ${assignee.lastName}`
                          : assignee.name || assignee.email || 'Unknown'}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {assigneeTasks.length} tasks
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 min-w-[600px]">
                      {STATUS_COLUMNS.map((status) => {
                        const statusTasks = assigneeTasks.filter(task => task.status === status);
                        return (
                          <Card key={status} className={`${compact ? 'shadow-none border-0' : ''} min-w-[160px]`}>
                            <CardHeader className="py-1 px-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-xs font-medium">{status}</CardTitle>
                                <Badge variant="outline" className="text-xs">
                                  {statusTasks.length}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="p-1">
                              <StatusColumn
                                status={status}
                                tasks={statusTasks}
                                onTaskDrop={handleTaskDrop}
                                compact={compact}
                              />
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : groupBy === 'label' ? (
            // Group by label based on status - show labels vertically
            <div className="space-y-8">
              {orderedLabels
                .filter((label) => (tasksByLabel.get(label) || []).length > 0)
                .map((label) => {
                  const labelTasks = tasksByLabel.get(label) || [];
                  return (
                    <div key={label || 'unlabeled'} className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Tag className={`h-6 w-6 ${label ? LABEL_COLORS[label]?.split(' ').filter(c => c.startsWith('text'))[0] || 'text-gray-700' : 'text-gray-400'}`} />
                        <h3 className="text-lg font-semibold">
                          {label || 'Unlabeled'}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {labelTasks.length} tasks
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 min-w-[600px]">
                        {STATUS_COLUMNS.map((status) => {
                          const statusTasks = labelTasks.filter(task => task.status === status);
                          return (
                            <Card key={status} className={`${compact ? 'shadow-none border-0' : ''} min-w-[160px]`}>
                              <CardHeader className="py-1 px-2">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-xs font-medium">{status}</CardTitle>
                                  <Badge variant="outline" className="text-xs">
                                    {statusTasks.length}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="p-1">
                                <StatusColumn
                                  status={status}
                                  tasks={statusTasks}
                                  onTaskDrop={handleTaskDrop}
                                  compact={compact}
                                />
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            // Group by status - standard grid layout
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 min-w-[600px]">
              {STATUS_COLUMNS.map((status) => (
                <Card key={status} className={`${compact ? 'shadow-none border-0' : ''} min-w-[160px]`}>
                  <CardHeader className="py-1 px-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-medium">{status}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {(tasksByStatus[status] || []).length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-1">
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
          )}
        </div>
      </div>
    </DndProvider>
  );
}

export default TasksBoard;
