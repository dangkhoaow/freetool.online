'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { 
  useTaskStatusAnalytics, 
  useProjectStatusAnalytics, 
  useTeamMemberRolesAnalytics, 
  useTaskDueDateAnalytics,
  useTeamTaskDistributionAnalytics,
  useTaskTimelineAnalytics
} from "@/lib/services/projly/use-analytics";
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

// Color scheme matching the existing dashboard
const STATUS_COLORS = {
  'Completed': '#16a34a',    // green-600
  'In Progress': '#2563eb',  // blue-600
  'In Review': '#a855f7',    // purple-500
  'Not Started': '#6b7280',  // gray-500
  'On Hold': '#f97316',      // orange-500
  'Pending': '#f59e0b',      // amber-500
  'Active': '#2563eb',       // blue-600
  'Planned': '#8b5cf6',      // purple-500
  'Canceled': '#ef4444',     // red-500
  'Archived': '#6b7280',     // gray-500
  'Overdue': '#ef4444',      // red-500
  'Due Soon': '#f59e0b',     // amber-500
  'Due Later': '#0ea5e9',    // sky-500
  'No Due Date': '#9ca3af',  // gray-400
  // Resource types
  'License': '#16a34a',      // green-600
  'File': '#2563eb',         // blue-600
  'Software': '#a855f7',     // purple-500
  'Equipment': '#f97316',    // orange-500
  // Team member roles
  'Member': '#6b7280',       // gray-500
  'Backend Developer': '#2563eb',  // blue-600
  'Team Manager': '#16a34a', // green-600
  'Project Manager': '#f97316', // orange-500
  'Frontend Developer': '#a855f7', // purple-500
  'Full Stack Developer': '#0ea5e9', // sky-500
  'Designer': '#ec4899',     // pink-500
  'DevOps': '#84cc16',       // lime-500
  'QA Engineer': '#f59e0b',  // amber-500
  'Admin': '#ef4444',        // red-500
  'Owner': '#7c3aed',        // violet-600
  'default': '#9ca3af',      // gray-400
};

const getColor = (name: string) => {
  return STATUS_COLORS[name as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
};

function LoadingChart({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading chart...</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorChart({ title, error }: { title: string; error: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <div className="text-muted-foreground text-center">
            <p>Unable to load chart</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskStatusChart() {
  const { data, isLoading, error } = useTaskStatusAnalytics();

  if (isLoading) return <LoadingChart title="Task Status Distribution" />;
  if (error) return <ErrorChart title="Task Status Distribution" error="Failed to load task status data" />;

  const chartData = data?.map((item: any) => ({
    ...item,
    fill: getColor(item.name)
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Task Status Distribution
        </CardTitle>
        <CardDescription>Overview of task statuses across your projects</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TaskDueDateChart() {
  const { data, isLoading, error } = useTaskDueDateAnalytics();

  if (isLoading) return <LoadingChart title="Task Due Date Distribution" />;
  if (error) return <ErrorChart title="Task Due Date Distribution" error="Failed to load due date data" />;

  const chartData = data?.map((item: any) => ({
    ...item,
    fill: getColor(item.name)
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Task Due Date Distribution
        </CardTitle>
        <CardDescription>Tasks categorized by due date periods</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8">
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ProjectStatusChart() {
  const { data, isLoading, error } = useProjectStatusAnalytics();

  if (isLoading) return <LoadingChart title="Project Status Distribution" />;
  if (error) return <ErrorChart title="Project Status Distribution" error="Failed to load project status data" />;

  const chartData = data?.map((item: any) => ({
    ...item,
    fill: getColor(item.name)
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Project Status Distribution
        </CardTitle>
        <CardDescription>Overview of project statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TeamMemberRolesChart() {
  const { data, isLoading, error } = useTeamMemberRolesAnalytics();

  if (isLoading) return <LoadingChart title="Team Member Roles Distribution" />;
  if (error) return <ErrorChart title="Team Member Roles Distribution" error="Failed to load team member roles data" />;

  const chartData = (data || []).map((item: any) => ({
    ...item,
    fill: getColor(item.name)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Team Member Roles Distribution
        </CardTitle>
        <CardDescription>Breakdown of team member roles across all teams</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TeamTaskDistributionChart() {
  const { data, isLoading, error } = useTeamTaskDistributionAnalytics();

  if (isLoading) return <LoadingChart title="Team Task Distribution" />;
  if (error) return <ErrorChart title="Team Task Distribution" error="Failed to load team distribution data" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Team Task Distribution
        </CardTitle>
        <CardDescription>Tasks assigned to team members</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TaskTimelineChart() {
  const { data, isLoading, error } = useTaskTimelineAnalytics();

  if (isLoading) return <LoadingChart title="Task Timeline" />;
  if (error) return <ErrorChart title="Task Timeline" error="Failed to load timeline data" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Task Timeline
        </CardTitle>
        <CardDescription>Tasks created and completed over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#2563eb" name="Total Created" />
            <Line type="monotone" dataKey="completed" stroke="#16a34a" name="Completed" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function AnalyticsChartsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics & Reports
        </CardTitle>
        <CardDescription>Comprehensive insights into your projects and tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TaskStatusChart />
              <ProjectStatusChart />
              <TaskDueDateChart />
              <TeamMemberRolesChart />
            </div>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ProjectStatusChart />
              <TeamMemberRolesChart />
              <TeamTaskDistributionChart />
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TaskStatusChart />
              <TaskDueDateChart />
              <TaskTimelineChart />
              <TeamTaskDistributionChart />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
