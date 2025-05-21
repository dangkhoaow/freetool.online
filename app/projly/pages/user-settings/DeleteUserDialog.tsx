import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  userToDelete: { id: string; name: string } | null;
  isUpdating: string | null;
}

/**
 * Dialog component for confirming user deletion
 */
const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onOpenChange,
  onDelete,
  userToDelete,
  isUpdating
}) => {
  console.log("[PROJLY:USER_SETTINGS:DELETE_DIALOG] Rendering delete user dialog, open:", open, "user:", userToDelete);
  
  const isDeleting = isUpdating === userToDelete?.id;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirm User Deletion
          </AlertDialogTitle>
        </AlertDialogHeader>
        {/* Custom description to avoid nesting issues with AlertDialogDescription */}
        <div className="text-sm text-muted-foreground mb-6 mt-2 px-6">
          {userToDelete && (
            <div className="space-y-3">
              <div className="mb-2">Are you sure you want to delete user <strong>{userToDelete.name}</strong>?</div>
              <div className="mb-2">
                This action will set the user's status to{" "}
                <Badge variant="destructive">Deleted</Badge>,
                preventing them from accessing the system.
              </div>
              <div className="text-sm text-muted-foreground">
                Note: This is a soft delete. The user's data will remain in the database but they will not be able to log in.
              </div>
            </div>
          )}  
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating !== null}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              console.log("[PROJLY:USER_SETTINGS:DELETE_DIALOG] Delete confirmed for user:", userToDelete);
              onDelete();
            }}
            disabled={isUpdating !== null}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Deleting...
              </>
            ) : (
              <>Delete User</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
