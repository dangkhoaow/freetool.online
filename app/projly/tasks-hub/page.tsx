'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { projlyAuthService } from '@/lib/services/projly';
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import { TasksHubContainer } from "./components/TasksHubContainer";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";

// Define constant log prefix for consistent logging
const LOG_PREFIX = "[PROJLY:TASKS_HUB_PAGE]";
const log = (...args: any[]) => console.log(LOG_PREFIX, ...args);

export default function TasksHubPage() {
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
    log("Initializing tasks hub page");
    checkAuth();
    setIsLoading(false);
  }, []);

  // Show loading state using the enhanced PageLoading component
  if (isLoading) {
    log("Showing loading state");
    return <PageLoading logContext="PROJLY:TASKS_HUB" />;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks Hub</h1>
            <p className="text-muted-foreground">Optimized task management with server-side performance</p>
          </div>
        </div>
        
        {/* Use the optimized TasksHubContainer component */}
        <TasksHubContainer />
      </div>
    </DashboardLayout>
  );
}
