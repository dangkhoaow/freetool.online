
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateMember, useInviteMember } from "@/lib/services/projly/use-members";
import { TeamWithProject } from "@/lib/services/projly/use-team";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
// Supabase import removed - no longer needed
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import { FolderOpen } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Valid email is required"),
  teamId: z.string().min(1, "Team is required"),
  role: z.string().optional(),
  department: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type AddMemberFormProps = {
  teams: TeamWithProject[];
  onSuccess: () => void;
};

// No longer need the ProfileUser type as we're using email input

export function AddMemberForm({ teams, onSuccess }: AddMemberFormProps) {
  const [selectedTeam, setSelectedTeam] = useState<TeamWithProject | null>(null);
  const { toast } = useToast();
  const { mutate: inviteMember, isPending } = useInviteMember();

  // No need to fetch users as we're using email input

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      teamId: "",
      role: "Member",
      department: "",
    },
  });

  // Update selected team when teamId changes
  useEffect(() => {
    const teamId = form.watch("teamId");
    const team = teams.find(t => t.id === teamId);
    setSelectedTeam(team || null);
    console.log('Team selection changed. Selected team:', team);
  }, [form.watch("teamId"), teams]);

  const onSubmit = (data: FormValues) => {
    const invitationData = {
      email: data.email,
      teamId: data.teamId,
      role: data.role || "Member",
      department: data.department,
    };
    console.log('[AddMemberForm] Submitting invitation with data:', invitationData);
    inviteMember(invitationData, {
      onSuccess: () => {
        onSuccess();
        form.reset();
        console.log('[AddMemberForm] Invitation sent successfully.');
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Enter email address" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Enter the email address of the person you want to invite.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teamId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
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
              {selectedTeam?.project && (
                <FormDescription className="flex items-center gap-1 mt-1">
                  <FolderOpen className="h-4 w-4" />
                  Associated with project: {selectedTeam.project.name}
                </FormDescription>
              )}
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
              <Select
                onValueChange={field.onChange}
                value={field.value || "Member"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Leader">Leader</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
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
                <Input placeholder="e.g., Engineering" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
          Add Member
        </Button>
      </form>
    </Form>
  );
}
