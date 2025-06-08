import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Task {
  id: string;
  title: string;
}

interface ParentTaskFieldProps {
  value: string;
  parentTasks: Task[];
  onChange: (value: string) => void;
}

export function ParentTaskField({ value, parentTasks, onChange }: ParentTaskFieldProps) {
  console.log('[PROJLY:TASK_FORM] Rendering ParentTaskField component with', parentTasks.length, 'parent tasks');
  
  return (
    <div>
      <Label htmlFor="parentTaskId">Parent Task (Optional)</Label>
      <Select
        value={value}
        onValueChange={(value) => onChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a parent task" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Parent Task</SelectItem>
          {parentTasks.map((task) => (
            <SelectItem key={task.id} value={task.id}>
              {task.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
