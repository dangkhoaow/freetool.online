import React from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Edit, Calendar, Clock, User, Briefcase, FileText, CheckCircle } from "lucide-react";
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

// Add formatDateForDisplay function
const formatDateForDisplay = (date: string | null | undefined): string => {
  if (!date) return "-";
  try {
    const parsedDate = parseDateSafe(date);
    if (parsedDate) {
      return format(parsedDate, "MMM d, yyyy");
    }
  } catch (error) {
    console.error("[TaskDetailView] Error formatting date:", error);
  }
  return "-";
};

// Update Task interface to include parentTask
interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  projectId: string;
  assignedTo?: string;
  startDate?: string;
  dueDate?: string;
  parentTaskId?: string;
  parentTask?: {
    id: string;
    title: string;
  };
  subTasks?: Task[];
  project?: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  };
}

export function TaskDetailView({ task, onEdit, onClose }: TaskDetailViewProps) {
  // Initialize router for navigation
  const router = useRouter();
  
  // Handle edit button click - navigate to edit page
  const handleEditClick = () => {
    console.log("[TaskDetailView] Navigating to edit task page:", task.id);
    // Close the dialog if onClose is provided
    if (onClose) {
      onClose();
    }
    // Navigate to the edit page
    router.push(`/projly/tasks/${task.id}/edit`);
  };
  // Helper function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let customClass = "";
    
    console.log(`[TaskDetailView] Rendering badge for status: ${status}`);
    
    switch (status) {
      case "Completed":
        variant = "default";
        customClass = "bg-green-600 text-white hover:bg-green-700 border-green-600";
        break;
      case "In Progress":
        variant = "secondary";
        customClass = "bg-blue-600 text-white hover:bg-blue-700 border-blue-600";
        break;
      case "In Review":
        variant = "outline";
        customClass = "bg-purple-500 text-white hover:bg-purple-600 border-purple-500";
        break;
      case "Not Started":
        variant = "outline";
        customClass = "bg-gray-500 text-white hover:bg-gray-600 border-gray-500";
        break;
      case "On Hold":
        variant = "outline";
        customClass = "bg-orange-500 text-white hover:bg-orange-600 border-orange-500";
        break;
      case "Pending":
        variant = "destructive";
        customClass = "bg-amber-500 text-white hover:bg-amber-600 border-amber-500";
        break;
      default:
        variant = "outline";
        customClass = "bg-gray-400 text-white hover:bg-gray-500 border-gray-400";
    }
    
    return <Badge variant={variant} className={customClass}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{task.title}</h2>
          <p className="text-muted-foreground mt-1">{task.description}</p>
        </div>
        <Button onClick={handleEditClick}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Task
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Project:</span>
            <span>{task.project?.name || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Assignee:</span>
            <span>{task.assignee?.name || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Status:</span>
            {renderStatusBadge(task.status)}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Start Date:</span>
            <span>{formatDateForDisplay(task.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Due Date:</span>
            <span>{formatDateForDisplay(task.dueDate)}</span>
          </div>
        </div>
      </div>

      {task.parentTaskId && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium">Parent Task</h3>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-l border-b border-gray-300" />
              <span>{task.parentTask?.title || "Loading..."}</span>
            </div>
          </div>
        </>
      )}

      {task.subTasks && task.subTasks.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium">Sub-tasks</h3>
            <div className="space-y-2">
              {task.subTasks.map((subTask) => (
                <div key={subTask.id} className="flex items-center gap-2">
                  <div className="w-4 h-4 border-l border-b border-gray-300" />
                  <span>{subTask.title}</span>
                  {renderStatusBadge(subTask.status)}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <DialogClose asChild>
        <Button variant="outline" className="w-full">
          Close
        </Button>
      </DialogClose>
    </div>
  );
}
