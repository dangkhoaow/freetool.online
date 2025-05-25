import React, { useState, useEffect } from "react";
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

interface PasswordValidation {
  isLengthValid: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  passwordsMatch: boolean;
}

/**
 * Dialog component for resetting a user's password
 * Implements the same password validation rules as PasswordSettings.tsx
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
  
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validation, setValidation] = useState<PasswordValidation>({
    isLengthValid: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false
  });

  // Validate password as user types
  const validatePassword = (password: string, confirmPwd: string) => {
    log('Validating password');
    
    const isLengthValid = password.length >= 8;
    log('Password length valid:', isLengthValid);
    
    const hasUpperCase = /[A-Z]/.test(password);
    log('Password has uppercase:', hasUpperCase);
    
    const hasNumber = /\d/.test(password);
    log('Password has number:', hasNumber);
    
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    log('Password has special char:', hasSpecialChar);
    
    const passwordsMatch = password === confirmPwd && password !== '';
    log('Passwords match:', passwordsMatch);
    
    setValidation({
      isLengthValid,
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
      passwordsMatch
    });
  };

  // Handle password change with validation
  const handlePasswordChange = (value: string) => {
    log('New password changed');
    setNewPassword(value);
    validatePassword(value, confirmPassword);
  };

  // Handle confirm password change with validation
  const handleConfirmPasswordChange = (value: string) => {
    log('Confirm password changed');
    setConfirmPassword(value);
    validatePassword(newPassword, value);
  };

  // Get validation status class for styling
  const getValidationStatusClass = (isValid: boolean) => {
    return isValid 
      ? "text-green-500" 
      : newPassword.length > 0 
        ? "text-red-500" 
        : "text-gray-400";
  };

  // Check if form is valid
  const isFormValid = () => {
    return validation.isLengthValid && 
           validation.hasUpperCase && 
           validation.hasNumber && 
           validation.hasSpecialChar &&
           validation.passwordsMatch;
  };

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      log("Dialog opened, resetting state");
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setValidation({
        isLengthValid: false,
        hasUpperCase: false,
        hasNumber: false,
        hasSpecialChar: false,
        passwordsMatch: false
      });
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
          {/* New Password Field */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => {
                  log("Toggle new password visibility:", !showNewPassword);
                  setShowNewPassword(!showNewPassword);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showNewPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => {
                  log("Toggle confirm password visibility:", !showConfirmPassword);
                  setShowConfirmPassword(!showConfirmPassword);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="mt-2">
            <p className="text-xs font-medium mb-1">Password Requirements:</p>
            <ul className="space-y-1 text-xs">
              <li className={getValidationStatusClass(validation.isLengthValid)}>
                • At least 8 characters long
              </li>
              <li className={getValidationStatusClass(validation.hasUpperCase)}>
                • At least one uppercase letter
              </li>
              <li className={getValidationStatusClass(validation.hasNumber)}>
                • At least one number
              </li>
              <li className={getValidationStatusClass(validation.hasSpecialChar)}>
                • At least one special character (!@#$%^&*(),.?":{})
              </li>
              <li className={getValidationStatusClass(validation.passwordsMatch)}>
                • Passwords match
              </li>
            </ul>
          </div>
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
            disabled={isPending || !isFormValid()}
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
