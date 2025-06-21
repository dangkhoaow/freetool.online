'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { projlyAuthService, projlyTasksService, projlyProjectsService } from '@/lib/services/projly';
import { useToast } from "@/components/ui/use-toast";
import { useAccessibleProjectMembers } from '@/lib/services/projly/use-members';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/app/projly/components/ui/breadcrumb";

// Import reusable form field components
import {
  TitleField,
  DescriptionField,
  ProjectField,
  StatusField,
  PriorityField,
  AssigneeField,
  ParentTaskFieldWithToggle,
  DateField,
  EditFormButtons,
  RelatedTasksField,
  ProgressField,
  LabelField
} from "../../../components/tasks/form-fields";

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
    percentProgress: 0 as number | null, // Add progress percentage field
    label: null as string | null, // Add label field
    relatedTasks: [] as string[], // Add related tasks field
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
        
        // Process related tasks - extract IDs
        const relatedTaskIds: string[] = [];
        
        // Process tasks from relatedTasks array (if available)
        if (taskData.relatedTasks && Array.isArray(taskData.relatedTasks)) {
          taskData.relatedTasks.forEach((task: any) => {
            if (typeof task === 'string') {
              relatedTaskIds.push(task);
            } else if (task && typeof task === 'object' && task.id) {
              relatedTaskIds.push(task.id);
            }
          });
        }
        
        log('Extracted related task IDs:', relatedTaskIds);
        
        const formattedTask = {
          id: taskData.id,
          title: taskData.title || '',
          description: taskData.description || '',
          projectId: taskData.projectId || '',
          status: taskData.status || 'Not Started',
          priority: taskData.priority || 'Medium',
          assignedTo: taskData.assigneeId || 'none',
          startDate: startDate,
          dueDate: dueDate,
          parentTaskId: taskData.parentTaskId || 'none',
          percentProgress: taskData.percentProgress || 0,
          label: taskData.label || null,
          relatedTasks: relatedTaskIds,
          project: taskData.project || null,
          assignee: taskData.assignee || null
        };
        
        log('Formatted task for form:', formattedTask);
        setTaskForm(formattedTask as typeof taskForm);
        
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
    if (field === 'percentProgress') {
      setTaskForm(prev => {
        const newPercent = value as number;
        let newStatus = prev.status;
        if (newPercent === 100 && prev.status === 'In Progress') {
          newStatus = 'Completed';
        } else if (newPercent < 100 && prev.status === 'Completed') {
          newStatus = 'In Progress';
        }
        return {
          ...prev,
          percentProgress: newPercent,
          status: newStatus
        };
      });
    } else {
      setTaskForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
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
      
      // Format data for API submission
      const formattedTask = {
        title: taskForm.title,
        description: taskForm.description,
        projectId: taskForm.projectId,
        status: taskForm.status,
        priority: taskForm.priority,
        assignedTo: taskForm.assignedTo === 'none' ? undefined : taskForm.assignedTo,
        parentTaskId: taskForm.parentTaskId === 'none' ? undefined : taskForm.parentTaskId,
        startDate: taskForm.startDate ? taskForm.startDate.toISOString() : undefined,
        dueDate: taskForm.dueDate ? taskForm.dueDate.toISOString() : undefined,
        percentProgress: taskForm.percentProgress === null ? undefined : taskForm.percentProgress,
        label: taskForm.label === null ? undefined : taskForm.label,
        relatedTasks: taskForm.relatedTasks.length > 0 ? taskForm.relatedTasks : undefined
      };
      
      log('Final update payload being sent to API:', formattedTask);
      
      await projlyTasksService.updateTask(taskId, formattedTask);
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
        {/* Breadcrumb navigation */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/projly/tasks">Tasks</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/projly/tasks/${taskId}`}>{taskForm.title}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {taskForm.title} ({taskForm.id})
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/projly/tasks/${taskId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Task
          </Button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <CardDescription>Edit the details for your task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title Field */}
              <TitleField 
                value={taskForm.title}
                onChange={(value) => handleChange('title', value)}
              />
              
              {/* Description Field */}
              <DescriptionField 
                value={taskForm.description}
                onChange={(value) => handleChange('description', value)}
              />
              
              {/* Project Field */}
              <ProjectField 
                value={taskForm.projectId}
                projects={projects}
                onChange={(value) => handleChange('projectId', value)}
              />
              
              {/* Assignee Field */}
              <AssigneeField 
                value={taskForm.assignedTo}
                projectMembers={projectMembers}
                isLoadingMembers={isLoadingMembers}
                onChange={(value) => handleChange('assignedTo', value)}
              />
              
              {/* Parent Task Field with Toggle */}
              <ParentTaskFieldWithToggle 
                value={taskForm.parentTaskId}
                parentTasks={parentTasks}
                onChange={(value) => handleChange('parentTaskId', value)}
                showAllTasks={showAllTasks}
                onToggleShowAllTasks={(checked: boolean) => {
                  setShowAllTasks(checked);
                  console.log(`[PROJLY:TASK_EDIT] Toggle show all tasks: ${checked}`);
                }}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Field */}
                <div className="space-y-2">
                  <StatusField 
                    value={taskForm.status}
                    onChange={(value) => handleChange('status', value)}
                  />
                </div>
                
                {/* Priority Field */}
                <div className="space-y-2">
                  <PriorityField 
                    value={taskForm.priority}
                    onChange={(value) => handleChange('priority', value)}
                  />
                </div>
                
                {/* Start Date Field */}
                <div className="space-y-2">
                  <DateField 
                    label="Start Date"
                    id="startDate"
                    date={taskForm.startDate}
                    setDate={(date) => handleChange('startDate', date)}
                  />
                </div>
                
                {/* Due Date Field */}
                <div className="space-y-2">
                  <DateField 
                    label="Due Date"
                    id="dueDate"
                    date={taskForm.dueDate}
                    setDate={(date) => handleChange('dueDate', date)}
                  />
                </div>
              </div>
              
              {/* Progress Field */}
              <ProgressField 
                value={taskForm.percentProgress}
                onChange={(value: number) => handleChange('percentProgress', value)}
              />
              
              {/* Label Field */}
              <LabelField 
                value={taskForm.label}
                onChange={(value: string) => handleChange('label', value)}
              />
              
              {/* Related Tasks Field */}
              <RelatedTasksField 
                value={taskForm.relatedTasks}
                onChange={(value: string[]) => handleChange('relatedTasks', value)}
                availableTasks={allTasks}
                isLoading={isLoading}
                currentTaskId={taskId}
              />
            </CardContent>
            <CardFooter className="p-6">
              <EditFormButtons 
                isSubmitting={isSubmitting}
                onCancel={() => router.push(`/projly/tasks/${taskId}`)}
              />
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
