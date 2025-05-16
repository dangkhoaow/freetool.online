
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { PlusCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { CreateTaskButton } from "@/components/tasks/CreateTaskButton";

export default function Dashboard() {
  const { profile } = useAuth();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: userTasks, isLoading: tasksLoading } = useTasks({ assignedTo: profile?.id });
  const navigate = useNavigate();

  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name || 'User'}! Here's an overview of your projects and tasks.
          </p>
        </div>
        <div className="flex gap-2">
          <CreateTaskButton />
          <Button variant="default" size="sm" onClick={() => navigate("/projects/new")}>
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
                        {/* Log date fields for debugging */}
                        {console.log(`Dashboard: Project ${project.id} dates:`, {
                          startDate: project.startDate,
                          endDate: project.endDate
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/projects/${project.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No projects found.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/projects/new")}>
                  Create your first project
                </Button>
              </div>
            )}
          </CardContent>
          {projects && projects.length > 0 && (
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/projects">View All Projects</Link>
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
            </div>
            <CreateTaskButton />
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
                <Link to="/tasks">View All Tasks</Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
