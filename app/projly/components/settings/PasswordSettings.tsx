'use client';

import { useState, useEffect } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { PasswordValidationComponent } from "@/app/projly/components/ui/PasswordValidation";

// Types
interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordSettingsProps {
  passwordForm: PasswordFormData;
  onPasswordChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSaving: boolean;
  error?: string | null; // Add error prop for API error messages
}

export function PasswordSettings({ 
  passwordForm, 
  onPasswordChange, 
  onSubmit,
  isSaving,
  error 
}: PasswordSettingsProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:PASSWORD_SETTINGS] ${message}`, data);
    } else {
      console.log(`[PROJLY:PASSWORD_SETTINGS] ${message}`);
    }
  };
  
  // Handle current password change
  const handleCurrentPasswordChange = (value: string) => {
    log('Current password changed');
    onPasswordChange('currentPassword', value);
  };
  
  // Handle new password change
  const handleNewPasswordChange = (value: string) => {
    log('New password changed');
    onPasswordChange('newPassword', value);
  };
  
  // Handle confirm password change
  const handleConfirmPasswordChange = (value: string) => {
    log('Confirm password changed');
    onPasswordChange('confirmPassword', value);
  };
  
  // Check if form is valid
  const isFormValid = () => {
    if (!passwordForm.currentPassword) {
      return false;
    }
    
    return isPasswordValid;
  };
  
  // Update isPasswordValid when the PasswordValidationComponent updates
  useEffect(() => {
    // This will be called when the password validation component updates its state
    // and the passwordForm is updated
    const { newPassword, confirmPassword } = passwordForm;
    
    // Basic validation checks
    const isLengthValid = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const passwordsMatch = newPassword === confirmPassword && newPassword !== '';
    
    // Set the overall validation state
    setIsPasswordValid(
      isLengthValid && 
      hasUpperCase && 
      hasNumber && 
      hasSpecialChar && 
      passwordsMatch
    );
    
    log('Password validation updated:', { isPasswordValid });
  }, [passwordForm.newPassword, passwordForm.confirmPassword]);
  
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
          {/* Display API error message if present */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input 
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => handleCurrentPasswordChange(e.target.value)}
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
          
          <div className="space-y-4">
            <Label htmlFor="newPassword">New Password</Label>
            <PasswordValidationComponent
              password={passwordForm.newPassword}
              confirmPassword={passwordForm.confirmPassword}
              onPasswordChange={handleNewPasswordChange}
              onConfirmPasswordChange={handleConfirmPasswordChange}
              disabled={isSaving}
              id={{
                password: "newPassword",
                confirmPassword: "confirmPassword"
              }}
              placeholder={{
                password: "Enter new password",
                confirmPassword: "Confirm new password"
              }}
            />
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
