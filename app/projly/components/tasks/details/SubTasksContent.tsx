import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Task } from "@/lib/services/projly/types";
import { TasksContainer } from "@/app/projly/components/tasks/TasksContainer";
import { CardTitle } from "@/components/ui/card";

interface SubTasksContentProps {
  subTasks: Task[];
  parentTaskId: string;
  parentProjectId: string;
  onCreateSubTaskClick: () => void;
}

/**
 * SubTasksContent - Component to display a list of sub-tasks for a given task
 * and provide functionality to create new sub-tasks.
 * @param {Object} props - The props object
 * @param {Task[]} props.subTasks - Array of sub-task objects
 * @param {string} props.parentTaskId - ID of the parent task
 * @param {string} props.parentProjectId - ID of the parent project
 * @param {Function} props.onCreateSubTaskClick - Callback for creating a new sub-task
 * @returns {JSX.Element} Sub-tasks content component
 */
export function SubTasksContent({ 
  subTasks, 
  parentTaskId, 
  parentProjectId,
  onCreateSubTaskClick 
}: SubTasksContentProps) {
  console.log('[SUB_TASKS_CONTENT] Rendering sub-tasks list', subTasks);
  console.log('[SUB_TASKS_CONTENT] Parent task ID', parentTaskId);
  console.log('[SUB_TASKS_CONTENT] Parent project ID', parentProjectId);

  // Render empty state with create button if no sub-tasks exist
  if (subTasks.length === 0) {
    console.log('[SUB_TASKS_CONTENT] No sub-tasks found, rendering empty state');
    return (
      <div className="text-center text-muted-foreground p-6 border border-dashed border-muted rounded-md">
        <p className="mb-4">No sub-tasks created for this task.</p>
        <Button variant="outline" onClick={() => {
          console.log('[SUB_TASKS_CONTENT] Create sub-task button clicked');
          onCreateSubTaskClick();
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Sub-Task
        </Button>
      </div>
    );
  }

  // Render sub-tasks list with external create button
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <CardTitle>Sub-Tasks</CardTitle>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" variant="outline" onClick={() => {
          console.log('[SUB_TASKS_CONTENT] Create sub-task button clicked');
          onCreateSubTaskClick();
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Sub-Task
        </Button>
      </div>
      <TasksContainer
        key={subTasks.length} // remount when subtasks count changes to refresh table
        context="task"
        initialTasks={subTasks}
        autoLoad={false}
        displayOptions={{
          showHeader: false,
          showAddButton: false,
          compact: true,
          title: "Sub-Tasks"
        }}
        hierarchyOptions={{
          maxDepth: 2,
          showAllSubtasks: false
        }}
        tableParentTaskId={parentTaskId}
        parentProjectId={parentProjectId}
        onDataChange={() => {
          console.log('[SUB_TASKS_CONTENT] Subtask data changed');
        }}
      />
    </div>
  );
}
