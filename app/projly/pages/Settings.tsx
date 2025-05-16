
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import PasswordChangeForm from "./settings/PasswordChangeForm";

export default function Settings() {
  console.log("Rendering Settings page");
  const { user, profile } = useAuth();
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6">
        {/* Account Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Profile Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">First Name</h4>
                    <p className="mt-1">{profile?.first_name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Name</h4>
                    <p className="mt-1">{profile?.last_name}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="mt-1">{user?.email}</p>
                </div>
              </div>
            </div>
            
            {/* Password Change Form */}
            <div>
              <h3 className="text-lg font-medium mb-4">Change Password</h3>
              <PasswordChangeForm />
            </div>
          </CardContent>
        </Card>
        
        {/* Preferences Card */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <p>User preferences will be available here.</p>
          </CardContent>
        </Card>
        
        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Notification settings will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
