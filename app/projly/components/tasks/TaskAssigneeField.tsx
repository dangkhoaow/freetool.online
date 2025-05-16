
import React, { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskFormValues } from "./schemas/taskSchema";
import { Profile } from "@/types/profile";
import { useProjectMembers } from "@/hooks/use-projects";
import { Spinner } from "@/components/ui/spinner";

interface TaskAssigneeFieldProps {
  profiles: Profile[];
  isLoading: boolean;
}

export function TaskAssigneeField({ profiles, isLoading }: TaskAssigneeFieldProps) {
  const form = useFormContext<TaskFormValues>();
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  
  // Watch for projectId changes to update the assignee dropdown
  const projectId = useWatch({
    control: form.control,
    name: "projectId"
  });

  // Fetch project members when a project is selected
  const { data: projectMembers, isLoading: loadingMembers } = useProjectMembers(projectId);
  
  // Log the current assignee value for debugging
  console.log("Current assignee value in form:", form.getValues("assignedTo"));
  console.log("Selected project ID:", projectId);
  console.log("Available profiles:", profiles);
  console.log("Project members:", projectMembers);
  
  // Filter profiles based on project membership
  useEffect(() => {
    if (!projectId) {
      // If no project selected, show all profiles
      setFilteredProfiles(profiles);
      return;
    }
    
    if (projectMembers && projectMembers.length > 0) {
      // Get user IDs from project members
      const memberUserIds = projectMembers.map(member => member.user?.id).filter(Boolean);
      console.log("Project member user IDs:", memberUserIds);
      
      // Filter profiles to only include project members
      const projectProfiles = profiles.filter(profile => 
        memberUserIds.includes(profile.id)
      );
      
      console.log("Filtered profiles for project:", projectProfiles);
      setFilteredProfiles(projectProfiles);
    } else {
      // If no members found but project selected, show empty list
      setFilteredProfiles([]);
    }
  }, [projectId, projectMembers, profiles]);
  
  return (
    <FormField
      control={form.control}
      name="assignedTo"
      render={({ field }) => {
        // Log the field value before rendering
        console.log("Field value in render:", field.value);
        
        return (
          <FormItem>
            <FormLabel>Assignee</FormLabel>
            <Select 
              onValueChange={(value) => {
                console.log("Select onValueChange fired with value:", value);
                // Convert "unassigned" to null for the database
                const finalValue = value === "unassigned" ? null : value;
                console.log("Setting field value to:", finalValue);
                field.onChange(finalValue);
              }} 
              value={field.value || "unassigned"}
              disabled={isLoading || loadingMembers || !projectId}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      !projectId ? "Select a project first" :
                      loadingMembers ? "Loading assignees..." :
                      "Select assignee"
                    } 
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="unassigned">No assignee</SelectItem>
                {filteredProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.firstName && profile.lastName 
                      ? `${profile.firstName} ${profile.lastName}` 
                      : profile.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
