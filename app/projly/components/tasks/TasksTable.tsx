import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/app/projly/contexts/AuthContextCustom";
import { useRouter } from "next/navigation";

// Helper function for date formatting
const formatDateForDisplay = (dateStr: string | undefined): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
};
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash,
  Plus,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Filter
} from "lucide-react";
import { PageLoading } from '@/app/projly/components/ui/PageLoading';
import { projlyTasksService, projlyProjectsService, projlyAuthService } from '@/lib/services/projly';
import { Task as ProjlyTask } from '@/lib/services/projly/types';

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
}
import { CreateTaskForm } from "./CreateTaskForm";
import { EditTaskForm } from "./EditTaskForm";
import { TaskDetailView } from "./TaskDetailView";
import { TaskTitleCell } from "./TaskTitleCell";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

// Helper function to organize tasks into a complete hierarchy showing ALL nested levels
export const organizeTasksHierarchy = (tasks: Task[], sortBy: { field: string; direction: "asc" | "desc" }): Task[] => {
  console.log('[TASKS TABLE] Organizing tasks into full hierarchy with ALL nested levels');
  
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
      
      console.log(`[TASKS TABLE] Task ${task.id} is level ${parentLevel + 1} (child of ${task.parentTaskId})`);
    } else {
      console.log(`[TASKS TABLE] Task ${task.id} is level 0 (top level)`);
    }
  });
  
  console.log(`[TASKS TABLE] Found ${parentTaskMap.size} parent-child relationships`);
  
  // Sort function used across different collections of tasks
  const sortTasks = (tasksToSort: Task[]) => {
    return tasksToSort.sort((a, b) => {
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
      console.log(`[TASKS TABLE] Found orphaned task: ${task.id} with missing parent: ${task.parentTaskId}`);
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
      console.log(`[TASKS TABLE] Adding ${children.length} children of task ${task.id} at level ${parentLevel + 1}`);
      
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
      console.log(`[TASKS TABLE] Adding orphaned task: ${task.id}`);
      organizedTasks.push(task);
    }
  });
  
  console.log(`[TASKS TABLE] Organized ${organizedTasks.length} tasks with full hierarchical structure`);
  
  // Store the calculated levels for easier access during rendering
  organizedTasks.forEach(task => {
    if (!task._meta) task._meta = {};
    task._meta.level = taskLevels.get(task.id) || 0;
  });
  
  return organizedTasks;
};

export function TasksTable({ tasks, onOperationComplete, initialFilters = {}, compact, context, parentTaskId, hideParentRow, hideFilterUI }: TasksTableProps) {
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data !== undefined) {
      console.log(`[TASKS TABLE] ${message}`, data);
    } else {
      console.log(`[TASKS TABLE] ${message}`);
    }
  };
  
  // Initialize router for navigation
  const router = useRouter();
  // Get current user from AuthContext
  const { user } = useAuth();
  
  console.log("[TASKS TABLE] Current user:", user?.id);
  
  // Use the filters directly from props
  const filters = initialFilters || {};
  
  console.log('[TASKS TABLE] Using filters from props:', filters);
  
  // Helper for debugging
  useEffect(() => {
    log('Current filters:', filters);
  }, [filters]);
  const [sortBy, setSortBy] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "dueDate",
    direction: "asc",
  });
  
  console.log("[TASKS TABLE] Initialized with default sort by dueDate");
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

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
  
  console.log(`[TASKS TABLE] Built relationship maps: ${taskRelationships.size} parents, ${subTaskParents.size} sub-tasks`);
  
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
      
      if (checkFilters.assignedTo && subTask.assignedTo !== checkFilters.assignedTo) {
        return false;
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
    
    if (checkFilters.assignedTo && parentTask.assignedTo !== checkFilters.assignedTo) {
      return false;
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
  
  console.log(`[TASKS TABLE] Found ${uniqueUsers.length} unique users for dropdown`);
  uniqueUsers.forEach(user => {
    console.log(`[TASKS TABLE] Unique user: ${user.id} - ${user.name}`);
  });
  
  // DEBUG: Log task assignment data
  tasks.forEach(task => {
    console.log(`[TASKS TABLE] Task ${task.id} (${task.title}) assignment data:`);
    console.log(`  - assignedTo: ${task.assignedTo || 'null'}`);
    console.log(`  - assignee.id: ${task.assignee?.id || 'null'}`);
    console.log(`  - assignee.email: ${task.assignee?.email || 'null'}`);
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
      console.log(`[TASKS TABLE] Task ${task.id} doesn't match label filter: ${filters.label}`);
      console.log(`  - task.label: ${task.label || 'null'}`);
      matchesBasicFilters = false;
    }
    
    // Apply assignee filter - check both assignedTo and assignee.id
    if (filters.assignedTo) {
      // Special handling for 'current' value - filter to current user's tasks
      if (filters.assignedTo === 'current') {
        if (!user?.id || (task.assignedTo !== user.id && task.assignee?.id !== user.id)) {
          console.log(`[TASKS TABLE] Task ${task.id} doesn't match current user filter. User ID: ${user?.id}`);
          console.log(`  - task.assignedTo: ${task.assignedTo || 'null'}`);
          console.log(`  - task.assignee?.id: ${task.assignee?.id || 'null'}`);
          matchesBasicFilters = false;
        } else {
          console.log(`[TASKS TABLE] Task ${task.id} MATCHES current user filter. User ID: ${user?.id}`);
        }
      } else {
        // Normal assignee filtering
        if (task.assignedTo !== filters.assignedTo && task.assignee?.id !== filters.assignedTo) {
          console.log(`[TASKS TABLE] Task ${task.id} doesn't match assignee filter: ${filters.assignedTo}`);
          console.log(`  - task.assignedTo: ${task.assignedTo || 'null'}`);
          console.log(`  - task.assignee?.id: ${task.assignee?.id || 'null'}`);
          matchesBasicFilters = false;
        } else {
          console.log(`[TASKS TABLE] Task ${task.id} MATCHES assignee filter: ${filters.assignedTo}`);
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
      console.log(`[TASKS TABLE] Including parent task ${task.id} because it has matching sub-tasks`);
      return true;
    }
    
    // 2. It's a sub-task and its parent matches the filters
    if (task.parentTaskId && hasMatchingParent(task.id, filters, tasks)) {
      console.log(`[TASKS TABLE] Including sub-task ${task.id} because its parent matches filters`);
      return true;
    }
    
    return false;
  });
  
  console.log("[TASKS TABLE] Filtered tasks:", filteredTasks.length);
  console.log("[TASKS TABLE] Sub-tasks count:", filteredTasks.filter(task => task.parentTaskId).length);
  
  // Sort tasks while preserving parent-child relationships
  const sortedTasks = organizeTasksHierarchy(filteredTasks, sortBy);

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
      console.log(`[TASKS TABLE] Deleting task with ID: ${id}`);
      await projlyTasksService.deleteTask(id);
      console.log('[TASKS TABLE] Task deleted successfully');
      
      // Reset state and refresh data
      setDeleteTaskId(null);
      
      // Call callback to refresh tasks list if provided
      if (onOperationComplete) {
        console.log('Calling onOperationComplete callback to refresh tasks with current filters');
        console.log('Current filters:', filters);
        onOperationComplete(filters);
      }
    } catch (error) {
      console.log('[TASKS TABLE] Error deleting task:', error);
    }
  };

  // Check if current user can delete a task
  // According to backend logic: only project owners or task assignees can delete tasks
  const canDeleteTask = (task: Task): boolean => {
    if (!user || !task) {
      console.log("[TASKS TABLE] Cannot check delete permission: missing user or task data");
      return false;
    }
    
    // For project ownership check, we'd need additional API data
    // According to backend logic in tasks.ts, we should check if the user is the project owner
    // Since we don't have direct access to project ownership in our current task data,
    // we'll simplify to just check if user is assigned to the task
    
    // Check if the current user is assigned to the task
    const isAssigned = task.assignedTo === user.id || task.assignee?.id === user.id;
    
    console.log(`[TASKS TABLE] Task ${task.id} delete permission check: isAssigned=${isAssigned}`);
    console.log(`[TASKS TABLE] Task details - assignedTo: ${task.assignedTo}, assignee.id: ${task.assignee?.id}`);
    
    return isAssigned;
  };

  // Handle edit task click - navigate to edit page
  const handleEditTask = (task: Task) => {
    console.log("[TASKS TABLE] Navigating to edit page for task:", task.id);
    
    // Set a flag in localStorage to indicate a task is being edited
    // This will be used to trigger a refresh when returning to the project detail page
    localStorage.setItem('projly_task_edited', 'true');
    localStorage.setItem('projly_last_edited_task', task.id);
    localStorage.setItem('projly_edit_timestamp', Date.now().toString());
    
    console.log("[TASKS TABLE] Set edit flags in localStorage");
    
    // Navigate to the edit page
    router.push(`/projly/tasks/${task.id}/edit`);
  };

  // Handle view task details - navigate to task detail page
  const handleViewTaskDetails = (task: Task) => {
    console.log("[TASKS TABLE] Navigating to task detail page:", task.id);
    router.push(`/projly/tasks/${task.id}`);
  };

  // Handle dialog close
  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
    
    // Call callback to refresh tasks list if provided
    if (onOperationComplete) {
      console.log('Calling onOperationComplete callback to refresh tasks after create with current filters');
      console.log('Current filters:', filters);
      onOperationComplete(filters);
    }
  };

  const handleDetailDialogClose = () => {
    setIsDetailDialogOpen(false);
    setDetailTask(null);
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
      default:
        variant = "outline";
        customClass = "bg-gray-400 text-white hover:bg-gray-500 border-gray-400";
    }
    
    console.log(`Rendering badge for status: ${status} with class: ${customClass}`);
    return <Badge variant={variant} className={customClass}>{status}</Badge>;
  };

  // Render the table

  return (
    <div>
      <div className="bg-card rounded-md space-y-4">
        {/* All filter UI removed - now handled by container */}
        
        <Separator />
        
        {/* Tasks table */}
        <Table>
          <TableCaption>
            {filteredTasks?.length === 0 
              ? "No tasks found." 
              : `Showing ${sortedTasks?.length} tasks`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer w-[300px] whitespace-nowrap"
                onClick={() => toggleSort("title")}
              >
                <div className="flex items-center">
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
            {sortedTasks?.filter(task => !hideParentRow || task.id !== parentTaskId).map((task) => (
              <TableRow 
                key={task.id}
                className={`cursor-pointer hover:bg-muted/50 ${task.parentTaskId ? 'sub-task' : ''}`}
                onClick={() => handleViewTaskDetails(task)}
              >
                <TableCell className="font-medium whitespace-nowrap" title={task.description || "-"}>
                  {/* Use the dedicated TaskTitleCell component to prevent unwanted characters */}
                  <TaskTitleCell
                    task={task}
                    level={task._meta?.level}
                    hasSubtasks={task._meta?.level === 0 && taskRelationships.has(task.id) && !hideParentRow}
                    subtaskCount={taskRelationships.get(task.id)?.length || 0}
                  />
                </TableCell>
                {context !== 'project' && (
                  <TableCell className="whitespace-nowrap" title={task.project?.name || "-"}>
                    {task.project?.id ? (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-normal" 
                        onClick={() => window.location.href = `/projly/projects/${task.project?.id}`}
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
                    console.log(`[TASKS TABLE] Formatting startDate for task ${task.id}: ${task.startDate || 'not set'}`);
                    return formatDateForDisplay(task.startDate);
                  })()}
                </TableCell>
                <TableCell className="whitespace-nowrap" title={formatDateForDisplay(task.dueDate)}>
                  {(() => {
                    console.log(`[TASKS TABLE] Formatting dueDate for task ${task.id}: ${task.dueDate || 'not set'}`);
                    return formatDateForDisplay(task.dueDate);
                  })()}
                </TableCell>
                <TableCell className="whitespace-nowrap" title={task.status}>{renderStatusBadge(task.status)}</TableCell>
                <TableCell className="whitespace-nowrap" title={task.label || "No label"}>
                  {task.label ? (
                    <Badge variant="outline">{task.label}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right" title={`${task.percentProgress || 0}% complete`}>
                  <span className="text-xs text-muted-foreground">{task.percentProgress || 0}%</span>
                </TableCell>
                <TableCell className="whitespace-nowrap" title={task.assignee ? (task.assignee.firstName && task.assignee.lastName ? `${task.assignee.firstName} ${task.assignee.lastName}` : task.assignee.name || task.assignee.email) : "-"}>
                  {(() => {
                    console.log("[TasksTable] Rendering assignee for task:", task.id, task.assignee);
                    if (task.assignee) {
                      console.log("[TasksTable] Assignee object:", task.assignee);
                      const firstName = task.assignee.firstName || "";
                      const lastName = task.assignee.lastName || "";
                      const name = task.assignee.name || "";
                      const email = task.assignee.email || "";
                      
                      // Display firstName and lastName if available
                      if (firstName && lastName) {
                        console.log(`[TasksTable] Displaying firstName and lastName: ${firstName} ${lastName}`);
                        return `${firstName} ${lastName}`;
                      } else if (name) {
                        // Fallback to name if available
                        console.log(`[TasksTable] Displaying name: ${name}`);
                        return name;
                      } else if (email) {
                        // Fallback to email if no name available
                        console.log(`[TasksTable] Displaying email: ${email}`);
                        return email;
                      } else {
                        return "-";
                      }
                    }
                    return "-";
                  })()}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Task Dialog removed - using page navigation instead */}
      
      {/* Task Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {detailTask && (
            <TaskDetailView
              task={detailTask}
              onEdit={() => {
                handleDetailDialogClose();
                handleEditTask(detailTask);
              }}
              onClose={handleDetailDialogClose}
            />
          )}
        </DialogContent>
      </Dialog>

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
  );
}
