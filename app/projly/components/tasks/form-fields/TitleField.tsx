import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TitleFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function TitleField({ value, onChange }: TitleFieldProps) {
  console.log('[PROJLY:TASK_FORM] Rendering TitleField component');
  
  return (
    <div>
      <Label htmlFor="title">Title *</Label>
      <Input
        id="title"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter task title"
        required
      />
    </div>
  );
}
