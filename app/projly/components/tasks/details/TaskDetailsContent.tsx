import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

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

  return (
    <div className="space-y-6">
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
          <span className="text-sm text-muted-foreground">
            {task.status}
          </span>
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
                  className="p-0 h-auto font-normal"
                  onClick={() => {
                    console.log(`[PROJLY:TASK_DETAILS] Parent task link clicked:`, task.parentTaskId);
                    router.push(`/projly/tasks/${task.parentTaskId}`);
                  }}
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
          <p className="whitespace-pre-wrap">{task.description || 'No description provided'}</p>
        </div>
      </div>
    </div>
  );
}
