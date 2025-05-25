'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { projlyAuthService } from '@/lib/services/projly';
import { useResetPassword } from '@/lib/services/projly/use-reset-password';

// Password validation interface
interface PasswordValidation {
  isLengthValid: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  passwordsMatch: boolean;
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validation, setValidation] = useState<PasswordValidation>({
    isLengthValid: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { resetPassword, isLoading, error, success } = useResetPassword();
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:RESET_PASSWORD] ${message}`, data);
    } else {
      console.log(`[PROJLY:RESET_PASSWORD] ${message}`);
    }
  };
  
  log("Reset password page loaded");
  
  // Get token from URL query parameters
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    log(`Token from URL: ${tokenFromUrl ? 'Present' : 'Not present'}`);
    setToken(tokenFromUrl);
  }, [searchParams]);
  
  // Check if user is already authenticated
  useEffect(() => {
    async function checkAuth() {
      log('Checking authentication status');
      setIsCheckingAuth(true);
      
      try {
        const isAuthenticated = await projlyAuthService.isAuthenticated();
        log('Authentication status:', isAuthenticated);
        
        if (isAuthenticated) {
          log('User is already authenticated, redirecting to dashboard');
          router.push('/projly/dashboard');
        }
      } catch (error) {
        console.error('[PROJLY:RESET_PASSWORD] Error checking authentication:', error);
      } finally {
        setIsCheckingAuth(false);
        log('Authentication check completed');
      }
    }
    
    checkAuth();
  }, [router]);
  
  // Redirect to login page after successful password reset
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        log('Redirecting to login page after successful password reset');
        router.push('/projly/login');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success, router]);
  
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
  
  // Get validation status class for styling
  const getValidationStatusClass = (isValid: boolean) => {
    return isValid 
      ? "text-green-500" 
      : password.length > 0 
        ? "text-red-500" 
        : "text-gray-400";
  };
  
  // Check if all password requirements are met
  const isPasswordValid = () => {
    return validation.isLengthValid && 
           validation.hasUpperCase && 
           validation.hasNumber && 
           validation.hasSpecialChar &&
           validation.passwordsMatch;
  };
  
  // Update password and validate
  const handlePasswordChange = (value: string) => {
    log('Password changed');
    setPassword(value);
    validatePassword(value, confirmPassword);
  };
  
  // Update confirm password and validate
  const handleConfirmPasswordChange = (value: string) => {
    log('Confirm password changed');
    setConfirmPassword(value);
    validatePassword(password, value);
  };
  
  // Legacy validation function - now uses the new validation system
  const validatePasswords = () => {
    if (!isPasswordValid()) {
      // Set a general validation error message
      setValidationError('Please ensure your password meets all requirements');
      return false;
    }
    
    setValidationError(null);
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    log('Password reset form submitted');
    
    // Validate passwords
    if (!validatePasswords()) {
      return;
    }
    
    // Validate token
    if (!token) {
      setValidationError('Missing reset token. Please check your reset link.');
      return;
    }
    
    try {
      // Call the resetPassword function from the hook
      const result = await resetPassword(token, password);
      
      log('Password reset result:', result);
      
      // Toast notification for success
      if (result.success) {
        toast({
          title: "Password reset successful",
          description: "Your password has been reset. You will be redirected to the login page.",
        });
      }
    } catch (err: any) {
      // Error handling is done by the hook
      console.error("[PROJLY:RESET_PASSWORD] Password reset error:", err);
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: err.message || "Failed to reset your password. Please try again.",
      });
    }
  };
  
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }
  
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
              <CardDescription>
                The password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  Missing reset token. Please request a new password reset link.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link 
                href="/projly/forgot-password" 
                className="pb-6 text-primary font-medium hover:underline inline-flex items-center"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                <span>Back to Forgot Password</span>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Projly</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Lightweight Project Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {validationError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
            
            {success ? (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-700 dark:text-green-400 mb-2">Password Reset Successful</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{success}</p>
                <p className="text-sm text-gray-500">Redirecting to login page...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter your new password" 
                      value={password} 
                      onChange={(e) => handlePasswordChange(e.target.value)} 
                      required 
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        log("Toggle password visibility:", !showPassword);
                        setShowPassword(!showPassword);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirm your new password" 
                      value={confirmPassword} 
                      onChange={(e) => handleConfirmPasswordChange(e.target.value)} 
                      required 
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        log("Toggle confirm password visibility:", !showConfirmPassword);
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      disabled={isLoading}
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
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !isPasswordValid()}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <span className="mr-2">Resetting...</span>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Lock className="mr-2 h-4 w-4" />
                      <span>Reset Password</span>
                    </div>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {!success && (
              <Link 
                href="/projly/login" 
                className="pb-6 text-primary font-medium hover:underline inline-flex items-center"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                <span>Back to Login</span>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
