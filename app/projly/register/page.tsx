'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { projlyAuthService } from '@/lib/services/projly';
import { PasswordValidationComponent, usePasswordValidation } from "@/app/projly/components/ui/PasswordValidation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Use the password validation hook for state management and validation
  const {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    isValid: isPasswordValid
  } = usePasswordValidation();
  
  const router = useRouter();
  const { toast } = useToast();
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:REGISTER] ${message}`, data);
    } else {
      console.log(`[PROJLY:REGISTER] ${message}`);
    }
  };
  
  log("Register page loaded");
  
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
        console.error('[PROJLY:REGISTER] Error checking authentication:', error);
      } finally {
        setIsCheckingAuth(false);
        log('Authentication check completed');
      }
    }
    
    checkAuth();
  }, [router]);
  
  const validateForm = () => {
    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements");
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    log('Registration attempt for email:', email);
    
    try {
      // Format the data to match the service expectation
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      const result = await projlyAuthService.register({ 
        email, 
        password, 
        firstName, 
        lastName: lastName || firstName // Fallback if no last name provided
      });
      log('Registration result:', result.success);
      
      if (result.success) {
        log('Registration successful, redirecting to login');
        toast({
          title: "Registration successful",
          description: "Your account has been created. You can now log in.",
        });
        router.push('/projly/login');
      } else {
        log('Registration failed:', result.error);
        setError(result.error || "Registration failed. Please try again.");
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: result.error || "Registration failed. Please try again.",
        });
      }
    } catch (err: any) {
      console.error("[PROJLY:REGISTER] Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: err.message || "Registration failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      log('Registration process completed');
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
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Sign up for a new Projly account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="John Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordValidationComponent
                  password={password}
                  confirmPassword={confirmPassword}
                  onPasswordChange={(value) => {
                    log('Password changed');
                    setPassword(value);
                  }}
                  onConfirmPasswordChange={(value) => {
                    log('Confirm password changed');
                    setConfirmPassword(value);
                  }}
                  disabled={isSubmitting}
                  id={{
                    password: "password",
                    confirmPassword: "confirmPassword"
                  }}
                  placeholder={{
                    password: "Enter password",
                    confirmPassword: "Confirm password"
                  }}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !isPasswordValid}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <span className="mr-2">Creating account</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Create Account</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-center">
              Already have an account?{" "}
              <Link href="/projly/login" className="text-primary font-medium hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
