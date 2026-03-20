
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "@/hooks/jwt-auth-adapter";
import { useToast } from "@/components/ui/use-toast";
import AuthService from "@/services/prisma/auth";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validResetSession, setValidResetSession] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get token from URL query parameters
  const [searchParams] = useSearchParams();
  const { data: session } = useSession();
  
  // Check if we have a valid reset token when the component loads
  useEffect(() => {
    const checkResetToken = () => {
      try {
        console.log("Checking for password reset token...");
        const token = searchParams.get('token');
        
        if (token) {
          console.log("Reset token found in URL");
          setValidResetSession(true);
        } else if (session) {
          // If user is already logged in, they can reset their password
          console.log("User is logged in, allowing password reset");
          setValidResetSession(true);
        } else {
          // No valid token or session, user may have visited this page directly
          console.log("No reset token or active session found");
          setError("No active password reset session. Please request a password reset from the login page.");
          setTimeout(() => {
            navigate("/projly/forgot-password");
          }, 3000);
        }
      } catch (err) {
        console.error("Reset token check exception:", err);
        setError("An error occurred while verifying your reset link.");
      }
    };
    
    checkResetToken();
  }, [navigate, searchParams, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Updating password");
      const token = searchParams.get('token');
      
      // Call the AuthService to update the password
      const result = await AuthService.updatePassword(password);
      
      if (!result.success) {
        console.error("Password update error:", result.error);
        setError(result.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to update password. Please try again.",
        });
      } else {
        console.log("Password updated successfully");
        toast({
          title: "Password reset successful",
          description: "Your password has been updated. You can now log in with your new password.",
        });
        
        // Redirect to login page after successful password reset
        setTimeout(() => {
          navigate("/projly/login");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Password update exception:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-project-primary">Projly</h1>
          <p className="text-gray-600 mt-1">Lightweight Project Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Create a new password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {validResetSession ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required
                      minLength={6}
                    />
                    <button 
                      type="button" 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full bg-project-primary hover:bg-orange-500" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Lock className="mr-2 h-4 w-4" />
                      Reset Password
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="rounded-full bg-yellow-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Verifying reset link...</h3>
                <p className="text-gray-600 mb-4">
                  Please wait while we verify your password reset link.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link to="/projly/login" className="text-project-primary hover:underline font-medium">
                Back to login
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} VIB Bank. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
