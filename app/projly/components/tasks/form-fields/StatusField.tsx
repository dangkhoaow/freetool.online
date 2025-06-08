import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StatusFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function StatusField({ value, onChange }: StatusFieldProps) {
  console.log('[PROJLY:TASK_FORM] Rendering StatusField component with value:', value);
  
  return (
    <div>
      <Label htmlFor="status">Status</Label>
      <Select
        value={value}
        onValueChange={(value) => onChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Not Started">Not Started</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="In Review">In Review</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="On Hold">On Hold</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
