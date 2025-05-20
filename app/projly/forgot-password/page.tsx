'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { projlyAuthService } from '@/lib/services/projly';
import { useForgotPassword } from '@/lib/services/projly/use-forgot-password';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const router = useRouter();
  const { toast } = useToast();
  const { forgotPassword, isLoading, error, success, reset } = useForgotPassword();
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:FORGOT_PASSWORD] ${message}`, data);
    } else {
      console.log(`[PROJLY:FORGOT_PASSWORD] ${message}`);
    }
  };
  
  log("Forgot password page loaded");
  
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
        console.error('[PROJLY:FORGOT_PASSWORD] Error checking authentication:', error);
      } finally {
        setIsCheckingAuth(false);
        log('Authentication check completed');
      }
    }
    
    checkAuth();
  }, [router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    log('Password reset request for email:', email);
    
    try {
      // Call the forgotPassword function from the hook
      const result = await forgotPassword(email);
      
      log('Password reset request result:', result);
      
      // Toast notification handled by the hook via success state
      if (success) {
        toast({
          title: "Email sent",
          description: "Reset instructions have been sent to your email address.",
        });
      }
    } catch (err: any) {
      // Error handling is done by the hook
      console.error("[PROJLY:FORGOT_PASSWORD] Password reset error:", err);
      toast({
        variant: "destructive",
        title: "Request failed",
        description: err.message || "Failed to send reset email. Please try again.",
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
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Projly</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Lightweight Project Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you instructions to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  disabled={isLoading || !!success}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !!success}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <span className="mr-2">Sending...</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Send Reset Instructions</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center">
              <Link 
                href="/projly/login" 
                className="pb-6 text-primary font-medium hover:underline inline-flex items-center"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
