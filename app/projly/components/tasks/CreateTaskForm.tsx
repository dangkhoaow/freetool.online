'use client';

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toISOStringSafe } from "@/app/projly/utils/dateUtils";
import { CalendarIcon, Plus } from "lucide-react";
import { useCreateTask } from "@/lib/services/projly/use-tasks";
import { useProjects } from "@/lib/services/projly/use-projects";
import { useSession } from "@/lib/services/projly/jwt-auth-adapter";
import { useProfiles } from "@/lib/services/projly/use-profile";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Task } from "@/lib/services/projly/use-tasks";
import { TaskProjectField } from "./form-fields/TaskProjectField";
import { TaskAssigneeField } from "./form-fields/TaskAssigneeField";

// Helper function to safely convert date values for the Calendar component
function toSafeDate(value: string | Date | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  } catch (e) {
    console.error("Error converting date value:", e);
    return undefined;
  }
}

// Form schema using zod
const taskSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  projectId: z.string().uuid().optional(),
  // Accept either Date objects or date strings
  startDate: z.union([z.date(), z.string()]).optional(),
  dueDate: z.union([z.date(), z.string()]).optional(),
  status: z.string().default("Not Started"),
  assignedTo: z.string().optional().transform(val => val === "unassigned" ? undefined : val),
}).refine(data => {
  // If both dates are provided, ensure startDate is not after dueDate
  if (data.startDate && data.dueDate) {
    const startDate = data.startDate instanceof Date ? data.startDate : new Date(data.startDate);
    const dueDate = data.dueDate instanceof Date ? data.dueDate : new Date(data.dueDate);
    return startDate <= dueDate;
  }
  return true;
}, {
  message: "Start date cannot be after the due date",
  path: ["startDate"]
});

console.log("[CreateTaskForm] Task schema updated to accept both Date objects and strings");

// Type from the schema
type TaskFormValues = z.infer<typeof taskSchema>;

interface CreateTaskFormProps {
  onSuccess?: () => void;
}

export function CreateTaskForm({ onSuccess }: CreateTaskFormProps) {
  const { data: session } = useSession();
  const { data: profiles = [], isLoading: isLoadingProfiles } = useProfiles();
  
  const { mutate: createTask, isPending } = useCreateTask();
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  
  console.log("[CreateTaskForm] Initializing form with session:", session?.user?.id);
  
  // Initialize the form with react-hook-form and zod validation
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "Not Started",
      assignedTo: session?.user?.id || "unassigned", // Default to current user but can be unassigned
    },
  });

  // Get the current projectId value from the form
  const projectId = form.watch("projectId");
  
  console.log("[CreateTaskForm] Loaded profiles:", profiles.length);
  console.log("[CreateTaskForm] Loaded projects:", projects.length);
  
  // Handle form submission
  function onSubmit(data: TaskFormValues) {
    console.log("Form data to be submitted:", data);
    
    // Make sure title is always present (satisfying the type requirement)
    if (!data.title) {
      console.error("Title is required");
      return;
    }
    
    // Create a new object with the data formatted for the API that matches TaskCreateInput
    const isoStartDate = data.startDate != null ? toISOStringSafe(data.startDate) : undefined;
    console.log('[CreateTaskForm] Converted startDate to ISO string or undefined, value was:', data.startDate);
    const isoDueDate = data.dueDate != null ? toISOStringSafe(data.dueDate) : undefined;
    console.log('[CreateTaskForm] Converted dueDate to ISO string or undefined, value was:', data.dueDate);
    const taskData: { title: string; description?: string; status?: string; assignedTo?: string; projectId?: string; startDate?: string; dueDate?: string } = {
      title: data.title,
      description: data.description,
      status: data.status || "Not Started",
      assignedTo: data.assignedTo,
      projectId: data.projectId || "",
      startDate: isoStartDate,
      dueDate: isoDueDate,
    };
    
    console.log("Submitting task data:", taskData);
    
    // Call the createTask mutation function
    createTask(taskData, {
      onSuccess: () => {
        console.log("Task created successfully");
        toast({
          title: "Success",
          description: "Task created successfully",
        });
        
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error: Error) => {
        console.error("Error creating task:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to create task. Please try again.",
          variant: "destructive"
        });
      }
    });
  }

  if (loadingProjects && isLoadingProfiles) {
    return (
      <div className="flex justify-center p-4">
        <Spinner />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
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
                  placeholder="Task description" 
                  className="min-h-[100px]" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <TaskProjectField />

        {/* Use the TaskAssigneeField component instead of inline implementation */}
        <TaskAssigneeField 
          profiles={profiles} 
          isLoading={isLoadingProfiles} 
        />
        
        {/* Start Date field */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => {
            // Create a safe date handler for the Calendar component
            const handleSelect = (date: Date | undefined) => {
              field.onChange(date);
            };
            
            return (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${
                          !field.value ? "text-muted-foreground" : ""
                        }`}
                      >
                        {field.value ? (
                          format(toSafeDate(field.value) || new Date(), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toSafeDate(field.value)}
                      onSelect={handleSelect}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => {
            // Create a safe date handler for the Calendar component
            const handleSelect = (date: Date | undefined) => {
              field.onChange(date);
            };
            
            return (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${
                          !field.value ? "text-muted-foreground" : ""
                        }`}
                      >
                        {field.value ? (
                          format(toSafeDate(field.value) || new Date(), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toSafeDate(field.value)}
                      onSelect={handleSelect}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <Spinner className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          Create Task
        </Button>
      </form>
    </Form>
  );
}
