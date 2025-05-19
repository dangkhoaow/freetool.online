'use client';

import React, { useState, useEffect } from "react";
import { useUserRoles } from "@/lib/services/projly/use-user-roles";
import { useUserProfile, useUpdateProfile } from "@/lib/services/projly/use-profile";
import { useAuth } from "@/app/projly/contexts/AuthContextCustom"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import { DashboardLayout } from '@/app/projly/components/layout/DashboardLayout';

// Dynamically import the UserSettings component to reduce initial load time
const UserSettingsContent = dynamic(
  () => import("@/app/projly/pages/settings/UserSettings"),
  {
    loading: () => (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    ),
    ssr: false, // Disable server-side rendering for this component
  }
);

/**
 * User Settings Page Component
 * 
 * This page provides an interface for all users to manage their personal profile settings
 * (e.g., first name, last name) and for site administrators to manage users, their roles,
 * and access permissions. Personal settings are available to all users, while user
 * management is restricted to users with the 'site_owner' role.
 * 
 * @returns {JSX.Element} The rendered page component
 */
export default function UserSettingsPage() {
  console.log("[PROJLY:USER-SETTINGS-PAGE] Rendering UserSettings page");
  
  // Use hooks to get user role and profile data
  const { currentUserRole } = useUserRoles();
  const { user } = useAuth(); // Get the user data from the AuthContext
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const updateProfile = useUpdateProfile();
  
  // Check if the current user is a site owner
  const isSiteOwner = currentUserRole.data === 'site_owner';
  console.log("[PROJLY:USER-SETTINGS-PAGE] Current user role:", currentUserRole.data, "isSiteOwner:", isSiteOwner);
  
  // State for profile form inputs
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email] = useState(user?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync form fields with user context changes
  useEffect(() => {
    if (user) {
      console.log('[USER_SETTINGS] Updating form fields from user data:', {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  // Handle profile update submission
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setError(null);
    setSuccessMessage(null);

    console.log('[USER_SETTINGS] Submitting profile update:', { firstName, lastName });

    try {
      if (!user?.id) {
        throw new Error('User ID not available');
      }
      await updateProfile.mutateAsync({
        id: user.id,
        firstName,
        lastName
      });
      console.log('[USER_SETTINGS] Profile updated successfully');
      setSuccessMessage('Profile updated successfully');
    } catch (err) {
      console.error('[USER_SETTINGS] Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Show loading spinner while checking permissions or loading profile
  if (currentUserRole.isLoading || profileLoading) {
    console.log("[PROJLY:USER-SETTINGS-PAGE] Loading user role or profile data");
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">User Settings</h1>
          <div className="flex justify-center p-8">
            <Spinner size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Log profile data or error for debugging
  if (profileError) {
    console.error("[PROJLY:USER-SETTINGS-PAGE] Profile data load error:", profileError);
  }
  if (profile) {
    console.log("[PROJLY:USER-SETTINGS-PAGE] Profile data loaded:", { id: profile.id, firstName: profile.firstName, lastName: profile.lastName });
  }

  const userId = user?.id;
  if (!userId) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <p className="text-red-500">Error: User not authenticated. Please log in.</p>
      </div>
    );
  }

  console.log('[USER_SETTINGS] Rendering form with data:', {
    firstName,
    lastName,
    email,
    userId
  });

  // Render the page with personal settings for all users and admin content for site owners
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">User Settings</h1>
        
        {/* Personal Profile Settings Section - Available to All Users */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      console.log("[PROJLY:USER-SETTINGS-PAGE] First name input changed to:", e.target.value);
                    }}
                    placeholder="Enter your first name"
                    disabled={isUpdatingProfile}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      console.log("[PROJLY:USER-SETTINGS-PAGE] Last name input changed to:", e.target.value);
                    }}
                    placeholder="Enter your last name"
                    disabled={isUpdatingProfile}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? <Spinner className="mr-2" size="sm" /> : null}
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Admin User Management Section - Restricted to Site Owners */}
        {isSiteOwner && (
          <>
            <h2 className="text-xl font-semibold mb-4">User Management (Admin Only)</h2>
            <UserSettingsContent />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
