'use client';

import React from "react";
import { useUserRoles } from "@/lib/services/projly/use-user-roles";
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import dynamic from "next/dynamic";
import { DashboardLayout } from '@/app/projly/components/layout/DashboardLayout';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

// Dynamically import the UserSettings component to reduce initial load time
const UserSettingsContent = dynamic(
  () => import("@/app/projly/pages/settings/UserSettings"),
  {
    loading: () => {
      console.log("[PROJLY:USER-SETTINGS-PAGE] Loading UserSettings component");
      return <PageLoading logContext="PROJLY:USER-SETTINGS:DYNAMIC" standalone={true} height="20vh" />;
    },
    ssr: false, // Disable server-side rendering for this component
  }
);

/**
 * User Settings Page Component
 * 
 * Site administrators can manage users, their roles,
 * and access permissions. User management is restricted to users with the 'site_owner' and 'admin' role.
 * 
 * @returns {JSX.Element} The rendered page component
 */
export default function UserSettingsPage() {
  console.log("[PROJLY:USER-SETTINGS-PAGE] Rendering UserSettings page");
  
  // Use hooks to get user role and profile data
  const { currentUserRole } = useUserRoles();
  
  // Show loading while checking user role
  if (currentUserRole.isLoading) {
    console.log("[PROJLY:USER-SETTINGS-PAGE] Loading user role data");
    return <PageLoading logContext="PROJLY:USER-SETTINGS:AUTH" />;
  }
  
  // Check if the current user is a site owner or admin - only after loading completes
  const isSiteOwner = currentUserRole.data === 'site_owner';
  const isAdmin = currentUserRole.data === 'admin';
  const hasAccess = isSiteOwner || isAdmin;
  
  console.log("[PROJLY:USER-SETTINGS-PAGE] Current user role:", currentUserRole.data, "isSiteOwner:", isSiteOwner, "isAdmin:", isAdmin, "hasAccess:", hasAccess);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        {hasAccess ? (
          // Admin User Management Section - Restricted to Site Owners and Admins
          <UserSettingsContent />
        ) : (
          // Unauthorized access message
          <Alert variant="destructive" className="mb-6">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to access user management settings. This area is restricted to administrators and site owners.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}
