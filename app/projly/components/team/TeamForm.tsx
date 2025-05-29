
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateTeam, useUpdateTeam, Team } from "@/lib/services/projly/use-team";
import { useProjects } from "@/lib/services/projly/use-projects";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema using zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  projectId: z.string().optional(),
  allowSendAllRemindEmail: z.boolean().default(false),
});

// Type from the schema
type FormValues = z.infer<typeof formSchema>;

interface TeamFormProps {
  team?: Team;
  onSuccess?: () => void;
}

export function TeamForm({ team, onSuccess }: TeamFormProps) {
  const { mutate: createTeam, isPending: isCreating } = useCreateTeam();
  const { mutate: updateTeam, isPending: isUpdating } = useUpdateTeam();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  
  const isPending = isCreating || isUpdating;

  console.log("TeamForm - Current team:", team);
  console.log("TeamForm - Available projects:", projects);

  // Get the connected project ID if it exists
  const connectedProjectId = team?.projects && team.projects.length > 0 
    ? team.projects[0].projectId 
    : undefined;

  console.log("TeamForm - Team projects:", team?.projects);
  console.log("TeamForm - Connected project ID:", connectedProjectId);

  // Initialize the form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: team?.name || "",
      description: team?.description || "",
      projectId: connectedProjectId,
      allowSendAllRemindEmail: team?.allowSendAllRemindEmail || false,
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    console.log("Submitting team form with data:", data);
    
    if (team) {
      // Update existing team - explicitly include all fields
      updateTeam(
        { 
          id: team.id, 
          data: {
            name: data.name,
            description: data.description,
            projectId: data.projectId,
            allowSendAllRemindEmail: data.allowSendAllRemindEmail
          } 
        },
        {
          onSuccess: () => {
            if (onSuccess) onSuccess();
          },
        }
      );
    } else {
      // Create new team - ensure name is always provided
      createTeam(
        {
          name: data.name,
          description: data.description,
          projectId: data.projectId,
          allowSendAllRemindEmail: data.allowSendAllRemindEmail
        }, 
        {
          onSuccess: () => {
            if (onSuccess) onSuccess();
            form.reset();
          },
        }
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter team name" {...field} />
              </FormControl>
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
                  placeholder="Enter team description"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associated Project</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={projectsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allowSendAllRemindEmail"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowSendAllRemindEmail"
                    checked={field.value}
                    onChange={(e) => {
                      // Explicitly set the boolean value
                      console.log('Checkbox changed:', e.target.checked);
                      field.onChange(e.target.checked);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <FormLabel htmlFor="allowSendAllRemindEmail" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Send Email Reminders to All Team Members
                    </FormLabel>
                    <p className="text-sm text-gray-500">
                      When enabled, overdue task reminders will be sent to all active team members, not just the task assignee.
                    </p>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
          {team ? "Update Team" : "Create Team"}
        </Button>
      </form>
    </Form>
  );
}
