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
  
  // Function to filter out deeply nested subtasks (level 2+) using a recursive approach
  const filterNestedTasks = (allTasks: any[]) => {
    log('Filtering out deeply nested subtasks using recursive approach');
    
    // Create maps to track relationships and visited tasks (to avoid circular references)
    const taskMap = new Map<string, any>(); // Map task ID to task object
    const taskLevels = new Map<string, number>(); // Track nesting level for each task
    const visited = new Set<string>(); // Track visited tasks to prevent circular references
    
    // Build task map for easy lookup
    allTasks.forEach(task => {
      taskMap.set(task.id, task);
    });
    
    // Recursive function to calculate task depth
    const calculateTaskDepth = (taskId: string, visited: Set<string> = new Set()): number => {
      // Base case: If we've already visited this task, there's a circular reference
      if (visited.has(taskId)) {
        log(`Warning: Circular reference detected for task ${taskId}`);
        return 0; // Break the circular reference by treating it as a top-level task
      }
      
      // Base case: If we've already calculated this task's depth, return it
      if (taskLevels.has(taskId)) {
        return taskLevels.get(taskId) || 0;
      }
      
      // Get the task object
      const task = taskMap.get(taskId);
      if (!task) {
        log(`Warning: Task ${taskId} not found in task map`);
        return 0; // Treat as a top-level task if not found
      }
      
      // If it's a top-level task (no parent), its depth is 0
      if (!task.parentTaskId) {
        taskLevels.set(taskId, 0);
        return 0;
      }
      
      // Mark this task as visited to detect circular references
      const newVisited = new Set(visited);
      newVisited.add(taskId);
      
      // Recursively calculate the parent's depth and add 1 for this task's depth
      const parentDepth = calculateTaskDepth(task.parentTaskId, newVisited);
      const thisDepth = parentDepth + 1;
      
      // Store and return the calculated depth
      taskLevels.set(taskId, thisDepth);
      log(`Task ${taskId} (${task.title}) is at depth level ${thisDepth} (child of ${task.parentTaskId})`);
      return thisDepth;
    };
    
    // Calculate depth for all tasks
    allTasks.forEach(task => {
      if (!taskLevels.has(task.id)) {
        calculateTaskDepth(task.id);
      }
    });
    
    // Log the level distribution for debugging
    const levelCounts = new Map<number, number>();
    taskLevels.forEach((level) => {
      levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
    });
    log('Task level distribution:');
    levelCounts.forEach((count, level) => {
      log(`Level ${level}: ${count} tasks`);
    });
    
    // Filter tasks to include only levels 0 and 1
    const filteredTasks = allTasks.filter(task => {
      const level = taskLevels.get(task.id) || 0;
      const includeTask = level <= 1; // Only include levels 0 and 1
      
      if (!includeTask) {
        log(`Filtering out deeply nested task: ${task.id} (${task.title}) at level ${level}`);
      }
      
      return includeTask;
    });
    
    log(`Filtered from ${allTasks.length} to ${filteredTasks.length} tasks after removing deeply nested tasks`);
    return filteredTasks;
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
      
      // Filter out deeply nested subtasks before setting state
      const filteredTasks = filterNestedTasks(userTasks);
      log(`Filtered to ${filteredTasks.length} tasks after removing deeply nested subtasks`);
      
      setTasks(filteredTasks);
      
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
