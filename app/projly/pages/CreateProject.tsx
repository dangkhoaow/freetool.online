
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useCreateProject } from "@/hooks/use-projects";
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
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useProfiles } from "@/hooks/use-profile";

type ProjectFormValues = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  ownerId: string;
  canManageMembers: boolean;
};

console.log("CreateProject: ProjectFormValues type defined with camelCase fields");

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

console.log("CreateProject: User type defined with camelCase fields");

export default function CreateProject() {
  console.log("CreateProject: Rendering component");
  const navigate = useNavigate();
  const { mutateAsync: createProject, isPending } = useCreateProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Fetch all users for owner selection using the useProfiles hook
  const { data: profiles = [], isLoading: loadingUsers } = useProfiles();
  
  // Transform the profile data (keeping camelCase formatting)
  const users = Array.isArray(profiles) ? profiles.map(profile => ({
    id: profile.id,
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    email: profile.email || ''
  })) : [];
  
  console.log("CreateProject: Transformed users with camelCase fields:", 
    users.length > 0 ? { exampleUser: users[0] } : "No users available");
  
  console.log("CreateProject: Users fetched:", users);

  const form = useForm<ProjectFormValues>({
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "Planning",
      ownerId: user?.id || "",
      canManageMembers: true
    }
  });
  
  console.log("CreateProject: Form initialized with camelCase default values");

  console.log("CreateProject: Form initialized with defaults", form.getValues());

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("CreateProject: Submitting project form with values:", values);
      
      // Format dates as needed for ISO-8601 compatibility
      const formattedValues = {
        ...values,
        startDate: values.startDate ? new Date(values.startDate).toISOString() : null,
        endDate: values.endDate ? new Date(values.endDate).toISOString() : null
      };
      
      console.log("CreateProject: Formatted dates to ISO-8601:", {
        originalStartDate: values.startDate,
        formattedStartDate: formattedValues.startDate,
        originalEndDate: values.endDate,
        formattedEndDate: formattedValues.endDate
      });
      
      console.log("CreateProject: Calling createProject with formatted values:", formattedValues);
      const result = await createProject(formattedValues);
      
      console.log("CreateProject: Create project result:", result);
      if (result.data) {
        console.log("CreateProject: Project created successfully");
        toast.success("Project created successfully");
        navigate("/projects");
      } else if (result.error) {
        console.error("CreateProject: Project creation error:", result.error);
        toast.error(`Failed to create project: ${result.error.message}`);
      }
    } catch (error) {
      console.error("CreateProject: Unexpected error:", error);
      toast.error("An error occurred while creating the project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Create New Project</h1>
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
                    <div className="space-y-1 leading-none hidden">
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
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isPending}
                >
                  {(isSubmitting || isPending) ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
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
  );
}
