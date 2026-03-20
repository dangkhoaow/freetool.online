
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useTaskStatusAnalytics, 
  useTaskDueDateAnalytics,
  useProjectStatusAnalytics,
  useResourcesAnalytics,
  useTeamTaskDistributionAnalytics,
  useTaskTimelineAnalytics
} from "@/hooks/use-analytics";
import { TaskStatusChart } from "@/components/analytics/TaskStatusChart";
import { TaskDueDateChart } from "@/components/analytics/TaskDueDateChart";
import { ProjectStatusChart } from "@/components/analytics/ProjectStatusChart";
import { ResourcesChart } from "@/components/analytics/ResourcesChart";
import { TeamTaskDistributionChart } from "@/components/analytics/TeamTaskDistributionChart";
import { TaskTimelineChart } from "@/components/analytics/TaskTimelineChart";
import { TasksOverviewTable } from "@/components/analytics/TasksOverviewTable";
import { Spinner } from "@/components/ui/spinner";
import { useUserRoles } from "@/hooks/use-user-roles";
import { Navigate } from "react-router-dom";
import { useProjectOwnership } from "@/hooks/use-project-ownership";

export default function Analytics() {
  const { currentUserRole } = useUserRoles();
  const { data: isProjectOwner, isLoading: checkingOwnership } = useProjectOwnership();
  
  const isSiteOwner = currentUserRole.data === 'site_owner';
  const isAdmin = currentUserRole.data === 'admin';
  
  // Allow project owners to also access analytics
  const hasAnalyticsAccess = isSiteOwner || isAdmin || isProjectOwner;
  
  console.log('[ANALYTICS] Access check:', {
    role: currentUserRole.data,
    isProjectOwner,
    hasAnalyticsAccess
  });
  
  const taskStatusAnalytics = useTaskStatusAnalytics();
  const taskDueDateAnalytics = useTaskDueDateAnalytics();
  const projectStatusAnalytics = useProjectStatusAnalytics();
  const resourcesAnalytics = useResourcesAnalytics();
  const teamTaskDistribution = useTeamTaskDistributionAnalytics();
  const taskTimeline = useTaskTimelineAnalytics();

  // Log data for debugging
  useEffect(() => {
    if (!hasAnalyticsAccess) {
      console.log("User does not have access to analytics page");
      return;
    }
    
    console.log("Analytics page data loaded:", {
      taskStatus: taskStatusAnalytics.data,
      taskDueDate: taskDueDateAnalytics.data,
      projectStatus: projectStatusAnalytics.data,
      resources: resourcesAnalytics.data,
      teamTasks: teamTaskDistribution.data,
      taskTimeline: taskTimeline.data
    });
  }, [
    hasAnalyticsAccess,
    taskStatusAnalytics.data,
    taskDueDateAnalytics.data,
    projectStatusAnalytics.data,
    resourcesAnalytics.data,
    teamTaskDistribution.data,
    taskTimeline.data
  ]);
  
  // Loading state for user role and project ownership check
  if (currentUserRole.isLoading || checkingOwnership) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // Access denied for users without proper role
  if (!hasAnalyticsAccess) {
    return <Navigate to="/projly/dashboard" replace />;
  }

  const isLoading = 
    taskStatusAnalytics.isLoading ||
    taskDueDateAnalytics.isLoading ||
    projectStatusAnalytics.isLoading ||
    resourcesAnalytics.isLoading ||
    teamTaskDistribution.isLoading ||
    taskTimeline.isLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Task Status</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskStatusChart data={Array.isArray(taskStatusAnalytics.data) ? taskStatusAnalytics.data : []} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tasks by Due Date</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskDueDateChart data={Array.isArray(taskDueDateAnalytics.data) ? taskDueDateAnalytics.data : []} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Project Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectStatusChart data={Array.isArray(projectStatusAnalytics.data) ? projectStatusAnalytics.data : []} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResourcesChart data={Array.isArray(resourcesAnalytics.data) ? resourcesAnalytics.data : []} />
              </CardContent>
            </Card>
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tasks Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskTimelineChart data={Array.isArray(taskTimeline.data) ? taskTimeline.data : []} />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Task Timeline</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <TaskTimelineChart data={Array.isArray(taskTimeline.data) ? taskTimeline.data : []} />
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskStatusChart data={Array.isArray(taskStatusAnalytics.data) ? taskStatusAnalytics.data : []} />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Team Task Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <TeamTaskDistributionChart data={Array.isArray(teamTaskDistribution.data) ? teamTaskDistribution.data : []} />
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Task Due Date Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskDueDateChart data={Array.isArray(taskDueDateAnalytics.data) ? taskDueDateAnalytics.data : []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Tasks Overview</CardTitle>
                <CardDescription>
                  A detailed breakdown of tasks by status and due date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TasksOverviewTable />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <TaskStatusChart data={Array.isArray(taskStatusAnalytics.data) ? taskStatusAnalytics.data : []} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Task Due Date Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskDueDateChart data={Array.isArray(taskDueDateAnalytics.data) ? taskDueDateAnalytics.data : []} />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Task Timeline</CardTitle>
              <CardDescription>
                Task distribution over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <TaskTimelineChart data={Array.isArray(taskTimeline.data) ? taskTimeline.data : []} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectStatusChart data={Array.isArray(projectStatusAnalytics.data) ? projectStatusAnalytics.data : []} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Project Statistics</CardTitle>
                <CardDescription>
                  Overview of project completion statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                      <p className="text-2xl font-bold">
                        {Array.isArray(projectStatusAnalytics.data) ? projectStatusAnalytics.data.reduce((sum, item) => sum + (item.count || 0), 0) : 0}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Completed Projects</p>
                      <p className="text-2xl font-bold">
                        {Array.isArray(projectStatusAnalytics.data) ? projectStatusAnalytics.data.find(item => item.status === "Completed")?.count || 0 : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Distribution</CardTitle>
              <CardDescription>
                Breakdown of resources by type and quantity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResourcesChart data={Array.isArray(resourcesAnalytics.data) ? resourcesAnalytics.data : []} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Task Distribution</CardTitle>
              <CardDescription>
                Workload distribution across team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamTaskDistributionChart data={Array.isArray(teamTaskDistribution.data) ? teamTaskDistribution.data : []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
