import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

interface FormButtonsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
}

export function FormButtons({ 
  isSubmitting,
  onCancel,
  submitLabel = "Create Task",
  cancelLabel = "Cancel"
}: FormButtonsProps) {
  console.log('[PROJLY:TASK_FORM] Rendering FormButtons component, isSubmitting:', isSubmitting);
  
  return (
    <div className="flex w-full justify-end space-x-2 p-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {submitLabel === "Create Task" ? "Creating..." : "Saving..."}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}
