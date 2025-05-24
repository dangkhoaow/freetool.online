'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { projlyAuthService } from '@/lib/services/projly';
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import { TasksContainer } from "../components/tasks/TasksContainer";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";

const log = (...args: any[]) => console.log("[TasksPage]", ...args);

export default function TasksPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated and redirect if not
  const checkAuth = async () => {
    const isAuthenticated = await projlyAuthService.isAuthenticated();
    if (!isAuthenticated) {
      router.push("/projly/auth/login");
    }
  };

  // Initialize on component mount
  useEffect(() => {
    log("Initializing tasks page");
    checkAuth();
    setIsLoading(false);
  }, []);

  // Show loading state using the enhanced PageLoading component
  if (isLoading) {
    log("Showing loading state");
    return <PageLoading logContext="PROJLY:TASKS" />;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">Manage your tasks across all projects</p>
          </div>
        </div>
        
        {/* Use the new TasksContainer component which handles everything internally */}
        <TasksContainer 
          context="main"
          autoLoad={true}
          displayOptions={{
            showHeader: true,
            showAddButton: true,
            compact: false,
            title: "Tasks"
          }}
          hierarchyOptions={{
            maxDepth: 1,
            showAllSubtasks: false
          }}
        />
      </div>
    </DashboardLayout>
  );
}
