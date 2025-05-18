'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useProfiles } from "@/lib/services/projly/use-profile";
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
import { projlyProjectsService } from '@/lib/services/projly';
import { useSession } from '@/lib/services/projly/jwt-auth-adapter';

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

export default function CreateProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  
  // Fetch all user profiles for owner selection
  const { data: profiles = [], isLoading: loadingUsers } = useProfiles();
  
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
  
  console.log('[PROJLY:NEW_PROJECT] Available users for owner selection:', users);
  console.log('[PROJLY:NEW_PROJECT] Current user ID:', currentUserId);
  
  // Find the current user in the users list
  const currentUserInList = users.find((user: { id: string }) => user.id === currentUserId);
  console.log('[PROJLY:NEW_PROJECT] Current user in list:', currentUserInList);
  
  // Initialize form with default values
  const form = useForm<ProjectFormValues>({
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'draft',
      ownerId: currentUserId || users[0]?.id || '',
      canManageMembers: true
    }
  });
  
  // Update the ownerId when the current user ID becomes available
  useEffect(() => {
    if (currentUserId && !form.getValues('ownerId')) {
      console.log('[PROJLY:NEW_PROJECT] Setting owner ID to current user:', currentUserId);
      form.setValue('ownerId', currentUserId);
    }
  }, [currentUserId, form]);
  
  // Log form values when they change
  const formValues = form.watch();
  console.log('Form values:', formValues);

  const onSubmit = async (data: ProjectFormValues) => {
    console.log('[PROJLY:NEW_PROJECT] Form submitted with data:', data);
    setIsSubmitting(true);
    
    try {
      // Ensure ownerId is not empty
      if (!data.ownerId) {
        console.log('[PROJLY:NEW_PROJECT] No owner ID selected, using first available user or current user');
        // If no owner is selected, use the first available user
        if (users.length > 0) {
          data.ownerId = users[0].id;
          console.log('[PROJLY:NEW_PROJECT] Using first available user as owner:', users[0]);
        }
      }
      
      console.log('[PROJLY:NEW_PROJECT] Creating project with data:', {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null
      });
      
      const response = await projlyProjectsService.createProject({
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null
      });
      
      console.log('Project created successfully:', response);
      
      // Show success message
      toast({
        title: 'Success!',
        description: 'Project created successfully.',
        variant: 'default',
      });
      
      // Redirect to projects list
      router.push('/projly/projects');
    } catch (error) {
      console.error('Error creating project:', error);
      
      // Show error message
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      console.log('Form submission completed');
    }
  };

  // Show loading state when checking auth and fetching data
  if (loadingUsers) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-10 w-10 animate-spin" />
          <span className="ml-2">Loading...</span>
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
            onClick={() => router.push('/projly/projects')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
          <h1 className="text-3xl font-bold mt-4">Create New Project</h1>
          <p className="text-muted-foreground mt-2">
            Fill in the details below to create a new project
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

              {/* Project Owner Field */}
              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => {
                  // Log the current field value for debugging
                  console.log('[PROJLY:NEW_PROJECT] Current owner field value:', field.value);
                  
                  return (
                    <FormItem>
                      <FormLabel>Project Owner*</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          {...field}
                          onChange={(e) => {
                            // Log the selected value
                            console.log('[PROJLY:NEW_PROJECT] Owner selected:', e.target.value);
                            field.onChange(e);
                          }}
                        >
                          <option value="">Select a project owner</option>
                          {loadingUsers ? (
                            <option value="">Loading users...</option>
                          ) : (
                            users.map((user: User) => (
                              <option key={user.id} value={user.id}>
                                {`${user.firstName} ${user.lastName} (${user.email})`}
                              </option>
                            ))
                          )}
                        </select>
                      </FormControl>
                      <FormDescription>
                        The project owner will have full control over this project. 
                        {field.value ? `Selected owner ID: ${field.value.substring(0, 8)}...` : 'No owner selected'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              {/* TODO: Show this field only when we define rule */}
              <FormField
                control={form.control}
                name="canManageMembers"
                render={({ field }) => (
                  <FormItem className="hidden flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 mt-1"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Allow owner to manage project members</FormLabel>
                      <FormDescription>
                        When enabled, the project owner can add or remove team members from this project
                      </FormDescription>
                    </div>
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
                        <Input 
                          type="date"
                          {...field}
                        />
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
                        <Input 
                          type="date"
                          {...field}
                        />
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
                  onClick={() => router.push('/projly/projects')}
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
                      Creating...
                    </>
                  ) : (
                    "Create Project"
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
