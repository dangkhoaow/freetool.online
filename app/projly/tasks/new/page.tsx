'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { projlyAuthService, projlyTasksService, projlyProjectsService } from '@/lib/services/projly';
import { useToast } from "@/components/ui/use-toast";
import { useAccessibleProjectMembers } from '@/lib/services/projly/use-members';

// Import form field components
import {
  TitleField,
  DescriptionField,
  ProjectField,
  StatusField,
  PriorityField,
  AssigneeField,
  ParentTaskField,
  DateField,
  FormButtons,
  RelatedTasksField,
  ProgressField,
  LabelField
} from "../../components/tasks/form-fields";

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

export default function NewTaskPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [parentTasks, setParentTasks] = useState<any[]>([]);
  
  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    projectId: '',
    status: 'Not Started',
    assignedTo: 'none', // Using 'none' instead of empty string for the Select component
    startDate: null as Date | null,
    dueDate: null as Date | null,
    priority: 'Medium',
    parentTaskId: 'none', // Add parent task ID field
    percentProgress: 0, // Add progress percentage field
    label: null as string | null, // Add label field
    relatedTasks: [] as string[] // Add related tasks field
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
      console.log(`[PROJLY:NEW_TASK] Loaded ${projectMembers.length} accessible members for project ${taskForm.projectId}`);
    } else if (taskForm.projectId && !isLoadingMembers && projectMembers.length === 0) {
      console.log(`[PROJLY:NEW_TASK] No accessible members found for project ${taskForm.projectId}`);
    }
  }, [taskForm.projectId, projectMembers, isLoadingMembers]);
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:NEW_TASK] ${message}`, data);
    } else {
      console.log(`[PROJLY:NEW_TASK] ${message}`);
    }
  };
  
  // Check authentication and load projects and users on page load
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
        
        log('Fetching projects and users for task creation');
        
        // Get all projects
        const projectsData = await projlyProjectsService.getProjects();
        setProjects(projectsData);
        log('Projects loaded:', projectsData.length);
        
        // Get current user as default assignee
        const currentUser = await projlyAuthService.getCurrentUser();
        if (currentUser) {
          setTaskForm(prev => ({
            ...prev,
            assignedTo: currentUser.id
          }));
          
          // Set default project if there are projects
          if (projectsData.length > 0) {
            setTaskForm(prev => ({
              ...prev,
              projectId: projectsData[0].id,
              assignedTo: 'none' // Ensure assignedTo is initialized with 'none'
            }));
          }
        }
        
        // Get team members for assignee selection
        // This would typically come from a teams service
        // For now we'll use a placeholder
        const teamMembers = [currentUser].filter(Boolean);
        setUsers(teamMembers);
        
        log('Form initialized with default values');
      } catch (error) {
        console.error('[PROJLY:NEW_TASK] Error initializing page:', error);
        toast({
          title: 'Error',
          description: 'Failed to load page data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
        log('Page initialization completed');
      }
    };
    
    initPage();
  }, [router, toast]);
  
  // Load parent tasks when project changes
  useEffect(() => {
    const loadParentTasks = async () => {
      if (!taskForm.projectId) return;
      
      try {
        log('Loading parent tasks for project:', taskForm.projectId);
        const tasks = await projlyTasksService.getProjectTasks(taskForm.projectId);
        // Filter out tasks that already have a parent (they can't be parent tasks)
        const availableParentTasks = tasks.filter((task: any) => !task.parentTaskId);
        setParentTasks(availableParentTasks);
        log('Loaded parent tasks:', availableParentTasks.length);
      } catch (error) {
        console.error('[PROJLY:NEW_TASK] Error loading parent tasks:', error);
        toast({
          title: 'Error',
          description: 'Failed to load parent tasks. Please try again.',
          variant: 'destructive'
        });
      }
    };

    loadParentTasks();
  }, [taskForm.projectId, toast]);
  
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
          console.error('[PROJLY:NEW_TASK] Error refetching members:', err);
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
      log('Submitting new task:', taskForm);
      
      // Format dates for API and handle 'none' value for assignedTo and parentTaskId
      const formattedTask = {
        ...taskForm,
        // Convert 'none' to null or undefined for the API
        assignedTo: taskForm.assignedTo === 'none' ? null : taskForm.assignedTo,
        parentTaskId: taskForm.parentTaskId === 'none' ? null : taskForm.parentTaskId,
        startDate: taskForm.startDate ? taskForm.startDate.toISOString() : undefined,
        dueDate: taskForm.dueDate ? taskForm.dueDate.toISOString() : undefined,
        // Add percentProgress, label, and relatedTasks to the API request
        percentProgress: taskForm.percentProgress,
        label: taskForm.label,
        relatedTasks: taskForm.relatedTasks.length > 0 ? taskForm.relatedTasks : undefined
      };
      
      log('Formatted task for submission:', formattedTask);
      
      await projlyTasksService.createTask(formattedTask);
      log('Task created successfully');
      
      toast({
        title: 'Success',
        description: 'Task created successfully'
      });
      
      // Navigate back to tasks list
      router.push('/projly/tasks');
    } catch (error) {
      console.error('[PROJLY:NEW_TASK] Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return <PageLoading logContext="PROJLY:NEW_TASK" />;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/projly/tasks')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
        </div>

        <div className="container mx-auto pb-6">
          <h1 className="text-3xl font-bold tracking-tight">New Task</h1>
          <p className="text-muted-foreground">Create a new task for your project</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent>
              <div className="space-y-4 pt-4">
                {/* Title field component */}
                <TitleField 
                  value={taskForm.title}
                  onChange={(value) => handleChange('title', value)}
                />
                
                {/* Description field component */}
                <DescriptionField 
                  value={taskForm.description}
                  onChange={(value) => handleChange('description', value)}
                />
                
                {/* Project field component */}
                <ProjectField 
                  value={taskForm.projectId}
                  projects={projects}
                  onChange={(value) => handleChange('projectId', value)}
                />
                
                {/* Status field component */}
                <StatusField 
                  value={taskForm.status}
                  onChange={(value) => handleChange('status', value)}
                />
                
                {/* Priority field component */}
                <PriorityField 
                  value={taskForm.priority}
                  onChange={(value) => handleChange('priority', value)}
                />
                
                {/* Assignee field component */}
                <AssigneeField 
                  value={taskForm.assignedTo}
                  projectMembers={projectMembers}
                  isLoadingMembers={isLoadingMembers}
                  onChange={(value) => handleChange('assignedTo', value)}
                />
                
                {/* Parent task field component */}
                <ParentTaskField 
                  value={taskForm.parentTaskId}
                  parentTasks={parentTasks}
                  onChange={(value) => handleChange('parentTaskId', value)}
                />
                
                {/* Start date field component */}
                <DateField 
                  label="Start Date"
                  id="startDate"
                  date={taskForm.startDate}
                  setDate={(date) => handleChange('startDate', date)}
                />
                
                {/* Due date field component */}
                <DateField 
                  label="Due Date"
                  id="dueDate"
                  date={taskForm.dueDate}
                  setDate={(date) => handleChange('dueDate', date)}
                />
                
                <ProgressField
                  value={taskForm.percentProgress}
                  onChange={(value: number) => handleChange('percentProgress', value)}
                />
                
                <LabelField
                  value={taskForm.label}
                  onChange={(value: string) => handleChange('label', value)}
                />
                
                <RelatedTasksField
                  value={taskForm.relatedTasks}
                  onChange={(value: string[]) => handleChange('relatedTasks', value)}
                  availableTasks={parentTasks}
                  isLoading={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              {/* Form buttons component */}
              <FormButtons 
                isSubmitting={isSubmitting}
                onCancel={() => router.push('/projly/tasks')}
              />
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
