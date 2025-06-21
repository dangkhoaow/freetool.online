import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useState, useEffect } from "react";

interface AdditionalInfoContentProps {
  task: {
    id: string;
    title?: string;
    percentProgress?: number | null;
    label?: string | null;
    relatedTasks?: string[] | Array<{id: string; title: string; label?: string | null}> | null;
    relatedToTasks?: Array<{relatedTaskId?: string; relatedTask?: {id?: string; title?: string; label?: string | null}}>;
    relatedFromTasks?: Array<{taskId?: string; task?: {id?: string; title?: string; label?: string | null}}>;
    [key: string]: any; // Allow any additional properties for flexibility
  };
  allTasks: Array<{id: string; title: string; label?: string | null}>;
}

export function AdditionalInfoContent({
  task,
  allTasks
}: AdditionalInfoContentProps) {
  console.log('[PROJLY:TASK_DETAILS] Rendering AdditionalInfoContent', { 
    task, 
    relatedTasks: task.relatedTasks, 
    relatedToTasks: task.relatedToTasks, 
    relatedFromTasks: task.relatedFromTasks,
    allTasks: allTasks
  });
  
  // State to show all related tasks (for when there are many)
  const [showAllRelatedTasks, setShowAllRelatedTasks] = useState(false);
  const [processedRelatedTasks, setProcessedRelatedTasks] = useState<Array<{
    id: string;
    title: string;
    label?: string | null;
  }>>([]);
  
  // Helper function to get related task details from ID
  const getTaskDetails = (taskId: string) => {
    const foundTask = allTasks.find(t => t.id === taskId);
    console.log(`[PROJLY:TASK_DETAILS] Looking up task ${taskId}:`, foundTask || 'Not found in allTasks');
    return foundTask || { id: taskId, title: 'Unknown task' };
  };
  
  // Process related tasks to ensure we have a consistent format
  useEffect(() => {
    console.log('[PROJLY:TASK_DETAILS] Processing related tasks:', { 
      relatedTasks: task.relatedTasks, 
      relatedToTasks: task.relatedToTasks, 
      relatedFromTasks: task.relatedFromTasks,
      allTasksCount: allTasks.length 
    });

    const result: Array<{id: string; title: string; label?: string | null}> = [];
    const processedIds = new Set<string>(); // Track processed IDs to prevent duplicates
    
    // Helper to add a task to the results only if not already added
    const addTaskIfUnique = (taskId: string, taskTitle: string, taskLabel?: string | null) => {
      if (!processedIds.has(taskId)) {
        processedIds.add(taskId);
        result.push({ 
          id: taskId, 
          title: taskTitle || 'Unnamed task',
          label: taskLabel 
        });
        console.log(`[PROJLY:TASK_DETAILS] Added unique task: ${taskId} - ${taskTitle}`);
      } else {
        console.log(`[PROJLY:TASK_DETAILS] Skipped duplicate task: ${taskId} - ${taskTitle}`);
      }
    };
    
    // First try to use relatedTasks array if it's available and contains objects
    if (Array.isArray(task.relatedTasks) && task.relatedTasks.length > 0) {
      task.relatedTasks.forEach(relatedTask => {
        if (typeof relatedTask === 'object' && relatedTask !== null && 'id' in relatedTask && relatedTask.id) {
          // It's a task object with id and title
          console.log('[PROJLY:TASK_DETAILS] Found related task object:', relatedTask);
          addTaskIfUnique(relatedTask.id, relatedTask.title, relatedTask.label);
        } else if (typeof relatedTask === 'string') {
          // It's just an ID string
          console.log('[PROJLY:TASK_DETAILS] Found related task ID:', relatedTask);
          const taskDetails = getTaskDetails(relatedTask);
          addTaskIfUnique(taskDetails.id, taskDetails.title, taskDetails.label);
        }
      });
    }
    
    // Check relatedToTasks
    if (Array.isArray(task.relatedToTasks)) {
      task.relatedToTasks.forEach(relation => {
        if (relation && relation.relatedTask && relation.relatedTask.id) {
          console.log('[PROJLY:TASK_DETAILS] Found relatedToTask:', relation.relatedTask);
          addTaskIfUnique(
            relation.relatedTask.id, 
            relation.relatedTask.title || 'Unnamed task',
            relation.relatedTask.label
          );
        }
      });
    }
    
    // Also check relatedFromTasks
    if (Array.isArray(task.relatedFromTasks)) {
      task.relatedFromTasks.forEach(relation => {
        if (relation && relation.task && relation.task.id) {
          const taskId = relation.task.id;
          const taskTitle = relation.task.title || 'Unnamed task';
          
          console.log('[PROJLY:TASK_DETAILS] Found relatedFromTask:', relation.task);
          addTaskIfUnique(taskId, taskTitle, relation.task.label);
        }
      });
    }
    
    console.log('[PROJLY:TASK_DETAILS] Processed related tasks:', result);
    setProcessedRelatedTasks(result);
  }, [task, allTasks]);
  
  // Show only first 5 related tasks by default unless expanded
  const visibleRelatedTasks = showAllRelatedTasks 
    ? processedRelatedTasks 
    : processedRelatedTasks.slice(0, 5);
  
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Progress</h3>
        <div className="space-y-1">
          <Progress value={task.percentProgress || 0} className="h-2" />
          <p className="text-sm text-right">{Math.round(task.percentProgress || 0)}%</p>
        </div>
      </div>
      
      {/* Label */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Label</h3>
        {task.label ? (
          <Badge variant="secondary">{task.label}</Badge>
        ) : (
          <p className="text-sm text-muted-foreground">No label assigned</p>
        )}
      </div>
      
      {/* Related Tasks */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Related Tasks</h3>
        {processedRelatedTasks.length > 0 ? (
          <div className="space-y-2">
            <ul className="space-y-1">
              {visibleRelatedTasks.map((relatedTask) => (
                <li key={relatedTask.id} className="text-sm flex items-center gap-2">
                  <Link 
                    href={`/projly/tasks/${relatedTask.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {relatedTask.title}
                  </Link>
                  {relatedTask.label && (
                    <Badge variant="outline" className="text-xs">
                      {relatedTask.label}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
            {processedRelatedTasks.length > 5 && (
              <button
                onClick={() => setShowAllRelatedTasks(!showAllRelatedTasks)}
                className="text-sm text-blue-600 hover:underline mt-1"
              >
                {showAllRelatedTasks 
                  ? "Show less" 
                  : `Show all (${processedRelatedTasks.length})`}
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No related tasks</p>
        )}
      </div>
    </div>
  );
} 