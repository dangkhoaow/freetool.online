'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { handleIntelligentBackNavigation, updateNavigationHistory } from "@/app/projly/utils/navigation-utils";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import { Loader2, ArrowLeft, Save, Trash, Clock, Calendar, Edit, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "../../components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { projlyAuthService, projlyTasksService, projlyProjectsService } from '@/lib/services/projly';
import { useProjectMembers } from '@/lib/services/projly/use-projects';
import { useToast } from "@/components/ui/use-toast";
import { organizeTasksHierarchy } from "@/app/projly/components/tasks/TasksTable";
// Define a custom task type that includes all the properties we need to work with
// This helps bypass the type conflicts between different Task interfaces in the codebase
type ProjlyTaskData = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  startDate?: string | Date | null;
  dueDate?: string | Date | null;
  projectId: string;
  assigneeId?: string | null;
  createdById?: string;
  parentTaskId?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  project?: any;
  assignee?: any;
  subTasks?: ProjlyTaskData[];
  [key: string]: any; // Allow any additional properties
};

// Import the Task type just for reference, but we'll use our custom type for actual work
import { Task } from "@/app/projly/components/tasks/TasksTable";
import { CreateTaskForm } from "@/app/projly/components/tasks/CreateTaskForm";
import { TasksContainer } from "@/app/projly/components/tasks/TasksContainer";

interface TaskDetailsPageProps {
  // Props are no longer needed here since we'll use useParams
}

// Utility function to recursively fetch subtasks up to a certain depth
async function fetchSubTasksRecursive(taskId: string, depth: number = 2, log: (msg: string, data?: any) => void): Promise<ProjlyTaskData[]> {
  if (depth <= 0) return [];
  const taskData = await projlyTasksService.getTask(taskId);
  log('Fetched task for recursive subtasks', taskData);
  if (!taskData || !Array.isArray(taskData.subTasks)) return [];
  let allSubtasks: ProjlyTaskData[] = [...taskData.subTasks];
  for (const subtask of taskData.subTasks) {
    const nested = await fetchSubTasksRecursive(subtask.id, depth - 1, log);
    allSubtasks.push(...nested);
  }
  log('All subtasks after recursion', allSubtasks);
  return allSubtasks;
}

// Utility function to get all descendant tasks for a given parent taskId
function getTaskSubtree(tasks: ProjlyTaskData[], parentId: string, log: (msg: string, data?: any) => void): ProjlyTaskData[] {
  const subtree: ProjlyTaskData[] = [];
  const idToTask = Object.fromEntries(tasks.map(t => [t.id, t]));
  function collect(currentId: string) {
    const children = tasks.filter(t => t.parentTaskId === currentId);
    for (const child of children) {
      subtree.push(child);
      log('Collected subtask', child);
      collect(child.id);
    }
  }
  collect(parentId);
  return subtree;
}

// Utility to get all descendants up to n+2
function getSubTasksUpToDepth(
  tasks: ProjlyTaskData[],
  parentId: string,
  maxDepth: number = 2
): (ProjlyTaskData & { _depth: number })[] {
  const result: (ProjlyTaskData & { _depth: number })[] = [];
  function collect(currentId: string, depth: number) {
    if (depth > maxDepth) return;
    const children = tasks.filter((t: ProjlyTaskData) => t.parentTaskId === currentId);
    for (const child of children) {
      result.push({ ...child, _depth: depth });
      collect(child.id, depth + 1);
    }
  }
  collect(parentId, 1);
  return result;
}

// Map to Task type for compatibility
const mapToTask = (t: ProjlyTaskData & Partial<{ _depth: number }>): Task => ({
  ...t,
  startDate: t.startDate ? (typeof t.startDate === 'string' ? t.startDate : (t.startDate instanceof Date ? t.startDate.toISOString() : undefined)) : undefined,
  dueDate: t.dueDate ? (typeof t.dueDate === 'string' ? t.dueDate : (t.dueDate instanceof Date ? t.dueDate.toISOString() : undefined)) : undefined,
  parentTaskId: t.parentTaskId ?? undefined,
  subTasks: t.subTasks ? t.subTasks.map(mapToTask) : undefined,
});

export default function TaskDetailsPage({}: TaskDetailsPageProps) {
  // Use useParams to get the route parameters
  const params = useParams();
  const taskId = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const [subTasks, setSubTasks] = useState<ProjlyTaskData[]>([]);
  const [isCreateSubTaskOpen, setIsCreateSubTaskOpen] = useState(false);
  const [isRefreshingSubTasks, setIsRefreshingSubTasks] = useState(false);
  
  // Task form state
  const [taskForm, setTaskForm] = useState({
    id: '',
    title: '',
    description: '',
    projectId: '',
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: 'none', // Using 'none' instead of empty string for the Select component
    startDate: null as Date | null,
    dueDate: null as Date | null,
    createdAt: new Date(),
    updatedAt: new Date(),
    // For displaying only
    project: null as any,
    assignee: null as any
  });
  
  // Use the useProjectMembers hook to get members for the selected project
  const { data: projectMembers = [], isLoading: isLoadingMembers } = 
    useProjectMembers(taskForm.projectId || undefined) as { 
      data: any[], 
      isLoading: boolean 
    };
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:TASK_DETAILS:${taskId}] ${message}`, data);
    } else {
      console.log(`[PROJLY:TASK_DETAILS:${taskId}] ${message}`);
    }
  };
  
  // Track navigation history in session storage using our utility function
  useEffect(() => {
    // Add current path to navigation history
    const currentPath = `/projly/tasks/${taskId}`;
    updateNavigationHistory(currentPath, 10, log);
  }, [taskId]);
  
  // Check authentication and load task and related data
  useEffect(() => {
    const initPage = async () => {
      try {
        log('Checking authentication');
        const isAuthenticated = await projlyAuthService.isAuthenticated();
        
        if (!isAuthenticated) {
          log('User not authenticated, redirecting to login');
          router.push('/projly/login');
          return;
        }
        
        log('Fetching task data');
        const taskData = await projlyTasksService.getTask(taskId);
        log('Fetched task data', taskData);
        // Explicitly log timestamp fields for debugging
        if (taskData) {
          // Use type assertion to access potential timestamp fields that might not be in Task type
          const taskWithDates = taskData as any;
          log('Task timestamp fields', {
            createdAt: taskWithDates.createdAt,
            updatedAt: taskWithDates.updatedAt,
            createdAtType: taskWithDates.createdAt ? typeof taskWithDates.createdAt : 'undefined',
            updatedAtType: taskWithDates.updatedAt ? typeof taskWithDates.updatedAt : 'undefined'
          });
        }
        
        if (!taskData) {
          log('Task not found');
          toast({
            title: 'Error',
            description: 'Task not found or you do not have permission to view it',
            variant: 'destructive'
          });
          router.push('/projly/tasks');
          return;
        }
        
        log('Task loaded:', taskData);
        
        // Format dates for the form and map API model to form state
        // Adding detailed logging to help debug the task data structure
        console.log('[PROJLY:TASK_DETAILS] Raw task data:', taskData);
        console.log('[PROJLY:TASK_DETAILS] Task assignee data:', taskData.assignee);
        console.log('[PROJLY:TASK_DETAILS] Task sub-tasks:', taskData.subTasks);
        
        // Always fetch all nested subtasks recursively on initial load
        await refreshSubTasks();
        log('[PROJLY:TASK_DETAILS] Called refreshSubTasks on initial load');
        
        // Use type assertion to access all fields that might be present in the API response
        const taskWithAllFields = taskData as unknown as {
          id: string;
          title: string;
          description?: string;
          projectId: string;
          status?: string;
          priority?: string;
          assigneeId?: string;
          assignedTo?: string;
          startDate?: string | Date;
          dueDate?: string | Date;
          createdAt?: string | Date;
          updatedAt?: string | Date;
          project?: any;
          assignee?: any;
        };
        
        const formData = {
          id: taskWithAllFields.id,
          title: taskWithAllFields.title,
          description: taskWithAllFields.description || '',
          projectId: taskWithAllFields.projectId,
          status: taskWithAllFields.status || 'Not Started',
          priority: taskWithAllFields.priority || 'Medium',
          assignedTo: taskWithAllFields.assigneeId || taskWithAllFields.assignedTo || 'none',
          startDate: taskWithAllFields.startDate ? new Date(taskWithAllFields.startDate) : null,
          dueDate: taskWithAllFields.dueDate ? new Date(taskWithAllFields.dueDate) : null,
          createdAt: taskWithAllFields.createdAt ? new Date(taskWithAllFields.createdAt) : new Date(),
          updatedAt: taskWithAllFields.updatedAt ? new Date(taskWithAllFields.updatedAt) : new Date(),
          project: taskWithAllFields.project,
          assignee: taskWithAllFields.assignee
        };
        
        // Log the form data with dates
        log('Task form data with processed dates', {
          createdAt: formData.createdAt,
          updatedAt: formData.updatedAt,
          createdAtValid: formData.createdAt instanceof Date && !isNaN(formData.createdAt.getTime()),
          updatedAtValid: formData.updatedAt instanceof Date && !isNaN(formData.updatedAt.getTime())
        });
        console.log('[PROJLY:TASK_DETAILS] Formatted task assignedTo:', formData.assignedTo);
        console.log('[PROJLY:TASK_DETAILS] Raw taskData for type inspection:', taskData);
        
        console.log('[PROJLY:TASK_DETAILS] Formatted task for form:', formData);
        setTaskForm(formData);
        
        // Get projects for dropdown
        const projectsData = await projlyProjectsService.getProjects();
        setProjects(projectsData);
        log('Projects loaded:', projectsData.length);
        
        // Get current user and team members
        const currentUser = await projlyAuthService.getCurrentUser();
        // Get team members for assignee selection
        // This would typically come from a teams service
        // For now we'll use a placeholder
        const teamMembers = [currentUser].filter(Boolean);
        setUsers(teamMembers);
        
        // If the task has a project, load the project members to ensure we can display the assignee correctly
        if (formData.projectId) {
          log('Loading project members for project:', formData.projectId);
          try {
            // This will trigger the useProjectMembers hook to load the members
            // The hook is already being used with taskForm.projectId
          } catch (error) {
            console.error('[PROJLY:TASK_DETAILS] Error loading project members:', error);
          }
        }
        
      } catch (error) {
        console.error(`[PROJLY:TASK_DETAILS:${taskId}] Error loading task:`, error);
        toast({
          title: 'Error',
          description: 'Failed to load task data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
        log('Page initialization completed');
      }
    };
    
    initPage();
  }, [taskId, router, toast]);
  
  // Handle form input changes
  const handleChange = (field: string, value: any) => {
    log(`Updating form field: ${field} with value:`, value);
    setTaskForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      log('Validating form submission');
      if (!taskForm.title.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Task title is required',
          variant: 'destructive'
        });
        return;
      }
      
      if (!taskForm.projectId) {
        toast({
          title: 'Validation Error',
          description: 'Please select a project',
          variant: 'destructive'
        });
        return;
      }
      
      setIsSubmitting(true);
      log('Updating task:', taskForm);
      
      // Format dates for API
      const updatedFormData = {
        ...taskForm,
        startDate: taskForm.startDate ? taskForm.startDate.toISOString() : undefined,
        dueDate: taskForm.dueDate ? taskForm.dueDate.toISOString() : undefined
      };
      
      // Use object destructuring to format the task data for the API correctly
      // and avoid duplicate id field
      const { project, assignee, assignedTo, startDate, dueDate, ...taskBasicData } = updatedFormData;
      
      // Add detailed logging for debugging
      console.log('[PROJLY:TASK_DETAILS] Preparing task data for update:', {
        assignedTo,
        startDate,
        dueDate,
        ...taskBasicData
      });
      
      // Create an update payload that matches the TaskUpdateInput interface
      // startDate is intentionally omitted as it's not part of the API interface
      // taskBasicData already contains the id, so we don't need to include it again
      // We need to check if dueDate is a Date object or a string
      // Convert 'none' to null for the API
      const assigneeIdForApi = assignedTo === 'none' ? null : assignedTo;
      console.log('[PROJLY:TASK_DETAILS] Assignee ID for API:', assigneeIdForApi);
      
      // Cast the update data to any to bypass type checking since the API and UI use different Task types
      await projlyTasksService.updateTask(taskId, {
        ...taskBasicData,
        assigneeId: assigneeIdForApi,
        dueDate: dueDate && typeof dueDate === 'object' && dueDate !== null ? (dueDate as Date).toISOString() : dueDate
      } as any);
      log('Task updated successfully');
      
      toast({
        title: 'Success',
        description: 'Task updated successfully'
      });
      
      // Refresh the task data
      const updatedTask = await projlyTasksService.getTask(taskId);
      
      if (updatedTask) {
        // Convert API task model to form state model
        // Add detailed logging for debugging
        console.log('[PROJLY:TASK_DETAILS] Updating task form with API response:', updatedTask);
        
        // Use type assertion to avoid type errors
        const taskUpdate: any = {
          id: updatedTask.id,
          title: updatedTask.title || '',
          description: updatedTask.description || '',
          projectId: updatedTask.projectId || '',
          status: updatedTask.status || 'Not Started',
          assignedTo: updatedTask.assignedTo || 'none',
          startDate: updatedTask.startDate ? new Date(updatedTask.startDate) : null,
          dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate) : null,
          // For displaying purposes
          project: updatedTask.project || null,
          assignee: updatedTask.assignee || null,
          parentTaskId: updatedTask.parentTaskId || null
        };
        
        setTaskForm(taskUpdate);
        
        console.log('[PROJLY:TASK_DETAILS] Task refreshed successfully');
      } else {
        console.error('[PROJLY:TASK_DETAILS] Failed to refresh task data');
      }
      
    } catch (error) {
      console.error(`[PROJLY:TASK_DETAILS:${taskId}] Error updating task:`, error);
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Refactored: Fetch all tasks and filter for the current task and its subtree
  const refreshSubTasks = async () => {
    try {
      setIsRefreshingSubTasks(true);
      log('Refreshing sub-tasks using main task list API');
      const allTasks = await projlyTasksService.getTasks();
      log('Fetched all tasks', allTasks);
      // Find the current task
      const parentTask = allTasks.find(t => t.id === taskId);
      if (!parentTask) {
        log('Parent task not found in all tasks', { taskId });
          setSubTasks([]);
        return;
      }
      // Get all descendants (n+1, n+2, ...)
      const subtree = getTaskSubtree(allTasks, taskId, log);
      log('Filtered subtree for current task', subtree);
      setSubTasks(subtree as ProjlyTaskData[]);
      log('SubTasks updated with filtered subtree');
    } catch (error) {
      console.error(`[PROJLY:TASK_DETAILS] Error refreshing sub-tasks:`, error);
      toast({
        title: 'Error',
        description: 'Failed to refresh sub-tasks',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshingSubTasks(false);
    }
  };
  
  // Handle sub-task creation completion
  const handleSubTaskCreated = async () => {
    console.log('[PROJLY:TASK_DETAILS] Sub-task created callback triggered');
    
    // IMPORTANT: Immediately close the dialog first with no delay
    // This is critical to ensure the UI updates properly
    console.log('[PROJLY:TASK_DETAILS] Immediately closing sub-task dialog');
    setIsCreateSubTaskOpen(false);
    
    // Then handle refreshing separately - no need to wait for it to close the dialog
    try {
      console.log('[PROJLY:TASK_DETAILS] Refreshing sub-tasks after creation');
      await refreshSubTasks();
      
      // Toast notification only after successful refresh
      toast({
        title: 'Success',
        description: 'Sub-task created and list refreshed successfully'
      });
    } catch (error) {
      console.error('[PROJLY:TASK_DETAILS] Error refreshing sub-tasks after creation:', error);
      // Still show success for creation, but note refresh issue
      toast({
        title: 'Success',
        description: 'Sub-task created, but list refresh failed. Please reload the page.'
      });
    }
  };
  
  // Handle sub-task deletion
  const handleDeleteSubTask = async (subTaskId: string) => {
    try {
      log(`Deleting sub-task: ${subTaskId}`);
      await projlyTasksService.deleteTask(subTaskId);
      log('Sub-task deleted successfully');
      
      toast({
        title: 'Success',
        description: 'Sub-task deleted successfully'
      });
      
      // Refresh sub-tasks
      await refreshSubTasks();
      
    } catch (error) {
      console.error(`[PROJLY:TASK_DETAILS] Error deleting sub-task ${subTaskId}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to delete sub-task. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Render status badge
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
    
    return <Badge variant={variant} className={customClass}>{status}</Badge>;
  };
  
  // Handle task deletion
  const handleDelete = async () => {
    try {
      log('Deleting task');
      setIsSubmitting(true);
      
      await projlyTasksService.deleteTask(taskId);
      log('Task deleted successfully');
      
      toast({
        title: 'Success',
        description: 'Task deleted successfully'
      });
      
      // Navigate back to tasks list
      router.push('/projly/tasks');
      
    } catch (error) {
      console.error(`[PROJLY:TASK_DETAILS:${taskId}] Error deleting task:`, error);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive'
      });
      setIsSubmitting(false);
    }
  };
  
  // Sort state for subtasks table (reuse same logic as main tasks list)
  const [subtaskSortBy, setSubtaskSortBy] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "dueDate",
    direction: "asc"
  });
  
  // Show loading state using the centralized PageLoading component
  if (isLoading) {
    log('Showing loading state');
    return <PageLoading logContext="PROJLY:TASK_DETAILS" />;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Use our extracted utility function for intelligent back navigation
              handleIntelligentBackNavigation(router, taskId, log);
            }}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{taskForm.title}</h1>
            <p className="text-muted-foreground">
              Task ID: {taskId}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/projly/tasks/${taskId}/edit`)}
            className="ml-2"
            disabled={isSubmitting}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="ml-2"
            disabled={isSubmitting}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={(value) => {
          console.log(`[PROJLY:TASK_DETAILS:${taskId}] Tab changed to:`, value);
          setActiveTab(value);
        }}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="subtasks">Sub-Tasks {(() => {
              const filteredSubTasks = getSubTasksUpToDepth(subTasks, taskId, 2);
              return filteredSubTasks.length > 0 ? `(${filteredSubTasks.length})` : '';
            })()}</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
                <CardDescription>View task information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                  <p className="text-base">{taskForm.title}</p>
                </div>
                
                {/* Description */}
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <div className="rounded-md bg-muted/30 p-3">
                    <p className="whitespace-pre-wrap">{taskForm.description || 'No description provided'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {taskForm.dueDate ? `Due ${taskForm.dueDate.toLocaleDateString()}` : 'No due date'}
                    </span>
                  </div>
                  {taskForm.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Starts {taskForm.startDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {taskForm.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Priority:</span>
                    <Badge variant={taskForm.priority === 'High' ? 'destructive' : 'default'}>
                      {taskForm.priority}
                    </Badge>
                  </div>
                </div>
                
                {/* Project */}
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Project</h3>
                  <p className="text-base">
                    {projects.find(p => p.id === taskForm.projectId)?.name || 'Unknown project'}
                  </p>
                </div>
                
                {/* Assignee */}
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Assignee</h3>
                  <p className="text-base">
                    {(() => {
                      if (taskForm.assignedTo === 'none') return 'None';
                      
                      if (isLoadingMembers) {
                        return (
                          <span className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading...
                          </span>
                        );
                      }
                      
                      console.log('[PROJLY:TASK_DETAILS] Assignee lookup - taskForm.assignedTo:', taskForm.assignedTo);
                      console.log('[PROJLY:TASK_DETAILS] Assignee lookup - projectMembers:', projectMembers);
                      console.log('[PROJLY:TASK_DETAILS] Assignee lookup - taskForm.assignee:', taskForm.assignee);
                      
                      // First try to use the assignee object directly from taskForm if it exists
                      if (taskForm.assignee) {
                        console.log('[PROJLY:TASK_DETAILS] Using assignee from taskForm:', taskForm.assignee);
                        return taskForm.assignee.firstName && taskForm.assignee.lastName
                          ? `${taskForm.assignee.firstName} ${taskForm.assignee.lastName} - ${taskForm.assignee.email}`
                          : taskForm.assignee.email || 'Unknown user';
                      }
                      
                      // If no assignee in taskForm, try to find in project members
                      const assignee = projectMembers.find(m => m.userId === taskForm.assignedTo);
                      if (assignee?.user) {
                        console.log('[PROJLY:TASK_DETAILS] Found assignee in project members:', assignee.user);
                        return assignee.user.firstName && assignee.user.lastName
                          ? `${assignee.user.firstName} ${assignee.user.lastName} - ${assignee.user.email}`
                          : assignee.user.email || 'Unknown user';
                      }
                      
                      console.log('[PROJLY:TASK_DETAILS] No assignee found for ID:', taskForm.assignedTo);
                      return 'Unknown user';
                    })()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subtasks">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Sub-Tasks</CardTitle>
                  <Dialog open={isCreateSubTaskOpen} onOpenChange={setIsCreateSubTaskOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Sub-Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Create Sub-Task</DialogTitle>
                        <DialogDescription>
                          Add a new sub-task to "{taskForm.title}"
                        </DialogDescription>
                      </DialogHeader>
                      <CreateTaskForm
                        initialData={{
                          projectId: taskForm.projectId,
                          parentTaskId: taskId // Set current task as parent
                        }}
                        onSuccess={handleSubTaskCreated}
                        onCancel={() => setIsCreateSubTaskOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>Tasks that are part of this task</CardDescription>
              </CardHeader>
              <CardContent>
                {isRefreshingSubTasks ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-10 w-10 animate-spin" />
                  </div>
                ) : (
                  (() => {
                    // Custom grouping/order: n+1, then n+2 under each n+1
                    const n1Tasks = subTasks.filter(t => t.parentTaskId === taskId);
                    const n2Tasks = subTasks.filter(t => n1Tasks.some(n1 => n1.id === t.parentTaskId));
                    const displayTasks: Task[] = [];
                    n1Tasks.forEach(n1 => {
                      displayTasks.push(mapToTask(n1));
                      n2Tasks.filter(n2 => n2.parentTaskId === n1.id).forEach(n2 => {
                        displayTasks.push(mapToTask(n2));
                      });
                    });
                    log('Custom grouped displayTasks (n+1 and n+2 grouped)', displayTasks);
                    return (
                      <TasksContainer
                        context="task"
                        initialTasks={displayTasks}
                        autoLoad={false}
                        displayOptions={{
                          showHeader: false,
                          showAddButton: true,
                          compact: true,
                          title: "Subtasks"
                        }}
                        hierarchyOptions={{
                          maxDepth: 2,
                          showAllSubtasks: false
                        }}
                        tableParentTaskId={taskId}
                      />
                    );
                  })()
                )}
                {subTasks.length === 0 && !isRefreshingSubTasks && (
                  <div className="text-center text-muted-foreground pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateSubTaskOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Sub-Task
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent activity for this task</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* This would be populated from an activity log API */}
                  {taskForm.updatedAt && (
                    <div className="flex items-start gap-2 border-b pb-4">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Status updated to: {taskForm.status}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(taskForm.updatedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {taskForm.createdAt && (
                    <div className="flex items-start gap-2 border-b pb-4">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Task created</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(taskForm.createdAt).toLocaleString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the task "{taskForm.title}". 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isSubmitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Task'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
