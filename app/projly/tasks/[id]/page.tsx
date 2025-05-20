'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { Loader2, ArrowLeft, Save, Trash, Clock, Calendar, Edit } from "lucide-react";
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
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { projlyAuthService, projlyTasksService, projlyProjectsService } from '@/lib/services/projly';
import { useProjectMembers } from '@/lib/services/projly/use-projects';
import { useToast } from "@/components/ui/use-toast";
import { Task } from "@/app/projly/components/tasks/TasksTable";

interface TaskDetailsPageProps {
  // Props are no longer needed here since we'll use useParams
}

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
        console.log('[PROJLY:TASK_DETAILS] Task assigneeId:', taskData.assigneeId);
        
        const formattedTask = {
          id: taskData.id,
          title: taskData.title || '',
          description: taskData.description || '',
          projectId: taskData.projectId || '',
          status: taskData.status || 'Not Started',
          priority: taskData.priority || 'Medium',
          assignedTo: taskData.assigneeId || 'none',
          startDate: taskData.startDate ? new Date(taskData.startDate) : null,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
          createdAt: taskData.createdAt ? new Date(taskData.createdAt) : new Date(),
          updatedAt: taskData.updatedAt ? new Date(taskData.updatedAt) : new Date(),
          // For displaying purposes
          project: taskData.project || null,
          assignee: taskData.assignee || null
        };
        
        // Log assignee information for debugging
        console.log('[PROJLY:TASK_DETAILS] Formatted task assignee:', formattedTask.assignee);
        console.log('[PROJLY:TASK_DETAILS] Formatted task assignedTo:', formattedTask.assignedTo);
        
        console.log('[PROJLY:TASK_DETAILS] Task timestamps:', {
          createdAt: formattedTask.createdAt,
          updatedAt: formattedTask.updatedAt
        });
        
        console.log('[PROJLY:TASK_DETAILS] Formatted task for form:', formattedTask);
        setTaskForm(formattedTask);
        
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
        if (formattedTask.projectId) {
          log('Loading project members for project:', formattedTask.projectId);
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
      const formattedTask = {
        ...taskForm,
        startDate: taskForm.startDate ? taskForm.startDate.toISOString() : undefined,
        dueDate: taskForm.dueDate ? taskForm.dueDate.toISOString() : undefined
      };
      
      // Use object destructuring to format the task data for the API correctly
      // and avoid duplicate id field
      const { project, assignee, assignedTo, startDate, dueDate, ...taskBasicData } = formattedTask;
      
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
      
      await projlyTasksService.updateTask(taskId, {
        ...taskBasicData,
        assigneeId: assigneeIdForApi,
        dueDate: dueDate && typeof dueDate === 'object' && dueDate !== null ? (dueDate as Date).toISOString() : dueDate
      });
      log('Task updated successfully');
      
      toast({
        title: 'Success',
        description: 'Task updated successfully'
      });
      
      // Refresh the task data
      const updatedTask = await projlyTasksService.getTask(taskId);
      
      if (updatedTask) {
        // Convert API task model to form state model
        setTaskForm({
          id: updatedTask.id,
          title: updatedTask.title || '',
          description: updatedTask.description || '',
          projectId: updatedTask.projectId || '',
          status: updatedTask.status || 'Not Started',
          priority: updatedTask.priority || 'Medium',
          assignedTo: updatedTask.assigneeId || 'none',
          startDate: updatedTask.startDate ? new Date(updatedTask.startDate) : null,
          dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate) : null,
          createdAt: updatedTask.createdAt ? new Date(updatedTask.createdAt) : new Date(),
          updatedAt: updatedTask.updatedAt ? new Date(updatedTask.updatedAt) : new Date(),
          // For displaying purposes
          project: updatedTask.project || null,
          assignee: updatedTask.assignee || null
        });
        
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
  
  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/projly/tasks')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
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
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
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
                          ? `${taskForm.assignee.firstName} ${taskForm.assignee.lastName}`
                          : taskForm.assignee.email || 'Unknown user';
                      }
                      
                      // If no assignee in taskForm, try to find in project members
                      const assignee = projectMembers.find(m => m.userId === taskForm.assignedTo);
                      if (assignee?.user) {
                        console.log('[PROJLY:TASK_DETAILS] Found assignee in project members:', assignee.user);
                        return assignee.user.firstName && assignee.user.lastName
                          ? `${assignee.user.firstName} ${assignee.user.lastName}`
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
