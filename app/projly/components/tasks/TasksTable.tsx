
import { useState, useEffect } from "react";
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
  Clock
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

export function TasksTable({ tasks }: TasksTableProps) {
  // Initialize router for navigation
  const router = useRouter();
  
  // State for filters and sorting
  const [filters, setFilters] = useState<{
    projectId?: string;
    assignedTo?: string;
    status?: string;
    search?: string;
  }>({});
  const [sortBy, setSortBy] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "dueDate",
    direction: "asc",
  });
  
  console.log("[TASKS TABLE] Initialized with default sort by dueDate");
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // State for loading and projects
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projects, setProjects] = useState<{id: string; name: string}[]>([]);
  
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
      // Notify parent component about the change if needed
      setDeleteTaskId(null);
    } catch (error) {
      console.error('[PROJLY:TASKS_TABLE] Error deleting task:', error);
    }
  };

  // Handle edit task - navigate directly to edit page
  const handleEditTask = (task: Task) => {
    console.log("[TasksTable] Navigating to edit task page:", task.id);
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
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditTask(null);
  };

  const handleDetailDialogClose = () => {
    setIsDetailDialogOpen(false);
    setDetailTask(null);
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    switch (status) {
      case "Completed":
        variant = "default";
        break;
      case "In Progress":
        variant = "secondary";
        break;
      case "Not Started":
        variant = "outline";
        break;
      case "Pending":
        variant = "destructive";
        break;
      default:
        variant = "outline";
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  // Handle filter changes
  const handleProjectFilterChange = (value: string) => {
    setFilters({
      ...filters,
      projectId: value === "all" ? undefined : value
    });
  };

  const handleStatusFilterChange = (value: string) => {
    setFilters({
      ...filters,
      status: value === "all" ? undefined : value
    });
  };

  const handleAssigneeFilterChange = (value: string) => {
    setFilters({
      ...filters,
      assignedTo: value === "all" ? undefined : value
    });
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
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
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
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setFilters({})} 
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
                      <Button variant="ghost" size="sm">Actions</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleEditTask(task)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setDeleteTaskId(task.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editTask && (
            <EditTaskForm 
              task={editTask} 
              onSuccess={handleEditDialogClose}
            />
          )}
        </DialogContent>
      </Dialog>
      
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
