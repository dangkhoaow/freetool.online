'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { handleIntelligentBackNavigation, updateNavigationHistory } from "@/app/projly/utils/navigation-utils";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { projlyAuthService, projlyTasksService, projlyProjectsService } from '@/lib/services/projly';
import { useProjectMembers } from '@/lib/services/projly/use-projects';
import { useToast } from "@/components/ui/use-toast";

// Import reusable components for task details
import {
  TaskActionButtons,
  TaskHeader,
  TaskDetailsContent,
  ActivityContent,
  SubTasksContent,
  TaskDeleteDialog,
  AdditionalInfoContent
} from "@/app/projly/components/tasks/details";

// Fix for type error with related tasks
// This matches the props for AdditionalInfoContent component
interface AdditionalTaskInfo {
  id: string;
  title?: string;
  percentProgress?: number | null;
  label?: string | null;
  relatedTasks?: string[] | Array<{id: string; title: string}> | null;
  relatedToTasks?: Array<{relatedTaskId?: string; relatedTask?: {id?: string; title?: string}}>;
  relatedFromTasks?: Array<{taskId?: string; task?: {id?: string; title?: string}}>;
  [key: string]: any; // Allow any additional properties
}

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
  percentProgress?: number | null;
  label?: string | null;
  relatedTasks?: string[] | Array<{id: string; title: string}>;
  relatedToTasks?: Array<{relatedTask: {id: string; title: string}}>;
  relatedFromTasks?: Array<{task: {id: string; title: string}}>;
  [key: string]: any; // Allow any additional properties
};

// Import the Task type just for reference, but we'll use our custom type for actual work
import { Task } from "@/app/projly/components/tasks/TasksTable";
import { CreateTaskForm } from "@/app/projly/components/tasks/CreateTaskForm";
import { TasksContainer } from "@/app/projly/components/tasks/TasksContainer";
import { TaskNotFoundUI } from "@/app/projly/components/tasks/TaskNotFoundUI";

interface TaskDetailsPageProps {
  // Optional id for direct usage in dialog mode
  id?: string;
  // Flag to indicate if component is being used in dialog mode
  inDialogMode?: boolean;
  // Optional callback for when dialog is closed
  onDialogClose?: () => void;
}

// Utility function to get all descendant tasks for a given parent taskId
function getTaskSubtree(tasks: ProjlyTaskData[], parentId: string, log: (msg: string, data?: any) => void): ProjlyTaskData[] {
  const subtree: ProjlyTaskData[] = [];
  log(`Getting subtree for parentId: ${parentId}`);
  
  // Find direct children
  const children = tasks.filter(task => task.parentTaskId === parentId);
  log(`Found ${children.length} direct children for parentId: ${parentId}`);
  
  // Add each child and recursively get their children
  children.forEach(child => {
    subtree.push(child);
    log(`Added child task to subtree: ${child.id}`);
    const grandChildren = getTaskSubtree(tasks, child.id, log);
    log(`Found ${grandChildren.length} descendants for child: ${child.id}`);
    subtree.push(...grandChildren);
  });
  
  log(`Returning subtree with ${subtree.length} total tasks for parentId: ${parentId}`);
  return subtree;
}

// Utility function to get subtasks up to a certain depth
function getSubTasksUpToDepth(tasks: ProjlyTaskData[], parentId: string, maxDepth: number, currentDepth: number = 0): ProjlyTaskData[] {
  const filteredTasks: ProjlyTaskData[] = [];
  if (currentDepth >= maxDepth) return filteredTasks;
  
  // Find direct children
  const children = tasks.filter(task => task.parentTaskId === parentId);
  
  // Add each child and recursively get their children up to maxDepth
  children.forEach(child => {
    filteredTasks.push(child);
    const grandChildren = getSubTasksUpToDepth(tasks, child.id, maxDepth, currentDepth + 1);
    filteredTasks.push(...grandChildren);
  });
  
  return filteredTasks;
}

// Utility to map ProjlyTaskData to Task type to satisfy type requirements
function mapToTask(taskData: ProjlyTaskData): Task {
  return {
    id: taskData.id,
    title: taskData.title,
    description: taskData.description || '',
    status: taskData.status || 'Not Started',
    startDate: taskData.startDate ? taskData.startDate.toString() : undefined,
    dueDate: taskData.dueDate ? taskData.dueDate.toString() : undefined,
    projectId: taskData.projectId,
    project: taskData.project
      ? { id: taskData.project.id, name: taskData.project.name }
      : undefined,
    parentTaskId: taskData.parentTaskId || undefined,
    assignedTo: taskData.assignedTo,
    assignee: taskData.assignee,
    percentProgress: taskData.percentProgress !== undefined ? Number(taskData.percentProgress) : undefined,
    label: taskData.label || undefined,
    relatedTasks: taskData.relatedTasks || []
  };
}

export default function TaskDetailsPage({ id, inDialogMode = false, onDialogClose }: TaskDetailsPageProps) {
  // Use useParams to get the route parameters if not in dialog mode
  const params = useParams();
  const taskId = id || (params?.id as string);
  
  // Log component initialization
  console.log(`[PROJLY:TASK_DETAILS_PAGE] Initializing with taskId: ${taskId}, inDialogMode: ${inDialogMode}`);
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
  const [parentTask, setParentTask] = useState<ProjlyTaskData | null>(null);
  // Add state for task not found error
  const [taskNotFound, setTaskNotFound] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);
  
  // Function to handle back navigation or dialog close
  const handleBackClick = () => {
    console.log(`[PROJLY:TASK_DETAILS_PAGE] Back/Close button clicked, inDialogMode: ${inDialogMode}`);
    if (inDialogMode && onDialogClose) {
      console.log(`[PROJLY:TASK_DETAILS_PAGE] Closing dialog via back button`);
      onDialogClose();
    } else {
      console.log(`[PROJLY:TASK_DETAILS_PAGE] Navigating back`);
      handleIntelligentBackNavigation(router, taskId, (msg) => console.log(`[PROJLY:TASK_DETAILS_PAGE] ${msg}`));
    }
  };
  
  // Task form state
  const [taskForm, setTaskForm] = useState<{
    id: string;
    title: string;
    description: string;
    projectId: string;
    status: string;
    priority: string;
    assignedTo: string;
    startDate: Date | null;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    project: any;
    assignee: any;
    parentTaskId?: string | null;
    percentProgress: number | null;
    label: string | null;
    relatedTasks: string[];
    _rawData?: any;
  }>({
    id: '',
    title: '',
    description: '',
    projectId: '',
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: 'none',
    startDate: null,
    dueDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    project: null,
    assignee: null,
    parentTaskId: null,
    percentProgress: 0,
    label: null,
    relatedTasks: []
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
  const initCalled = useRef(false);
  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;
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
          parentTaskId?: string | null;
          percentProgress?: string;
          label?: string;
          relatedTasks?: string[];
          relatedToTasks?: any[];
          relatedFromTasks?: any[];
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
          assignee: taskWithAllFields.assignee,
          parentTaskId: taskWithAllFields.parentTaskId || null,
          percentProgress: taskWithAllFields.percentProgress !== undefined ? Number(taskWithAllFields.percentProgress) : 0,
          label: taskWithAllFields.label || null,
          relatedTasks: (() => {
            // Process related tasks to extract IDs
            const relatedTaskIds: string[] = [];
            
            // Process tasks from relatedTasks array (if available)
            if (taskWithAllFields.relatedTasks && Array.isArray(taskWithAllFields.relatedTasks)) {
              taskWithAllFields.relatedTasks.forEach((task: any) => {
                if (typeof task === 'string') {
                  relatedTaskIds.push(task);
                } else if (task && typeof task === 'object' && task.id) {
                  relatedTaskIds.push(task.id);
                }
              });
            }
            
            // Process tasks from relatedToTasks array (if available)
            if (taskWithAllFields.relatedToTasks && Array.isArray(taskWithAllFields.relatedToTasks)) {
              taskWithAllFields.relatedToTasks.forEach((relation: any) => {
                if (relation && relation.relatedTask && relation.relatedTask.id) {
                  if (!relatedTaskIds.includes(relation.relatedTask.id)) {
                    relatedTaskIds.push(relation.relatedTask.id);
                  }
                }
              });
            }
            
            // Process tasks from relatedFromTasks array (if available)
            if (taskWithAllFields.relatedFromTasks && Array.isArray(taskWithAllFields.relatedFromTasks)) {
              taskWithAllFields.relatedFromTasks.forEach((relation: any) => {
                if (relation && relation.task && relation.task.id) {
                  if (!relatedTaskIds.includes(relation.task.id)) {
                    relatedTaskIds.push(relation.task.id);
                  }
                }
              });
            }
            
            log('Extracted related task IDs:', relatedTaskIds);
            return relatedTaskIds;
          })(),
          _rawData: taskData
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
        log('Set taskForm with parentTaskId', { parentTaskId: formData.parentTaskId });
        
        // If there's a parentTaskId, fetch the parent task details
        if (formData.parentTaskId) {
          try {
            log('Fetching parent task details', { parentTaskId: formData.parentTaskId });
            const parentTaskData = await projlyTasksService.getTask(formData.parentTaskId);
            if (parentTaskData) {
              log('Parent task found', parentTaskData);
              setParentTask(parentTaskData);
            }
          } catch (error) {
            console.error('[PROJLY:TASK_DETAILS] Error fetching parent task:', error);
          }
        }
        
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

      // Fetch fresh data from the API
      const allTasks = await projlyTasksService.getTasks();
      log('Fetched all tasks for subtask refresh', allTasks);

      // Find current task and its descendant subtree
      const subtree = getTaskSubtree(allTasks, taskId, log);
      log('Filtered subtree for current task', subtree);

      // Directly update state with a deep copy for React change detection
      const subtreeCopy = JSON.parse(JSON.stringify(subtree));
      setSubTasks(subtreeCopy as ProjlyTaskData[]);
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
  
  // Conditional rendering based on dialog mode
  const renderContent = () => (
    <div className={inDialogMode ? "" : "container mx-auto py-6"}>
      <TaskActionButtons 
        onBackClick={handleBackClick}
        onEditClick={() => {
          console.log('[TASK_DETAILS] Edit button clicked');
          router.push(`/projly/tasks/${taskId}/edit`);
        }}
        onDeleteClick={() => {
          console.log('[TASK_DETAILS] Delete button clicked');
          setIsDeleteDialogOpen(true);
        }}
        isDialogMode={inDialogMode}
        canDelete={canDeleteTask()}
        isSubmitting={isSubmitting}
      />

      <TaskHeader title={taskForm.title} taskId={taskId} />
      
      <Tabs defaultValue="details" value={activeTab} onValueChange={(value) => {
        console.log(`[PROJLY:TASK_DETAILS:${taskId}] Tab changed to:`, value);
        setActiveTab(value);
      }}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="additional">Additional Info</TabsTrigger>
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
            <CardContent>
              <TaskDetailsContent 
                task={taskForm}
                projects={projects}
                projectMembers={projectMembers}
                parentTask={parentTask}
                isLoadingMembers={isLoadingMembers}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="additional">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>View additional task details</CardDescription>
            </CardHeader>
            <CardContent>
              <AdditionalInfoContent
                task={{
                  id: taskForm.id,
                  title: taskForm.title,
                  percentProgress: taskForm.percentProgress,
                  label: taskForm.label,
                  relatedTasks: taskForm.relatedTasks,
                  // Pass these fields directly from the raw task data if available
                  relatedToTasks: taskForm._rawData?.relatedToTasks,
                  relatedFromTasks: taskForm._rawData?.relatedFromTasks
                } as AdditionalTaskInfo}
                allTasks={(() => {
                  // Define a type that includes label property
                  type ExtendedTask = {
                    id: string;
                    title: string;
                    label?: string | null;
                  };

                  // Create a list of all known tasks for related task resolution
                  const allKnownTasks: ExtendedTask[] = [
                    // Include current task
                    { 
                      id: taskId, 
                      title: taskForm.title,
                      label: taskForm.label
                    },
                    // Include all sub-tasks we're aware of
                    ...subTasks.map(task => ({ 
                      id: task.id, 
                      title: task.title,
                      label: task.label || null
                    })),
                  ];
                  
                  // Add related tasks from relatedToTasks if available
                  if (taskForm._rawData?.relatedToTasks && Array.isArray(taskForm._rawData.relatedToTasks)) {
                    taskForm._rawData.relatedToTasks.forEach((relation: any) => {
                      if (relation.relatedTask && relation.relatedTask.id) {
                        // Only add if not already in the list
                        if (!allKnownTasks.some(task => task.id === relation.relatedTask.id)) {
                          allKnownTasks.push({
                            id: relation.relatedTask.id,
                            title: relation.relatedTask.title || 'Unnamed task',
                            label: relation.relatedTask.label || null
                          });
                        }
                      }
                    });
                  }
                  
                  // Add related tasks from relatedFromTasks if available
                  if (taskForm._rawData?.relatedFromTasks && Array.isArray(taskForm._rawData.relatedFromTasks)) {
                    taskForm._rawData.relatedFromTasks.forEach((relation: any) => {
                      if (relation.task && relation.task.id) {
                        // Only add if not already in the list
                        if (!allKnownTasks.some(task => task.id === relation.task.id)) {
                          allKnownTasks.push({
                            id: relation.task.id,
                            title: relation.task.title || 'Unnamed task',
                            label: relation.task.label || null
                          });
                        }
                      }
                    });
                  }
                  
                  // Also check relatedTasks array for complete task objects
                  if (taskForm._rawData?.relatedTasks && Array.isArray(taskForm._rawData.relatedTasks)) {
                    taskForm._rawData.relatedTasks.forEach((relatedTask: any) => {
                      if (typeof relatedTask === 'object' && relatedTask && relatedTask.id) {
                        // Only add if not already in the list
                        if (!allKnownTasks.some(task => task.id === relatedTask.id)) {
                          allKnownTasks.push({
                            id: relatedTask.id,
                            title: relatedTask.title || 'Unnamed task',
                            label: relatedTask.label || null
                          });
                        }
                      }
                    });
                  }
                  
                  log('Created allKnownTasks list for AdditionalInfoContent', allKnownTasks);
                  return allKnownTasks;
                })()}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subtasks">
          <Card>
            <CardContent className="mt-4">
              <SubTasksContent 
                subTasks={getSubTasksUpToDepth(subTasks, taskId, 2).map(mapToTask) as any}
                parentTaskId={taskId}
                parentProjectId={taskForm.projectId}
                onCreateSubTaskClick={() => setIsCreateSubTaskOpen(true)}
                onSubTasksChange={() => {
                  console.log('[TASK_DETAILS] Subtask deleted, refreshing list');
                  refreshSubTasks();
                }}
              />
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
              <ActivityContent 
                updatedAt={taskForm.updatedAt}
                createdAt={taskForm.createdAt}
                status={taskForm.status}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <TaskDeleteDialog 
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onDelete={handleDelete}
        taskTitle={taskForm.title}
        isSubmitting={isSubmitting}
      />

      <Dialog open={isCreateSubTaskOpen} onOpenChange={setIsCreateSubTaskOpen}>
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
  );
  
  // Return the content wrapped in DashboardLayout if not in dialog mode
  return inDialogMode ? renderContent() : (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
}
