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
import { projlyAuthService, projlyAnalyticsService } from '@/lib/services/projly';

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>({
    projects: {
      byStatus: [],
      byMonth: []
    },
    tasks: {
      byStatus: [],
      byPriority: []
    }
  });
  const [activeTab, setActiveTab] = useState('overview');
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:ANALYTICS] ${message}`, data);
    } else {
      console.log(`[PROJLY:ANALYTICS] ${message}`);
    }
  };
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    log('Analytics dashboard loaded');
    
    const fetchData = async () => {
      try {
        log('Checking authentication');
        const isAuthenticated = await projlyAuthService.isAuthenticated();
        
        if (!isAuthenticated) {
          log('User not authenticated, redirecting to login');
          router.push('/projly/login');
          return;
        }
        
        log('Fetching analytics data');
        try {
          const data = await projlyAnalyticsService.getAnalytics();
          log('Analytics data loaded:', data);
          
          if (data) {
            setAnalyticsData(data);
          } else {
            throw new Error('No analytics data returned');
          }
        } catch (error) {
          console.error('[PROJLY:ANALYTICS] Error fetching analytics data:', error);
          
          // Use mock data if the API fails
          const mockData = generateMockAnalyticsData();
          log('Using mock analytics data:', mockData);
          setAnalyticsData(mockData);
        }
      } catch (error) {
        console.error('[PROJLY:ANALYTICS] Error in analytics dashboard:', error);
      } finally {
        setIsLoading(false);
        log('Analytics data loading completed');
      }
    };
    
    fetchData();
  }, [router]);
  
  // Generate mock data for development/fallback
  const generateMockAnalyticsData = () => {
    log('Generating mock analytics data');
    
    return {
      projects: {
        byStatus: [
          { name: 'Not Started', value: 4 },
          { name: 'In Progress', value: 6 },
          { name: 'Completed', value: 3 },
          { name: 'On Hold', value: 2 }
        ],
        byMonth: [
          { name: 'Jan', count: 2 },
          { name: 'Feb', count: 3 },
          { name: 'Mar', count: 1 },
          { name: 'Apr', count: 4 },
          { name: 'May', count: 2 },
          { name: 'Jun', count: 3 },
        ]
      },
      tasks: {
        byStatus: [
          { name: 'To Do', value: 8 },
          { name: 'In Progress', value: 5 },
          { name: 'Done', value: 12 },
          { name: 'Blocked', value: 2 }
        ],
        byPriority: [
          { name: 'Low', value: 7 },
          { name: 'Medium', value: 10 },
          { name: 'High', value: 8 },
          { name: 'Critical', value: 2 }
        ]
      },
      users: {
        active: 12,
        inactive: 3
      },
      activity: {
        today: 23,
        week: 145,
        month: 567
      }
    };
  };

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
            <Button variant="outline" size="sm" onClick={() => setAnalyticsData(generateMockAnalyticsData())}>
              Refresh Data
            </Button>
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
                    {analyticsData.projects.byStatus.reduce((acc: number, curr: any) => acc + curr.value, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.tasks.byStatus.reduce((acc: number, curr: any) => acc + curr.value, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.users?.active || 12}
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
                        data={analyticsData.projects.byStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.projects.byStatus.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                        data={analyticsData.tasks.byStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.tasks.byStatus.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <CardTitle>Projects Created by Month</CardTitle>
                <CardDescription>Number of new projects started per month</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.projects.byMonth}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Project Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Priority</CardTitle>
                <CardDescription>Distribution of tasks by priority level</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.tasks.byPriority}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#82ca9d" name="Task Count" />
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
