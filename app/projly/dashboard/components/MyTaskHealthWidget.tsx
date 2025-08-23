'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CheckCircle, Calendar, ExternalLink } from "lucide-react";
import { useMyTasksStatusAnalytics } from "@/lib/services/projly/use-analytics";
import { useAuth } from "@/app/projly/contexts/AuthContextCustom";
import Link from "next/link";
import { format } from "date-fns";

export function MyTaskHealthWidget() {
  const { data: myTasksData, isLoading, error } = useMyTasksStatusAnalytics();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            My Task Health
          </CardTitle>
          <CardDescription>Your personal task overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !myTasksData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            My Task Health
          </CardTitle>
          <CardDescription>Your personal task overview</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Unable to load task data</p>
        </CardContent>
      </Card>
    );
  }

  const { overdue, dueToday, dueSoon, inProgress, total } = myTasksData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          My Task Health
        </CardTitle>
        <CardDescription>
          {total} total tasks • Focus on {overdue.count + dueToday.count} urgent items
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Overdue
              </span>
              <Badge variant={overdue.count > 0 ? "destructive" : "secondary"}>
                {overdue.count}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-4 w-4 text-amber-500" />
                Due Today
              </span>
              <Badge variant={dueToday.count > 0 ? "default" : "secondary"}>
                {dueToday.count}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                Due Soon
              </span>
              <Badge variant="outline">
                {dueSoon.count}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                In Progress
              </span>
              <Badge variant="outline">
                {inProgress.count}
              </Badge>
            </div>
          </div>
        </div>

        {/* Urgent Tasks List */}
        {(overdue.count > 0 || dueToday.count > 0) && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-600">Urgent Tasks</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {[...overdue.tasks, ...dueToday.tasks].slice(0, 5).map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-red-50 rounded text-xs">
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/projly/tasks/${task.id}`}
                      className="font-medium text-red-700 hover:text-red-900 truncate block"
                    >
                      {task.title}
                    </Link>
                    <p className="text-red-600 truncate">{task.project?.name}</p>
                  </div>
                  <div className="text-right ml-2">
                    {task.dueDate && (
                      <p className="text-red-600">
                        {format(new Date(task.dueDate), 'MMM dd')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {(overdue.count + dueToday.count) > 5 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{(overdue.count + dueToday.count) - 5} more urgent tasks
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Link href={`/projly/tasks-hub?assignedTo=${user?.id || 'current'}&exclude=Completed%2CGolive&excludeChild=Completed%2CGolive`}>
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              View All My Tasks
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
