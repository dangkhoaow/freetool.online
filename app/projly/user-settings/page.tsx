'use client';

import React from "react";
import { useUserRoles } from "@/lib/services/projly/use-user-roles";
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
 * Site administrators can manage users, their roles,
 * and access permissions. User management is restricted to users with the 'site_owner' and 'admin' role.
 * 
 * @returns {JSX.Element} The rendered page component
 */
export default function UserSettingsPage() {
  console.log("[PROJLY:USER-SETTINGS-PAGE] Rendering UserSettings page");
  
  // Use hooks to get user role and profile data
  const { currentUserRole } = useUserRoles();
  
  // Check if the current user is a site owner
  const isSiteOwner = currentUserRole.data === 'site_owner';
  console.log("[PROJLY:USER-SETTINGS-PAGE] Current user role:", currentUserRole.data, "isSiteOwner:", isSiteOwner);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        {/* Admin User Management Section - Restricted to Site Owners */}
        {isSiteOwner && (
          <>
            <UserSettingsContent />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
