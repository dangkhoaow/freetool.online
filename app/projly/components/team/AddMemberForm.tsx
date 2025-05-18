
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateMember } from "@/lib/services/projly/use-members";
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
  userId: z.string().min(1, "User is required"),
  teamId: z.string().min(1, "Team is required"),
  role: z.string().optional(),
  department: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type AddMemberFormProps = {
  teams: TeamWithProject[];
  onSuccess: () => void;
};

// Define a type for users fetched from profiles to match the actual API response structure
type ProfileUser = {
  id: string;
  userId: string;
  bio?: string;
  avatarUrl?: string | null;
  jobTitle?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
};

export function AddMemberForm({ teams, onSuccess }: AddMemberFormProps) {
  const [users, setUsers] = useState<ProfileUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithProject | null>(null);
  const { toast } = useToast();
  const { mutate: createMember, isPending } = useCreateMember();

  // Fetch users from profiles table
  useEffect(() => {
    async function fetchUsers() {
      setIsLoadingUsers(true);
      try {
        console.log('[AddMemberForm] Fetching profiles from API');
        // Use API client to fetch profiles with correct /api/projly prefix
        const response = await apiClient.get('/api/projly/profiles');
        
        if (response.error) {
          throw response.error;
        }

        if (response.data) {
          // Store the profiles data as is
          const profiles = response.data as ProfileUser[];
          console.log('[AddMemberForm] Fetched profiles:', profiles);
          setUsers(profiles);
        } else {
          console.log('[AddMemberForm] No profiles returned from API');
          setUsers([]);
        }
      } catch (error: any) {
        console.error("[AddMemberForm] Error fetching profiles:", error);
        toast({
          variant: "destructive",
          title: "Error fetching users",
          description: error.message || "Failed to load users",
        });
      } finally {
        setIsLoadingUsers(false);
        console.log('[AddMemberForm] User loading complete. Current users state:', users);
      }
    }

    fetchUsers();
  }, [toast]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
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
    const memberData = {
      userId: data.userId,
      teamId: data.teamId,
      role: data.role || "Member",
      department: data.department,
    };
    console.log('Submitting AddMemberForm with data:', memberData);
    createMember(memberData, {
      onSuccess: () => {
        onSuccess();
        form.reset();
        console.log('Member added successfully.');
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoadingUsers}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select a user"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((profile) => (
                    <SelectItem key={profile.userId} value={profile.userId}>
                      {profile.user.firstName && profile.user.lastName 
                        ? `${profile.user.firstName} ${profile.user.lastName}` 
                        : profile.user.email}
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

        <Button type="submit" className="w-full" disabled={isPending || isLoadingUsers}>
          {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
          Add Member
        </Button>
      </form>
    </Form>
  );
}
