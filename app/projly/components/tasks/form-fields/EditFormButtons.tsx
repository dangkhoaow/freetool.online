import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface EditFormButtonsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
}

export function EditFormButtons({ 
  isSubmitting,
  onCancel,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel"
}: EditFormButtonsProps) {
  console.log('[PROJLY:TASK_FORM] Rendering EditFormButtons component, isSubmitting:', isSubmitting);
  
  return (
    <div className="flex justify-end space-x-2 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {submitLabel}
          </>
        )}
      </Button>
    </div>
  );
}
