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
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import { DashboardLayout } from '@/app/projly/components/layout/DashboardLayout';
import { projlyAuthService, projlyAnalyticsService } from '@/lib/services/projly';
import { 
  useTaskStatusAnalytics,
  useTaskDueDateAnalytics,
  useProjectStatusAnalytics,
  useResourcesAnalytics,
  useTeamTaskDistributionAnalytics,
  useTaskTimelineAnalytics
} from '@/lib/services/projly/use-analytics';

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
  // Resource types
  'License': '#16a34a', // green-600
  'File': '#2563eb', // blue-600
  'Software': '#a855f7', // purple-500
  'Equipment': '#f97316', // orange-500
  // Fallback colors for other categories
  'default': '#9ca3af', // gray-400
};

// Helper function to get color based on status/category
const getStatusColor = (name: string): string => {
  console.log(`[ANALYTICS] Getting color for status: ${name}`);
  return STATUS_COLORS[name as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
};

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use React Query hooks for analytics data
  const { data: taskStatusData, isLoading: isTaskStatusLoading } = useTaskStatusAnalytics();
  const { data: taskDueDateData, isLoading: isTaskDueDateLoading } = useTaskDueDateAnalytics();
  const { data: projectStatusData, isLoading: isProjectStatusLoading } = useProjectStatusAnalytics();
  const { data: resourcesData, isLoading: isResourcesLoading } = useResourcesAnalytics();
  const { data: teamTaskData, isLoading: isTeamTaskLoading } = useTeamTaskDistributionAnalytics();
  const { data: taskTimelineData, isLoading: isTaskTimelineLoading } = useTaskTimelineAnalytics();

  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:ANALYTICS] ${message}`, data);
    } else {
      console.log(`[PROJLY:ANALYTICS] ${message}`);
    }
  };
  
  // Check if any data is still loading
  const isLoading = isTaskStatusLoading || isTaskDueDateLoading || isProjectStatusLoading || 
                   isResourcesLoading || isTeamTaskLoading || isTaskTimelineLoading;

  // Calculate total counts
  const totalProjects = projectStatusData?.reduce((acc, curr) => acc + curr.value, 0) || 0;
  const totalTasks = taskStatusData?.reduce((acc, curr) => acc + curr.value, 0) || 0;
  const totalTeamMembers = teamTaskData?.length || 0;

  if (isLoading) {
    log('Showing analytics loading spinner');
    return <PageLoading logContext="PROJLY:ANALYTICS" />;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-4">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.push('/projly/dashboard')
            }}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              View insights and metrics for your projects and tasks
            </p>
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
                  <div className="text-2xl font-bold">{totalProjects}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTeamMembers}</div>
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
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {projectStatusData?.map((entry, index) => (
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
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {taskStatusData?.map((entry, index) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Task Due Dates</CardTitle>
                  <CardDescription>Tasks by due date period</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taskDueDateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill={getStatusColor('Due Later')} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Types</CardTitle>
                  <CardDescription>Distribution of resources by type</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resourcesData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {resourcesData?.map((entry, index) => (
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
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Overview of project statuses</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill={getStatusColor('In Progress')} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>Overview of task statuses</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill={getStatusColor('In Progress')} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Task Distribution</CardTitle>
                <CardDescription>Tasks assigned to team members</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamTaskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill={getStatusColor('Active')} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
