"use client";

import { useState } from "react";
import { Project, Task, Resource } from "@/types";
import { useRouter } from "next/navigation";
import { useProject } from "@/lib/services/projly/use-projects";
import { useTasks } from "@/lib/services/projly/use-tasks";
import { useResources } from "@/lib/services/projly/use-resources";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, CalendarIcon, UserCircle } from "lucide-react";
import { TaskDialog } from "@/components/projects/TaskDialog";
import { ResourceDialog } from "@/components/projects/ResourceDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardLayout } from "../components/layout/DashboardLayout";

interface ProjectDetailProps {
  projectId: string;
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const router = useRouter();
  
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: projectTasks, isLoading: tasksLoading, refetch: refetchTasks } = useTasks({ projectId });
  const { data: resourcesResponse, isLoading: resourcesLoading, refetch: refetchResources } = useResources();
  
  // Function to refresh resources data
  const handleResourceChange = async () => {
    console.log("[ProjectDetail] Refreshing resources data");
    await refetchResources();
    console.log("[ProjectDetail] Resources data refreshed");
  };
  
  // Function to refresh tasks data
  const handleTaskChange = async () => {
    console.log("[ProjectDetail] Refreshing tasks data");
    try {
      // Force a complete refetch of the tasks data
      const result = await refetchTasks({ throwOnError: true });
      console.log("[ProjectDetail] Tasks data refreshed successfully:", result.data?.length || 0, "tasks found");
      
      // This line is important - log each task to verify they're loaded correctly
      if (result.data && Array.isArray(result.data)) {
        result.data.forEach((task, index) => {
          console.log(`[ProjectDetail] Refreshed task ${index+1}:`, task.id, task.title);
        });
      }
      
      // Manually trigger a router refresh to ensure UI updates
      router.refresh();
    } catch (error) {
      console.error("[ProjectDetail] Error refreshing tasks data:", error);
    }
  };
  
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  
  const isLoading = projectLoading || tasksLoading || resourcesLoading;

  // Extract resources array from the API response using our utility function
  // The API returns { data: [...], error: null, count: X }
  const projectResources = resourcesResponse && 'data' in resourcesResponse ? resourcesResponse.data : [];
  
  console.log("[ProjectDetail] Resources response:", resourcesResponse);
  console.log("[ProjectDetail] Project ID for filtering:", projectId);
  console.log("[ProjectDetail] Resources before filtering:", projectResources);
  
  // Filter resources to only show those for this project
  // Make sure we're comparing the same case (both camelCase or both snake_case)
  const filteredResources = Array.isArray(projectResources) 
    ? projectResources.filter(resource => {
        // Check both camelCase and snake_case variations for compatibility
        const resourceProjectId = resource.projectId || resource.project_id;
        const matches = resourceProjectId === projectId;
        console.log(`[ProjectDetail] Resource ${resource.id} project ID: ${resourceProjectId}, matches: ${matches}`);
        return matches;
      })
    : [];
  
  console.log("[ProjectDetail] Resources after filtering:", filteredResources);
  
  const handleBackClick = () => {
    router.push("/projly/projects");
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTask(taskId);
  };

  const handleResourceClick = (resourceId: string) => {
    setSelectedResource(resourceId);
  };
  
  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    console.log(`[ProjectDetail] Rendering badge for status: ${status}`);
    
    // Define a direct style object for more control
    let style = {};
    let className = "";
    
    switch (status) {
      case "Active":
      case "In Progress":
        style = { 
          backgroundColor: '#2563eb !important', 
          color: 'white !important', 
          borderColor: '#2563eb !important' 
        };
        className = "bg-blue-600 text-white border-blue-600";
        break;
      case "Completed":
        style = { 
          backgroundColor: '#16a34a !important', 
          color: 'white !important', 
          borderColor: '#16a34a !important' 
        };
        className = "bg-green-600 text-white border-green-600";
        break;
      case "In Review":
        style = { 
          backgroundColor: '#a855f7 !important', 
          color: 'white !important', 
          borderColor: '#a855f7 !important' 
        };
        className = "bg-purple-500 text-white border-purple-500";
        break;
      case "Not Started":
        style = { 
          backgroundColor: '#6b7280 !important', 
          color: 'white !important', 
          borderColor: '#6b7280 !important' 
        };
        className = "bg-gray-500 text-white border-gray-500";
        break;
      case "On Hold":
        style = { 
          backgroundColor: '#f97316 !important', 
          color: 'white !important', 
          borderColor: '#f97316 !important' 
        };
        className = "bg-orange-500 text-white border-orange-500";
        break;
      case "Canceled":
        style = { 
          backgroundColor: '#ef4444 !important', 
          color: 'white !important', 
          borderColor: '#ef4444 !important' 
        };
        className = "bg-red-500 text-white border-red-500";
        break;
      case "Planned":
        style = { 
          backgroundColor: '#8b5cf6 !important', 
          color: 'white !important', 
          borderColor: '#8b5cf6 !important' 
        };
        className = "bg-purple-500 text-white border-purple-500";
        break;
      case "Archived":
        style = { 
          backgroundColor: '#6b7280 !important', 
          color: 'white !important', 
          borderColor: '#6b7280 !important' 
        };
        className = "bg-gray-500 text-white border-gray-500";
        break;
      default:
        style = { 
          backgroundColor: '#9ca3af !important', 
          color: 'white !important', 
          borderColor: '#9ca3af !important' 
        };
        className = "bg-gray-400 text-white border-gray-400";
    }
    
    console.log(`[ProjectDetail] Applied style for ${status}:`, style);
    
    // Apply both style and className for maximum compatibility
    return <Badge style={style} className={className}>{status || 'Unknown'}</Badge>;
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

  if (!project) {
    console.log("[ProjectDetail] Project not found for ID:", projectId);
    return (
      <DashboardLayout>
        <div className="container mx-auto pt-16">
          <div className="text-center pt-16">
            <h2 className="text-2xl font-bold">Project not found</h2>
            <Button className="mt-4" onClick={handleBackClick}>
              Back to Projects
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
      {/* Project Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Button variant="ghost" size="sm" onClick={handleBackClick}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {renderStatusBadge((project as Project).status || 'Unknown')}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{(project as Project).name}</h1>
          <p className="text-muted-foreground mt-1">{(project as Project).description}</p>
        </div>
        <Button onClick={() => router.push(`/projly/projects/${projectId}/edit`)} variant="outline">
          Edit Project
        </Button>
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Project Owner</p>
            <div className="flex items-center">
              <UserCircle className="mr-2 h-4 w-4" />
              <p>{(project as Project).owner?.firstName || ''} {(project as Project).owner?.lastName || ''} - {(project as Project).owner?.email || ''}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Timeline</p>
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <p>
                {(project as Project).startDate ? format(new Date((project as Project).startDate), "MMM d, yyyy") : "Not set"} 
                {" - "} 
                {(project as Project).endDate ? format(new Date((project as Project).endDate), "MMM d, yyyy") : "Not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks and Resources Tabs */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Tasks ({(projectTasks as Task[] | undefined)?.length || 0})</TabsTrigger>
          <TabsTrigger value="resources">Resources ({filteredResources?.length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Tasks</CardTitle>
                <Button onClick={() => setSelectedTask("new")} size="sm">Add Task</Button>
              </div>
              <CardDescription>Tasks associated with this project</CardDescription>
            </CardHeader>
            <CardContent>
              {projectTasks && (projectTasks as Task[]).length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(projectTasks as Task[]).map((task) => (
                        <TableRow 
                          key={task.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onDoubleClick={() => handleTaskClick(task.id)}
                        >
                          <TableCell>{task.title}</TableCell>
                          <TableCell>
                            {renderStatusBadge(task.status || 'Unknown')}
                          </TableCell>
                          <TableCell>
  {/* Log the assignee object for debugging */}
  {(() => {
    console.log("[ProjectDetail] Rendering assignee for task:", task.id, task.assignee);
    if (task.assignee) {
      const firstName = task.assignee.firstName || "";
      const lastName = task.assignee.lastName || "";
      const email = task.assignee.email || "";
      const fullName = `${firstName} ${lastName}`.trim();
      console.log("[ProjectDetail] Computed fullName:", fullName);
      if (fullName && fullName !== "") {
        return fullName;
      } else if (email) {
        return email;
      } else {
        return "-";
      }
    }
    return "Unassigned";
  })()}
</TableCell>
<TableCell>
  {/* Log the due date for debugging */}
  {(() => {
    console.log("[ProjectDetail] Rendering due date for task:", task.id, task.dueDate);
    if (task.dueDate) {
      return format(new Date(task.dueDate), "MMM d, yyyy");
    }
    return "Not set";
  })()}
</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tasks found for this project.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSelectedTask("new")}
                  >
                    Create your first task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resources" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Resources</CardTitle>
                <Button onClick={() => setSelectedResource("new")} size="sm">Add Resource</Button>
              </div>
              <CardDescription>Resources allocated to this project</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredResources && filteredResources.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResources.map((resource) => (
                        <TableRow 
                          key={resource.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onDoubleClick={() => handleResourceClick(resource.id)}
                        >
                          <TableCell>{resource.name}</TableCell>
                          <TableCell>{resource.fileType}</TableCell>
                          <TableCell>{resource.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No resources found for this project.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSelectedResource("new")}
                  >
                    Add your first resource
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Dialog */}
      <TaskDialog 
        projectId={projectId as string}
        // Only pass taskId for existing tasks, not for new ones
        // This prevents unnecessary API calls to /api/projly/tasks/new
        taskId={selectedTask === "new" ? undefined : (selectedTask || undefined)}
        open={!!selectedTask}
        onOpenChange={(open) => {
          console.log("[ProjectDetail] TaskDialog onOpenChange", open);
          if (!open) {
            setSelectedTask(null);
            // If dialog is closed, refresh tasks data
            handleTaskChange();
          }
        }}
        onTaskChange={handleTaskChange} // Pass the refresh function to TaskDialog
      />

      {/* Resource Dialog */}
      <ResourceDialog 
        projectId={projectId as string}
        resourceId={selectedResource === "new" ? undefined : selectedResource || undefined}
        open={!!selectedResource}
        resources={filteredResources} // Pass the already loaded and filtered resources
        onOpenChange={(open) => {
          console.log("[ProjectDetail] ResourceDialog onOpenChange", open);
          if (!open) {
            setSelectedResource(null);
            // If dialog is closed, refresh resources data
            handleResourceChange();
          }
        }}
        onResourceChange={handleResourceChange} // Pass the refresh function to ResourceDialog
      />
      </div>
    </DashboardLayout>
  );
}
