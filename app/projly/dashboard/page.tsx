'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { projlyAuthService, projlyProjectsService, projlyTasksService } from '@/lib/services/projly';
import { DashboardLayout } from '@/app/projly/components/layout/DashboardLayout';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Handle and store API errors for user feedback
  const [errors, setErrors] = useState<{
    auth?: string;
    projects?: string;
    tasks?: string;
  }>({});

  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:DASHBOARD] ${message}`, data);
    } else {
      console.log(`[PROJLY:DASHBOARD] ${message}`);
    }
  };

  // Function to dismiss an error
  const dismissError = (errorKey: 'auth' | 'projects' | 'tasks') => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[errorKey];
      return newErrors;
    });
  };

  // Component to display errors with toast-like styling
  const ErrorDisplay = ({ message, onDismiss }: { message: string; onDismiss: () => void }) => {
    if (!message) return null;
    
    return (
      <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-md flex items-start justify-between">
        <div className="flex">
          <div className="text-red-500 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-red-800">{message}</p>
          </div>
        </div>
        <button onClick={onDismiss} className="text-red-500 hover:text-red-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    );
  };

  // Function to refresh the auth token
  const refreshAuthToken = async () => {
    log('Attempting to refresh auth token');
    try {
      const result = await projlyAuthService.refreshSession();
      return result.success;
    } catch (error) {
      console.error('[PROJLY:DASHBOARD] Error refreshing token:', error);
      return false;
    }
  };
  
  // Main data fetching function
  const fetchData = async () => {
    try {
      log('Checking authentication');
      let isAuthenticated = await projlyAuthService.isAuthenticated();
      
      if (!isAuthenticated) {
        log('User not authenticated, trying to refresh token');
        const refreshed = await refreshAuthToken();
        
        if (!refreshed) {
          log('Auth refresh failed, redirecting to login');
          setErrors(prev => ({ ...prev, auth: 'Your session has expired. Please log in again.' }));
          router.push('/projly/login');
          return;
        } else {
          isAuthenticated = true;
          log('Auth token refreshed successfully');
        }
      }
      
      log('Fetching user profile');
      const currentUser = await projlyAuthService.getCurrentUser();
      log('User profile:', currentUser);
      
      if (currentUser) {
        setUserProfile(currentUser);
        log('User profile loaded:', currentUser);
        
        // Fetch projects
        log('Fetching projects');
        try {
          const projectsData = await projlyProjectsService.getProjects();
          log('Projects loaded:', projectsData.length);
          setProjects(projectsData);
        } catch (projectError) {
          console.error('[PROJLY:DASHBOARD] Error fetching projects:', projectError);
          setErrors(prev => ({ ...prev, projects: 'Could not load projects. Please try again later.' }));
          setProjects([]);
        }
        
        // Fetch user tasks
        log('Fetching user tasks');
        try {
          const tasksData = await projlyTasksService.getUserTasks();
          log('Tasks loaded:', tasksData.length);
          setUserTasks(tasksData);
        } catch (taskError) {
          console.error('[PROJLY:DASHBOARD] Error fetching tasks:', taskError);
          setErrors(prev => ({ ...prev, tasks: 'Could not load tasks.' }));
        }
      }
    } catch (error) {
      console.error('[PROJLY:DASHBOARD] Error fetching dashboard data:', error);
      setErrors(prev => ({ ...prev, auth: 'An unexpected error occurred. Please try again later.' }));
    } finally {
      setIsLoading(false);
      log('Dashboard data loading completed');
    }
  };

  // Initialize dashboard data
  useEffect(() => {
    log('Dashboard page loaded');
    fetchData();
  }, [router]);

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
      <div className="container mx-auto py-6 space-y-8">
        {/* Show auth errors at the top */}
        {errors.auth && <ErrorDisplay message={errors.auth} onDismiss={() => dismissError('auth')} />}
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {userProfile?.firstName || userProfile?.first_name || 'User'}! Here's an overview of your projects and tasks.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={() => router.push('/projly/tasks/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Task
            </Button>
            <Button variant="default" size="sm" onClick={() => router.push('/projly/projects/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <Card className="col-span-full lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your active projects</CardDescription>
              {errors.projects && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                  <div className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    {errors.projects}
                    <button 
                      className="ml-auto text-amber-700 hover:text-amber-900" 
                      onClick={() => dismissError('projects')}
                      aria-label="Dismiss"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {projects && projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="text-lg font-medium">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          {project.startDate && (
                            <span>Started: {format(new Date(project.startDate), 'MMM d, yyyy')}</span>
                          )}
                          {project.startDate && project.endDate && <span className="mx-2">•</span>}
                          {project.endDate && (
                            <span>Due: {format(new Date(project.endDate), 'MMM d, yyyy')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/projly/projects/${project.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No projects found.</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push('/projly/projects/new')}>
                    Create your first project
                  </Button>
                </div>
              )}
            </CardContent>
            {projects && projects.length > 0 && (
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/projly/projects">View All Projects</Link>
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Tasks Due Soon */}
          <Card className="col-span-full lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Tasks</CardTitle>
                <CardDescription>Tasks assigned to you</CardDescription>
                {errors.tasks && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                    <div className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      {errors.tasks}
                      <button 
                        className="ml-auto text-amber-700 hover:text-amber-900" 
                        onClick={() => dismissError('tasks')}
                        aria-label="Dismiss"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/projly/tasks/new')}>
                <PlusCircle className="h-4 w-4 mr-1" />
                New
              </Button>
            </CardHeader>
            <CardContent>
              {userTasks && userTasks.length > 0 ? (
                <div className="space-y-4">
                  {userTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <h3 className="text-lg font-medium">{task.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
                            Project: {task.project?.name}
                          </span>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                          ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {task.status}
                        </span>
                      </div>
                      {task.due_date && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tasks assigned to you.</p>
                </div>
              )}
            </CardContent>
            {userTasks && userTasks.length > 0 && (
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/projly/tasks">View All Tasks</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
