import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PriorityFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function PriorityField({ value, onChange }: PriorityFieldProps) {
  console.log('[PROJLY:TASK_FORM] Rendering PriorityField component with value:', value);
  
  return (
    <div>
      <Label htmlFor="priority">Priority</Label>
      <Select
        value={value}
        onValueChange={(value) => onChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
