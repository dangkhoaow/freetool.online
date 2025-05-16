'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projlyAuthService } from '@/lib/services/projly';
import { useToast } from "@/components/ui/use-toast";

// Import our modular settings components
import { 
  ProfileSettings, 
  PasswordSettings, 
  NotificationSettings 
} from "@/app/projly/components/settings";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // User profile state
  const [profile, setProfile] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    avatar: ''
  });
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
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
  
  // Check authentication and load user profile on page load
  useEffect(() => {
    const loadProfile = async () => {
      try {
        log('Checking authentication');
        const isAuthenticated = await projlyAuthService.isAuthenticated();
        
        if (!isAuthenticated) {
          log('User not authenticated, redirecting to login');
          router.push('/projly/login');
          return;
        }
        
        log('Fetching user profile');
        const userData = await projlyAuthService.getCurrentUser();
        
        if (!userData) {
          log('User data not found');
          toast({
            title: 'Error',
            description: 'Could not load user profile',
            variant: 'destructive'
          });
          return;
        }
        
        log('Profile loaded:', userData);
        setProfile({
          id: userData.id || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          // The User type doesn't include avatar property
          avatar: ''
        });
        
        // In a real app, we would also load notification settings from an API
        // For now, we'll use default values
        log('Using default notification settings');
        
      } catch (error) {
        console.error('[PROJLY:SETTINGS] Error loading profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user profile. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
        log('Settings page initialization completed');
      }
    };
    
    loadProfile();
  }, [router, toast]);
  
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
  
  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      log('Validating profile submission');
      if (!profile.firstName.trim() || !profile.lastName.trim() || !profile.email.trim()) {
        toast({
          title: 'Validation Error',
          description: 'All fields are required',
          variant: 'destructive'
        });
        return;
      }
      
      setIsSaving(true);
      log('Simulating profile update API call');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      log('Profile updated successfully');
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
      
    } catch (error) {
      console.error('[PROJLY:SETTINGS] Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
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
      log('Validating password change submission');
      
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        toast({
          title: 'Validation Error',
          description: 'All password fields are required',
          variant: 'destructive'
        });
        return;
      }
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast({
          title: 'Validation Error',
          description: 'New passwords do not match',
          variant: 'destructive'
        });
        return;
      }
      
      if (passwordForm.newPassword.length < 8) {
        toast({
          title: 'Validation Error',
          description: 'Password must be at least 8 characters long',
          variant: 'destructive'
        });
        return;
      }
      
      setIsSaving(true);
      log('Simulating password change API call');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      log('Password updated successfully');
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
      toast({
        title: 'Error',
        description: 'Failed to update password. Ensure your current password is correct and try again.',
        variant: 'destructive'
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
  
  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </DashboardLayout>
    );
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
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
