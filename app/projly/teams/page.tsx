'use client';

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { TeamsList } from "@/app/projly/components/team/TeamsList";
import { MembersTable } from "@/app/projly/components/team/MembersTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Log initialization for debugging
console.log('[PROJLY:TEAM] Team page component initializing');

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<string>('teams');
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  
  // Log component render for debugging
  console.log('[PROJLY:TEAM] Rendering team page component with active tab:', activeTab);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    console.log('[PROJLY:TEAM] Tab changed to:', value);
    setActiveTab(value);
  };
  
  // Handle error notification
  const handleError = (error: Error) => {
    console.error('[PROJLY:TEAM] Error:', error);
    toast({
      title: "Error",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
            <p className="text-muted-foreground">Manage your teams and members</p>
          </div>
        </div>
        
        <Tabs defaultValue="teams" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
          
          <TabsContent value="teams" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Teams</CardTitle>
                <CardDescription>
                  View and manage your teams. Click on a team to see its members.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeamsList />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="members" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  {selectedTeamId 
                    ? "Viewing members for the selected team." 
                    : "Viewing all team members. Select a team to filter."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MembersTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
