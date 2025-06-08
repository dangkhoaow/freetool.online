'use client';

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toISOStringSafe } from "@/app/projly/utils/dateUtils";
import { CalendarIcon, Plus, ChevronsUpDown, Check, X } from "lucide-react";
import { useCreateTask, useUpdateTask } from "@/lib/services/projly/use-tasks";
import { useProjects } from "@/lib/services/projly/use-projects";
import { useSession } from "@/lib/services/projly/jwt-auth-adapter";
import { useProfiles } from "@/lib/services/projly/use-profile";
import { useAccessibleProjectMembers } from "@/lib/services/projly/use-members";
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
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import { Spinner } from "@/components/ui/spinner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { TaskProjectField } from "./form-fields/TaskProjectField";
import { TaskAssigneeField } from "./form-fields/TaskAssigneeField";
import { LabelField } from "./form-fields/LabelField";
// Import Task type from the central types file
import { Task } from "@/lib/services/projly/types";
import { projlyTasksService } from "@/lib/services/projly";

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
  projectId: z.string().optional(),
  // Accept either Date objects or date strings
  startDate: z.union([z.date(), z.string()]).optional(),
  dueDate: z.union([z.date(), z.string()]).optional(),
  status: z.string().default("Not Started"),
  assignedTo: z.string().optional().transform(val => val === "unassigned" ? undefined : val),
  priority: z.string().optional().default("Medium"),
  parentTaskId: z.string().optional(),
  // New fields
  percentProgress: z.number().min(0).max(100).optional().default(0),
  label: z.string().nullable().optional(),
  relatedTasks: z.array(z.string()).optional().default([]),
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
  // Callbacks
  onSuccess?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  
  // Initial data and mode
  initialData?: Partial<TaskFormValues>;
  taskId?: string;   // For edit mode
  projectId?: string; // For when creating within a project context
  
  // Display options
  mode?: 'create' | 'edit';
  inDialog?: boolean; // Whether this form is being rendered inside a dialog
  hideProjectField?: boolean; // For when in a project context
  submitButtonText?: string; // Custom submit button text
  isSubmitting?: boolean; // For external control of submit button state
}

export function CreateTaskForm({ 
  onSuccess, 
  onSubmit, 
  onCancel, 
  initialData, 
  projectId,
  taskId,
  mode = 'create',
  inDialog = false,
  hideProjectField = false,
  submitButtonText,
  isSubmitting: externalIsSubmitting
}: CreateTaskFormProps) {
  console.log("[CreateTaskForm] Rendering in mode:", mode, "inDialog:", inDialog, "hideProjectField:", hideProjectField);
  const { data: session } = useSession();
  const { data: profiles = [], isLoading: isLoadingProfiles } = useProfiles();
  
  // Use the appropriate mutation based on the mode
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  
  // Determine if task is being created or updated
  const isPending = externalIsSubmitting || createTaskMutation.isPending || updateTaskMutation.isPending;
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  
  // Initialize the form first so we can watch projectId
  // Initialize the form with react-hook-form and zod validation
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      status: initialData?.status || "Not Started",
      assignedTo: initialData?.assignedTo || session?.user?.id || "unassigned",
      projectId: initialData?.projectId || projectId || "",
      dueDate: initialData?.dueDate,
      startDate: initialData?.startDate,
      priority: initialData?.priority || "Medium",
      parentTaskId: initialData?.parentTaskId,
      // New fields with default values
      percentProgress: initialData?.percentProgress || 0,
      label: initialData?.label || null,
      relatedTasks: initialData?.relatedTasks || [],
    },
  });
  
  // Watch current form values for projectId
  const currentProjectId = form.watch("projectId");
  
  // Use the same hook as the edit task page to get project members
  const { 
    data: projectMembers = [], 
    isLoading: isLoadingMembers 
  } = useAccessibleProjectMembers(currentProjectId || undefined) as {
    data: any[],
    isLoading: boolean
  };
  
  console.log("[CreateTaskForm] Initializing form with session:", session?.user?.id);
  console.log("[CreateTaskForm] Initial data:", initialData);
  console.log("[CreateTaskForm] Project ID:", projectId);
  
  console.log("[CreateTaskForm] Loaded profiles:", profiles.length);
  console.log("[CreateTaskForm] Current project ID from form:", currentProjectId);
  console.log("[CreateTaskForm] Loaded projects:", projects.length);
  console.log("[CreateTaskForm] Loaded project members:", projectMembers?.length);
  
  // Log project members when they change
  useEffect(() => {
    if (currentProjectId && projectMembers?.length > 0) {
      console.log(`[CreateTaskForm] Loaded ${projectMembers.length} members for project ${currentProjectId}`);
      console.log('[CreateTaskForm] Project members sample:', projectMembers[0]);
    }
  }, [currentProjectId, projectMembers]);
  
  // Define the submission handler
  const onFormSubmit = (data: TaskFormValues) => {
    console.log('[CreateTaskForm] Form submitted with data:', data);
    
    // Validation (could be moved to zod schema)
    if (!hideProjectField && (data.projectId === "" || !data.projectId)) {
      toast({
        title: "Error",
        description: "Please select a project",
        variant: "destructive",
      });
      return;
    }
    
    // Handle date conversion with proper type safety
    // Explicitly typed as string | undefined to avoid string | null issues
    let isoStartDate: string | undefined = undefined;
    let isoDueDate: string | undefined = undefined;
    
    try {
      // Only convert dates if they exist and are valid - with explicit type safety
      if (data.startDate) {
        if (typeof data.startDate === 'string') {
          // If it's already a string, use it directly (force type as string | undefined)
          isoStartDate = data.startDate as string;
        } else if (data.startDate instanceof Date) {
          // If it's a Date object, convert it safely and ensure it's string | undefined
          const convertedDate = toISOStringSafe(data.startDate);
          isoStartDate = convertedDate ? convertedDate : undefined;
        }
      }
      
      if (data.dueDate) {
        if (typeof data.dueDate === 'string') {
          // If it's already a string, use it directly (force type as string | undefined)
          isoDueDate = data.dueDate as string;
        } else if (data.dueDate instanceof Date) {
          // If it's a Date object, convert it safely and ensure it's string | undefined
          const convertedDate = toISOStringSafe(data.dueDate);
          isoDueDate = convertedDate ? convertedDate : undefined;
        }
      }
      
      console.log('[CreateTaskForm] Converted dates:', { 
        startDate: data.startDate, 
        isoStartDate, 
        dueDate: data.dueDate, 
        isoDueDate 
      });
    } catch (error) {
      console.error('[CreateTaskForm] Error converting dates:', error);
    }
    
    // Create task data with the correct types for the API
    // Ensure all required properties are non-undefined
    const taskData: Omit<Task, 'id'> = {
      title: data.title, // title is required
      description: data.description || '', // provide default empty string
      status: data.status || "Not Started",
      assignedTo: data.assignedTo,
      projectId: data.projectId || "",
      startDate: isoStartDate,
      dueDate: isoDueDate,
      parentTaskId: data.parentTaskId,
      // Add new fields to the task data with appropriate type handling
      percentProgress: data.percentProgress || 0, // Ensure it's not undefined
      label: data.label || undefined, // Convert null to undefined for API
      relatedTasks: data.relatedTasks || [],
    };
    
    // Log the exact task data being sent to API
    console.log('[CreateTaskForm] Final task data for API (after priority handling):', taskData);
    
    console.log('[CreateTaskForm] Prepared task data for API:', taskData);
    
    console.log("Submitting task data:", taskData);
    
    // Handle create or update based on mode
    if (mode === 'edit' && taskId) {
      console.log("[CreateTaskForm] Updating task with ID:", taskId);
      updateTaskMutation.mutate(
        { id: taskId, data: taskData },
        {
          onSuccess: (data) => {
            console.log("[CreateTaskForm] Task updated successfully:", data);
            
            // Show success message
            toast({
              title: "Success",
              description: "Task updated successfully",
            });
            
            // IMPORTANT: Execute callback immediately - no delay
            console.log("[CreateTaskForm] Executing success callback immediately");
            
            // Call onSubmit with highest priority, then onSuccess
            if (onSubmit) {
              console.log("[CreateTaskForm] Calling onSubmit callback");
              onSubmit();
            } 
            
            if (onSuccess) {
              console.log("[CreateTaskForm] Calling onSuccess callback");
              onSuccess();
            }
          },
          onError: (error: Error) => {
            console.error("Error updating task:", error);
            toast({
              title: "Error",
              description: error.message || "Failed to update task. Please try again.",
              variant: "destructive"
            });
          }
        }
      );
    } else {
      // Call the createTask mutation function
      createTaskMutation.mutate(taskData, {
        onSuccess: (data) => {
          console.log("[CreateTaskForm] Task created successfully:", data);
          
          // Reset form immediately
          form.reset();
          
          // Show success message
          toast({
            title: "Success",
            description: "Task created successfully",
          });
          
          // IMPORTANT: Execute callback immediately - no delay
          console.log("[CreateTaskForm] Executing success callback immediately");
          
          // Call onSubmit with highest priority, then onSuccess
          if (onSubmit) {
            console.log("[CreateTaskForm] Calling onSubmit callback");
            onSubmit();
          } 
          
          if (onSuccess) {
            console.log("[CreateTaskForm] Calling onSuccess callback");
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
  };

  if (loadingProjects && isLoadingProfiles) {
    console.log('[PROJLY:TASKS:CREATE_FORM] Loading form dependencies');
    return <PageLoading standalone={true} logContext="PROJLY:TASKS:CREATE_FORM" height="20vh" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Title, Project and Assignee fields on the same line */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
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
          </div>
          {/* Only show project field if not hidden */}
          {!hideProjectField && (
            <div>
              <TaskProjectField />
            </div>
          )}
          <div className={hideProjectField ? "md:col-span-2" : ""}>
            {/* Use the TaskAssigneeField component with project members */}
            <TaskAssigneeField 
              profiles={currentProjectId && projectMembers?.length > 0 ? projectMembers : profiles} 
              isLoading={currentProjectId ? isLoadingMembers : isLoadingProfiles} 
            />
          </div>
        </div>

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
        
        {/* Start Date, Due Date, and Status fields on the same line */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Due Date field */}
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

          {/* Status field */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* New fields section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Progress field */}
          <FormField
            control={form.control}
            name="percentProgress"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormControl>
                  <div className="space-y-4">
                    <FormLabel>Progress</FormLabel>
                    <div className="flex items-center justify-between">
                      <Slider
                        value={[field.value || 0]}
                        max={100}
                        step={1}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                      <span className="ml-2 text-sm text-muted-foreground w-10 text-right">
                        {field.value || 0}%
                      </span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Label field */}
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <LabelField
                value={field.value ?? null}
                onChange={field.onChange}
              />
            )}
          />

          {/* Related Tasks field */}
          <FormField
            control={form.control}
            name="relatedTasks"
            render={({ field }) => {
              // Get the list of tasks for the current project
              const [availableTasks, setAvailableTasks] = useState<any[]>([]);
              
              // Fetch tasks for the selected project
              useEffect(() => {
                const fetchTasks = async () => {
                  const projectIdValue = form.watch("projectId");
                  if (projectIdValue) {
                    try {
                      const response = await projlyTasksService.getProjectTasks(projectIdValue);
                      // Filter out the current task if in edit mode
                      const filtered = taskId 
                        ? response.filter((task: any) => task.id !== taskId)
                        : response;
                      setAvailableTasks(filtered);
                    } catch (error) {
                      console.error("Error fetching tasks:", error);
                      setAvailableTasks([]);
                    }
                  } else {
                    setAvailableTasks([]);
                  }
                };
                
                fetchTasks();
              }, [form.watch("projectId"), taskId]);
              
              return (
                <FormItem className="col-span-1">
                  <FormLabel>Related Tasks</FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="justify-between"
                          >
                            {field.value?.length 
                              ? `${field.value.length} tasks selected`
                              : "Select related tasks"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search tasks..." />
                            <CommandEmpty>No tasks found</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-64">
                                {availableTasks.map((task: any) => (
                                  <CommandItem
                                    key={task.id}
                                    onSelect={() => {
                                      const selected = field.value || [];
                                      const updatedTasks = selected.includes(task.id)
                                        ? selected.filter(id => id !== task.id)
                                        : [...selected, task.id];
                                      field.onChange(updatedTasks);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        (field.value || []).includes(task.id) 
                                          ? "opacity-100" 
                                          : "opacity-0"
                                      )}
                                    />
                                    {task.title}
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {field.value.map(taskId => {
                            const task = availableTasks.find((t: any) => t.id === taskId);
                            return (
                              <Badge
                                key={taskId}
                                variant="secondary"
                                className="flex items-center space-x-1"
                              >
                                <span className="truncate max-w-[150px]">
                                  {task ? task.title : 'Unknown task'}
                                </span>
                                <button
                                  type="button"
                                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onClick={() => {
                                    const updatedTasks = (field.value || []).filter(
                                      id => id !== taskId
                                    );
                                    field.onChange(updatedTasks);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">Remove</span>
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
          
          <Button type="submit" disabled={isPending} className={!onCancel ? "w-full" : undefined}>
            {isPending ? <Spinner className="mr-2 h-4 w-4" /> : 
              mode === 'edit' ? null : <Plus className="mr-2 h-4 w-4" />}
            {submitButtonText || (mode === 'edit' ? 'Save Task' : 'Create Task')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
