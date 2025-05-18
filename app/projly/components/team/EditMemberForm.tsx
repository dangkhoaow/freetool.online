import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useUpdateMember, TeamMemberWithUser } from "@/lib/services/projly/use-members";
import type { Team } from "@/lib/services/projly/use-team";

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

  const roles = ["Member", "Lead", "Manager", "Admin"];

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
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
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
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
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
