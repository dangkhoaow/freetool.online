import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ProjectMember {
  id: string;
  teamId: string;
  userId: string;
  role?: string;
  user?: {
    id: string;
    name?: string;
    lastName?: string;
    email?: string;
  };
}

interface AssigneeFieldProps {
  value: string;
  projectMembers: ProjectMember[];
  isLoadingMembers: boolean;
  onChange: (value: string) => void;
}

export function AssigneeField({ value, projectMembers, isLoadingMembers, onChange }: AssigneeFieldProps) {
  console.log('[PROJLY:TASK_FORM] Rendering AssigneeField component with', 
    projectMembers.length, 'members, loading:', isLoadingMembers);
  
  return (
    <div>
      <Label htmlFor="assignedTo">Assignee</Label>
      <Select
        value={value}
        onValueChange={(value) => onChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {/* Show loading state if fetching members */}
          {isLoadingMembers ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading members...</span>
            </div>
          ) : projectMembers.length > 0 ? (
            // Show project members if available
            projectMembers.map((member: ProjectMember) => (
              <SelectItem key={member.userId} value={member.userId}>
                {member.user?.name?.trim() || member.user?.lastName?.trim() 
                  ? `${member.user?.name} - ${member.user?.email}` 
                  : member.user?.email || 'Unknown user'}
              </SelectItem> 
            ))
          ) : (
            // Show message if no members found
            <div className="px-2 py-1 text-sm text-muted-foreground">
              No team members found for this project
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
