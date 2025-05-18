import { useState, useEffect } from "react";
import { useMembers, useDeleteMember, useAccessibleMembers } from "@/lib/services/projly/use-members";
import { useTeams } from "@/lib/services/projly/use-team";
import { useUserRoles } from "@/lib/services/projly/use-user-roles";
// import { TeamMember } from "@/services/members"; // Not needed, type comes from hook

// Local type for team member with user (matches backend and hook)
type TeamMemberWithUser = {
  id: string;
  teamId: string;
  userId: string;
  role?: string;
  department?: string;
  createdAt?: Date;
  updatedAt?: Date;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    position?: string | null;
    name?: string;
    image?: string;
  };
};
import { Pencil, Search, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { AddMemberForm } from "./AddMemberForm";
import { EditMemberForm } from "./EditMemberForm";

export function MembersTable() {
  // State for filters and sorting
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortField, setSortField] = useState<"name" | "role" | "team" | "department">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithUser | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Get members data - use the new useAccessibleMembers hook to get filtered members
  const { data: accessibleMembers = [], isLoading: isLoadingAccessible, error: accessibleError } = useAccessibleMembers();
  const { data: members = [], isLoading: isLoadingMembers } = useMembers(teamFilter !== "all" ? teamFilter : undefined);
  const { data: teams = [], isLoading: isLoadingTeams } = useTeams(); // teams: Team[]
  const { mutate: deleteMember, isPending: isDeleting } = useDeleteMember();
  
  // Determine which members data to use based on the current role and API success
  const isLoading = isLoadingAccessible || isLoadingMembers || isLoadingTeams;
  const error = null; // Don't show error to user, just fall back to regular members
  
  // Use the accessible members if available, otherwise fall back to regular members
  // This ensures we still show data even if the accessible members API fails
  const membersData = accessibleError || accessibleMembers.length === 0 ? members : accessibleMembers;
  console.log('[MEMBERS:TABLE] Using members data, source:', accessibleError ? 'fallback regular members' : 'filtered accessible members', 'count:', membersData.length);
  
  // If there was an error with the accessible members API, log it but don't show to user
  if (accessibleError) {
    console.error('[MEMBERS:TABLE] Error fetching accessible members, falling back to regular members:', accessibleError);
  }

  // Get current user role for privileged access (admin/site_owner)
  const { data: currentRole, isLoading: isLoadingRole } = useUserRoles().currentUserRole;
  const isPrivileged = !isLoadingRole && (currentRole === 'admin' || currentRole === 'site_owner');

  // Default to first team on load for non-privileged users
  useEffect(() => {
    // Only apply default filter after role is loaded and user not privileged
    if (!isLoadingRole && teams.length > 0 && teamFilter === "all" && !isPrivileged) {
      setTeamFilter(teams[0].id);
    }
  }, [teams, teamFilter, isPrivileged, isLoadingRole]);

  // Filter and sort the members data
  const filteredMembers = membersData.filter((member) => {
    const matchesSearch = 
      `${member.user?.firstName} ${member.user?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      member.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      member.role?.toLowerCase().includes(search.toLowerCase()) ||
      member.department?.toLowerCase().includes(search.toLowerCase());
    // Filter by selected teamId (use proper property) and role
    return (
      matchesSearch &&
      (teamFilter === "all" || member.teamId === teamFilter) &&
      (roleFilter === "all" || member.role === roleFilter)
    );
  });
  console.log('[MEMBERS:TABLE] Applied UI filters, resulting count:', filteredMembers.length);

  // Get unique roles for the filter dropdown
  const roles = Array.from(new Set(membersData.map(member => member.role))).filter(Boolean);
  console.log('[MEMBERS:TABLE] Available roles:', roles);

  // Sort the filtered members
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let compareA, compareB;

    switch (sortField) {
      case "name":
        compareA = `${a.user?.firstName} ${a.user?.lastName}`;
        compareB = `${b.user?.firstName} ${b.user?.lastName}`;
        break;
      case "role":
        compareA = a.role || "";
        compareB = b.role || "";
        break;
      case "department":
        compareA = a.department || "";
        compareB = b.department || "";
        break;
      default:
        compareA = a.user?.firstName || "";
        compareB = b.user?.firstName || "";
    }

    if (sortDirection === "asc") {
      return compareA.localeCompare(compareB);
    } else {
      return compareB.localeCompare(compareA);
    }
  });
  console.log('Sorted members:', sortedMembers);

  // Toggle sort direction
  const toggleSort = (field: "name" | "role" | "team" | "department") => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (isLoading || isLoadingTeams) {
    return (
      <div className="flex justify-center p-8">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    // Safe access to error message property
    const errorMessage = typeof error === 'string' 
      ? error 
      : (error && typeof error === 'object' && error !== null && 'message' in error) 
        ? String((error as { message: string }).message) 
        : 'Unknown error';
    
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        Error loading members: {errorMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Team Members</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a new team member to your organization.
              </DialogDescription>
            </DialogHeader>
            <AddMemberForm teams={teams} onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center w-full sm:w-auto">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm whitespace-nowrap">Team:</span>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm whitespace-nowrap">Role:</span>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role || ""}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Members table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => toggleSort("name")} className="cursor-pointer">
                Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead onClick={() => toggleSort("department")} className="cursor-pointer">
                Department {sortField === "department" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => toggleSort("role")} className="cursor-pointer">
                Role {sortField === "role" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No team members found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              sortedMembers.map((member) => {
                const teamName = teams.find(t => t.id === member.teamId)?.name || "Unknown Team";
                
                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {(() => {console.log('Rendering member:', member); return null;})()}
                      {(member.user?.firstName || "")} {(member.user?.lastName || "")}
                    </TableCell>
                    <TableCell>{member.user?.email}</TableCell>
                    <TableCell>{member.department || "—"}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog open={isEditDialogOpen && selectedMember?.id === member.id} onOpenChange={(open) => {
                          if (!open) {
                            setSelectedMember(null);
                          }
                          setIsEditDialogOpen(open);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => {
                                setSelectedMember(member);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Team Member</DialogTitle>
                              <DialogDescription>
                                Update team member information.
                              </DialogDescription>
                            </DialogHeader>
                            {selectedMember && (
                              <EditMemberForm 
                                member={selectedMember} 
                                teams={teams}
                                onSuccess={() => {
                                  setSelectedMember(null);
                                  setIsEditDialogOpen(false);
                                }} 
                              />
                            )}
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {(member.user?.firstName || "")} {(member.user?.lastName || "")} from the team? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                disabled={isDeleting}
                                onClick={() => deleteMember(member.id)}
                              >
                                {isDeleting ? <Spinner className="h-4 w-4 mr-2" /> : null}
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
