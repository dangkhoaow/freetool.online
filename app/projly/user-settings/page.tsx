'use client';

import React from "react";
import { useUserRoles } from "@/lib/services/projly/use-user-roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
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
 * This page provides an interface for site administrators to manage users,
 * their roles, and access permissions. It is restricted to users with the
 * 'site_owner' role and provides comprehensive user management capabilities.
 * 
 * @returns {JSX.Element} The rendered page component
 */
export default function UserSettingsPage() {
  console.log("[PROJLY:USER-SETTINGS-PAGE] Rendering UserSettings page");
  
  // Use the useUserRoles hook to check if the current user is a site owner
  const { currentUserRole } = useUserRoles();
  
  // Check if the current user is a site owner
  const isSiteOwner = currentUserRole.data === 'site_owner';
  
  // Show loading spinner while checking permissions
  if (currentUserRole.isLoading) {
    console.log("[PROJLY:USER-SETTINGS-PAGE] Loading user role data");
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
  
  // Log the current user role for debugging
  console.log("[PROJLY:USER-SETTINGS-PAGE] Current user role:", currentUserRole.data);
  
  // Show access denied message for non-site owners
  if (!isSiteOwner) {
    console.log("[PROJLY:USER-SETTINGS-PAGE] Access denied - user is not a site owner");
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">User Settings</h1>
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                <p className="text-amber-800">
                  You don't have permission to view user settings.
                  Only Site Owners can manage user roles.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  // Render the user settings content for site owners
  console.log("[PROJLY:USER-SETTINGS-PAGE] User is a site owner, rendering settings content");
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">User Settings</h1>
        <UserSettingsContent />
      </div>
    </DashboardLayout>
  );
}
