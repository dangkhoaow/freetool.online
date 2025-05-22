'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { DashboardLayout } from '@/app/projly/components/layout/DashboardLayout';
import { projlyAuthService } from '@/lib/services/projly';
import { 
  useTaskStatusAnalytics,
  useTaskDueDateAnalytics,
  useProjectStatusAnalytics,
  useResourcesAnalytics,
  useTeamTaskDistributionAnalytics,
  useTaskTimelineAnalytics
} from '@/lib/services/projly/use-analytics';

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Analytics hooks
  const taskStatusData = useTaskStatusAnalytics();
  const taskDueDateData = useTaskDueDateAnalytics();
  const projectStatusData = useProjectStatusAnalytics();
  const resourcesData = useResourcesAnalytics();
  const teamTaskDistributionData = useTeamTaskDistributionAnalytics();
  const taskTimelineData = useTaskTimelineAnalytics();
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:ANALYTICS] ${message}`, data);
    } else {
      console.log(`[PROJLY:ANALYTICS] ${message}`);
    }
  };
  
  // Define a consistent color scheme matching our status badges
  const STATUS_COLORS = {
    'Completed': '#16a34a', // green-600
    'In Progress': '#2563eb', // blue-600
    'In Review': '#a855f7', // purple-500
    'Not Started': '#6b7280', // gray-500
    'On Hold': '#f97316', // orange-500
    'Pending': '#f59e0b', // amber-500
    'Active': '#2563eb', // blue-600 (same as In Progress)
    'Planned': '#8b5cf6', // purple-500 (similar to In Review)
    'Canceled': '#ef4444', // red-500
    'Archived': '#6b7280', // gray-500 (same as Not Started)
    'Overdue': '#ef4444', // red-500
    'Due Soon': '#f59e0b', // amber-500 (same as Pending)
    'Due Later': '#0ea5e9', // sky-500
    'No Due Date': '#9ca3af', // gray-400
    // Fallback colors for other categories
    'default': '#9ca3af', // gray-400
  };
  
  // Helper function to get color by status name
  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
  };
  
  // Generate a color array based on data entries for charts
  const getColorsForData = (data: any[] | undefined) => {
    if (!data) return [];
    return data.map(entry => getStatusColor(entry.name));
  };
  
  useEffect(() => {
    log('Analytics dashboard loaded');
    
    const checkAuth = async () => {
      try {
        log('Checking authentication');
        const isAuthenticated = await projlyAuthService.isAuthenticated();
        
        if (!isAuthenticated) {
          log('User not authenticated, redirecting to login');
          router.push('/projly/login');
          return;
        }
        
        setIsLoading(false);
        log('Analytics data loading completed');
      } catch (error) {
        console.error('[PROJLY:ANALYTICS] Error in analytics dashboard:', error);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Spinner className="h-10 w-10" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              View insights and metrics for your projects and tasks
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/projly/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full" onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projectStatusData.data?.reduce((acc: number, curr: any) => acc + curr.value, 0) || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {taskStatusData.data?.reduce((acc: number, curr: any) => acc + curr.value, 0) || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {teamTaskDistributionData.data?.length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Status</CardTitle>
                  <CardDescription>Distribution of projects by status</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectStatusData.data}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {projectStatusData.data?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Task Status</CardTitle>
                  <CardDescription>Distribution of tasks by status</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskStatusData.data}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {taskStatusData.data?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>Project creation and completion over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskTimelineData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="created" name="Created" fill={STATUS_COLORS['Active']} />
                    <Bar dataKey="completed" name="Completed" fill={STATUS_COLORS['Completed']} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
                <CardDescription>Tasks assigned to team members</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamTaskDistributionData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Tasks" fill={STATUS_COLORS['Active']} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Task Due Dates</CardTitle>
                <CardDescription>Distribution of tasks by due date status</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskDueDateData.data}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskDueDateData.data?.map((entry: any, index: number) => {
                        // Map due date categories to our status colors
                        let colorKey = entry.name;
                        if (entry.name === 'Overdue') colorKey = 'Overdue';
                        else if (entry.name === 'Due Soon') colorKey = 'Due Soon';
                        else if (entry.name === 'Due Later') colorKey = 'Due Later';
                        else if (entry.name === 'No Due Date') colorKey = 'No Due Date';
                        return <Cell key={`cell-${index}`} fill={getStatusColor(colorKey)} />;
                      })}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
