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
import { TaskNotFoundUI } from "@/app/projly/components/tasks/TaskNotFoundUI";

interface TaskDetailsPageProps {
  // Props are no longer needed here since we'll use useParams
}


// Utility function to get all descendant tasks for a given parent taskId
function getTaskSubtree(tasks: ProjlyTaskData[], parentId: string, log: (msg: string, data?: any) => void): ProjlyTaskData[] {
  const subtree: ProjlyTaskData[] = [];
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [subTasks, setSubTasks] = useState<ProjlyTaskData[]>([]);
  const [isCreateSubTaskOpen, setIsCreateSubTaskOpen] = useState(false);
  const [isRefreshingSubTasks, setIsRefreshingSubTasks] = useState(false);
  // Add state for task not found error
  const [taskNotFound, setTaskNotFound] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);
  
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
        
        let taskData;
        try {
          log('Fetching task data');
          taskData = await projlyTasksService.getTask(taskId);
          log('Fetched task data', taskData);
          
          if (!taskData) {
            log('Task not found - null response');
            // Set task not found state instead of redirecting
            setTaskNotFound(true);
            setTaskError('Task not found or you do not have permission to view it');
            setIsLoading(false);
            return;
          }
          
          // Explicitly log timestamp fields for debugging
          const taskWithDates = taskData as any;
          log('Task timestamp fields', {
            createdAt: taskWithDates.createdAt,
            updatedAt: taskWithDates.updatedAt,
            createdAtType: taskWithDates.createdAt ? typeof taskWithDates.createdAt : 'undefined',
            updatedAtType: taskWithDates.updatedAt ? typeof taskWithDates.updatedAt : 'undefined'
          });
        } catch (error) {
          log('Error fetching task data', error);
          // Set task not found state for any API errors
          setTaskNotFound(true);
          setTaskError('Task not found or you do not have permission to view it');
          setIsLoading(false);
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
        console.log('[TASK_DETAILS] Current user:', currentUser);
        setCurrentUser(currentUser);
        
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
  
  
  // Refactored: Fetch all tasks and filter for the current task and its subtree
  const refreshSubTasks = async () => {
    try {
      setIsRefreshingSubTasks(true);
      log('Refreshing sub-tasks using main task list API');
      
      // First, we'll clear the subtasks to ensure the UI updates immediately
      setSubTasks([]);
      
      // Fetch fresh data from the API
      const allTasks = await projlyTasksService.getTasks();
      log('Fetched all tasks for subtask refresh', allTasks);
      
      // Find the current task
      const parentTask = allTasks.find(t => t.id === taskId);
      if (!parentTask) {
        log('Parent task not found in all tasks', { taskId });
        return; // We already cleared the subtasks above
      }
      
      // Get all descendants (n+1, n+2, ...)
      const subtree = getTaskSubtree(allTasks, taskId, log);
      log('Filtered subtree for current task', subtree);
      
      // Implementation of a reliable React state update pattern:
      // 1. First set empty array (already done above)
      // 2. Use a small timeout to ensure the UI has rendered the empty state
      // 3. Set the new state with a deep copy to ensure React detects changes
      setTimeout(() => {
        try {
          // Create a deep copy of the subtree to ensure React treats it as new data
          // This is important to force a re-render when tasks are deleted
          const subtreeCopy = JSON.parse(JSON.stringify(subtree));
          log('Setting subtasks with deep-copied data to force UI refresh', { count: subtreeCopy.length });
          setSubTasks(subtreeCopy as ProjlyTaskData[]);
        } catch (innerError) {
          console.error('[PROJLY:TASK_DETAILS] Error in deferred subtask update:', innerError);
          // Fallback in case the JSON operations fail
          setSubTasks([...subtree] as ProjlyTaskData[]);
        }
      }, 50); // Short delay to ensure the UI updates properly
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
  
  
  
  // Check if user has permission to delete the task
  const canDeleteTask = (): boolean => {
    if (!currentUser || !taskForm) {
      console.log("[TASK_DETAILS] Cannot check delete permission: missing user or task data");
      return false;
    }
    
    console.log('[TASK_DETAILS] Current user for permission check:', currentUser);
    console.log('[TASK_DETAILS] Task form for permission check:', taskForm);
    
    // Check if user has site_owner role or admin permissions, which always gets delete permission
    // Look for the role in different possible locations in the user object
    const userRole = currentUser.role || currentUser.userRole;
    const isSiteOwner = userRole === 'site_owner' || userRole === 'admin';
    
    // Log the role check for debugging
    console.log(`[TASK_DETAILS] User role check: role=${userRole}, isSiteOwner=${isSiteOwner}`);
    
    if (isSiteOwner) {
      console.log('[TASK_DETAILS] User is site_owner/admin, granting delete permission');
      return true;
    }
    
    // Handle the case where assignedTo is 'none' (meaning not assigned)
    if (taskForm.assignedTo === 'none' || taskForm.assignedTo === null || taskForm.assignedTo === undefined) {
      // If task is not assigned to anyone, check if user is project owner or has admin privileges
      // Check for project owner status in different possible fields
      const isProjectOwner = 
        !!currentUser.projectOwner || 
        !!currentUser.isProjectOwner || 
        userRole === 'site_owner' || 
        userRole === 'admin';
      
      console.log(`[TASK_DETAILS] Task is not assigned to anyone. User project owner status: ${isProjectOwner}`);
      
      if (isProjectOwner) {
        console.log('[TASK_DETAILS] User is project owner, granting delete permission for unassigned task');
        return true;
      }
      
      console.log('[TASK_DETAILS] Task not assigned and user is not project owner, denying permission');
      return false;
    }
    
    // Convert IDs to strings for safer comparison
    const userId = String(currentUser.id || '');
    const currentUserIdAlternative = String(currentUser.userId || ''); // Some places use userId instead of id
    
    // The task might store assignedTo differently than the user ID format
    const assignedToId = String(taskForm.assignedTo || '');
    const assigneeId = taskForm.assignee ? String(taskForm.assignee.id || '') : '';
    
    // Debug output of the values we're comparing
    console.log(`[TASK_DETAILS] Comparing userIds=${userId},${currentUserIdAlternative} with assignedToId=${assignedToId} and assigneeId=${assigneeId}`);
    
    // Check various ID formats since the application might use different ID formats in different places
    const isAssigned = 
      userId === assignedToId || 
      userId === assigneeId ||
      currentUserIdAlternative === assignedToId ||
      currentUserIdAlternative === assigneeId;
    
    console.log(`[TASK_DETAILS] Task ${taskForm.id} delete permission check: isAssigned=${isAssigned}`);
    
    return isAssigned;
  };

  // Handle task deletion
  const handleDelete = async () => {
    if (!canDeleteTask()) {
      console.log("[TASK_DETAILS] User does not have permission to delete the task");
      toast({
        title: 'Error',
        description: 'You do not have permission to delete this task.',
        variant: 'destructive'
      });
      return;
    }
    
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
  
  // Show task not found UI if the task doesn't exist
  if (taskNotFound) {
    log('Showing task not found UI');
    return (
      <DashboardLayout>
        <TaskNotFoundUI errorMessage={taskError || undefined} />
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6 w-full">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('[TASK_DETAILS] Back button clicked');
                handleIntelligentBackNavigation(router, taskId, log);
              }}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('[TASK_DETAILS] Edit button clicked');
                router.push(`/projly/tasks/${taskId}/edit`);
              }}
              className="ml-2"
              disabled={isSubmitting}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {/* Only show Delete button if user has permission */}
            {canDeleteTask() && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  console.log('[TASK_DETAILS] Delete button clicked');
                  setIsDeleteDialogOpen(true);
                }}
                className="ml-2"
                disabled={isSubmitting}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className="container mx-auto pb-4">
          <h1 className="text-3xl font-bold tracking-tight">{taskForm.title}</h1>
          <p className="text-muted-foreground">
            Task ID: {taskId}
          </p>
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
                    {(() => {
                      const project = projects.find(p => p.id === taskForm.projectId);
                      if (project) {
                        return (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto font-normal" 
                            onClick={() => router.push(`/projly/projects/${project.id}`)}
                          >
                            {project.name}
                          </Button>
                        );
                      }
                      return 'Unknown project';
                    })()}
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
                        key={`task-container-${subTasks.length}-${new Date().getTime()}`} // Force re-render on subtasks changes
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
                        onDataChange={async () => {
                          log('Subtask data changed (created/updated/deleted), refreshing subtasks list');
                          // Force a clean reload by clearing subtasks first
                          setSubTasks([]);
                          await refreshSubTasks();
                        }}
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
