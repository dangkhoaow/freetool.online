import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Task {
  id: string;
  title: string;
}

interface ParentTaskFieldWithToggleProps {
  value: string;
  parentTasks: Task[];
  onChange: (value: string) => void;
  showAllTasks: boolean;
  onToggleShowAllTasks: (checked: boolean) => void;
}

export function ParentTaskFieldWithToggle({ 
  value, 
  parentTasks, 
  onChange,
  showAllTasks,
  onToggleShowAllTasks
}: ParentTaskFieldWithToggleProps) {
  console.log('[PROJLY:TASK_FORM] Rendering ParentTaskFieldWithToggle component with', parentTasks.length, 'parent tasks, showAllTasks:', showAllTasks);
  
  return (
    <div className="grid w-full items-center gap-1.5">
      <div className="flex justify-between items-center">
        <Label htmlFor="parentTaskId">Parent Task (Optional)</Label>
        <div className="flex items-center space-x-2">
          <Label htmlFor="show-all-tasks" className="text-xs text-muted-foreground cursor-pointer">
            {showAllTasks ? "Showing all tasks" : "Showing only top-level tasks"}
          </Label>
          <Switch
            id="show-all-tasks"
            checked={showAllTasks}
            onCheckedChange={onToggleShowAllTasks}
          />
        </div>
      </div>
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
