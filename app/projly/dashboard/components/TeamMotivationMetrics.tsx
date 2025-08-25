'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Zap, Target, AlertTriangle, Calendar, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/services/projly/jwt-auth-adapter";

// API interfaces
interface TopPerformer {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  completedTasks: number;
  avgCompletionDays: number;
  onTimeRate: number;
  earlyCompletions: number;
}

interface ActivityLeader {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  totalActivities: number;
  streak: number;
  recentCompletions: number;
}

interface MissingGoalTask {
  id: string;
  title: string;
  status: string;
  assignee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  project: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  missingStartDate: boolean;
  missingDueDate: boolean;
  daysSinceCreated: number;
}

export function TeamMotivationMetrics() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Fetch top performers data
  const { data: topPerformersData, isLoading: loadingPerformers } = useQuery({
    queryKey: ['motivation', 'top-performers'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/projly/analytics/top-performers', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch top performers');
      const result = await response.json();
      return result.data;
    },
    enabled: !!userId
  });

  // Fetch activity leaders data
  const { data: activityLeadersData, isLoading: loadingLeaders } = useQuery({
    queryKey: ['motivation', 'activity-leaders'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/projly/analytics/activity-leaders', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch activity leaders');
      const result = await response.json();
      return result.data;
    },
    enabled: !!userId
  });

  // Fetch missing goal dates tasks
  const { data: missingGoalTasksData, isLoading: loadingMissingGoals } = useQuery({
    queryKey: ['motivation', 'missing-goals'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/projly/analytics/missing-goal-dates', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch missing goal tasks');
      const result = await response.json();
      return result.data;
    },
    enabled: !!userId
  });

  const getMemberName = (member: any) => {
    return `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
  };

  const getMemberInitials = (member: any) => {
    const name = getMemberName(member);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Top Performers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Performers This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPerformers ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {topPerformersData?.slice(0, 5).map((performer: TopPerformer, index: number) => (
                  <div key={performer.userId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-yellow-600">#{index + 1}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-yellow-100 text-yellow-800">
                            {getMemberInitials(performer)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{getMemberName(performer)}</p>
                        <p className="text-xs text-muted-foreground">
                          {performer.completedTasks} tasks • {performer.onTimeRate}% on-time
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {performer.earlyCompletions > 0 && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          <Zap className="h-3 w-3 mr-1" />
                          Fast
                        </Badge>
                      )}
                      {performer.onTimeRate > 80 && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          <Target className="h-3 w-3 mr-1" />
                          Reliable
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Most Active Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLeaders ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {activityLeadersData?.slice(0, 5).map((leader: ActivityLeader, index: number) => (
                  <div key={leader.userId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                            {getMemberInitials(leader)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{getMemberName(leader)}</p>
                        <p className="text-xs text-muted-foreground">
                          {leader.totalActivities} activities • {leader.streak} day streak
                        </p>
                      </div>
                    </div>
                    <div>
                      {leader.streak > 5 && (
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                          🔥 {leader.streak}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Missing Goal Dates Alert */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
            <AlertTriangle className="h-5 w-5" />
            Tasks Missing Goal Dates
            {missingGoalTasksData?.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {missingGoalTasksData.length} issues
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMissingGoals ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : missingGoalTasksData?.length === 0 ? (
            <div className="text-center py-8 text-green-600">
              <Target className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="font-medium">Great! All in-progress tasks have proper goal dates.</p>
              <p className="text-sm text-muted-foreground mt-1">Your team is well-organized with clear objectives.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                These "In Progress" tasks need start dates and/or due dates for proper goal setting:
              </p>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Missing</TableHead>
                    <TableHead>Days Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missingGoalTasksData?.slice(0, 10).map((task: MissingGoalTask) => (
                    <TableRow key={task.id} className="hover:bg-orange-100 dark:hover:bg-orange-900/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          <Badge variant="outline" className="text-xs mt-1 text-orange-400 border-orange-400">
                            {task.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getMemberInitials(task.assignee)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{getMemberName(task.assignee)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{task.project.name}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {task.missingStartDate && (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                              <Calendar className="h-3 w-3 mr-1" />
                              Start
                            </Badge>
                          )}
                          {task.missingDueDate && (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                              <Clock className="h-3 w-3 mr-1" />
                              Due
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{task.daysSinceCreated}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
