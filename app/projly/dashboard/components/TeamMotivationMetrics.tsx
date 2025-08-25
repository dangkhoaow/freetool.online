'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trophy, Zap, Target, AlertTriangle, Calendar, Clock, Brain, CheckCircle, XCircle, User, MessageSquare, Activity, Lightbulb, ExternalLink, Edit3, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/services/projly/jwt-auth-adapter";
import { format } from "date-fns";
import { ActivityDetailDialog } from "@/app/projly/components/ActivityDetailDialog";

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

interface TaskAnalysis {
  task: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    startDate: string | null;
    dueDate: string | null;
    assignee: any;
    project: any;
    daysSinceCreated: number;
    daysSinceLastUpdate: number;
  };
  activities: Array<{
    id: string;
    action: string;
    changedFields: string;
    createdAt: string;
    actor: any;
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: any;
  }>;
  analysis: {
    lackOfUpdates: boolean;
    noRecentActivity: boolean;
    statusStagnation: boolean;
    missingDates: boolean;
    unassigned: boolean;
    blockers: Array<any>;
  };
  recommendations: {
    immediate: Array<{
      type: string;
      title: string;
      description: string;
      action: string;
      priority: string;
    }>;
    shortTerm: Array<any>;
    process: Array<any>;
    severity: string;
  };
}

export function TeamMotivationMetrics() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showTaskAnalysis, setShowTaskAnalysis] = useState(false);
  const [selectedPerformerId, setSelectedPerformerId] = useState<string | null>(null);
  const [showPerformerEvidence, setShowPerformerEvidence] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [showActivityDetail, setShowActivityDetail] = useState(false);

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

  // Fetch detailed task analysis when a task is selected
  const { data: taskAnalysisData, isLoading: loadingTaskAnalysis } = useQuery({
    queryKey: ['task-analysis', selectedTaskId],
    queryFn: async () => {
      if (!selectedTaskId) return null;
      const response = await fetch(`http://localhost:3001/api/projly/analytics/task-analysis?taskId=${selectedTaskId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch task analysis');
      const result = await response.json();
      return result.data;
    },
    enabled: !!selectedTaskId
  });

  // Fetch detailed performer evidence when a performer is selected
  const { data: performerEvidenceData, isLoading: loadingPerformerEvidence } = useQuery({
    queryKey: ['performer-evidence', selectedPerformerId],
    queryFn: async () => {
      if (!selectedPerformerId) return null;
      const response = await fetch(`http://localhost:3001/api/projly/analytics/performer-evidence?performerId=${selectedPerformerId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch performer evidence');
      const result = await response.json();
      return result.data;
    },
    enabled: !!selectedPerformerId
  });

  const getMemberName = (member: any) => {
    return `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
  };

  // Helper functions for activity styling (from TeamActivityFeed)
  const getActivityIcon = (entityType: string, action: string) => {
    if (entityType === 'comment') return MessageSquare;
    if (action === 'created') return Plus;
    if (action === 'updated' || action === 'status_changed') return Edit3;
    return Activity;
  };

  const getActivityColor = (entityType: string, action: string) => {
    if (entityType === 'comment') return 'text-blue-500';
    if (action === 'created') return 'text-green-500';
    if (action === 'status_changed') return 'text-purple-500';
    return 'text-gray-500';
  };

  const formatActivityMessage = (activity: any) => {
    if (activity.entityType === 'task') {
      if (activity.action === 'created') {
        return 'created task';
      } else if (activity.action === 'status_changed') {
        const newStatus = activity.changedFields?.status?.new || 'Unknown';
        return `changed status to ${newStatus}`;
      } else if (activity.action === 'updated') {
        const changedFieldNames = Object.keys(activity.changedFields || {});
        const fieldsText = changedFieldNames.length > 1 ? 
          `${changedFieldNames.length} fields` : 
          changedFieldNames[0] || 'task';
        return `updated ${fieldsText}`;
      }
    } else if (activity.entityType === 'comment') {
      return 'added comment';
    }
    return activity.action;
  };

  const getMemberInitials = (member: any) => {
    const name = getMemberName(member);
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getScrumMasterRecommendation = (task: MissingGoalTask) => {
    const recommendations = [];
    
    if (task.missingStartDate && task.missingDueDate) {
      recommendations.push({
        type: 'critical',
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        title: 'Missing Both Dates',
        advice: 'Schedule immediate planning session to estimate effort and set realistic timeline'
      });
    } else if (task.missingStartDate) {
      recommendations.push({
        type: 'high',
        icon: <Calendar className="h-4 w-4 text-orange-500" />,
        title: 'Missing Start Date',
        advice: 'Define when work should begin to track progress effectively'
      });
    } else if (task.missingDueDate) {
      recommendations.push({
        type: 'high',
        icon: <Clock className="h-4 w-4 text-orange-500" />,
        title: 'Missing Due Date',
        advice: 'Set target completion date to maintain sprint commitments'
      });
    }

    if (!task.assignee) {
      recommendations.push({
        type: 'critical',
        icon: <User className="h-4 w-4 text-red-500" />,
        title: 'Unassigned Task',
        advice: 'Assign to team member based on skills and current workload'
      });
    }

    if (task.daysSinceCreated > 14) {
      recommendations.push({
        type: 'medium',
        icon: <Brain className="h-4 w-4 text-blue-500" />,
        title: 'Long-Running Task',
        advice: 'Consider breaking into smaller, manageable subtasks'
      });
    }

    return recommendations;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const openTaskAnalysis = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowTaskAnalysis(true);
  };

  const openTaskInNewTab = (taskId: string) => {
    window.open(`/projly/tasks/${taskId}`, '_blank');
  };

  const handleActivityClick = (activityId: string) => {
    setSelectedActivityId(activityId);
    setShowActivityDetail(true);
  };

  const openPerformerEvidence = (performerId: string) => {
    setSelectedPerformerId(performerId);
    setShowPerformerEvidence(true);
  };

  const getPerformanceIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap': return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'target': return <Target className="h-5 w-5 text-green-500" />;
      case 'activity': return <Activity className="h-5 w-5 text-blue-500" />;
      case 'award': return <Trophy className="h-5 w-5 text-purple-500" />;
      case 'users': return <User className="h-5 w-5 text-orange-500" />;
      default: return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
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
                  <div 
                    key={performer.userId} 
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => openPerformerEvidence(performer.userId)}
                  >
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
                        <p className="font-medium text-sm hover:text-blue-600">{getMemberName(performer)}</p>
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
                    <TableHead>Scrum Master Advice</TableHead>
                    <TableHead>Days Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missingGoalTasksData?.slice(0, 10).map((task: MissingGoalTask) => {
                    const recommendations = getScrumMasterRecommendation(task);
                    const primaryRecommendation = recommendations[0];
                    
                    return (
                      <TableRow 
                        key={task.id} 
                        className="hover:bg-orange-100 dark:hover:bg-orange-900/30 cursor-pointer"
                        onClick={() => openTaskAnalysis(task.id)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm hover:text-blue-600">{task.title}</p>
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
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                                <User className="h-3 w-3 mr-1" />
                                Unassigned
                              </Badge>
                            </div>
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
                          {primaryRecommendation && (
                            <div className={`flex items-center gap-2 p-2 rounded-lg border ${getSeverityColor(primaryRecommendation.type)}`}>
                              {primaryRecommendation.icon}
                              <div className="flex-1">
                                <p className="text-xs font-medium">{primaryRecommendation.title}</p>
                                <p className="text-xs opacity-80 mt-0.5">{primaryRecommendation.advice}</p>
                              </div>
                            </div>
                          )}
                          {recommendations.length > 1 && (
                            <Badge variant="outline" className="text-xs mt-1 text-orange-400 border-orange-400">
                              +{recommendations.length - 1} more
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{task.daysSinceCreated}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Task Analysis Dialog */}
      <Dialog open={showTaskAnalysis} onOpenChange={setShowTaskAnalysis}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                <span>Task Analysis & Scrum Master Recommendations</span>
              </div>
              {taskAnalysisData && (
                <Button
                  size="sm"
                  variant="outline"
                  style={{marginRight: '30px', marginTop: '-10px'}}
                  title='Open task in new tab'
                  onClick={() => openTaskInNewTab(taskAnalysisData.task.id)}
                  className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 border-primary hover:border-primary/90 hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              Expert analysis of why this task might be stuck and actionable recommendations
            </DialogDescription>
          </DialogHeader>

          {loadingTaskAnalysis ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ) : taskAnalysisData ? (
            <div className="space-y-6">
              {/* Task Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Task Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Title</h4>
                      <p className="font-medium">{taskAnalysisData.task.title}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                      <Badge variant="outline">{taskAnalysisData.task.status}</Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Created</h4>
                      <p className="text-sm">{format(new Date(taskAnalysisData.task.createdAt), 'MMM dd, yyyy')} ({taskAnalysisData.task.daysSinceCreated} days ago)</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Last Updated</h4>
                      <p className="text-sm">{format(new Date(taskAnalysisData.task.updatedAt), 'MMM dd, yyyy')} ({taskAnalysisData.task.daysSinceLastUpdate} days ago)</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Assignee</h4>
                      {taskAnalysisData.task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getMemberInitials(taskAnalysisData.task.assignee)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{getMemberName(taskAnalysisData.task.assignee)}</span>
                        </div>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Unassigned</Badge>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Dates</h4>
                      <div className="space-y-1">
                        <p className="text-xs">
                          Start: {taskAnalysisData.task.startDate ? format(new Date(taskAnalysisData.task.startDate), 'MMM dd') : (
                            <Badge variant="outline" className="text-red-600">Missing</Badge>
                          )}
                        </p>
                        <p className="text-xs">
                          Due: {taskAnalysisData.task.dueDate ? format(new Date(taskAnalysisData.task.dueDate), 'MMM dd') : (
                            <Badge variant="outline" className="text-red-600">Missing</Badge>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Immediate Actions */}
              {taskAnalysisData.recommendations.immediate.length > 0 && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-300">
                      <AlertTriangle className="h-5 w-5" />
                      Immediate Actions Required
                      <Badge variant="destructive">{taskAnalysisData.recommendations.severity}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {taskAnalysisData.recommendations.immediate.map((rec: any, index: number) => (
                        <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{rec.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Action:</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">{rec.action}</p>
                              </div>
                            </div>
                            <Badge variant={rec.priority === 'high' ? 'destructive' : 'default'} className="text-xs">
                              {rec.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Activity Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activity Pattern Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      {taskAnalysisData.analysis.noRecentActivity ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm">Recent Activity (7 days)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {taskAnalysisData.analysis.statusStagnation ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm">Status Progression</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {taskAnalysisData.analysis.missingDates ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm">Goal Dates Set</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {taskAnalysisData.analysis.blockers.length > 0 ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm">No Blockers Detected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Recent Activity History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {taskAnalysisData.activities.slice(0, 10).map((activity: any, index: number) => (
                      <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <Avatar className="h-6 w-6 mt-0.5">
                          <AvatarFallback className="text-xs">
                            {getMemberInitials(activity.actor)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{getMemberName(activity.actor)}</span>
                            <span className="text-muted-foreground"> {activity.action}</span>
                          </p>
                          {activity.changedFields && (
                            <p className="text-xs text-muted-foreground mt-1">{activity.changedFields}</p>
                          )}
                          <p className="text-xs text-muted-foreground">{format(new Date(activity.createdAt), 'MMM dd, HH:mm')}</p>
                        </div>
                      </div>
                    ))}
                    {taskAnalysisData.activities.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No recent activity found</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Process Improvements */}
              {taskAnalysisData.recommendations.process.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Process Improvement Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {taskAnalysisData.recommendations.process.map((rec: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                          <p className="text-sm mt-2 text-blue-600 dark:text-blue-400">{rec.action}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Failed to load task analysis</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Performer Evidence Dialog */}
      <Dialog open={showPerformerEvidence} onOpenChange={setShowPerformerEvidence}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Top Performer Evidence</span>
              </div>
            </DialogTitle>
            <DialogDescription>
              Detailed proof and evidence of why this member earned top performer recognition
            </DialogDescription>
          </DialogHeader>

          {loadingPerformerEvidence ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ) : performerEvidenceData ? (
            <div className="space-y-6">
              {/* Performer Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-yellow-100 text-yellow-800">
                        {getMemberInitials(performerEvidenceData.performer)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium">{getMemberName(performerEvidenceData.performer)}</h3>
                      <p className="text-sm text-muted-foreground">Performance Analysis for Last 30 Days</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {performerEvidenceData.evidence.achievements.map((achievement: any, index: number) => (
                      <div key={index} className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{achievement.value}</p>
                        <p className="text-sm font-medium">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performance Reasons */}
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                    <Trophy className="h-5 w-5" />
                    Why This Member is a Top Performer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performerEvidenceData.evidence.topReasons.slice(0, 4).map((reason: any, index: number) => (
                      <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="flex items-start gap-3">
                          {getPerformanceIcon(reason.icon)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{reason.title}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {reason.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{reason.description}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-blue-600 dark:text-blue-400">{reason.proof}</p>
                              <div className="flex items-center gap-1">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all"
                                    style={{ width: `${reason.score}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium">{reason.score}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Key Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Key Strengths Identified
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {performerEvidenceData.evidence.strengths.map((strength: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Completed Tasks Evidence */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Completed Tasks ({performerEvidenceData.completedTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {performerEvidenceData.completedTasks.slice(0, 10).map((task: any, index: number) => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.project.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Completed in {task.completionDays} days • {format(new Date(task.updatedAt), 'MMM dd')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {task.wasEarly && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                <Zap className="h-3 w-3 mr-1" />
                                Early
                              </Badge>
                            )}
                            {task.wasOnTime && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                <Target className="h-3 w-3 mr-1" />
                                On-time
                              </Badge>
                            )}
                          </div>
                          <button
                            onClick={() => openTaskInNewTab(task.id)}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group"
                            title="Open task in new tab"
                          >
                            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {performerEvidenceData.completedTasks.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No completed tasks found</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activities ({performerEvidenceData.activities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {performerEvidenceData.activities.slice(0, 15).map((activity: any, index: number) => {
                      const IconComponent = getActivityIcon(activity.entityType, activity.action);
                      const iconColor = getActivityColor(activity.entityType, activity.action);
                      const message = formatActivityMessage(activity);
                      const actorName = getMemberName(activity.actor);

                      return (
                        <div 
                          key={activity.id} 
                          className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm dark:hover:shadow-gray-900/20 cursor-pointer"
                          onClick={() => handleActivityClick(activity.id)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{getMemberInitials(activity.actor)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                  <span className="font-medium">{actorName}</span>{' '}
                                  <span className="text-muted-foreground">{message}</span>
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <IconComponent className={`h-3 w-3 ${iconColor}`} />
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(activity.createdAt), 'MMM dd, HH:mm')}
                                  </span>
                                  {activity.action === 'status_changed' && activity.changedFields?.status && (
                                    <Badge variant="outline" className="text-xs">
                                      {activity.changedFields.status.new}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {performerEvidenceData.activities.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No recent activities found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Failed to load performer evidence</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Activity Detail Dialog */}
      <ActivityDetailDialog
        activityId={selectedActivityId}
        open={showActivityDetail}
        onOpenChange={setShowActivityDetail}
      />
    </div>
  );
}