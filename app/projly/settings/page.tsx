'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projlyAuthService } from '@/lib/services/projly';
import { useToast } from "@/components/ui/use-toast";
import { API_ENDPOINTS, API_BASE_URL, SERVER_URL } from "@/app/projly/config/apiConfig";
import { getAuthToken } from "@/app/projly/utils/auth-utils";
import { useAuth } from "@/app/projly/contexts/AuthContextCustom";

// Import our modular settings components
import { 
  ProfileSettings, 
  PasswordSettings, 
  NotificationSettings 
} from "@/app/projly/components/settings";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Define profile type
  interface Profile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    bio?: string;
    jobTitle?: string;
    department?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    language?: string;
    timezone?: string;
    theme?: string;
  }
  
  // Get auth context data
  const { user, isLoading, updateUser } = useAuth();

  // Use data directly from AuthContext to ensure consistency
  const [profile, setProfile] = useState<Profile>({
    id: user?.id || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    avatar: '',
    bio: '',
    jobTitle: '',
    department: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    language: 'en',
    timezone: 'UTC',
    theme: 'system'
  });

  useEffect(() => {
    console.log('[SETTINGS_PAGE] Updating profile state with AuthContext user data:', user);
    if (user) {
      setProfile(prev => ({
        ...prev,
        id: user.id || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      }));
    }
  }, [user]);
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Add error state for displaying in UI
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskAssignments: true,
    projectUpdates: true,
    dueDateReminders: true
  });
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:SETTINGS] ${message}`, data);
    } else {
      console.log(`[PROJLY:SETTINGS] ${message}`);
    }
  };
  
  // Handle profile form input changes
  const handleProfileChange = (field: string, value: string) => {
    log(`Updating profile field: ${field} with value:`, value);
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle password form input changes
  const handlePasswordChange = (field: string, value: string) => {
    log(`Updating password field: ${field}`);
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle notification settings changes
  const handleNotificationChange = (field: string, value: boolean) => {
    log(`Updating notification setting: ${field} to:`, value);
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle profile form submission with added error handling and token check
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      log('Saving profile changes:', profile);
      setIsSaving(true);
      const token = getAuthToken();
      if (!token) {
        log('Error: No auth token available for update');
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to update your profile',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }
      // Make API call with token
      const response = await fetch(`${SERVER_URL}/api/projly/auth/update-user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName
        })
      });
      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }
      const updateResult = await response.json();
      log('User update result:', updateResult);
      // Update AuthContext so avatar and other components reflect change
      if (updateUser) {
        await updateUser({ firstName: profile.firstName, lastName: profile.lastName });
        log('AuthContext updated with new user data');
      }
      // Update local state or refetch data
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch (error) {
      console.error('[PROJLY:SETTINGS] Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile changes. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Clear any previous errors
      setPasswordError(null);
      log('Validating password change submission');
      
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setPasswordError('All password fields are required');
        toast({
          title: 'Validation Error',
          description: 'All password fields are required',
          variant: 'destructive'
        });
        return;
      }
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError('New passwords do not match');
        toast({
          title: 'Validation Error',
          description: 'New passwords do not match',
          variant: 'destructive'
        });
        return;
      }
      
      if (passwordForm.newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters long');
        toast({
          title: 'Validation Error',
          description: 'Password must be at least 8 characters long',
          variant: 'destructive'
        });
        return;
      }
      
      setIsSaving(true);
      log('Making password change API call to:', API_ENDPOINTS.AUTH.CHANGE_PASSWORD);
      
      // Get the authentication token
      const token = getAuthToken();
      log('Using auth token for password change request:', token ? 'Token found' : 'No token');
      
      const response = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add the token to the Authorization header
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      log('Password change API response status:', response.status);
      
      // Parse the response data
      const data = await response.json();
      log('Password change API response data:', data);
      
      // Check for successful response based on the success flag
      if (!data.success) {
        // Extract error message from response
        const errorMessage = data.message || 
                            (data.error?.message) || 
                            (typeof data.error === 'string' ? data.error : 'Failed to update password');
        
        log('Password change failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      log('Password updated successfully:', data);
      
      toast({
        title: 'Success',
        description: 'Password updated successfully'
      });
      
      // Clear password form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('[PROJLY:SETTINGS] Error updating password:', error);
      
      // Extract error message and set it for display in the UI
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password. Please try again.';
      setPasswordError(errorMessage);
      
      // Show error toast with extended duration to ensure visibility
      toast({
        title: 'Password Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000 // Show for 5 seconds to ensure user sees it
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle notification settings submission
  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      log('Updating notification settings:', notificationSettings);
      
      // In a real app, we would save these to an API
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      log('Notification settings updated successfully');
      toast({
        title: 'Success',
        description: 'Notification preferences updated successfully'
      });
      
    } catch (error) {
      console.error('[PROJLY:SETTINGS] Error updating notification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Show loading state using the centralized PageLoading component
  if (isLoading) {
    log('Showing loading state');
    return <PageLoading logContext="PROJLY:SETTINGS" />;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger disabled={true} value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileSettings 
              profile={profile}
              onProfileChange={handleProfileChange}
              onSubmit={handleProfileSubmit}
              isSaving={isSaving}
            />
          </TabsContent>
          
          <TabsContent value="password">
            <PasswordSettings
              passwordForm={passwordForm}
              onPasswordChange={handlePasswordChange}
              onSubmit={handlePasswordSubmit}
              isSaving={isSaving}
              error={passwordError}
            />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationSettings
              settings={notificationSettings}
              onSettingChange={handleNotificationChange}
              onSubmit={handleNotificationSubmit}
              isSaving={isSaving}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
