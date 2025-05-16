
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  deleteProjectId: string | null;
  setDeleteProjectId: (id: string | null) => void;
  confirmDelete: (id: string) => void;
}

export function DeleteConfirmationDialog({ 
  deleteProjectId, 
  setDeleteProjectId, 
  confirmDelete 
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the project and all associated tasks. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => deleteProjectId && confirmDelete(deleteProjectId)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
