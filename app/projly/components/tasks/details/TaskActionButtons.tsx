import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash } from "lucide-react";

interface TaskActionButtonsProps {
  onBackClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  isDialogMode?: boolean;
  canDelete: boolean;
  isSubmitting: boolean;
}

export function TaskActionButtons({
  onBackClick,
  onEditClick,
  onDeleteClick,
  isDialogMode = false,
  canDelete,
  isSubmitting
}: TaskActionButtonsProps) {
  console.log('[PROJLY:TASK_DETAILS] Rendering TaskActionButtons, canDelete:', canDelete, 'isSubmitting:', isSubmitting);
  
  return (
    <div className="flex items-center justify-between mb-6 w-full">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackClick}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isDialogMode ? "Close" : "Back"}
        </Button>
      </div>
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onEditClick}
          className="ml-2"
          disabled={isSubmitting}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        
        {canDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteClick}
            className="ml-2"
            disabled={isSubmitting}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
