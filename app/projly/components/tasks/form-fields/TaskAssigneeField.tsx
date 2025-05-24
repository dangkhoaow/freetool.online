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
import { Profile } from "@/app/projly/projects/new/page";
import { useProjectMembers } from "@/lib/services/projly/use-projects";
import { Spinner } from "@/components/ui/spinner";
import { PageLoading } from "@/app/projly/components/ui/PageLoading";

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
  const safeProjectId = projectId == null ? undefined : projectId;
  console.log('[TaskAssigneeField] Safe project ID set to:', safeProjectId);
  const { data: projectMembers = [], isLoading: isMembersLoading } = useProjectMembers(safeProjectId);
  
  // Convert project members data to match Profile interface
  const members = Array.isArray(projectMembers) ? projectMembers.map((member: any) => ({
    ...member,
    // Convert null values to undefined to match the Profile interface
    position: member.position || undefined
  })) as Profile[] : [];
  
  // Add detailed debug logging
  console.log('[TaskAssigneeField] Project members:', projectMembers);
  console.log('[TaskAssigneeField] Converted members:', members);
  console.log('[TaskAssigneeField] Form projectId:', projectId);
  console.log('[TaskAssigneeField] Safe projectId:', safeProjectId);

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
            onValueChange={(value) => {
              console.log('[TaskAssigneeField] Value selected:', value);
              field.onChange(value === "unassigned" ? "unassigned" : value);
            }}
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
                  <PageLoading 
                    standalone={true} 
                    logContext="PROJLY:TASKS:ASSIGNEE_FIELD" 
                    height="10vh" 
                  />
                </div>
              )}
              
              {/* Show filtered profiles */}
              {!isLoading && !isMembersLoading && filteredProfiles.map((profile) => {
                console.log('[TaskAssigneeField] Rendering profile item:', profile);
                
                // Handle different profile structures safely
                const user = profile.user || profile;
                
                // Build display name with fallbacks for different API formats
                let displayName = 'Unknown User';
                
                if (user.firstName && user.lastName) {
                  displayName = `${user.firstName} ${user.lastName} - ${user.email}`;
                } else if (user.name) {
                  displayName = `${user.name} - ${user.email}`;
                } else if (user.email) {
                  displayName = `${user.email}`;
                }
                  
                // Extract the correct user ID, which is what the database constraint requires
                // For team members, we need to use the userId field, not the team member ID
                const userId = user.id || (profile.userId ? profile.userId : profile.id);
                
                // Log the ID mapping for debugging
                console.log(`[TaskAssigneeField] Mapping profile to userId: profileId=${profile.id}, userId=${userId}`);
                
                return (
                  <SelectItem key={profile.id} value={userId}>
                    {displayName}
                  </SelectItem>
                );
              })}
              
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
