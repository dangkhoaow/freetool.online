'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "../../components/ui/date-picker";
import { projlyAuthService, projlyTasksService, projlyProjectsService } from '@/lib/services/projly';
import { useProjectMembers } from '@/lib/services/projly/use-projects';
import { useToast } from "@/components/ui/use-toast";

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
  
  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    projectId: '',
    status: 'Not Started',
    assignedTo: 'none', // Using 'none' instead of empty string for the Select component
    startDate: null as Date | null,
    dueDate: null as Date | null,
    priority: 'Medium'
  });
  
  // Use the useProjectMembers hook to get members for the selected project
  const { data: projectMembers = [], isLoading: isLoadingMembers } = useProjectMembers(taskForm.projectId || undefined) as { data: ProjectMember[], isLoading: boolean };
  
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
  
  // Handle form input changes
  const handleChange = (field: string, value: any) => {
    log(`Updating form field: ${field} with value:`, value);
    setTaskForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // If project ID changes, log it for debugging
    if (field === 'projectId') {
      log(`Project ID changed to: ${value}, will fetch members for this project`);
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
      
      // Format dates for API and handle 'none' value for assignedTo
      const formattedTask = {
        ...taskForm,
        // Convert 'none' to null or undefined for the API
        assignedTo: taskForm.assignedTo === 'none' ? null : taskForm.assignedTo,
        startDate: taskForm.startDate ? taskForm.startDate.toISOString() : undefined,
        dueDate: taskForm.dueDate ? taskForm.dueDate.toISOString() : undefined
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Task</h1>
            <p className="text-muted-foreground">Create a new task for your project</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={taskForm.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={taskForm.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Enter task description"
                  />
                </div>
                <div>
                  <Label htmlFor="projectId">Project *</Label>
                  <Select
                    value={taskForm.projectId}
                    onValueChange={(value) => handleChange('projectId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
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
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
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
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assignee</Label>
                  <Select
                    value={taskForm.assignedTo}
                    onValueChange={(value) => handleChange('assignedTo', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {/* Show loading state if fetching members */}
                      {isLoadingMembers ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading members...</span>
                        </div>
                      ) : projectMembers.length > 0 ? (
                        // Show project members if available
                        projectMembers.map((member: ProjectMember) => (
                          <SelectItem key={member.userId} value={member.userId}>
                            {member.user?.firstName && member.user?.lastName 
                              ? `${member.user.firstName} ${member.user.lastName}` 
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
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <DatePicker
                    date={taskForm.startDate}
                    setDate={(date) => handleChange('startDate', date)}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <DatePicker
                    date={taskForm.dueDate}
                    setDate={(date) => handleChange('dueDate', date)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/projly/tasks')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Task'
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
