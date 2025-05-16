import React from "react";
import { Edit, Trash } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateForDisplay } from "@/app/projly/utils/dateUtils";
import { projlyProjectPermissionsService, type Project } from "@/lib/services/projly";

interface ProjectTableRowProps {
  project: Project;
  handleProjectClick: (id: string) => void;
  setDeleteProjectId: (id: string) => void;
}

export function ProjectTableRow({ project, handleProjectClick, setDeleteProjectId }: ProjectTableRowProps) {
  // Use the project permissions service to check if the user can delete this project
  const userCanDeleteProject = projlyProjectPermissionsService.canDeleteProject(project.ownerId);
  
  console.log(`[PROJECT TABLE ROW] Project ${project.id} owned by ${project.ownerId}, user can delete: ${userCanDeleteProject}`);
  
  // Render status badge with appropriate color
  const renderStatusBadge = (status?: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    if (!status) {
      return <Badge variant="outline">Unknown</Badge>;
    }
    
    switch (status.toLowerCase()) {
      case "completed":
        variant = "default";
        break;
      case "in progress":
        variant = "secondary";
        break;
      case "planning":
        variant = "outline";
        break;
      default:
        variant = "outline";
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <TableRow 
      key={project.id}
      className="cursor-pointer hover:bg-muted/50"
      onDoubleClick={() => handleProjectClick(project.id)}
    >
      <TableCell className="font-medium">{project.name}</TableCell>
      <TableCell className="max-w-[300px] truncate">
        {project.description || "-"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDateForDisplay(project.createdAt, 'medium')}
      </TableCell>
      <TableCell>{renderStatusBadge(project.status)}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleProjectClick(project.id)}>
              <Edit className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            
            {/* Only show delete option if user has permission */}
            {userCanDeleteProject && (
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onSelect={() => setDeleteProjectId(project.id)}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
