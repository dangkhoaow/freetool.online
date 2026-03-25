import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/app/projly/contexts/AuthContextCustom";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { buildBrowserRouteUrl } from '@/src/router/hash-path';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Helper function for date formatting
const formatDateForDisplay = (dateStr: string | undefined): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
};
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Edit,
  Trash,
  Plus,
  ExternalLink,
  Maximize2,
  Calendar,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Filter
} from "lucide-react";
import { PageLoading } from '@/app/projly/components/ui/PageLoading';
import { projlyTasksService } from '@/lib/services/projly';
import { TaskDetailDialog } from "./TaskDetailDialog";

// Define Task interface to match API response structure
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  projectId: string;
  assignedTo?: string;
  startDate?: string;
  dueDate?: string;
  parentTaskId?: string; // Add parentTaskId to know if it's a sub-task
  project?: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  };
  parentTask?: Task; // Reference to parent task
  subTasks?: Task[]; // Reference to sub-tasks
  percentProgress?: number | null; // Progress percentage
  label?: string | null; // Task label or category
  displayOrder?: number | null; // Custom ordering within parent context
  relatedTasks?: string[] | Array<{id: string; title: string}>; // Related tasks
  _meta?: {
    level?: number;  // Store the task nesting level for UI purposes
    [key: string]: any;
  };
}

// Props for TasksTable
export interface TasksTableProps {
  tasks: Task[];
  onOperationComplete?: (filters?: any) => void; // Callback to refresh data after operations with current filters
  initialFilters?: any; // Initial filters passed from parent
  compact?: boolean; // Whether to use compact mode (less padding, smaller text)
  context?: 'main' | 'project' | 'task'; // The context this table is being used in
  parentTaskId?: string; // The parent task id for context (for detail view)
  hideParentRow?: boolean; // If true, hide the parent row (for sub-task tab)
  hideFilterUI?: boolean; // If true, hide the filter UI (for use with container-level filter)
  loading?: boolean; // Whether the tasks are currently loading
}
import { TaskTitleCell } from "./TaskTitleCell";
import { getAssigneeInitials, getLabelInitials } from "./TasksContainer";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Define drag item types for react-dnd
const ItemTypes = {
  TASK_ROW: 'task_row',
};

// Define draggable task row interface
interface DragItem {
  id: string;
  index: number;
  type: string;
}

// Helper function to organize tasks into a complete hierarchy showing ALL nested levels
export const organizeTasksHierarchy = (tasks: Task[], sortBy: { field: string; direction: "asc" | "desc" }): Task[] => {
  // console.log('[TASKS TABLE] Organizing tasks into full hierarchy with ALL nested levels');
  
  // Create a map for tracking parent-child relationships
  const parentTaskMap = new Map<string, Task[]>();
  const taskLevels = new Map<string, number>(); // Track nesting level for each task
  
  // First pass - identify all tasks and determine their level
  tasks.forEach(task => {
    // Initialize all tasks as level 0 (top level)
    if (!taskLevels.has(task.id)) {
      taskLevels.set(task.id, 0);
    }
    
    // If task has a parent, set its level and add to parent's children
    if (task.parentTaskId) {
      // This is a child task
      if (!parentTaskMap.has(task.parentTaskId)) {
        parentTaskMap.set(task.parentTaskId, []);
      }
      
      // Add to parent's children list
      parentTaskMap.get(task.parentTaskId)?.push(task);
      
      // Find the parent's level and set this task's level to parent+1
      const parentLevel = taskLevels.get(task.parentTaskId) || 0;
      taskLevels.set(task.id, parentLevel + 1);
      
      // console.log(`[TASKS TABLE] Task ${task.id} is level ${parentLevel + 1} (child of ${task.parentTaskId})`);
    } else {
      // console.log(`[TASKS TABLE] Task ${task.id} is level 0 (top level)`);
    }
  });
  
  // console.log(`[TASKS TABLE] Found ${parentTaskMap.size} parent-child relationships`);
  
  // Sort function used across different collections of tasks
  const sortTasks = (tasksToSort: Task[]) => {
    return tasksToSort.sort((a, b) => {
      // First priority: Use displayOrder when both tasks have it set (not -1 or null)
      const aDisplayOrder = a.displayOrder !== undefined && a.displayOrder !== null && a.displayOrder !== -1 ? a.displayOrder : null;
      const bDisplayOrder = b.displayOrder !== undefined && b.displayOrder !== null && b.displayOrder !== -1 ? b.displayOrder : null;
      
      // If we're not explicitly sorting by another field, use displayOrder when available
      if (sortBy.field === "displayOrder" || (aDisplayOrder !== null && bDisplayOrder !== null)) {
        if (aDisplayOrder !== null && bDisplayOrder !== null) {
          const orderCompare = sortBy.direction === "asc" 
            ? aDisplayOrder - bDisplayOrder
            : bDisplayOrder - aDisplayOrder;
          if (orderCompare !== 0) return orderCompare;
        } else if (aDisplayOrder !== null) {
          return sortBy.direction === "asc" ? -1 : 1; // Tasks with displayOrder come first
        } else if (bDisplayOrder !== null) {
          return sortBy.direction === "asc" ? 1 : -1; // Tasks with displayOrder come first
        }
      }
      
      // Fall back to other sorting criteria
      if (sortBy.field === "dueDate") {
        if (!a.dueDate) return sortBy.direction === "asc" ? 1 : -1;
        if (!b.dueDate) return sortBy.direction === "asc" ? -1 : 1;
        return sortBy.direction === "asc" 
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (sortBy.field === "startDate") {
        if (!a.startDate) return sortBy.direction === "asc" ? 1 : -1;
        if (!b.startDate) return sortBy.direction === "asc" ? -1 : 1;
        return sortBy.direction === "asc" 
          ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      } else if (sortBy.field === "title") {
        return sortBy.direction === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy.field === "status") {
        return sortBy.direction === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      } else if (sortBy.field === "project") {
        const projectA = a.project?.name || "";
        const projectB = b.project?.name || "";
        return sortBy.direction === "asc"
          ? projectA.localeCompare(projectB)
          : projectB.localeCompare(projectA);
      }
      
      // Final fallback: if no displayOrder and no explicit sort, use creation time
      return 0;
    });
  };
  
  // Sort tasks within each parent group
  parentTaskMap.forEach((children, parentId) => {
    sortTasks(children);
  });
  
  // Create organized list with complete hierarchical structure
  const organizedTasks: Task[] = [];
  
  // Get top-level tasks (those without a parentTaskId) and orphaned tasks
  const topLevelTasks = tasks.filter(task => {
    // Include tasks without a parent
    if (!task.parentTaskId) return true;
    
    // Include orphaned tasks (parent not in our filtered set)
    if (task.parentTaskId && !tasks.some(t => t.id === task.parentTaskId)) {
      // console.log(`[TASKS TABLE] Found orphaned task: ${task.id} with missing parent: ${task.parentTaskId}`);
      return true;
    }
    
    return false;
  });
  
  // Sort top-level tasks
  sortTasks(topLevelTasks);
  
  // Recursive function to add a task and all its descendants in hierarchical order
  const addTaskWithDescendants = (task: Task, parentLevel: number) => {
    // Add the task itself
    organizedTasks.push(task);
    taskLevels.set(task.id, parentLevel);
    
    // Get all children of this task
    const children = parentTaskMap.get(task.id) || [];
    if (children.length > 0) {
      // console.log(`[TASKS TABLE] Adding ${children.length} children of task ${task.id} at level ${parentLevel + 1}`);
      
      // Recursively add each child and its descendants
      children.forEach(child => {
        addTaskWithDescendants(child, parentLevel + 1);
      });
    }
  };
  
  // Process each top-level task and all its descendants
  topLevelTasks.forEach(task => {
    addTaskWithDescendants(task, 0);
  });
  
  // Add any remaining tasks that might have been orphaned
  // (their parent wasn't in the filtered set)
  tasks.forEach(task => {
    if (!organizedTasks.includes(task)) {
      // console.log(`[TASKS TABLE] Adding orphaned task: ${task.id}`);
      organizedTasks.push(task);
    }
  });
  
  // console.log(`[TASKS TABLE] Organized ${organizedTasks.length} tasks with full hierarchical structure`);
  
  // Store the calculated levels for easier access during rendering
  organizedTasks.forEach(task => {
    if (!task._meta) task._meta = {};
    task._meta.level = taskLevels.get(task.id) || 0;
  });
  
  return organizedTasks;
};

// Draggable task row component
interface DraggableTaskRowProps {
  task: Task;
  index: number;
  children: React.ReactNode;
  onTaskReorder: (draggedTaskId: string, targetTaskId: string, position: 'before' | 'after') => void;
  isDragDisabled?: boolean;
}

const DraggableTaskRow: React.FC<DraggableTaskRowProps> = ({ 
  task, 
  index, 
  children, 
  onTaskReorder, 
  isDragDisabled = false 
}) => {
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);
  const dropRef = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, dragRef] = useDrag({
    type: ItemTypes.TASK_ROW,
    item: { id: task.id, index, type: ItemTypes.TASK_ROW },
    canDrag: !isDragDisabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      setDropPosition(null);
    },
  });

  const [{ isOver, canDrop }, connectDropTarget] = useDrop({
    accept: ItemTypes.TASK_ROW,
    hover: (draggedItem: DragItem, monitor) => {
      if (!monitor.isOver({ shallow: true })) {
        setDropPosition(null);
        return;
      }
      
      const draggedId = draggedItem.id;
      const targetId = task.id;
      
      if (draggedId === targetId) {
        setDropPosition(null);
        return; // Can't drop on itself
      }
      
      // Get the bounding rectangle of the target row
      const hoverBoundingRect = dropRef.current?.getBoundingClientRect();
      if (!hoverBoundingRect) return;
      
      // Get mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      // Get pixels to the top of the target row
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverHeight = hoverBoundingRect.bottom - hoverBoundingRect.top;
      
      // Create a more responsive drop zone calculation
      // Use 30% top and bottom zones for better UX
      const topZone = hoverHeight * 0.3;
      const bottomZone = hoverHeight * 0.7;
      
      let position: 'before' | 'after';
      if (hoverClientY < topZone) {
        position = 'before';
      } else if (hoverClientY > bottomZone) {
        position = 'after';
      } else {
        // In the middle zone, maintain the current position if it exists
        // This prevents flickering when hovering in the middle
        position = dropPosition || 'after';
      }
      
      setDropPosition(position);
    },
    drop: (draggedItem: DragItem, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      
      const draggedId = draggedItem.id;
      const targetId = task.id;
      
      if (draggedId === targetId) return; // Can't drop on itself
      
      // Use the determined drop position or default to 'after'
      const position = dropPosition || 'after';
      onTaskReorder(draggedId, targetId, position);
      setDropPosition(null);
    },
    canDrop: (draggedItem: DragItem) => {
      return draggedItem.id !== task.id;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Combine drag and drop refs
  const combinedRef = (el: HTMLTableRowElement | null) => {
    dropRef.current = el;
    dragRef(el);
    connectDropTarget(el);
  };

  // Enhanced visual feedback
  const getRowClasses = () => {
    const baseClasses = 'transition-all duration-200 ease-in-out';
    
    if (isDragging) {
      return `${baseClasses} opacity-30 cursor-grabbing transform scale-105 shadow-lg bg-blue-50`;
    }
    
    if (isDragDisabled) {
      return `${baseClasses} cursor-default`;
    }
    
    if (isOver && canDrop) {
      const positionClasses = dropPosition === 'before' 
        ? 'border-t-4 border-blue-500 shadow-md' 
        : 'border-b-4 border-blue-500 shadow-md';
      return `${baseClasses} ${positionClasses} bg-blue-50/50 transform scale-[1.02]`;
    }
    
    // Remove isDragActive since we're using isDragging instead
    
    return `${baseClasses} cursor-grab hover:bg-gray-100/80 dark:hover:bg-gray-700/60 hover:shadow-sm`;
  };

  return (
    <TableRow 
      ref={combinedRef}
      className={getRowClasses()}
      style={{
        // Add visual depth when dragging
        ...(isDragging && {
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
        }),
        // Add subtle elevation when hovering as drop target
        ...(isOver && canDrop && {
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
        })
      }}
    >
      {children}
    </TableRow>
  );
};

export function TasksTable({ tasks, onOperationComplete, initialFilters = {}, compact, context, parentTaskId, hideParentRow, hideFilterUI, loading = false }: TasksTableProps) {
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data !== undefined) {
      // console.log(`[TASKS TABLE] ${message}`, data);
    } else {
      // console.log(`[TASKS TABLE] ${message}`);
    }
  };
  
  // Initialize router for navigation
  const router = useRouter();
  // Get current user from AuthContext
  const { user } = useAuth();
  
  // console.log("[TASKS TABLE] Current user:", user?.id);
  
  // Use the filters directly from props
  const filters = initialFilters || {};
  
  // console.log('[TASKS TABLE] Using filters from props:', filters);
  
  // Helper for debugging
  useEffect(() => {
    log('Current filters:', filters);
  }, [filters]);
  const [sortBy, setSortBy] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "displayOrder",
    direction: "asc",
  });
  
  // console.log("[TASKS TABLE] Initialized with default sort by dueDate");
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  // State for Task detail dialog (rich modal)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  // Log table rendering
  log('Rendering TasksTable with tasks:', tasks.length);

  // First extract parent tasks IDs and their sub-tasks before filtering
  // This is used to maintain relationships even when filtering
  const taskRelationships = new Map<string, string[]>();
  const subTaskParents = new Map<string, string>();
  
  // Build relationship maps
  tasks.forEach(task => {
    if (task.parentTaskId) {
      // Record which parent this task belongs to
      subTaskParents.set(task.id, task.parentTaskId);
      
      // Add this task to its parent's list of children
      if (!taskRelationships.has(task.parentTaskId)) {
        taskRelationships.set(task.parentTaskId, []);
      }
      taskRelationships.get(task.parentTaskId)?.push(task.id);
    }
  });
  
  // console.log(`[TASKS TABLE] Built relationship maps: ${taskRelationships.size} parents, ${subTaskParents.size} sub-tasks`);
  
  // Helper to check if any sub-task of a parent matches the filters
  const hasMatchingSubTask = (parentId: string, checkFilters: any, allTasks: Task[]): boolean => {
    const subTaskIds = taskRelationships.get(parentId) || [];
    return subTaskIds.some(subTaskId => {
      const subTask = allTasks.find(t => t.id === subTaskId);
      if (!subTask) return false;
      
      // Apply the same filter checks as below, but for the sub-task
      if (checkFilters.search && subTask.title && 
          !subTask.title.toLowerCase().includes(checkFilters.search.toLowerCase())) {
        return false;
      }
      
      if (checkFilters.status && subTask.status !== checkFilters.status) {
        return false;
      }
      
      if (checkFilters.projectId && subTask.projectId !== checkFilters.projectId) {
        return false;
      }
      
      if (checkFilters.label && subTask.label !== checkFilters.label) {
        return false;
      }
      
      // Check assignee filter for sub-task using either assignedTo or assignee.id
      if (checkFilters.assignedTo) {
        const subId = subTask.assignedTo ?? subTask.assignee?.id;
        if (checkFilters.assignedTo === 'current') {
          if (subId !== user?.id) return false;
        } else {
          if (subId !== checkFilters.assignedTo) return false;
        }
      }
      
      return true;
    });
  };
  
  // Helper to check if the parent of a sub-task matches filters
  const hasMatchingParent = (subTaskId: string, checkFilters: any, allTasks: Task[]): boolean => {
    const parentId = subTaskParents.get(subTaskId);
    if (!parentId) return false;
    
    const parentTask = allTasks.find(t => t.id === parentId);
    if (!parentTask) return false;
    
    // Apply filters to the parent task
    if (checkFilters.search && parentTask.title && 
        !parentTask.title.toLowerCase().includes(checkFilters.search.toLowerCase())) {
      return false;
    }
    
    if (checkFilters.status && parentTask.status !== checkFilters.status) {
      return false;
    }
    
    if (checkFilters.projectId && parentTask.projectId !== checkFilters.projectId) {
      return false;
    }
    
    if (checkFilters.label && parentTask.label !== checkFilters.label) {
      return false;
    }
    
    // Check assignee filter for parent task
    if (checkFilters.assignedTo) {
      const parId = parentTask.assignedTo ?? parentTask.assignee?.id;
      if (checkFilters.assignedTo === 'current') {
        if (parId !== user?.id) return false;
      } else {
        if (parId !== checkFilters.assignedTo) return false;
      }
    }
    
    return true;
  };
  
  // Extract all unique users from tasks to populate the assignee filter dropdown
  const uniqueUsers = useMemo(() => {
    const userMap = new Map<string, {id: string, name: string}>(); 
    
    tasks.forEach(task => {
      if (task.assignee) {
        const userId = task.assignee.id;
        const userName = task.assignee.firstName && task.assignee.lastName 
          ? `${task.assignee.firstName} ${task.assignee.lastName}`
          : task.assignee.name || task.assignee.email || 'Unknown User';
        
        userMap.set(userId, {id: userId, name: userName});
      }
    });
    
    // Convert map to array for rendering
    return Array.from(userMap.values());
  }, [tasks]);
  
  // console.log(`[TASKS TABLE] Found ${uniqueUsers.length} unique users for dropdown`);
  uniqueUsers.forEach(user => {
    // console.log(`[TASKS TABLE] Unique user: ${user.id} - ${user.name}`);
  });
  
  // DEBUG: Log task assignment data
  tasks.forEach(task => {
    // console.log(`[TASKS TABLE] Task ${task.id} (${task.title}) assignment data:`);
    // console.log(`  - assignedTo: ${task.assignedTo || 'null'}`);
    // console.log(`  - assignee.id: ${task.assignee?.id || 'null'}`);
    // console.log(`  - assignee.email: ${task.assignee?.email || 'null'}`);
  });
  
  // Filter tasks based on search and filters with proper type safety
  // But also keep parent tasks if any of their children match the filter
  // And keep sub-tasks if their parent matches the filter
  const filteredTasks = tasks.filter(task => {
    // Special case for task hierarchy filter
    if (filters.taskHierarchy === 'parent_only' && task.parentTaskId) {
      return false; // Filter out tasks that have a parent (sub-tasks)
    }
    
    // Check basic filter conditions
    let matchesBasicFilters = true;
    
    // Apply search filter
    if (filters.search && task.title && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
      matchesBasicFilters = false;
    }
    
    // Apply status filter
    if (filters.status && task.status !== filters.status) {
      matchesBasicFilters = false;
    }
    
    // Apply project filter
    if (filters.projectId && task.projectId !== filters.projectId) {
      matchesBasicFilters = false;
    }
    
    // Apply label filter
    if (filters.label && task.label !== filters.label) {
      // console.log(`[TASKS TABLE] Task ${task.id} doesn't match label filter: ${filters.label}`);
      // console.log(`  - task.label: ${task.label || 'null'}`);
      matchesBasicFilters = false;
    }
    
    // Apply assignee filter - check both assignedTo and assignee.id
    if (filters.assignedTo) {
      if (Array.isArray(filters.assignedTo)) {
        // Multi-select assignee filtering
        let matchesAssignee = false;
        
        for (const assigneeFilter of filters.assignedTo) {
          if (assigneeFilter === 'current') {
            // Check if task is assigned to current user
            if (user?.id && (task.assignedTo === user.id || task.assignee?.id === user.id)) {
              matchesAssignee = true;
              break;
            }
          } else {
            // Check if task is assigned to this specific user
            if (task.assignedTo === assigneeFilter || task.assignee?.id === assigneeFilter) {
              matchesAssignee = true;
              break;
            }
          }
        }
        
        if (!matchesAssignee) {
          // console.log(`[TASKS TABLE] Task ${task.id} doesn't match any assignee in multi-select filter:`, filters.assignedTo);
          // console.log(`  - task.assignedTo: ${task.assignedTo || 'null'}`);
          // console.log(`  - task.assignee?.id: ${task.assignee?.id || 'null'}`);
          matchesBasicFilters = false;
        } else {
          // console.log(`[TASKS TABLE] Task ${task.id} MATCHES multi-select assignee filter`);
        }
      } else {
        // Single assignee filtering (backward compatibility)
        if (filters.assignedTo === 'current') {
          if (!user?.id || (task.assignedTo !== user.id && task.assignee?.id !== user.id)) {
            // console.log(`[TASKS TABLE] Task ${task.id} doesn't match current user filter. User ID: ${user?.id}`);
            // console.log(`  - task.assignedTo: ${task.assignedTo || 'null'}`);
            // console.log(`  - task.assignee?.id: ${task.assignee?.id || 'null'}`);
            matchesBasicFilters = false;
          } else {
            // console.log(`[TASKS TABLE] Task ${task.id} MATCHES current user filter. User ID: ${user?.id}`);
          }
        } else {
          // Normal single assignee filtering
          if (task.assignedTo !== filters.assignedTo && task.assignee?.id !== filters.assignedTo) {
            // console.log(`[TASKS TABLE] Task ${task.id} doesn't match assignee filter: ${filters.assignedTo}`);
            // console.log(`  - task.assignedTo: ${task.assignedTo || 'null'}`);
            // console.log(`  - task.assignee?.id: ${task.assignee?.id || 'null'}`);
            matchesBasicFilters = false;
          } else {
            // console.log(`[TASKS TABLE] Task ${task.id} MATCHES assignee filter: ${filters.assignedTo}`);
          }
        }
      }
    }
    
    // If the task passes basic filters, include it
    if (matchesBasicFilters) {
      return true;
    }
    
    // Even if this task doesn't match filters, include it if:
    // 1. It's a parent task and any of its sub-tasks match the filters
    if (taskRelationships.has(task.id) && hasMatchingSubTask(task.id, filters, tasks)) {
      // console.log(`[TASKS TABLE] Including parent task ${task.id} because it has matching sub-tasks`);
      return true;
    }
    
    // 2. It's a sub-task and its parent matches the filters
    if (task.parentTaskId && hasMatchingParent(task.id, filters, tasks)) {
      // console.log(`[TASKS TABLE] Including sub-task ${task.id} because its parent matches filters`);
      return true;
    }
    
    return false;
  });
  
  // console.log("[TASKS TABLE] Filtered tasks:", filteredTasks.length);
  // console.log("[TASKS TABLE] Sub-tasks count:", filteredTasks.filter(task => task.parentTaskId).length);
  
  // Sort tasks while preserving parent-child relationships
  const sortedTasks = organizeTasksHierarchy(filteredTasks, sortBy);

  // State for collapsed parent tasks
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());

  // Compute which tasks are visible based on collapsed parents
  const visibleTasks = useMemo(() => {
    return sortedTasks.filter(task => {
      let pid = task.parentTaskId;
      while (pid) {
        if (collapsedTasks.has(pid)) return false;
        const parent = sortedTasks.find(t => t.id === pid);
        pid = parent?.parentTaskId;
      }
      return true;
    });
  }, [sortedTasks, collapsedTasks]);

  // Toggle sort when clicking on a header
  const toggleSort = (field: string) => {
    if (sortBy.field === field) {
      setSortBy({ 
        field, 
        direction: sortBy.direction === "asc" ? "desc" : "asc" 
      });
    } else {
      setSortBy({ field, direction: "asc" });
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: string) => {
    if (sortBy.field !== field) return null;
    return sortBy.direction === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  // Handle delete task
  const confirmDelete = async (id: string) => {
    try {
      // console.log(`[TASKS TABLE] Deleting task with ID: ${id}`);
      await projlyTasksService.deleteTask(id);
      // console.log('[TASKS TABLE] Task deleted successfully');
      
      // Reset state and refresh data
      setDeleteTaskId(null);
      
      // Call callback to refresh tasks list if provided
      if (onOperationComplete) {
        // console.log('Calling onOperationComplete callback to refresh tasks with current filters');
        // console.log('Current filters:', filters);
        onOperationComplete(filters);
      }
    } catch (error) {
      // console.log('[TASKS TABLE] Error deleting task:', error);
    }
  };

  // Check if current user can delete a task
  // According to backend logic: only project owners or task assignees can delete tasks
  const canDeleteTask = (task: Task): boolean => {
    if (!user || !task) {
      // console.log("[TASKS TABLE] Cannot check delete permission: missing user or task data");
      return false;
    }
    
    // For project ownership check, we'd need additional API data
    // According to backend logic in tasks.ts, we should check if the user is the project owner
    // Since we don't have direct access to project ownership in our current task data,
    // we'll simplify to just check if user is assigned to the task
    
    // Check if the current user is assigned to the task
    const isAssigned = task.assignedTo === user.id || task.assignee?.id === user.id;
    
    // console.log(`[TASKS TABLE] Task ${task.id} delete permission check: isAssigned=${isAssigned}`);
    // console.log(`[TASKS TABLE] Task details - assignedTo: ${task.assignedTo}, assignee.id: ${task.assignee?.id}`);
    
    return isAssigned;
  };

  // Handle edit task click - navigate to edit page
  const handleEditTask = (task: Task) => {
    // console.log("[TASKS TABLE] Navigating to edit page for task:", task.id);
    
    // Set a flag in localStorage to indicate a task is being edited
    // This will be used to trigger a refresh when returning to the project detail page
    localStorage.setItem('projly_task_edited', 'true');
    localStorage.setItem('projly_last_edited_task', task.id);
    localStorage.setItem('projly_edit_timestamp', Date.now().toString());
    
    // console.log("[TASKS TABLE] Set edit flags in localStorage");
    
    // Navigate to the edit page
    router.push(`/projly/tasks/${task.id}/edit`);
  };

  // Handle view task details - navigate to task detail page
  const handleViewTaskDetails = (task: Task) => {
    // console.log("[TASKS TABLE] Navigating to task detail page:", task.id);
    router.push(`/projly/tasks/${task.id}`);
  };

  // Handle dialog close
  const handleTaskDetailClose = () => {
    setIsTaskDetailOpen(false);
    setSelectedTaskId(null);
  };

  const openTaskDetailDialog = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailOpen(true);
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let customClass = "";
    
    switch (status) {
      case "Completed":
        variant = "default";
        customClass = "bg-green-600 text-white hover:bg-green-700 border-green-600";
        break;
      case "In Progress":
        variant = "secondary";
        customClass = "bg-blue-600 text-white hover:bg-blue-700 border-blue-600";
        break;
      case "In Review":
        variant = "outline";
        customClass = "bg-purple-500 text-white hover:bg-purple-600 border-purple-500";
        break;
      case "Golive":
        variant = "default";
        customClass = "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500";
        break;
      case "Not Started":
        variant = "outline";
        customClass = "bg-gray-500 text-white hover:bg-gray-600 border-gray-500";
        break;
      case "On Hold":
        variant = "outline";
        customClass = "bg-orange-500 text-white hover:bg-orange-600 border-orange-500";
        break;
      case "Pending":
        variant = "destructive";
        customClass = "bg-amber-500 text-white hover:bg-amber-600 border-amber-500";
        break;
      case "Cancelled":
        variant = "destructive";
        customClass = "bg-red-500 text-white hover:bg-red-600 border-red-500";
        break;
      default:
        variant = "outline";
        customClass = "bg-gray-400 text-white hover:bg-gray-500 border-gray-400";
    }
    
    // console.log(`Rendering badge for status: ${status} with class: ${customClass}`);
    return <Badge variant={variant} className={customClass}>{status}</Badge>;
  };

  // Toggle collapse for a parent task
  const toggleCollapse = (taskId: string) => {
    const newSet = new Set(collapsedTasks);
    if (newSet.has(taskId)) newSet.delete(taskId);
    else newSet.add(taskId);
    setCollapsedTasks(newSet);
  };

  // Collapse/Expand all parent tasks
  const toggleCollapseAll = () => {
    const parentTaskIds = Array.from(taskRelationships.keys());
    
    // In dialog context (task detail), only collapse/expand top-level parents
    // In main context, collapse/expand all parents
    let targetParentIds = parentTaskIds;
    
    if (context === 'task' && parentTaskId) {
      // For sub-task context, only target direct children of the parent task
      targetParentIds = parentTaskIds.filter(id => {
        const task = tasks.find(t => t.id === id);
        return task && task.parentTaskId === parentTaskId;
      });
    }
    
    const allCollapsed = targetParentIds.every(id => collapsedTasks.has(id));
    
    if (allCollapsed) {
      // If all target parents are collapsed, expand them
      const newSet = new Set(collapsedTasks);
      targetParentIds.forEach(id => newSet.delete(id));
      setCollapsedTasks(newSet);
    } else {
      // If some are expanded, collapse all target parents
      const newSet = new Set(collapsedTasks);
      targetParentIds.forEach(id => newSet.add(id));
      setCollapsedTasks(newSet);
    }
  };

  // Check if all parent tasks are collapsed
  const areAllCollapsed = useMemo(() => {
    const parentTaskIds = Array.from(taskRelationships.keys());
    
    // In dialog context (task detail), only check top-level parents
    let targetParentIds = parentTaskIds;
    
    if (context === 'task' && parentTaskId) {
      // For sub-task context, only check direct children of the parent task
      targetParentIds = parentTaskIds.filter(id => {
        const task = tasks.find(t => t.id === id);
        return task && task.parentTaskId === parentTaskId;
      });
    }
    
    return targetParentIds.length > 0 && targetParentIds.every(id => collapsedTasks.has(id));
  }, [taskRelationships, collapsedTasks, context, parentTaskId, tasks]);

  // Handle task reordering via drag and drop
  const handleTaskReorder = async (
    draggedTaskId: string,
    targetTaskId: string,
    position: "before" | "after"
  ) => {
    try {
      // console.log(`[TASKS TABLE] Reordering task ${draggedTaskId} ${position} task ${targetTaskId}`);

      // ---- 1. Identify dragged / target tasks -------------------------
      const draggedTask = visibleTasks.find((t) => t.id === draggedTaskId);
      const targetTask = visibleTasks.find((t) => t.id === targetTaskId);

      if (!draggedTask || !targetTask) {
        // console.log("[TASKS TABLE] Could not find dragged or target task");
        return;
      }

      // ---- 2. Get *siblings* (same parent context) ---------------------
      const parentId = draggedTask.parentTaskId ?? null; // null for top-level

      const siblingTasks = visibleTasks.filter(
        (t) => (t.parentTaskId ?? null) === parentId
      );

      // Sort siblings by their current displayOrder (fallback to created order)
      siblingTasks.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

      // ---- 3. Build new ordering array ---------------------------------
      // Remove dragged from sibling list
      const newOrder = siblingTasks.filter((t) => t.id !== draggedTaskId);

      // Find target index in the new list
      const tgtIdx = newOrder.findIndex((t) => t.id === targetTaskId);

      // Insert dragged task before / after the target
      const insertIdx = position === "before" ? tgtIdx : tgtIdx + 1;
      newOrder.splice(insertIdx, 0, draggedTask);

      // ---- 4. Re-assign sequential displayOrder values -----------------
      const updates: Promise<any>[] = [];
      newOrder.forEach((task, idx) => {
        const requiredOrder = idx + 1; // 1-based, small integers
        if (task.displayOrder !== requiredOrder) {
          // console.log(`[TASKS TABLE]   -> ${task.id} displayOrder ${task.displayOrder} → ${requiredOrder}`);
          updates.push(
            projlyTasksService.updateTask(task.id, {
              title: task.title,
              status: task.status,
              projectId: task.projectId,
              assignedTo: task.assignedTo,
              description: task.description || "",
              parentTaskId: task.parentTaskId,
              label: task.label || undefined,
              percentProgress:
                task.percentProgress !== null ? task.percentProgress : undefined,
              displayOrder: requiredOrder,
            })
          );
        }
      });

      await Promise.all(updates);
      // console.log(`[TASKS TABLE] Re-ordering complete – ${updates.length} task(s) updated.`);

      // ---- 5. Refresh list --------------------------------------------
      if (onOperationComplete) {
        onOperationComplete(filters);
      }
    } catch (error) {
      console.error("[TASKS TABLE] Error reordering task:", error);
    }
  };

  // Render the table

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div className="bg-card rounded-md space-y-4">
          {/* All filter UI removed - now handled by container */}
          
          <Separator />
          
          
          {/* Tasks table */}
          <Table>
          <TableCaption>
            {loading 
              ? "Loading tasks..." 
              : filteredTasks?.length === 0 
                ? "No tasks found." 
                : `Showing ${sortedTasks?.length} tasks`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer w-[300px] whitespace-nowrap px-3"
                onClick={() => toggleSort("title")}
              >
                <div className="flex items-center">
                  {/* Collapse/Expand All Button */}
                  {taskRelationships.size > 0 && (
                    <button
                      className="p-2 mr-2 rounded-md bg-primary hover:bg-primary/90 text-white transition-colors duration-200 ease-in-out"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCollapseAll();
                      }}
                      title={areAllCollapsed ? "Expand All" : "Collapse All"}
                    >
                      {areAllCollapsed ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  Title
                  {renderSortIndicator("title")}
                </div>
              </TableHead>
              {context !== 'project' && (
                <TableHead 
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort("project")}
                >
                  <div className="flex items-center">
                    Project
                    {renderSortIndicator("project")}
                  </div>
                </TableHead>
              )}
              <TableHead 
                className="cursor-pointer whitespace-nowrap"
                onClick={() => toggleSort("startDate")}
              >
                <div className="flex items-center">
                  Start Date
                  {renderSortIndicator("startDate")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer whitespace-nowrap"
                onClick={() => toggleSort("dueDate")}
              >
                <div className="flex items-center">
                  Due Date
                  {renderSortIndicator("dueDate")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer whitespace-nowrap"
                onClick={() => toggleSort("status")}
              >
                <div className="flex items-center">
                  Status
                  {renderSortIndicator("status")}
                </div>
              </TableHead>
              <TableHead className="whitespace-nowrap">Label</TableHead>
              <TableHead className="whitespace-nowrap">Progress</TableHead>
              <TableHead className="whitespace-nowrap">Assignee</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleTasks.filter(task => !hideParentRow || task.id !== parentTaskId).map((task, index) => (
              <DraggableTaskRow
                key={task.id}
                task={task}
                index={index}
                onTaskReorder={handleTaskReorder}
                isDragDisabled={false}
              >
                <TableCell 
                  className={`font-medium whitespace-nowrap min-w-[90vw] ${context === 'project' ? 'md:min-w-[33vw]' : 'md:min-w-[500px]'} cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-700/60 hover:shadow-sm transition-colors duration-200 ${task.parentTaskId ? 'sub-task' : ''} group`} 
                  title={task.title || "-"}
                  onClick={() => openTaskDetailDialog(task.id)}
                >
                  <div className="flex items-center">
                    {/* Collapse/expand toggle */}
                    {taskRelationships.has(task.id) && task._meta?.level === 0 && (!hideParentRow || context !== 'main') ? (
                      <button
                        className="p-2 mr-2 rounded-md hover:bg-primary hover:text-white transition-colors duration-200 ease-in-out"
                        title="Collapse/Expand"
                        onClick={e => { e.stopPropagation(); toggleCollapse(task.id); }}
                      >
                        {collapsedTasks.has(task.id) ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      <div className="w-4 h-4 mr-2 hidden" />
                    )}
                    {/* Task title - no longer wrapped in Link */}
                    <div className="block flex-1">
                      <TaskTitleCell
                        task={task}
                        level={task._meta?.level}
                        hasSubtasks={task._meta?.level === 0 && taskRelationships.has(task.id) && !hideParentRow}
                        subtaskCount={taskRelationships.get(task.id)?.length || 0}
                      />
                    </div>
                    {/* Full task detail in new tab icon - appears on hover */}
                    <button
                      type="button"
                      title="Open full task detail in new tab"
                      className="ml-2 opacity-0 group-hover:opacity-100 group-hover:bg-primary group-hover:text-white transition-colors duration-200 ease-in-out p-1 rounded-sm"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        window.open(buildBrowserRouteUrl(`/projly/tasks/${task.id}`), '_blank');
                      }}
                    >

                      <Maximize2 className="h-3 w-3" />
                    </button>
                    {/* Quick view detail icon - appears on hover, hidden in task context to prevent multiple dialog layers */}
                    {(context === 'project' || context === 'main') && (
                      <button
                        type="button"
                        title="Quick view task detail"
                        className="ml-1 opacity-0 group-hover:opacity-100 group-hover:bg-primary group-hover:text-white transition-colors duration-200 ease-in-out p-1 rounded-sm"
                        onClick={(e) => { e.stopPropagation(); openTaskDetailDialog(task.id); }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </TableCell>
                {context !== 'project' && (
                  <TableCell className="whitespace-nowrap" title={task.project?.name || "-"}>
                    {task.project?.id ? (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-normal" 
                        onClick={() => router.push(`/projly/projects/${task.project?.id}`)}
                      >
                        {task.project?.name || "-"}
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                )}
                <TableCell className="whitespace-nowrap" title={formatDateForDisplay(task.startDate)}>
                  {(() => {
                    // console.log(`[TASKS TABLE] Formatting startDate for task ${task.id}: ${task.startDate || 'not set'}`);
                    return formatDateForDisplay(task.startDate);
                  })()}
                </TableCell>
                <TableCell className="whitespace-nowrap" title={formatDateForDisplay(task.dueDate)}>
                  {(() => {
                    // console.log(`[TASKS TABLE] Formatting dueDate for task ${task.id}: ${task.dueDate || 'not set'}`);
                    return formatDateForDisplay(task.dueDate);
                  })()}
                </TableCell>
                <TableCell className="whitespace-nowrap" title={task.status}>{renderStatusBadge(task.status)}</TableCell>
                <TableCell className="whitespace-nowrap" title={task.label || "No label"}>
                  {task.label ? (
                    <Badge variant="outline" title={task.label}>
                      {getLabelInitials(task.label)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right" title={`${task.percentProgress || 0}% complete`}>
                  <span className="text-xs text-muted-foreground">{Math.round(task.percentProgress || 0)}%</span>
                </TableCell>
                <TableCell className="whitespace-nowrap" title={task.assignee ? (task.assignee.firstName && task.assignee.lastName ? `${task.assignee.firstName} ${task.assignee.lastName}` : task.assignee.name || task.assignee.email) : "-"}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      {task.assignee?.avatar && (
                        <AvatarImage src={task.assignee.avatar} alt={task.assignee.name || task.assignee.email || "User"} />
                      )}
                      <AvatarFallback className="text-xs" title={task.assignee ? (task.assignee.firstName && task.assignee.lastName ? `${task.assignee.firstName} ${task.assignee.lastName} - ${task.assignee.email}` : task.assignee.name || task.assignee.email) : "-"}>
                        {getAssigneeInitials(task.assignee)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => window.open(buildBrowserRouteUrl(`/projly/tasks/${task.id}`), '_blank')}>
                        <Maximize2 className="mr-2 h-4 w-4" /> Open in new tab
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => openTaskDetailDialog(task.id)}>
                        <ExternalLink className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleEditTask(task)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      
                      {/* Only show Delete option if user has permission */}
                      {canDeleteTask(task) && (
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setDeleteTaskId(task.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </DraggableTaskRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Task Dialog removed - using page navigation instead */}
      
      {/* Task Detail Dialog (rich modal) */}
      <TaskDetailDialog
        taskId={selectedTaskId || ""}
        isOpen={isTaskDetailOpen && !!selectedTaskId}
        onClose={handleTaskDetailClose}
        onTaskUpdated={() => onOperationComplete && onOperationComplete(filters)}
      />

      {/* Delete task confirmation */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTaskId && confirmDelete(deleteTaskId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </DndProvider>
  );
}
