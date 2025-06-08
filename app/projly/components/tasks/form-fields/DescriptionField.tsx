import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescriptionField({ value, onChange }: DescriptionFieldProps) {
  console.log('[PROJLY:TASK_FORM] Rendering DescriptionField component');
  
  return (
    <div>
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter task description"
      />
    </div>
  );
}
