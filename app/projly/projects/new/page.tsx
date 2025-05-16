'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { projlyAuthService, projlyProjectsService } from '@/lib/services/projly';

type ProjectFormValues = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  ownerId: string;
  canManageMembers: boolean;
};

// Interface to represent user profiles for the owner selection
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:CREATE-PROJECT] ${message}`, data);
    } else {
      console.log(`[PROJLY:CREATE-PROJECT] ${message}`);
    }
  };
  
  log('Rendering CreateProject page');
  
  // Check authentication and fetch users on page load
  useEffect(() => {
    const checkAuthAndLoadUsers = async () => {
      try {
        log('Checking authentication');
        const isAuthenticated = await projlyAuthService.isAuthenticated();
        
        if (!isAuthenticated) {
          log('User not authenticated, redirecting to login');
          router.push('/projly/login');
          return;
        }
        
        log('Getting current user');
        const user = projlyAuthService.getCurrentUser();
        setCurrentUser(user);
        log('Current user:', user);
        
        // In a real implementation, we would fetch profiles here
        // For now, we'll just use the current user as the only available user
        if (user) {
          setUsers([{
            id: user.id,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || ''
          }]);
        }
        
        log('Users loaded');
      } catch (error) {
        console.error('[PROJLY:CREATE-PROJECT] Error initializing page:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    checkAuthAndLoadUsers();
  }, [router]);

  // Initialize form with react-hook-form
  const form = useForm<ProjectFormValues>({
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "Planning",
      ownerId: currentUser?.id || "",
      canManageMembers: true
    }
  });
  
  // Update owner ID when current user is loaded
  useEffect(() => {
    if (currentUser?.id) {
      form.setValue('ownerId', currentUser.id);
      log('Updated form owner ID with current user ID');
    }
  }, [currentUser, form]);
  
  log('Form initialized with defaults', form.getValues());

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      setIsSubmitting(true);
      log('Submitting project form with values:', values);
      
      // Format dates as needed for ISO-8601 compatibility
      const formattedValues = {
        ...values,
        startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
        endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined
      };
      
      log('Formatted dates to ISO-8601:', {
        originalStartDate: values.startDate,
        formattedStartDate: formattedValues.startDate,
        originalEndDate: values.endDate,
        formattedEndDate: formattedValues.endDate
      });
      
      log('Calling createProject with formatted values:', formattedValues);
      const createdProject = await projlyProjectsService.createProject(formattedValues);
      
      if (createdProject) {
        log('Project created successfully:', createdProject);
        toast({
          title: "Success",
          description: "Project created successfully"
        });
        router.push("/projly/projects");
      } else {
        log('Project creation failed - no data returned');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create project"
        });
      }
    } catch (error) {
      console.error("[PROJLY:CREATE-PROJECT] Unexpected error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while creating the project"
      });
    } finally {
      setIsSubmitting(false);
      log('Form submission completed');
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Owner*</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        {...field}
                      >
                        {loadingUsers ? (
                          <option>Loading users...</option>
                        ) : (
                          users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {`${user.firstName} ${user.lastName} (${user.email})`}
                            </option>
                          ))
                        )}
                      </select>
                    </FormControl>
                    <FormDescription>
                      The project owner will have full control over this project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canManageMembers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
