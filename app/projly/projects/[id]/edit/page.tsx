'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useProfiles } from "@/lib/services/projly/use-profile";
import { useProject, useUpdateProject } from "@/lib/services/projly/use-projects";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DashboardLayout } from '@/app/projly/components/layout/DashboardLayout';
import { useSession } from '@/lib/services/projly/jwt-auth-adapter';
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import { projlyAuthService } from '@/lib/services/projly';

type ProjectFormValues = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  ownerId: string;
  canManageMembers: boolean;
};

// Interface for user data from the API
interface ApiUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

// Interface for profile data from the API
export interface Profile {
  id: string;
  userId: string;
  user: ApiUser;
  bio?: string | null;
  avatarUrl?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Interface for user data in the dropdown
interface User {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Define constant log prefix for consistent logging
const LOG_PREFIX = "[PROJLY:EDIT_PROJECT_PAGE]";
const log = (...args: any[]) => console.log(LOG_PREFIX, ...args);

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  
  // Fetch the project data
  const { data: project, isLoading: loadingProject } = useProject(projectId);
  
  // Fetch all user profiles for owner selection
  const { data: profiles = [], isLoading: loadingUsers } = useProfiles();
  
  // Get the update project mutation
  const updateProjectMutation = useUpdateProject();
  
  // Check if user is authenticated and redirect if not
  const checkAuth = async () => {
    const isAuthenticated = await projlyAuthService.isAuthenticated();
    if (!isAuthenticated) {
      router.push("/projly/login");
    }
  };

  // Initialize on component mount
  useEffect(() => {
    log("Initializing project edit page");
    checkAuth();
    setIsPageLoading(false);
  }, []);
  
  // Transform the profile data for the dropdown
  // Use userId as the id field for proper project owner assignment
  const users = profiles.map((profile: Profile) => ({
    id: profile.userId, // Use userId instead of profile.id
    profileId: profile.id, // Keep profile ID for reference
    userId: profile.userId,
    firstName: profile.user.firstName || 'Unknown',
    lastName: profile.user.lastName || 'User',
    email: profile.user.email || 'No email'
  }));
  
  log("Available users for owner selection:", users);
  log("Current user ID:", currentUserId);
  log("Project data:", project);
  
  // Initialize form with default values
  const form = useForm<ProjectFormValues>({
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'Planning',
      ownerId: '',
      canManageMembers: true
    }
  });
  
  // Update form values when project data is loaded
  useEffect(() => {
    if (project) {
      log("Setting form values from project data:", project);
      
      // Format dates for the input fields
      const startDate = project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '';
      const endDate = project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '';
      
      form.reset({
        name: project.name || '',
        description: project.description || '',
        startDate: startDate,
        endDate: endDate,
        status: project.status || 'Planning',
        ownerId: project.ownerId || currentUserId || '',
        canManageMembers: project.canManageMembers !== undefined ? project.canManageMembers : true
      });
      
      console.log('[PROJLY:EDIT_PROJECT] Form values set:', form.getValues());
    }
  }, [project, form, currentUserId]);
  
  // Log form values when they change
  const formValues = form.watch();
  console.log('[PROJLY:EDIT_PROJECT] Form values:', formValues);

  const onSubmit = async (data: ProjectFormValues) => {
    console.log('[PROJLY:EDIT_PROJECT] Form submitted with data:', data);
    setIsSubmitting(true);
    
    try {
      // Ensure ownerId is not empty
      if (!data.ownerId) {
        console.log('[PROJLY:EDIT_PROJECT] No owner ID selected, using first available user or current user');
        // If no owner is selected, use the first available user
        if (users.length > 0) {
          data.ownerId = users[0].id;
          console.log('[PROJLY:EDIT_PROJECT] Using first available user as owner:', users[0]);
        }
      }
      
      // Ensure empty strings are properly converted to null for date fields
      const processedData = {
        ...data,
        startDate: data.startDate && data.startDate.trim() !== '' ? new Date(data.startDate) : null,
        endDate: data.endDate && data.endDate.trim() !== '' ? new Date(data.endDate) : null
      };
      
      console.log('[PROJLY:EDIT_PROJECT] Updating project with data:', {
        id: projectId,
        ...processedData,
        startDateRaw: data.startDate, // Log raw value for debugging
        endDateRaw: data.endDate // Log raw value for debugging
      });
      
      // Call the update project mutation
      await updateProjectMutation.mutateAsync({
        id: projectId,
        ...processedData
      });
      
      console.log('[PROJLY:EDIT_PROJECT] Project updated successfully');
      
      // Show success message
      toast({
        title: 'Success!',
        description: 'Project updated successfully.',
        variant: 'default',
      });
      
      // Redirect to project detail page
      router.push(`/projly/projects/${projectId}`);
    } catch (error) {
      console.error('[PROJLY:EDIT_PROJECT] Error updating project:', error);
      
      // Show error message
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      console.log('[PROJLY:EDIT_PROJECT] Form submission completed');
    }
  };

  // Show loading state using the enhanced PageLoading component
  if (isPageLoading || loadingProject || loadingUsers) {
    log("Showing loading state");
    return <PageLoading logContext="PROJLY:EDIT_PROJECT" />;
  }

  // Show error if project not found
  if (!project) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 text-center">
          <h1 className="text-3xl font-bold">Project Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The project you are trying to edit does not exist or you don't have permission to access it.
          </p>
          <Button 
            className="mt-4"
            onClick={() => router.push('/projly/projects')}
          >
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-5xl">
        <div className="mb-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push(`/projly/projects/${projectId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Project
          </Button>
          <h1 className="text-3xl font-bold mt-4">Edit Project</h1>
          <p className="text-muted-foreground mt-2">
            Update the details of your project
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter project name" 
                        {...field} 
                        required
                      />
                    </FormControl>
                    <FormDescription>
                      Give your project a clear, descriptive name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the goals and scope of this project" 
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="date"
                            {...field}
                          />
                          {field.value && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                form.setValue('startDate', '');
                                console.log('[PROJLY:EDIT_PROJECT] Cleared start date');
                              }}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="date"
                            {...field}
                          />
                          {field.value && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                form.setValue('endDate', '');
                                console.log('[PROJLY:EDIT_PROJECT] Cleared end date');
                              }}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        {...field}
                      >
                        <option value="Planning">Planning</option>
                        <option value="In Progress">In Progress</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/projly/projects/${projectId}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Project"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}
