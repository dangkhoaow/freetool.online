import { Label } from "@/components/ui/label";
import { DatePicker } from "../../../components/ui/date-picker";

interface DateFieldProps {
  label: string;
  id: string;
  date: Date | null;
  setDate: (date: Date | null) => void;
}

export function DateField({ label, id, date, setDate }: DateFieldProps) {
  console.log(`[PROJLY:TASK_FORM] Rendering DateField component for ${id} with date:`, date);
  
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <DatePicker
        date={date}
        setDate={setDate}
      />
    </div>
  );
}
