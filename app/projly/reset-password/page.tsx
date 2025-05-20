'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Lock, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { projlyAuthService } from '@/lib/services/projly';
import { useResetPassword } from '@/lib/services/projly/use-reset-password';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
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
  
  const validatePasswords = () => {
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
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
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your new password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    disabled={isLoading}
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Confirm your new password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
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
