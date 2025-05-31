'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { handleIntelligentBackNavigation, updateNavigationHistory } from "@/app/projly/utils/navigation-utils";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "../../../components/ui/date-picker";
import { projlyAuthService, projlyTasksService, projlyProjectsService } from '@/lib/services/projly';
import { useToast } from "@/components/ui/use-toast";
import { useAccessibleProjectMembers } from '@/lib/services/projly/use-members';

// Define type for project members
type ProjectMember = {
  id: string;
  teamId: string;
  userId: string;
  role?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

interface TaskEditPageProps {
  // Props are no longer needed here since we'll use useParams
}

export default function TaskEditPage({}: TaskEditPageProps) {
  // Use useParams to get the route parameters
  const params = useParams();
  const taskId = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [parentTasks, setParentTasks] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]); // Store all tasks before filtering
  const [showAllTasks, setShowAllTasks] = useState(false); // Toggle for showing all tasks vs only non-parent tasks
  
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
    parentTaskId: 'none', // Add parent task ID field with 'none' as default
    // For displaying only
    project: null as any,
    assignee: null as any
  });
  
  // Use the useAccessibleProjectMembers hook to get accessible members for the selected project
  const { data: projectMembers = [], isLoading: isLoadingMembers, error: membersError, refetch: refetchMembers } = 
    useAccessibleProjectMembers(taskForm.projectId || undefined) as { 
      data: ProjectMember[], 
      isLoading: boolean,
      error: any,
      refetch: () => Promise<any> 
    };
    
  // Log project members for debugging
  useEffect(() => {
    if (taskForm.projectId && projectMembers.length > 0) {
      console.log(`[PROJLY:EDIT_TASK] Loaded ${projectMembers.length} accessible members for project ${taskForm.projectId}`);
    } else if (taskForm.projectId && !isLoadingMembers && projectMembers.length === 0) {
      console.log(`[PROJLY:EDIT_TASK] No accessible members found for project ${taskForm.projectId}`);
    }
  }, [taskForm.projectId, projectMembers, isLoadingMembers]);
  
  // Load parent tasks when project changes
  useEffect(() => {
    const loadParentTasks = async () => {
      if (!taskForm.projectId) return;
      
      try {
        log('Loading parent tasks for project:', taskForm.projectId);
        const tasks = await projlyTasksService.getProjectTasks(taskForm.projectId);
        
        // Filter out the current task itself (can't be its own parent)
        const availableTasks = tasks.filter((task: any) => task.id !== taskId);
        
        // Store all available tasks
        setAllTasks(availableTasks);
        
        // Apply filter based on toggle state
        if (showAllTasks) {
          setParentTasks(availableTasks);
          log('Loaded all tasks as potential parents:', availableTasks.length);
        } else {
          // Only show tasks without parents
          const nonParentTasks = availableTasks.filter((task: any) => !task.parentTaskId);
          setParentTasks(nonParentTasks);
          log('Loaded non-parent tasks as potential parents:', nonParentTasks.length);
        }
      } catch (error) {
        console.error(`[PROJLY:TASK_EDIT:${taskId}] Error loading parent tasks:`, error);
        toast({
          title: 'Error',
          description: 'Failed to load parent tasks. Please try again.',
          variant: 'destructive'
        });
      }
    };

    loadParentTasks();
  }, [taskForm.projectId, taskId, toast, showAllTasks]);
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:TASK_EDIT:${taskId}] ${message}`, data);
    } else {
      console.log(`[PROJLY:TASK_EDIT:${taskId}] ${message}`);
    }
  };
  
  // Track navigation history in session storage using our utility function
  useEffect(() => {
    // Add current path to navigation history
    const currentPath = `/projly/tasks/${taskId}/edit`;
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
        log('Raw task data:', taskData);
        
        // Parse dates properly
        let dueDate = null;
        if (taskData.dueDate) {
          dueDate = new Date(taskData.dueDate);
          log('Parsed dueDate:', dueDate);
        }
        
        let startDate = null;
        // If the API has startDate, parse it
        if (taskData.startDate) {
          startDate = new Date(taskData.startDate);
          log('Parsed startDate:', startDate);
        }
        
        const formattedTask = {
          id: taskData.id,
          title: taskData.title || '',
          description: taskData.description || '',
          projectId: taskData.projectId || '',
          status: taskData.status || 'Not Started',
          priority: taskData.priority || 'Medium',
          assignedTo: taskData.assigneeId || 'none',
          parentTaskId: taskData.parentTaskId || 'none', // Include parentTaskId, default to 'none' if not present
          startDate: startDate,
          dueDate: dueDate,
          // For displaying purposes
          project: taskData.project || null,
          assignee: taskData.assignee || null
        };
        
        log('Formatted task for form:', formattedTask);
        setTaskForm(formattedTask);
        
        // Get projects for dropdown
        const projectsData = await projlyProjectsService.getProjects();
        setProjects(projectsData);
        log('Projects loaded:', projectsData.length);
        
      } catch (error) {
        console.error(`[PROJLY:TASK_EDIT:${taskId}] Error loading task:`, error);
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
    
    // If project ID changes, trigger a refetch of project members
    if (field === 'projectId') {
      log(`Project ID changed to: ${value}, will fetch members for this project`);
      
      // Reset assignee when project changes
      setTaskForm(prev => ({
        ...prev,
        assignedTo: 'none' // Reset to none when project changes
      }));
      
      // Force refetch of members for the new project
      setTimeout(() => {
        log('Triggering refetch of project members');
        refetchMembers().then(result => {
          log(`Refetched ${result?.data?.length || 0} members for project ${value}`);
        }).catch(err => {
          console.error(`[PROJLY:TASK_EDIT:${taskId}] Error refetching members:`, err);
        });
      }, 100); // Small timeout to ensure state is updated
    }
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
        // Convert 'none' to null or undefined for the API
        assignedTo: taskForm.assignedTo === 'none' ? null : taskForm.assignedTo,
        // For parentTaskId, convert 'none' to undefined (not null) as the API expects
        parentTaskId: taskForm.parentTaskId === 'none' ? undefined : taskForm.parentTaskId, 
        startDate: taskForm.startDate ? taskForm.startDate.toISOString() : undefined,
        dueDate: taskForm.dueDate ? taskForm.dueDate.toISOString() : undefined
      };
      
      // Use object destructuring to format the task data for the API correctly
      const { project, assignee, assignedTo, parentTaskId, startDate, dueDate, projectId, ...taskBasicData } = formattedTask;
      
      // Add detailed logging for debugging
      log('Preparing task data for update:', {
        assignedTo,
        parentTaskId,
        projectId,
        startDate,
        dueDate,
        ...taskBasicData
      });
      
      // Create an update payload that matches the TaskUpdateInput interface
      const updatePayload = {
        ...taskBasicData,
        projectId: projectId,     // Explicitly include projectId in the update
        assigneeId: assignedTo,   // This is the key field the backend expects
        parentTaskId: parentTaskId, // Include the parentTaskId in the update
        startDate: startDate,
        dueDate: dueDate
      };
      
      log('Final update payload being sent to API:', updatePayload);
      
      await projlyTasksService.updateTask(taskId, updatePayload);
      log('Task updated successfully');
      
      toast({
        title: 'Success',
        description: 'Task updated successfully'
      });
      
      // Navigate back to task details page
      router.push(`/projly/tasks/${taskId}`);
      
    } catch (error) {
      console.error(`[PROJLY:TASK_EDIT:${taskId}] Error updating task:`, error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update task. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
      log('Form submission completed');
    }
  };
  
  // Show loading state using the centralized PageLoading component
  if (isLoading) {
    log('Showing loading state');
    return <PageLoading logContext="PROJLY:TASK_EDIT" />;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleIntelligentBackNavigation(router, taskId, log)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Task
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
          <p className="text-muted-foreground">Update task details</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <CardDescription>Edit the details for your task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={taskForm.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Task title"
                  required
                />
              </div>
              
              {/* Description */}
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={taskForm.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Task description"
                  className="min-h-[100px]"
                />
              </div>
              
              {/* Project Selection */}
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={taskForm.projectId}
                  onValueChange={(value) => handleChange('projectId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Assignee Selection */}
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="assignee">Assignee</Label>
                <Select
                  value={taskForm.assignedTo}
                  onValueChange={(value) => handleChange('assignedTo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an assignee (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* No selection option - using "none" instead of empty string */}
                    <SelectItem value="none">None</SelectItem>
                    
                    {/* Show loading state if fetching members */}
                    {isLoadingMembers ? (
                      <div className="px-2 py-1 text-sm">
                        <PageLoading 
                          standalone={true} 
                          logContext="PROJLY:TASK_EDIT:MEMBERS" 
                          height="5vh" 
                        />
                      </div>
                    ) : projectMembers.length > 0 ? (
                      // Show project members if available
                      projectMembers.map((member: ProjectMember) => (
                        <SelectItem key={member.userId} value={member.userId}>
                            {member.user?.name?.trim() || member.user?.lastName?.trim() ? `${member.user?.name} - ${member.user?.email}` 
                              : member.user?.email || 'Unknown user'}
                        </SelectItem> 
                      ))
                    ) : (
                      // Show message if no members found
                      <div className="px-2 py-1 text-sm text-muted-foreground">
                        No team members found for this project
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Parent Task Selection */}
              <div className="grid w-full items-center gap-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="parentTaskId">Parent Task (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="show-all-tasks" className="text-xs text-muted-foreground cursor-pointer">
                      {showAllTasks ? "Showing all tasks" : "Showing only top-level tasks"}
                    </Label>
                    <Switch
                      id="show-all-tasks"
                      checked={showAllTasks}
                      onCheckedChange={(checked: boolean) => {
                        setShowAllTasks(checked);
                        console.log(`[PROJLY:TASK_EDIT] Toggle show all tasks: ${checked}`);
                      }}
                    />
                  </div>
                </div>
                <Select
                  value={taskForm.parentTaskId}
                  onValueChange={(value) => handleChange('parentTaskId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Parent Task</SelectItem>
                    {parentTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={taskForm.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="In Review">In Review</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={taskForm.priority}
                    onValueChange={(value) => handleChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Start Date */}
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <DatePicker
                    date={taskForm.startDate}
                    setDate={(date) => handleChange('startDate', date)}
                  />
                </div>
                
                {/* Due Date */}
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <DatePicker
                    date={taskForm.dueDate}
                    setDate={(date) => handleChange('dueDate', date)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/projly/tasks/${taskId}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
