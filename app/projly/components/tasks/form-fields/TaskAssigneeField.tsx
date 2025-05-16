"use client";

import React, { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskFormValues } from "../schemas/taskSchema";
import { Profile } from "@/app/projly/types/profile";
import { useProjectMembers } from "../../../hooks/use-projects";
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

  // Fetch project members when a project is selected with proper typing
  const { data: projectMembers = [], isLoading: isMembersLoading } = useProjectMembers(projectId);
  
  // Convert project members data to match Profile interface
  const members = Array.isArray(projectMembers) ? projectMembers.map((member: any) => ({
    ...member,
    // Convert null values to undefined to match the Profile interface
    position: member.position || undefined
  })) as Profile[] : [];
  
  // Add debug logging
  console.log('[TaskAssigneeField] Project members:', projectMembers);
  console.log('[TaskAssigneeField] Converted members:', members);

  useEffect(() => {
    // If a project is selected, filter assignees to project members
    if (projectId) {
      console.log("[TaskAssigneeField] Project selected, filtering members:", projectId);
      
      // Clean profiles to match the expected structure
      const availableProfiles = members.length > 0 
        ? members
        : profiles; // Fall back to all profiles
      
      setFilteredProfiles(availableProfiles);
    } else {
      // No project selected, show all available profiles
      console.log("[TaskAssigneeField] No project, showing all profiles");
      setFilteredProfiles(profiles);
    }
  }, [projectId, profiles, members]);

  return (
    <FormField
      control={form.control}
      name="assignedTo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assignee</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(value === "unassigned" ? undefined : value)}
            defaultValue={field.value || "unassigned"}
            value={field.value || "unassigned"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              
              {/* Loading state */}
              {(isLoading || isMembersLoading) && (
                <div className="flex items-center justify-center py-2">
                  <Spinner className="mr-2 h-4 w-4" />
                  <span className="text-sm">Loading...</span>
                </div>
              )}
              
              {/* Show filtered profiles */}
              {!isLoading && !isMembersLoading && filteredProfiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : profile.email || 'Unknown User'}
                </SelectItem>
              ))}
              
              {/* No profiles found */}
              {!isLoading && !isMembersLoading && filteredProfiles.length === 0 && (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  No members found
                </div>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
