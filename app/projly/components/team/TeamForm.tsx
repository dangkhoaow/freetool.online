
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateTeam, useUpdateTeam, Team } from "@/lib/services/projly/use-team";
import { useProjects } from "@/lib/services/projly/use-projects";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  projectId: z.string().optional(), // Keep for backward compatibility
  projectIds: z.array(z.string()).optional(), // New field for multiple project selection
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

  // Get the connected project IDs if they exist
  const connectedProjectIds = team?.projects && team.projects.length > 0 
    ? team.projects.map((p: any) => p.projectId || p.project?.id) 
    : [];
  
  // For backward compatibility, also get the first project ID
  const connectedProjectId = connectedProjectIds.length > 0 ? connectedProjectIds[0] : undefined;

  console.log("TeamForm - Team projects:", team?.projects);
  console.log("TeamForm - Connected project IDs:", connectedProjectIds);
  console.log("TeamForm - First connected project ID (for backward compatibility):", connectedProjectId);

  // Initialize the form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: team?.name || "",
      description: team?.description || "",
      projectId: connectedProjectId, // Keep for backward compatibility
      projectIds: connectedProjectIds.filter(Boolean), // Filter out any null/undefined values
      allowSendAllRemindEmail: team?.allowSendAllRemindEmail || false,
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    console.log("Submitting team form with data:", data);
    
    // Determine which project ID to send
    // If projectIds array is available and has items, use the first one for backward compatibility
    // Otherwise fall back to the single projectId field
    const projectIdToSend = data.projectIds && data.projectIds.length > 0 
      ? data.projectIds[0] 
      : data.projectId;
    
    // Log the projects being submitted
    console.log("Team form - Selected project IDs:", data.projectIds);
    console.log("Team form - Using primary project ID for API:", projectIdToSend);
    
    if (team) {
      // Update existing team - explicitly include all fields
      updateTeam(
        { 
          id: team.id, 
          data: {
            name: data.name,
            description: data.description,
            projectId: projectIdToSend, // Send the primary project ID
            projectIds: data.projectIds, // Send all project IDs for future API support
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
          projectId: projectIdToSend, // Send the primary project ID
          projectIds: data.projectIds, // Send all project IDs for future API support
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
          name="projectIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associated Projects</FormLabel>
              <div className="relative">
                <Select
                  onValueChange={(value) => {
                    // Handle "none" selection to clear all selections
                    if (value === "none") {
                      field.onChange([]);
                      return;
                    }
                    
                    // If value already exists in array, remove it (toggle behavior)
                    // Otherwise add it to the array
                    const currentValues = Array.isArray(field.value) ? field.value : [];
                    // Ensure value is a string before checking includes
                    const valueStr = String(value);
                    const newValues = currentValues.includes(valueStr)
                      ? currentValues.filter(v => v !== valueStr)
                      : [...currentValues, valueStr];
                    
                    console.log("Selected project IDs:", newValues);
                    field.onChange(newValues);
                  }}
                  value={Array.isArray(field.value) && field.value.length > 0 ? field.value[0] : "none"}
                  disabled={projectsLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={field.value && field.value.length > 0 
                          ? `${field.value.length} project(s) selected` 
                          : "Select projects (optional)"} 
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Clear selection</SelectItem>
                    {projects?.map((project) => (
                      <SelectItem 
                        key={project.id} 
                        value={project.id}
                        className={field.value && field.value.includes(project.id) ? "bg-accent" : ""}
                      >
                        <div className="flex items-center gap-2">
                          {field.value && field.value.includes(project.id) && (
                            <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
                          )}
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Show selected projects as tags */}
                {Array.isArray(field.value) && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map((projectId) => {
                      const project = projects?.find(p => p.id === projectId);
                      return (
                        <Badge key={projectId} variant="secondary" className="flex items-center gap-1">
                          {project?.name || projectId}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => {
                              // Ensure field.value is an array before filtering
                              const currentValues = Array.isArray(field.value) ? field.value : [];
                              const newValues = currentValues.filter(v => v !== projectId);
                              field.onChange(newValues);
                            }}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
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
