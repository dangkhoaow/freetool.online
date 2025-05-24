import React from "react";
import { useFormContext } from "react-hook-form";
import { useProjects } from "@/lib/services/projly/use-projects";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskFormValues } from "../schemas/taskSchema";
import { PageLoading } from "@/app/projly/components/ui/PageLoading";

export function TaskProjectField() {
  const form = useFormContext<TaskFormValues>();
  const { data: projects, isLoading: loadingProjects } = useProjects();
  
  // Add debug logging to help diagnose the project selection issue
  const formValues = form.getValues();
  console.log('[TaskProjectField] Current form values:', formValues);
  console.log('[TaskProjectField] Current projectId value:', formValues.projectId);
  console.log('[TaskProjectField] Available projects:', projects);
  
  if (loadingProjects) {
    console.log('[PROJLY:TASKS:PROJECT_FIELD] Loading projects data');
    return <PageLoading standalone={true} logContext="PROJLY:TASKS:PROJECT_FIELD" height="10vh" />;
  }

  return (
    <FormField
      control={form.control}
      name="projectId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Project</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || undefined}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Array.isArray(projects) && projects.map((project: { id: string; name: string }) => (
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
  );
}
