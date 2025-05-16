'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { Loader2, Calendar, BarChart3, PieChart, TrendingUp, Users, CheckCircle2, Clock } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { projlyAuthService, projlyProjectsService, projlyTasksService } from '@/lib/services/projly';
import { useToast } from "@/components/ui/use-toast";

// Analytics data types
interface AnalyticsSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTask: number;
  teamMembers: number;
  completionRate: number;
}

interface ProjectStats {
  id: string;
  name: string;
  tasksTotal: number;
  tasksCompleted: number;
  progress: number;
  status: string;
  dueDate?: string;
}

interface TaskDistribution {
  status: string;
  count: number;
  percentage: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeFrame, setTimeFrame] = useState("month");
  
  // Analytics state
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTask: 0,
    teamMembers: 0,
    completionRate: 0
  });
  
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);
  const [taskDistribution, setTaskDistribution] = useState<TaskDistribution[]>([]);
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:ANALYTICS] ${message}`, data);
    } else {
      console.log(`[PROJLY:ANALYTICS] ${message}`);
    }
  };
  
  // Check authentication and load analytics data on page load
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        log('Checking authentication');
        const isAuthenticated = await projlyAuthService.isAuthenticated();
        log('Authentication check result:', isAuthenticated);
        
        if (!isAuthenticated) {
          log('User not authenticated, redirecting to login');
          router.push('/projly/login');
          return;
        }
        
        log('Loading analytics data');
        await fetchAnalyticsData();
        
      } catch (error) {
        console.error('[PROJLY:ANALYTICS] Error loading analytics data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load analytics data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
        log('Analytics page initialization completed');
      }
    };
    
    loadAnalyticsData();
  }, [router, toast]);
  
  // Effect to refresh data when timeframe changes
  useEffect(() => {
    if (!isLoading) {
      log('Time frame changed, refreshing data:', timeFrame);
      fetchAnalyticsData();
    }
  }, [timeFrame]);
  
  // Fetch analytics data based on the current timeframe
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      log('Fetching analytics data for timeframe:', timeFrame);
      
      // In a real app, we would call different API endpoints
      // For demonstration, we'll use mock data
      
      // Fetch projects first
      const projects = await projlyProjectsService.getProjects();
      log('Projects loaded:', projects.length);
      
      // Fetch tasks
      const tasks = await projlyTasksService.getMyTasks();
      log('Tasks loaded:', tasks.length);
      
      // Calculate summary stats
      const activeProjects = projects.filter(p => p.status !== 'Completed').length;
      log('Active projects count:', activeProjects);
      
      const completedProjects = projects.filter(p => p.status === 'Completed').length;
      log('Completed projects count:', completedProjects);
      
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      log('Completed tasks count:', completedTasks);
      
      const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'Not Started').length;
      log('Pending tasks count:', pendingTasks);
      
      const overdueTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < new Date() && t.status !== 'Completed';
      }).length;
      log('Overdue tasks count:', overdueTasks);
      
      const completionRate = tasks.length > 0 
        ? Math.round((completedTasks / tasks.length) * 100) 
        : 0;
      log('Task completion rate:', completionRate);
      
      // Update summary
      const summaryData = {
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        overdueTask: overdueTasks,
        teamMembers: 4, // Mock data
        completionRate
      };
      log('Summary data calculated:', summaryData);
      setSummary(summaryData);
      
      // Calculate project stats
      const projectStatsData = projects.map(project => {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        const tasksCompleted = projectTasks.filter(t => t.status === 'Completed').length;
        const progress = projectTasks.length > 0 
          ? Math.round((tasksCompleted / projectTasks.length) * 100) 
          : 0;
        
        return {
          id: project.id,
          name: project.name,
          tasksTotal: projectTasks.length,
          tasksCompleted,
          progress,
          status: project.status,
          dueDate: project.dueDate
        };
      });
      log('Project stats calculated:', projectStatsData);
      setProjectStats(projectStatsData);
      
      // Calculate task distribution
      const statusCounts = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const distribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / tasks.length) * 100)
      }));
      log('Task distribution calculated:', distribution);
      setTaskDistribution(distribution);
      
    } catch (error) {
      console.error('[PROJLY:ANALYTICS] Error fetching analytics data:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh analytics data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      log('Analytics data refresh completed');
    }
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
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
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Project insights and performance metrics</p>
          </div>
          
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-muted-foreground mr-2" />
                    <div className="text-2xl font-bold">{summary.totalProjects}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.activeProjects} active, {summary.completedProjects} completed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground mr-2" />
                    <div className="text-2xl font-bold">{summary.totalTasks}</div>
                  </div>
                  <div className="mt-2">
                    <Progress value={summary.completionRate} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.completionRate}% completion rate
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                    <div className="text-2xl font-bold">{summary.overdueTask}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((summary.overdueTask / (summary.totalTasks || 1)) * 100)}% of total tasks
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-muted-foreground mr-2" />
                    <div className="text-2xl font-bold">{summary.teamMembers}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active collaborators on projects
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Projects Progress */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
                <CardDescription>Completion status of your active projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectStats.filter(p => p.status !== 'Completed').slice(0, 5).map(project => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">{project.progress}%</div>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <div>{project.tasksCompleted} / {project.tasksTotal} tasks</div>
                        <div>Due {formatDate(project.dueDate)}</div>
                      </div>
                    </div>
                  ))}
                  
                  {projectStats.filter(p => p.status !== 'Completed').length === 0 && (
                    <div className="py-4 text-center text-muted-foreground">
                      No active projects found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Task Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
                <CardDescription>Tasks by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taskDistribution.map(item => (
                    <div key={item.status} className="flex items-center">
                      <div className="w-1/3 font-medium">{item.status}</div>
                      <div className="w-2/3">
                        <div className="flex items-center gap-2">
                          <Progress value={item.percentage} className="h-2" />
                          <span className="text-sm text-muted-foreground w-16">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {taskDistribution.length === 0 && (
                    <div className="py-4 text-center text-muted-foreground">
                      No tasks found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Project Performance</CardTitle>
                <CardDescription>Progress and status of all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Tasks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectStats.map(project => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="h-2 w-[60px]" />
                            <span>{project.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{project.tasksCompleted}/{project.tasksTotal}</TableCell>
                        <TableCell>
                          <Badge 
                            className={project.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''}
                            variant={project.status === 'In Progress' ? 'default' : 'outline'}
                          >
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(project.dueDate)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => router.push(`/projly/projects/${project.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {projectStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No projects found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Task Analytics</CardTitle>
                    <CardDescription>Task completion and status breakdown</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Completion Rate</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Overall</div>
                        <div className="text-sm text-muted-foreground">{summary.completionRate}%</div>
                      </div>
                      <Progress value={summary.completionRate} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {summary.completedTasks} completed out of {summary.totalTasks} total tasks
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Task Status Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {taskDistribution.map(item => (
                        <Card key={item.status}>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold mb-1">{item.count}</div>
                            <div className="text-sm font-medium">{item.status}</div>
                            <Progress value={item.percentage} className="h-1 mt-2" />
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.percentage}% of total
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Task Timeline</h3>
                    <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Upcoming</div>
                        <div className="text-2xl font-bold">{summary.pendingTasks}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Overdue</div>
                        <div className="text-2xl font-bold">{summary.overdueTask}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Completed</div>
                        <div className="text-2xl font-bold">{summary.completedTasks}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Workload and contribution metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Team analytics are available in the premium version.
                  </p>
                  <Button onClick={() => router.push('/projly/team')}>
                    View Team Members
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
