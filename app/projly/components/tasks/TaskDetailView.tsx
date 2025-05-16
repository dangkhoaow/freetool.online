
import React from "react";
import { format } from "date-fns";
import { Edit, Calendar, Clock, User, Briefcase, FileText, CheckCircle } from "lucide-react";
import { Task } from "@/app/projly/types/task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { parseDateSafe, formatDateForInput } from "@/app/projly/utils/dateUtils";

interface TaskDetailViewProps {
  task: Task;
  onEdit?: () => void;
  onClose: () => void;
}

export function TaskDetailView({ task, onEdit, onClose }: TaskDetailViewProps) {
  // Helper function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    switch (status) {
      case "Completed":
        variant = "default";
        break;
      case "In Progress":
        variant = "secondary";
        break;
      case "Not Started":
        variant = "outline";
        break;
      case "Pending":
        variant = "destructive";
        break;
      default:
        variant = "outline";
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 py-4">
      <div>
        <h2 className="text-2xl font-semibold">{task.title}</h2>
        {renderStatusBadge(task.status)}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span className="font-medium">Project:</span>
            <span>{task.project?.name || "No project"}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {/* Log the assignee object for debugging */}
              {(() => {
                console.log("[TaskDetailView] Rendering assignee for task:", task.id, task.assignee);
                if (task.assignee) {
                  // Log each property
                  console.log("[TaskDetailView] Assignee firstName:", task.assignee.firstName);
                  console.log("[TaskDetailView] Assignee lastName:", task.assignee.lastName);
                  // Display name using camelCase fields
                  return `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() || task.assignee.email || "Unassigned";
                }
                return "Unassigned";
              })()}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Start date:</span>
            <span>
              {(() => {
                // Standardize to camelCase field names
                const startDate = task.startDate;
                console.log("[TaskDetailView] Start date value:", startDate);
                
                if (startDate) {
                  try {
                    const parsedDate = parseDateSafe(startDate);
                    if (parsedDate) {
                      return format(parsedDate, "MMM d, yyyy");
                    }
                  } catch (error) {
                    console.error("[TaskDetailView] Error formatting start date:", error);
                  }
                }
                return "Not specified";
              })()}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Due date:</span>
            <span>
              {(() => {
                // Standardize to camelCase field names
                const dueDate = task.dueDate;
                console.log("[TaskDetailView] Due date value:", dueDate);
                
                if (dueDate) {
                  try {
                    const parsedDate = parseDateSafe(dueDate);
                    if (parsedDate) {
                      return format(parsedDate, "MMM d, yyyy");
                    }
                  } catch (error) {
                    console.error("[TaskDetailView] Error formatting due date:", error);
                  }
                }
                return "No deadline";
              })()}
            </span>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4" />
          <h3 className="font-medium">Description</h3>
        </div>
        {task.description ? (
          <p className="text-muted-foreground whitespace-pre-wrap">
            {task.description}
          </p>
        ) : (
          <p className="text-muted-foreground italic">No description provided</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <DialogClose asChild>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogClose>
        <Button onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" /> Edit Task
        </Button>
      </div>
    </div>
  );
}
