import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

// Custom CSS to add proper link styling in the rendered HTML content
const customLinkStyles = `
  .description-content a {
    word-break: break-all;
    overflow-wrap: break-word;
    color: hsl(var(--primary));
    text-decoration: underline;
    overflow: hidden;
    display: inline-block;
    max-width: 100%;
  }
  
  .description-content a:hover {
    text-decoration: none;
  }
  
  .description-content pre {
    white-space: pre-wrap;
    word-break: break-all;
  }
`;

interface TaskDetailsContentProps {
  task: {
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    startDate?: Date | null;
    dueDate?: Date | null;
    projectId: string;
    parentTaskId?: string | null;
    assignedTo?: string | null;
    assignee?: any;
  };
  projects: Array<{id: string; name: string}>;
  projectMembers: Array<any>;
  parentTask?: { id: string; title: string } | null;
  isLoadingMembers: boolean;
}

export function TaskDetailsContent({
  task,
  projects,
  projectMembers,
  parentTask,
  isLoadingMembers
}: TaskDetailsContentProps) {
  console.log('[PROJLY:TASK_DETAILS] Rendering TaskDetailsContent');
  const router = useRouter();

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let customClass = "";
    
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
      {/* Include custom styles */}
      <style jsx global>{customLinkStyles}</style>
      
      {/* Title */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
        <p className="text-base">{task.title}</p>
      </div>
      
      {/* Dates and Status */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {task.dueDate ? `Due ${task.dueDate.toLocaleDateString()}` : 'No due date'}
          </span>
        </div>
        {task.startDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Starts {task.startDate.toLocaleDateString()}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Status: </span>
          {renderStatusBadge(task.status)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Priority:</span>
          <Badge variant={task.priority === 'High' ? 'destructive' : 'default'}>
            {task.priority}
          </Badge>
        </div>
      </div>
      
      {/* Project */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground">Project</h3>
        <p className="text-base">
          {(() => {
            const project = projects.find(p => p.id === task.projectId);
            if (project) {
              return (
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-normal" 
                  onClick={() => router.push(`/projly/projects/${project.id}`)}
                >
                  {project.name}
                </Button>
              );
            }
            return 'Unknown project';
          })()}
        </p>
        
        {/* Parent Task */}
        {task.parentTaskId && (
          <div className="mt-1">
            <h3 className="text-sm font-medium text-muted-foreground">Parent Task</h3>
            {(() => {
              console.log(`[PROJLY:TASK_DETAILS] Rendering parent task link for parentTaskId:`, task.parentTaskId);
              console.log(`[PROJLY:TASK_DETAILS] Parent task data:`, parentTask);
              return (
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal max-w-full overflow-hidden text-ellipsis whitespace-nowrap block text-left"
                  onClick={() => {
                    console.log(`[PROJLY:TASK_DETAILS] Parent task link clicked:`, task.parentTaskId);
                    router.push(`/projly/tasks/${task.parentTaskId}`);
                  }}
                  title={`${parentTask?.title || 'Loading...'} (${task.parentTaskId})`}
                >
                  {parentTask?.title || 'Loading...'} 
                  <span className="text-xs text-slate-500 ml-1">({task.parentTaskId})</span>
                </Button>
              );
            })()}
          </div>
        )}
      </div>
      
      {/* Assignee */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground">Assignee</h3>
        <p className="text-base">
          {(() => {
            if (task.assignedTo === 'none') return 'None';
            
            if (isLoadingMembers) {
              return (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </span>
              );
            }
            
            console.log('[PROJLY:TASK_DETAILS] Assignee lookup - task.assignedTo:', task.assignedTo);
            console.log('[PROJLY:TASK_DETAILS] Assignee lookup - projectMembers:', projectMembers);
            console.log('[PROJLY:TASK_DETAILS] Assignee lookup - task.assignee:', task.assignee);
            
            // First try to use the assignee object directly from task if it exists
            if (task.assignee) {
              console.log('[PROJLY:TASK_DETAILS] Using assignee from task:', task.assignee);
              return task.assignee.firstName && task.assignee.lastName
                ? `${task.assignee.firstName} ${task.assignee.lastName} - ${task.assignee.email}`
                : task.assignee.email || 'Unknown user';
            }
            
            // If no assignee in task, try to find in project members
            const assignee = projectMembers.find(m => m.userId === task.assignedTo);
            if (assignee?.user) {
              console.log('[PROJLY:TASK_DETAILS] Found assignee in project members:', assignee.user);
              return assignee.user.firstName && assignee.user.lastName
                ? `${assignee.user.firstName} ${assignee.user.lastName} - ${assignee.user.email}`
                : assignee.user.email || 'Unknown user';
            }
            
            console.log('[PROJLY:TASK_DETAILS] No assignee found for ID:', task.assignedTo);
            return 'Unknown user';
          })()}
        </p>
      </div>
            
      {/* Description */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
        <div className="rounded-md bg-muted/50 p-3">
          {task.description ? (
            <div 
              className="prose prose-sm dark:prose-invert max-w-none break-words description-content"
              style={{ 
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}
              dangerouslySetInnerHTML={{ __html: task.description }} 
            />
          ) : (
            <p className="text-muted-foreground">No description provided</p>
          )}
        </div>
      </div>
    </div>
  );
}
