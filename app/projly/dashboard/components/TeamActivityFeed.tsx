'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Activity, MessageSquare, Edit3, Plus, ExternalLink } from "lucide-react";
import { useRecentUpdatesAnalytics } from "@/lib/services/projly/use-analytics";
import { useProfile } from "@/lib/services/projly/use-profile";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Fix timezone offset using user's profile timezone preference
const fixTimezone = (utcDateString: string, userTimezone: number = 7): Date => {
  const dbDate = new Date(utcDateString);
  // Database stores local time as UTC, so subtract the timezone offset to get correct time
  return new Date(dbDate.getTime() - (userTimezone * 60 * 60 * 1000));
};

interface ActivityItem {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changedFields: any;
  actorId: string;
  createdAt: string;
  actor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  entityDetails: any;
}

export function TeamActivityFeed() {
  const { data: activities, isLoading, error } = useRecentUpdatesAnalytics(50);
  const { data: profile } = useProfile();

  // Helper function to determine badge color based on task status
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-600 text-white hover:bg-green-700 border-green-600';
      case 'in progress':
      case 'inprogress':
        return 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600';
      case 'todo':
      case 'to do':
        return 'bg-gray-600 text-white hover:bg-gray-700 border-gray-600';
      case 'pending':
        return 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500';
      case 'blocked':
        return 'bg-red-600 text-white hover:bg-red-700 border-red-600';
      case 'review':
      case 'in review':
        return 'bg-purple-600 text-white hover:bg-purple-700 border-purple-600';
      case 'golive':
      case 'go live':
        return 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600';
      case 'cancelled':
      case 'canceled':
        return 'bg-orange-500 text-white hover:bg-orange-600 border-orange-500';
      default:
        return 'bg-gray-600 text-white hover:bg-gray-700 border-gray-600';
    }
  };

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

  const formatActivityMessage = (activity: ActivityItem) => {
    const actorName = `${activity.actor.firstName || ''} ${activity.actor.lastName || ''}`.trim() || activity.actor.email;
    
    if (activity.entityType === 'task') {
      const taskTitle = activity.entityDetails?.title || 'Unknown Task';
      const projectName = activity.entityDetails?.project?.name || 'Unknown Project';
      
      if (activity.action === 'created') {
        return {
          message: `created task "${taskTitle}" in ${projectName}`,
          link: `/projly/tasks/${activity.entityId}`
        };
      } else if (activity.action === 'status_changed') {
        const newStatus = activity.changedFields?.status?.new || 'Unknown';
        return {
          message: `changed status of "${taskTitle}" to ${newStatus}`,
          link: `/projly/tasks/${activity.entityId}`
        };
      } else if (activity.action === 'updated') {
        const changedFieldNames = Object.keys(activity.changedFields || {});
        const fieldsText = changedFieldNames.length > 1 ? 
          `${changedFieldNames.length} fields` : 
          changedFieldNames[0] || 'task';
        return {
          message: `updated ${fieldsText} in "${taskTitle}"`,
          link: `/projly/tasks/${activity.entityId}`
        };
      }
    } else if (activity.entityType === 'comment') {
      const taskTitle = activity.entityDetails?.task?.title || 'Unknown Task';
      const projectName = activity.entityDetails?.task?.project?.name || 'Unknown Project';
      
      if (activity.action === 'created') {
        return {
          message: `commented on "${taskTitle}" in ${projectName}`,
          link: `/projly/tasks/${activity.entityDetails?.task?.id}`
        };
      } else if (activity.action === 'updated') {
        return {
          message: `updated comment on "${taskTitle}"`,
          link: `/projly/tasks/${activity.entityDetails?.task?.id}`
        };
      }
    }

    return {
      message: `${activity.action} ${activity.entityType}`,
      link: null
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Team Activity Feed
          </CardTitle>
          <CardDescription>Latest updates from your team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !activities) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Team Activity Feed
          </CardTitle>
          <CardDescription>Latest updates from your team members</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Unable to load activity feed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Team Activity Feed
        </CardTitle>
        <CardDescription>
          {activities.length} recent updates from your team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                Team activity will appear here as members update tasks and add comments
              </p>
            </div>
          ) : (
            activities.map((activity: ActivityItem) => {
              const IconComponent = getActivityIcon(activity.entityType, activity.action);
              const iconColor = getActivityColor(activity.entityType, activity.action);
              const { message, link } = formatActivityMessage(activity);
              const actorName = `${activity.actor.firstName || ''} ${activity.actor.lastName || ''}`.trim() || activity.actor.email;
              const initials = actorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
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
                            {formatDistanceToNow(fixTimezone(activity.createdAt, profile?.timezone || 7), { addSuffix: true })}
                          </span>
                          {activity.action === 'status_changed' && activity.changedFields?.status && (
                            <Badge 
                              className={`text-xs ${getStatusBadgeClass(activity.changedFields.status.new)}`}
                            >
                              {activity.changedFields.status.new}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {link && (
                        <Link href={link}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {activities.length > 0 && (
          <div className="pt-4 border-t">
            <Link href="/projly/notifications">
              <Button variant="outline" size="sm" className="w-full">
                View All Activities
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
