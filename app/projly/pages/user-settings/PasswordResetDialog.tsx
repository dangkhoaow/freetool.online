import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: (password: string) => void;
  isPending: boolean;
}

/**
 * Dialog component for resetting a user's password
 */
const PasswordResetDialog: React.FC<PasswordResetDialogProps> = ({
  open,
  onOpenChange,
  onReset,
  isPending
}) => {
  console.log("[PROJLY:USER_SETTINGS:PASSWORD_RESET_DIALOG] Rendering password reset dialog, open:", open);
  
  const [newPassword, setNewPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      console.log("[PROJLY:USER_SETTINGS:PASSWORD_RESET_DIALOG] Dialog opened, resetting state");
      setNewPassword("");
      setShowPassword(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset User Password</DialogTitle>
          <DialogDescription>
            Enter a new password for this user. They will need to use this password for their next login.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => {
                  console.log("[PROJLY:USER_SETTINGS:PASSWORD_RESET_DIALOG] Password changed");
                  setNewPassword(e.target.value);
                }}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => {
                  console.log("[PROJLY:USER_SETTINGS:PASSWORD_RESET_DIALOG] Toggle password visibility:", !showPassword);
                  setShowPassword(!showPassword);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={() => {
              console.log("[PROJLY:USER_SETTINGS:PASSWORD_RESET_DIALOG] Reset password button clicked");
              onReset(newPassword);
            }}
            disabled={isPending || !newPassword || newPassword.length < 6}
          >
            {isPending ? (
              <><Spinner size="sm" className="mr-2" /> Processing...</>
            ) : (
              'Reset Password'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetDialog;
