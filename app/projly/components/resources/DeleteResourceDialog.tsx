
import { useDeleteResource } from "../../hooks/use-resources";
import { useToast } from "../../hooks/use-toast";
import { Resource } from "../../types/resources";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Spinner } from "../../components/ui/spinner";
import { useState } from "react";

interface DeleteResourceDialogProps {
  resource: Resource;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteResourceDialog({
  resource,
  onClose,
  onSuccess,
}: DeleteResourceDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate: deleteResource } = useDeleteResource(resource.id);

  const handleDelete = () => {
    setIsDeleting(true);
    deleteResource(
      undefined,
      {
        onSuccess: () => {
          toast({
            title: "Resource deleted",
            description: "The resource has been deleted successfully.",
          });
          onSuccess();
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to delete resource",
            description: error.message || "An error occurred while deleting the resource.",
          });
          onClose();
        },
        onSettled: () => {
          setIsDeleting(false);
        }
      }
    );
  };

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the resource "{resource.name}". This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
