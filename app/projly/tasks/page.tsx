'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TasksTable } from "@/app/projly/components/tasks/TasksTable";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle } from "lucide-react";
import { projlyAuthService, projlyTasksService } from '@/lib/services/projly';

export default function TasksPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  // Maintain filters at the page level to preserve during refresh
  const [currentFilters, setCurrentFilters] = useState<any>({});
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:TASKS] ${message}`, data);
    } else {
      console.log(`[PROJLY:TASKS] ${message}`);
    }
  };
  
  // Function to fetch tasks data
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      log('Checking authentication');
      const isAuthenticated = await projlyAuthService.isAuthenticated();
      
      if (!isAuthenticated) {
        log('User not authenticated, redirecting to login');
        router.push('/projly/login');
        return;
      }
      
      log('Fetching tasks');
      const userTasks = await projlyTasksService.getUserTasks();
      log('Tasks loaded:', userTasks.length);
      setTasks(userTasks);
      
    } catch (error) {
      console.error('[PROJLY:TASKS] Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
      log('Tasks loading completed');
    }
  };
  
  // Refresh tasks handler for TasksTable to call after operations
  const handleRefreshTasks = (filters?: any) => {
    log('Refreshing tasks data after operation');
    log('Preserving filters:', filters);
    
    // Update current filters if provided
    if (filters) {
      setCurrentFilters(filters);
    }
    
    fetchTasks();
  };
  
  // Check authentication and load tasks on page load
  useEffect(() => {    
    fetchTasks();
  }, [router]);
  
  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">Manage your tasks across all projects</p>
          </div>
          <Button onClick={() => router.push('/projly/tasks/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
        
        <Card>
          <CardContent>
            {tasks.length > 0 ? (
              <TasksTable 
                tasks={tasks} 
                initialFilters={currentFilters}
                onOperationComplete={handleRefreshTasks} 
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You don't have any tasks assigned to you yet.</p>
                <Button onClick={() => router.push('/projly/tasks/new')}>
                  Create your first task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
