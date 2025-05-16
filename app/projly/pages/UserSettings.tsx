
import React from "react";
import { useUserRoles } from "@/hooks/use-user-roles";
import UserSettingsContent from "./settings/UserSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function UserSettings() {
  console.log("Rendering UserSettings page");
  const { currentUserRole } = useUserRoles();
  
  const isSiteOwner = currentUserRole.data === 'site_owner';
  
  if (currentUserRole.isLoading) {
    return <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">User Settings</h1>
      <div className="flex justify-center p-8"><Spinner size="lg" /></div>
    </div>;
  }
  
  if (!isSiteOwner) {
    return (
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
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">User Settings</h1>
      <UserSettingsContent />
    </div>
  );
}
