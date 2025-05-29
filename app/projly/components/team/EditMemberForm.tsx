import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useUpdateMember, TeamMemberWithUser } from "@/lib/services/projly/use-members";
import type { Team } from "@/lib/services/projly/use-team";
import { useSession } from "@/lib/services/projly/jwt-auth-adapter";
import { TEAM_ROLES } from "@/app/projly/config/team-roles";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Spinner } from "@/components/ui/spinner";
import { DialogClose } from "@/components/ui/dialog";

// Form schema using zod
const memberSchema = z.object({
  team_id: z.string().uuid({ message: "Please select a team" }),
  role: z.string().min(1, { message: "Role is required" }),
  department: z.string().optional(),
});

// Type from the schema
type MemberFormValues = z.infer<typeof memberSchema>;

interface EditMemberFormProps {
  member: TeamMemberWithUser;
  teams: Team[];
  onSuccess?: () => void;
}

export function EditMemberForm({ member, teams, onSuccess }: EditMemberFormProps) {
  const { mutate: updateMember, isPending } = useUpdateMember();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  
  // Filter teams to only show those owned by the current user
  const ownedTeams = useMemo(() => {
    console.log('[EditMemberForm] Filtering teams by ownership, currentUserId:', currentUserId);
    if (!currentUserId || !teams || teams.length === 0) {
      console.log('[EditMemberForm] No user ID or teams data available');
      return [];
    }
    
    // Check if the current user is the owner of each team
    const filtered = teams.filter(team => {
      // Check if the team has an ownerId property directly
      if ('ownerId' in team && team.ownerId === currentUserId) {
        return true;
      }
      
      // If not, check if any team member has the owner role and matches the current user
      if (team.members && team.members.length > 0) {
        return team.members.some(member => 
          member.userId === currentUserId && 
          member.role?.toLowerCase() === 'owner'
        );
      }
      
      return false;
    });
    
    console.log(`[EditMemberForm] Found ${filtered.length} teams owned by current user out of ${teams.length} total teams`);
    return filtered;
  }, [teams, currentUserId]);
  
  // Always include the member's current team in the list, even if not owned by current user
  const displayTeams = useMemo(() => {
    const currentTeam = teams.find(t => t.id === member.teamId);
    if (currentTeam && !ownedTeams.some(t => t.id === currentTeam.id)) {
      console.log('[EditMemberForm] Adding current team to list even though not owned by current user');
      return [...ownedTeams, currentTeam];
    }
    return ownedTeams;
  }, [ownedTeams, member.teamId, teams]);
  
  // Initialize the form with react-hook-form and zod validation
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      team_id: member.teamId || "",
      role: member.role || "Member",
      department: member.department || "",
    },
  });

  // Handle form submission
  function onSubmit(data: MemberFormValues) {
    console.log('Submitting EditMemberForm with data:', data);
    
    // Include both role and department fields as they are now supported in the ProjlyTeamMember schema
    updateMember(
      { 
        id: member.id, 
        data: {
          role: data.role,
          department: data.department // Now supported after database migration
        }
      },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
          console.log('Member updated successfully.');
        },
      }
    );
  }

  // Use the centralized team roles configuration
  console.log('[EditMemberForm] Using centralized team roles configuration');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
          <p className="text-sm font-medium">User</p>
          <p className="text-sm text-gray-500 mt-1">
            {(() => {console.log('Rendering user info:', member.user); return null;})()}
            {member.user?.firstName} {member.user?.lastName} ({member.user?.email})
          </p>
        </div>

        <FormField
          control={form.control}
          name="team_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {displayTeams.length > 0 ? (
                    displayTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                        {team.id === member.teamId ? " (Current)" : ""}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-sm text-gray-500">
                      No teams available. You must own a team to edit members.
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "Member"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TEAM_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
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
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input placeholder="Enter department" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
