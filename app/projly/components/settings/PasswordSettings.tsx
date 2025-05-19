'use client';

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";

// Types
interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordValidation {
  isLengthValid: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  passwordsMatch: boolean;
}

interface PasswordSettingsProps {
  passwordForm: PasswordFormData;
  onPasswordChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSaving: boolean;
}

export function PasswordSettings({ 
  passwordForm, 
  onPasswordChange, 
  onSubmit,
  isSaving 
}: PasswordSettingsProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validation, setValidation] = useState<PasswordValidation>({
    isLengthValid: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false
  });
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:PASSWORD_SETTINGS] ${message}`, data);
    } else {
      console.log(`[PROJLY:PASSWORD_SETTINGS] ${message}`);
    }
  };
  
  // Validate password as user types
  const validatePassword = (password: string, confirmPassword: string) => {
    log('Validating password');
    
    const isLengthValid = password.length >= 8;
    log('Password length valid:', isLengthValid);
    
    const hasUpperCase = /[A-Z]/.test(password);
    log('Password has uppercase:', hasUpperCase);
    
    const hasNumber = /\d/.test(password);
    log('Password has number:', hasNumber);
    
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    log('Password has special char:', hasSpecialChar);
    
    const passwordsMatch = password === confirmPassword && password !== '';
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
  const handlePasswordInputChange = (field: string, value: string) => {
    log(`Password field changed: ${field}`);
    
    // Update form state
    onPasswordChange(field, value);
    
    // Validate if new password or confirm password fields change
    if (field === 'newPassword') {
      validatePassword(value, passwordForm.confirmPassword);
    } else if (field === 'confirmPassword') {
      validatePassword(passwordForm.newPassword, value);
    }
  };
  
  // Get validation status icon class
  const getValidationStatusClass = (isValid: boolean) => {
    return isValid 
      ? "text-green-500" 
      : passwordForm.newPassword.length > 0 
        ? "text-red-500" 
        : "text-gray-300";
  };
  
  // Check if form is valid
  const isFormValid = () => {
    if (!passwordForm.currentPassword) {
      return false;
    }
    
    if (!validation.isLengthValid || 
        !validation.hasUpperCase || 
        !validation.hasNumber || 
        !validation.hasSpecialChar ||
        !validation.passwordsMatch) {
      return false;
    }
    
    return true;
  };
  
  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password securely</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input 
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => onPasswordChange('currentPassword', e.target.value)}
                required
                disabled={isSaving}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => {
                  setShowCurrentPassword(!showCurrentPassword);
                  log('Toggled current password visibility:', !showCurrentPassword);
                }}
                disabled={isSaving}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input 
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                required
                disabled={isSaving}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => {
                  setShowNewPassword(!showNewPassword);
                  log('Toggled new password visibility:', !showNewPassword);
                }}
                disabled={isSaving}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input 
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                required
                disabled={isSaving}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => {
                  setShowConfirmPassword(!showConfirmPassword);
                  log('Toggled confirm password visibility:', !showConfirmPassword);
                }}
                disabled={isSaving}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Password Requirements:</p>
            <ul className="space-y-1 text-sm">
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
        </CardContent>
        <CardFooter className="flex justify-end p-6">
          <Button 
            type="submit" 
            disabled={isSaving || !isFormValid()}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
