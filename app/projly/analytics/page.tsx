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
  Cell,
  LineChart,
  Line
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
    'Golive': '#10b981', // emerald-500 (green)
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

  // Log data when it changes
  useEffect(() => {
    log('Task status data:', taskStatusData.data);
    log('Task due date data:', taskDueDateData.data);
    log('Project status data:', projectStatusData.data);
    log('Resources data:', resourcesData.data);
    log('Team task distribution data:', teamTaskDistributionData.data);
    log('Task timeline data:', taskTimelineData.data);
  }, [
    taskStatusData.data,
    taskDueDateData.data,
    projectStatusData.data,
    resourcesData.data,
    teamTaskDistributionData.data,
    taskTimelineData.data
  ]);

  // Check if any data is still loading
  const isDataLoading = 
    taskStatusData.isLoading ||
    taskDueDateData.isLoading ||
    projectStatusData.isLoading ||
    resourcesData.isLoading ||
    teamTaskDistributionData.isLoading ||
    taskTimelineData.isLoading;

  // Check if any data has errors
  const hasErrors = 
    taskStatusData.error ||
    taskDueDateData.error ||
    projectStatusData.error ||
    resourcesData.error ||
    teamTaskDistributionData.error ||
    taskTimelineData.error;

  if (isLoading || isDataLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Spinner className="h-10 w-10" />
        </div>
      </DashboardLayout>
    );
  }

  if (hasErrors) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
          <h2 className="text-2xl font-bold text-red-600">Error Loading Analytics</h2>
          <p className="text-muted-foreground">There was an error loading the analytics data. Please try again later.</p>
          <Button variant="outline" onClick={() => router.refresh()}>
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate totals from data with proper type checking
  const calculateTotal = (data: any[] | undefined, key: string): number => {
    if (!data || !Array.isArray(data)) {
      console.log(`[ANALYTICS] Invalid data for total calculation:`, data);
      return 0;
    }
    
    return data.reduce((acc: number, curr: any) => {
      if (!curr || typeof curr !== 'object') {
        console.log(`[ANALYTICS] Invalid item in data:`, curr);
        return acc;
      }
      const value = typeof curr[key] === 'number' ? curr[key] : 0;
      console.log(`[ANALYTICS] Adding value to total: ${value}`);
      return acc + value;
    }, 0);
  };

  // Calculate totals
  const totalProjects = calculateTotal(projectStatusData.data || [], 'value');
  const totalTasks = calculateTotal(taskStatusData.data || [], 'value');
  const totalTeamMembers = teamTaskDistributionData.data?.length || 0;

  console.log('[ANALYTICS] Calculated totals:', {
    totalProjects,
    totalTasks,
    totalTeamMembers
  });

  // Helper function to safely get data for charts
  const getChartData = (data: any[] | undefined) => {
    if (!data || !Array.isArray(data)) return [];
    return data.filter(item => item && typeof item.value === 'number');
  };

  // Task Status Chart
  const renderTaskStatusChart = () => {
    const { data: taskStatusData, isLoading: isTaskStatusLoading } = useTaskStatusAnalytics();
    
    if (isTaskStatusLoading) {
      return <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
    }

    if (!taskStatusData || taskStatusData.length === 0) {
      return <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No task status data available
      </div>;
    }

    console.log('[ANALYTICS] Rendering TaskStatusChart with data:', taskStatusData);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={taskStatusData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label={({ name, percent }) => {
              if (name === undefined || percent === undefined || isNaN(percent)) {
                return '';
              }
              return `${String(name)}: ${(percent * 100).toFixed(0)}%`;
            }}
          >
            {taskStatusData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => {
            if (value === undefined || value === null || isNaN(value)) return '0';
            return String(Number(value).toFixed(0));
          }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Task Due Date Chart
  const renderTaskDueDateChart = () => {
    const { data: taskDueDateData, isLoading: isTaskDueDateLoading } = useTaskDueDateAnalytics();
    
    if (isTaskDueDateLoading) {
      return <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
    }

    if (!taskDueDateData || taskDueDateData.length === 0) {
      return <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No task due date data available
      </div>;
    }

    console.log('[ANALYTICS] Rendering TaskDueDateChart with data:', taskDueDateData);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={taskDueDateData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: any) => {
            if (value === undefined || value === null || isNaN(value)) return '0';
            return String(Number(value).toFixed(0));
          }} />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Project Status Chart
  const renderProjectStatusChart = () => {
    const { data: projectStatusData, isLoading: isProjectStatusLoading } = useProjectStatusAnalytics();
    
    if (isProjectStatusLoading) {
      return <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
    }

    if (!projectStatusData || projectStatusData.length === 0) {
      return <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No project status data available
      </div>;
    }

    console.log('[ANALYTICS] Rendering ProjectStatusChart with data:', projectStatusData);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={projectStatusData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label={({ name, percent }) => {
              if (name && percent !== undefined) {
                return `${name}: ${(percent * 100).toFixed(0)}%`;
              }
              return '';
            }}
          >
            {projectStatusData && projectStatusData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={getStatusColor(entry?.name || 'default')} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => {
            if (value === undefined || value === null || isNaN(value)) return '0';
            return String(value);
          }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Resources Chart
  const renderResourcesChart = () => {
    const { data: resourcesData, isLoading: isResourcesLoading } = useResourcesAnalytics();
    
    if (isResourcesLoading) {
      return <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
    }

    if (!resourcesData || resourcesData.length === 0) {
      return <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No resources data available
      </div>;
    }

    console.log('[ANALYTICS] Rendering ResourcesChart with data:', resourcesData);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={resourcesData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label={({ name, percent }) => {
              if (name && percent !== undefined) {
                return `${name}: ${(percent * 100).toFixed(0)}%`;
              }
              return '';
            }}
          >
            {resourcesData && Array.isArray(resourcesData) && resourcesData.map((entry: any, index: number) => {
              if (!entry) return null;
              return <Cell key={`cell-${index}`} fill={getStatusColor(entry?.name || 'default')} />;
            })}
          </Pie>
          <Tooltip formatter={(value: any) => {
            if (value === undefined || value === null || isNaN(value)) return '0';
            return String(value);
          }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Team Task Distribution Chart
  const renderTeamTaskDistributionChart = () => {
    const { data: teamTaskData, isLoading: isTeamTaskLoading } = useTeamTaskDistributionAnalytics();
    
    if (isTeamTaskLoading) {
      return <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
    }

    if (!teamTaskData || teamTaskData.length === 0) {
      return <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No team task distribution data available
      </div>;
    }

    console.log('[ANALYTICS] Rendering TeamTaskDistributionChart with data:', teamTaskData);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={teamTaskData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: any) => {
            if (value === undefined || value === null || isNaN(value)) return '0';
            return String(value);
          }} />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" name="Assigned Tasks" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Task Timeline Chart
  const renderTaskTimelineChart = () => {
    const { data: timelineData, isLoading: isTimelineLoading } = useTaskTimelineAnalytics();
    
    if (isTimelineLoading) {
      return <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
    }

    if (!timelineData || timelineData.length === 0) {
      return <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No task timeline data available
      </div>;
    }

    console.log('[ANALYTICS] Rendering TaskTimelineChart with data:', timelineData);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={timelineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: any) => {
            if (value === undefined || value === null || isNaN(value)) return '0';
            return String(value);
          }} />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Tasks" />
          <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="Completed Tasks" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Ensure all display values are properly formatted to avoid NaN errors
  const formatDisplayValue = (value: any): string => {
    if (value === undefined || value === null) return '0';
    if (typeof value === 'number') return String(value);
    return String(value);
  };
  
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
                  <div className="text-2xl font-bold">{formatDisplayValue(totalProjects)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDisplayValue(totalTasks)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDisplayValue(totalTeamMembers)}</div>
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
                  {renderProjectStatusChart()}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Task Status</CardTitle>
                  <CardDescription>Distribution of tasks by status</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {renderTaskStatusChart()}
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
                {renderTaskTimelineChart()}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Task Due Dates</CardTitle>
                  <CardDescription>Tasks by due date category</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {renderTaskDueDateChart()}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Team Task Distribution</CardTitle>
                  <CardDescription>Tasks assigned to team members</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {renderTeamTaskDistributionChart()}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Resource Types</CardTitle>
                <CardDescription>Distribution of resources by type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {renderResourcesChart()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
