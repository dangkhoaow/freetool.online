import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { PasswordValidationComponent, usePasswordValidation } from "@/app/projly/components/ui/PasswordValidation";

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: (password: string) => void;
  isPending: boolean;
}

/**
 * Dialog component for resetting a user's password
 * Uses the centralized PasswordValidationComponent for consistent validation
 */
const PasswordResetDialog: React.FC<PasswordResetDialogProps> = ({
  open,
  onOpenChange,
  onReset,
  isPending
}) => {
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:USER_SETTINGS:PASSWORD_RESET_DIALOG] ${message}`, data);
    } else {
      console.log(`[PROJLY:USER_SETTINGS:PASSWORD_RESET_DIALOG] ${message}`);
    }
  };
  
  log("Rendering password reset dialog, open:", open);
  
  // Use the password validation hook for state management and validation
  const {
    password: newPassword,
    confirmPassword,
    setPassword: setNewPassword,
    setConfirmPassword,
    isValid: isFormValid
  } = usePasswordValidation();

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      log("Dialog opened, resetting state");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [open, setNewPassword, setConfirmPassword]);

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
          {/* Using the centralized password validation component */}
          <PasswordValidationComponent
            password={newPassword}
            confirmPassword={confirmPassword}
            onPasswordChange={(value) => {
              log('New password changed');
              setNewPassword(value);
            }}
            onConfirmPasswordChange={(value) => {
              log('Confirm password changed');
              setConfirmPassword(value);
            }}
            disabled={isPending}
            placeholder={{
              password: "New password",
              confirmPassword: "Confirm password"
            }}
          />
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={() => {
              log("Reset password button clicked");
              onReset(newPassword);
            }}
            disabled={isPending || !isFormValid}
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
