import { useState } from "react";
import { useTeams, useTeamMembersCount, useDeleteTeam, Team } from "@/lib/services/projly/use-team";
import { PlusCircle, Pencil, Trash, Users, FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { TeamForm } from "./TeamForm";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/services/projly/jwt-auth-adapter";

export function TeamsList() {
  const { data: teams, isLoading, refetch } = useTeams();
  const { mutate: deleteTeam, isPending: isDeleting } = useDeleteTeam();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  console.log("Teams data:", teams);

  // Handle opening the edit dialog
  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setIsOpen(true);
  };

  // Handle opening the delete dialog
  const handleDelete = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    if (!teamToDelete) return;
    
    deleteTeam(teamToDelete.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setTeamToDelete(null);
        refetch();
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Teams</h2>
        <Dialog 
          open={isOpen} 
          onOpenChange={(open) => {
            setIsOpen(open);
            // Reset selectedTeam when dialog is closed
            if (!open) {
              setSelectedTeam(null);
              console.log('[PROJLY:TEAMS] Dialog closed, resetting selectedTeam');
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => {
              // Ensure selectedTeam is null when creating a new team
              setSelectedTeam(null);
              console.log('[PROJLY:TEAMS] Create Team button clicked, setting selectedTeam to null');
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedTeam ? "Edit Team" : "Create Team"}
              </DialogTitle>
              <DialogDescription>
                {selectedTeam
                  ? "Update the team information."
                  : "Create a new team in your organization."}
              </DialogDescription>
            </DialogHeader>
            <TeamForm
              team={selectedTeam || undefined}
              onSuccess={() => {
                setIsOpen(false);
                setSelectedTeam(null);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner className="h-8 w-8" />
        </div>
      ) : teams && teams.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Sort teams alphabetically by name */}
          {[...teams]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((team) => (
              <TeamMemberCard
                key={team.id}
                team={team}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
        </div>
      ) : (
        <div className="col-span-full flex justify-center p-8 border rounded-lg bg-muted/20">
          <div className="text-center">
            <h3 className="text-lg font-medium">No teams found</h3>
            <p className="text-muted-foreground mt-1">
              Create a new team to get started
            </p>
          </div>
        </div>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team
              "{teamToDelete?.name}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TeamMemberCard({ 
  team, 
  onEdit, 
  onDelete 
}: { 
  team: Team; 
  onEdit: (team: Team) => void; 
  onDelete: (team: Team) => void;
}) {
  const { data: membersCount = 0, isLoading: isCountLoading } = useTeamMembersCount(
    team.id, 
    team.project?.id
  );
  const membersCountWithOwner = membersCount + 1; //include owner
  const { data: session } = useSession();
  // Check if the logged-in user is the team owner (not the project owner)
  const isOwner = session?.user?.id === team.ownerId;
  
  // Get owner display name - use firstName + lastName if available, otherwise use email
  const getOwnerDisplayName = () => {
    if (!team.owner) return 'Unknown';
    
    if (team.owner.firstName && team.owner.lastName) {
      return `${team.owner.firstName} ${team.owner.lastName} - ${team.owner.email}`;
    } else if (team.owner.firstName) {
      return `${team.owner.firstName} - ${team.owner.email}`;
    } else {
      return `${team.owner.email}`;
    }
  };
  
  const ownerDisplayName = getOwnerDisplayName();
  
  console.log("TeamMemberCard - Team:", team.name, "Owner:", ownerDisplayName, "Is Owner:", isOwner);

  return (
    <Card key={team.id}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{team.name}</CardTitle>
          <div className="flex space-x-1">
            {isOwner && <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(team)}
            >
              <Trash className="h-4 w-4" />
            </Button>}
            {isOwner && <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(team)}
            >
              <Pencil className="h-4 w-4" />
            </Button>}
          </div>
        </div>
        {team.project && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <FolderOpen className="h-4 w-4" />
            <span>{team.project.name}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {team.description ? (
          <p className="text-sm text-muted-foreground mb-4">
            {team.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic mb-4">
            No description
          </p>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">
              {isCountLoading ? (
                <Spinner className="h-3 w-3 mr-1" />
              ) : (
                `${membersCountWithOwner} ${membersCountWithOwner === 1 ? 'member' : 'members'}`
              )}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Owner: {ownerDisplayName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
