
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
  MoreHorizontal
} from "lucide-react";
import { projlyTasksService, projlyProjectsService } from '@/lib/services/projly';

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
}

// Props for TasksTable
export interface TasksTableProps {
  tasks: Task[];
  onOperationComplete?: (filters?: any) => void; // Callback to refresh data after operations with current filters
  initialFilters?: any; // Initial filters passed from parent
}
import { CreateTaskForm } from "./CreateTaskForm";
import { EditTaskForm } from "./EditTaskForm";
import { TaskDetailView } from "./TaskDetailView";

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

export function TasksTable({ tasks, onOperationComplete, initialFilters = {} }: TasksTableProps) {
  // Initialize router for navigation
  const router = useRouter();
  // Get current user from AuthContext
  const { user } = useAuth();
  
  console.log("[TASKS TABLE] Current user:", user?.id);
  
  // State for filters and sorting - initialize from props if available
  const [filters, setFilters] = useState<{
    projectId?: string;
    assignedTo?: string;
    status?: string;
    search?: string;
    taskHierarchy?: string; // New filter for parent tasks only or include sub-tasks
  }>(initialFilters || {});
  
  // Log filters for debugging
  useEffect(() => {
    console.log('[TASKS TABLE] Current filters:', filters);
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

  // State for loading and projects
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projects, setProjects] = useState<{id: string; name: string}[]>([]);
  
  // Get unique statuses from tasks for the dropdown
  const uniqueStatuses = useMemo(() => {
    const statusSet = new Set<string>();
    
    // Collect all unique statuses from tasks
    tasks.forEach(task => {
      if (task.status) {
        statusSet.add(task.status);
      }
    });
    
    // Convert to array and sort alphabetically
    return Array.from(statusSet).sort();
  }, [tasks]);
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:TASKS_TABLE] ${message}`, data);
    } else {
      console.log(`[PROJLY:TASKS_TABLE] ${message}`);
    }
  };
  
  // Load projects for filtering
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        log('Fetching projects for task table');
        const projectsData = await projlyProjectsService.getProjects();
        setProjects(projectsData);
        log('Projects loaded:', projectsData.length);
      } catch (error) {
        console.error('[PROJLY:TASKS_TABLE] Error fetching projects:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  log('Rendering TasksTable with tasks:', tasks.length);

  // Filter tasks based on search and filters with proper type safety
  const filteredTasks = tasks.filter(task => {
    // Apply search filter
    if (filters.search && task.title && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Apply status filter
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    
    // Apply project filter
    if (filters.projectId && task.projectId !== filters.projectId) {
      return false;
    }
    
    // Apply assignee filter
    if (filters.assignedTo && task.assignedTo !== filters.assignedTo) {
      return false;
    }
    
    // Apply task hierarchy filter (client-side filtering based on parentTaskId)
    // Note: Ideally this would be handled by the backend, but we're implementing it client-side for now
    if (filters.taskHierarchy === 'parent_only' && task.parentTaskId) {
      return false; // Filter out tasks that have a parent (sub-tasks)
    }
    
    return true;
  });
  
  console.log("[TasksTable] Filtered tasks:", filteredTasks.length);

  // Sort tasks
  const sortedTasks = filteredTasks?.slice().sort((a, b) => {
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
      log(`Deleting task with ID: ${id}`);
      await projlyTasksService.deleteTask(id);
      log('Task deleted successfully');
      
      // Reset state and refresh data
      setDeleteTaskId(null);
      
      // Call callback to refresh tasks list if provided
      if (onOperationComplete) {
        log('Calling onOperationComplete callback to refresh tasks with current filters');
        log('Current filters:', filters);
        onOperationComplete(filters);
      }
    } catch (error) {
      console.error('[PROJLY:TASKS_TABLE] Error deleting task:', error);
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
    router.push(`/projly/tasks/${task.id}/edit`);
  };

  // Handle view task details - navigate to task detail page
  const handleViewTaskDetails = (task: Task) => {
    console.log("Navigating to task detail page:", task.id);
    router.push(`/projly/tasks/${task.id}`);
  };

  // Handle dialog close
  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
    
    // Call callback to refresh tasks list if provided
    if (onOperationComplete) {
      log('Calling onOperationComplete callback to refresh tasks after create with current filters');
      log('Current filters:', filters);
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

  // Function to handle filter changes
  const handleProjectFilterChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === "all") {
      delete newFilters.projectId;
    } else {
      newFilters.projectId = value;
    }
    setFilters(newFilters);
    
    // If callback provided, notify parent component
    if (onOperationComplete) {
      // Transform UI filters to API parameters
      const apiFilters = { ...newFilters };
      if (newFilters.taskHierarchy === 'parent_only') {
        apiFilters.parentOnly = 'true';
        apiFilters.includeSubTasks = 'false';
      } else if (newFilters.taskHierarchy === 'include_subtasks') {
        apiFilters.parentOnly = 'false';
        apiFilters.includeSubTasks = 'true';
      }
      onOperationComplete(apiFilters);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === "all") {
      delete newFilters.status;
    } else {
      newFilters.status = value;
    }
    setFilters(newFilters);
    
    // If callback provided, notify parent component
    if (onOperationComplete) {
      // Transform UI filters to API parameters
      const apiFilters = { ...newFilters };
      if (newFilters.taskHierarchy === 'parent_only') {
        apiFilters.parentOnly = 'true';
        apiFilters.includeSubTasks = 'false';
      } else if (newFilters.taskHierarchy === 'include_subtasks') {
        apiFilters.parentOnly = 'false';
        apiFilters.includeSubTasks = 'true';
      }
      onOperationComplete(apiFilters);
    }
  };

  const handleAssigneeFilterChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === "all") {
      delete newFilters.assignedTo;
    } else if (value === "current" && user?.id) {
      newFilters.assignedTo = user.id;
    } else {
      newFilters.assignedTo = value;
    }
    setFilters(newFilters);
    
    // If callback provided, notify parent component
    if (onOperationComplete) {
      // Transform UI filters to API parameters
      const apiFilters = { ...newFilters };
      if (newFilters.taskHierarchy === 'parent_only') {
        apiFilters.parentOnly = 'true';
        apiFilters.includeSubTasks = 'false';
      } else if (newFilters.taskHierarchy === 'include_subtasks') {
        apiFilters.parentOnly = 'false';
        apiFilters.includeSubTasks = 'true';
      }
      onOperationComplete(apiFilters);
    }
  };

  // Show loading state for projects only
  if (isLoadingProjects) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-md p-4 space-y-4">
        {/* Filters and search */}
        <div className="flex flex-col md:flex-row gap-4">
          <Input 
            placeholder="Search tasks..." 
            className="md:w-1/3"
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          
          <div className="flex flex-row gap-2">
            <Select 
              value={filters.projectId || "all"}
              onValueChange={handleProjectFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {Array.isArray(projects) && projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.status || "all"}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.assignedTo || "all"}
              onValueChange={handleAssigneeFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Assigned To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="current">My Tasks</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.taskHierarchy || "all"}
              onValueChange={(value) => {
                console.log('[TASK TABLE] Setting task hierarchy filter to:', value);
                setFilters({ ...filters, taskHierarchy: value });
                
                // If callback provided, notify parent component to fetch with updated filters
                if (onOperationComplete) {
                  const apiFilters = { ...filters, taskHierarchy: value };
                  // Transform UI filter value to API parameters
                  if (value === 'parent_only') {
                    apiFilters.parentOnly = 'true';
                    apiFilters.includeSubTasks = 'false';
                  } else if (value === 'include_subtasks') {
                    apiFilters.parentOnly = 'false';
                    apiFilters.includeSubTasks = 'true';
                  }
                  onOperationComplete(apiFilters);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Task Hierarchy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="parent_only">Parent Tasks Only</SelectItem>
                <SelectItem value="include_subtasks">Include Sub-Tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setFilters({});
              // Clear filters should also notify parent component with empty filters
              if (onOperationComplete) {
                onOperationComplete({});
              }
            }} 
            className="md:ml-auto"
          >
            Clear Filters
          </Button>
        </div>
        
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
                className="cursor-pointer w-[300px]"
                onClick={() => toggleSort("title")}
              >
                <div className="flex items-center">
                  Title
                  {renderSortIndicator("title")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => toggleSort("project")}
              >
                <div className="flex items-center">
                  Project
                  {renderSortIndicator("project")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => toggleSort("startDate")}
              >
                <div className="flex items-center">
                  Start Date
                  {renderSortIndicator("startDate")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => toggleSort("dueDate")}
              >
                <div className="flex items-center">
                  Due Date
                  {renderSortIndicator("dueDate")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => toggleSort("status")}
              >
                <div className="flex items-center">
                  Status
                  {renderSortIndicator("status")}
                </div>
              </TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks?.map((task) => (
              <TableRow 
                key={task.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleViewTaskDetails(task)}
              >
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>{task.project?.name || "-"}</TableCell>
                <TableCell>
                  {(() => {
                    console.log(`[TASKS TABLE] Formatting startDate for task ${task.id}: ${task.startDate || 'not set'}`);
                    return formatDateForDisplay(task.startDate);
                  })()}
                </TableCell>
                <TableCell>
                  {(() => {
                    console.log(`[TASKS TABLE] Formatting dueDate for task ${task.id}: ${task.dueDate || 'not set'}`);
                    return formatDateForDisplay(task.dueDate);
                  })()}
                </TableCell>
                <TableCell>{renderStatusBadge(task.status)}</TableCell>
                <TableCell>
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
