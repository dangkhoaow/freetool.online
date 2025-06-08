'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { projlyAuthService } from '@/lib/services/projly';
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import { TasksContainer } from "../components/tasks/TasksContainer";
import { useTasks } from "@/lib/services/projly/use-tasks";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";

// Define constant log prefix for consistent logging
const LOG_PREFIX = "[PROJLY:TASKS_PAGE]";
const log = (...args: any[]) => console.log(LOG_PREFIX, ...args);

export default function TasksPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  // Load tasks via React Query hook for background updates
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useTasks();
  
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
  if (isLoading || tasksLoading) {
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
        
        {/* Use the TasksContainer component */}
        <TasksContainer
          context="main"
          // Provide initial tasks and disable internal auto-loading once data exists
          initialTasks={tasks || []}
          autoLoad={!tasks}
          onDataChange={() => {
            log('TasksPage: data changed, refetching tasks');
            refetchTasks();
          }}
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
