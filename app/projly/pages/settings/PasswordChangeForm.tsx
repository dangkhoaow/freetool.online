import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { API_ENDPOINTS } from "@/config/apiConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useSession, signIn } from "@/hooks/jwt-auth-adapter";
import { toast } from "@/components/ui/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Password change form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Current password must be at least 6 characters."
  }),
  newPassword: z.string().min(6, {
    message: "New password must be at least 6 characters."
  }),
  confirmPassword: z.string().min(6, {
    message: "Confirm password must be at least 6 characters."
  })
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"]
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const PasswordChangeForm = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  console.log("Rendering PasswordChangeForm component");

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    console.log("Password form submitted");
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Verifying current password");
      // First verify the current password by attempting to sign in
      const result = await signIn("credentials", {
        email: user?.email as string,
        password: data.currentPassword,
        redirect: false
      });
      
      if (result?.error) {
        console.error("Current password verification failed:", result.error);
        setError("Current password is incorrect");
        setIsLoading(false);
        return;
      }

      console.log("Current password verified, updating to new password via API");
      console.log("[PasswordChangeForm] change-password payload:", { currentPassword: data.currentPassword, newPassword: data.newPassword });
      // Call backend change-password endpoint using centralized config
      const changeRes = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      });
      const changeJson = await changeRes.json();
      if (!changeRes.ok || changeJson.error) {
        console.error("Password update failed:", changeJson.error || changeJson);
        throw new Error(changeJson.error?.message || 'Failed to update password');
      }
      
      console.log("Password updated successfully");
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully."
      });

      // Reset the form
      passwordForm.reset();
    } catch (error: any) {
      console.error("Password change error:", error);
      setError(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <FormField
            control={passwordForm.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your current password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Separator className="my-4" />
          
          <FormField
            control={passwordForm.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your new password" {...field} />
                </FormControl>
                <FormDescription>
                  Password must be at least 6 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={passwordForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm your new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PasswordChangeForm;
