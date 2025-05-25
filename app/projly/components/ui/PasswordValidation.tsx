'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

// Password validation interface
export interface PasswordValidation {
  isLengthValid: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  passwordsMatch: boolean;
}

export interface PasswordValidationProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  showValidationRules?: boolean;
  disabled?: boolean;
  className?: string;
  id?: {
    password?: string;
    confirmPassword?: string;
  };
  placeholder?: {
    password?: string;
    confirmPassword?: string;
  };
}

/**
 * A reusable password validation component that provides consistent UI and validation logic
 */
export function PasswordValidationComponent({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  showValidationRules = true,
  disabled = false,
  className = '',
  id = {
    password: 'password',
    confirmPassword: 'confirmPassword'
  },
  placeholder = {
    password: 'Enter password',
    confirmPassword: 'Confirm password'
  }
}: PasswordValidationProps) {
  const [showPassword, setShowPassword] = useState(false);
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
      console.log(`[PROJLY:PASSWORD_VALIDATION] ${message}`, data);
    } else {
      console.log(`[PROJLY:PASSWORD_VALIDATION] ${message}`);
    }
  };

  // Validate password as user types
  const validatePassword = (newPassword: string, confirmPwd: string) => {
    log('Validating password');
    
    const isLengthValid = newPassword.length >= 8;
    log('Password length valid:', isLengthValid);
    
    const hasUpperCase = /[A-Z]/.test(newPassword);
    log('Password has uppercase:', hasUpperCase);
    
    const hasNumber = /\d/.test(newPassword);
    log('Password has number:', hasNumber);
    
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    log('Password has special char:', hasSpecialChar);
    
    const passwordsMatch = newPassword === confirmPwd && newPassword !== '';
    log('Passwords match:', passwordsMatch);
    
    setValidation({
      isLengthValid,
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
      passwordsMatch
    });
  };

  // Update validation when password or confirmPassword changes
  useEffect(() => {
    validatePassword(password, confirmPassword);
  }, [password, confirmPassword]);

  // Get validation status class for styling
  const getValidationStatusClass = (isValid: boolean) => {
    return isValid 
      ? "text-green-500" 
      : password.length > 0 
        ? "text-red-500" 
        : "text-gray-400";
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    log('Password changed');
    onPasswordChange(e.target.value);
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    log('Confirm password changed');
    onConfirmPasswordChange(e.target.value);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Password Field */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            id={id.password}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder.password}
            value={password}
            onChange={handlePasswordChange}
            required
            disabled={disabled}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => {
              log("Toggle password visibility:", !showPassword);
              setShowPassword(!showPassword);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={disabled}
          >
            {showPassword ? (
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
            id={id.confirmPassword}
            type={showConfirmPassword ? "text" : "password"}
            placeholder={placeholder.confirmPassword}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
            disabled={disabled}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => {
              log("Toggle confirm password visibility:", !showConfirmPassword);
              setShowConfirmPassword(!showConfirmPassword);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={disabled}
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
      {showValidationRules && (
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
      )}
    </div>
  );
}

// Utility function to check if password meets all requirements
export function isPasswordValid(password: string, confirmPassword: string): boolean {
  const isLengthValid = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && password !== '';
  
  return isLengthValid && hasUpperCase && hasNumber && hasSpecialChar && passwordsMatch;
}

// Export a hook to use the password validation logic
export function usePasswordValidation(initialPassword = '', initialConfirmPassword = '') {
  const [password, setPassword] = useState(initialPassword);
  const [confirmPassword, setConfirmPassword] = useState(initialConfirmPassword);
  const [validation, setValidation] = useState<PasswordValidation>({
    isLengthValid: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false
  });

  // Validate password as user types
  const validatePassword = (newPassword: string, confirmPwd: string) => {
    const isLengthValid = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const passwordsMatch = newPassword === confirmPwd && newPassword !== '';
    
    setValidation({
      isLengthValid,
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
      passwordsMatch
    });
  };

  // Update validation when password or confirmPassword changes
  useEffect(() => {
    validatePassword(password, confirmPassword);
  }, [password, confirmPassword]);

  // Check if all password requirements are met
  const isValid = () => {
    return validation.isLengthValid && 
           validation.hasUpperCase && 
           validation.hasNumber && 
           validation.hasSpecialChar &&
           validation.passwordsMatch;
  };

  return {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    validation,
    isValid: isValid()
  };
}

export default PasswordValidationComponent;
