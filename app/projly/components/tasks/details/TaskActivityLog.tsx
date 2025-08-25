'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, User, MessageSquare, Activity, Lightbulb, Edit3, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useTaskActivities } from "@/lib/services/projly/use-analytics";
import { ActivityDetailDialog } from "@/app/projly/components/ActivityDetailDialog";
import { format } from "date-fns";

interface TaskActivityLogProps {
  taskId: string;
  updatedAt?: string | Date;
  createdAt?: string | Date;
  status: string;
}

interface TaskActivity {
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
}

export function TaskActivityLog({ 
  taskId,
  updatedAt, 
  createdAt, 
  status 
}: TaskActivityLogProps) {
  console.log('[PROJLY:TASK_ACTIVITY_LOG] Rendering for task:', taskId);
  
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [showActivityDetail, setShowActivityDetail] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  
  const { data: activitiesResponse, isLoading, error } = useTaskActivities(taskId);
  const activities: TaskActivity[] = activitiesResponse?.data || [];
  const lookupData = activitiesResponse?.lookupData || { projects: {}, users: {} };

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

  const getMemberName = (actor: any) => {
    return `${actor.firstName || ''} ${actor.lastName || ''}`.trim() || actor.email;
  };

  const getMemberInitials = (actor: any) => {
    const name = getMemberName(actor);
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatFieldValue = (fieldName: string, value: any) => {
    if (!value) return value;
    
    // Handle specific field types
    switch (fieldName) {
      case 'projectId':
        return lookupData.projects[value] || value;
      case 'assigneeId':
        return lookupData.users[value] || value;
      default:
        return value;
    }
  };

  const formatChangedField = (key: string, value: any) => {
    const fieldDisplayNames: { [key: string]: string } = {
      'projectId': 'Project',
      'assigneeId': 'Assignee',
      'status': 'Status',
      'priority': 'Priority',
      'title': 'Title',
      'description': 'Description',
      'startDate': 'Start Date',
      'dueDate': 'Due Date',
      'percentProgress': 'Progress'
    };

    const displayName = fieldDisplayNames[key] || key;

    if (typeof value === 'object' && value?.old !== undefined && value?.new !== undefined) {
      const oldValue = formatFieldValue(key, value.old);
      const newValue = formatFieldValue(key, value.new);
      return `${displayName}: ${oldValue} → ${newValue}`;
    }
    
    const newValue = formatFieldValue(key, value?.new || value);
    return `${displayName}: ${newValue}`;
  };

  const formatActivityMessage = (activity: TaskActivity) => {
    const { action, changedFields } = activity;
    
    if (action === 'created') {
      return 'created this task';
    }
    
    if (action === 'updated') {
      if (changedFields && typeof changedFields === 'object') {
        const changes = Object.entries(changedFields)
          .map(([key, value]) => {
            // For description, just say "description" without showing the content
            if (key === 'description') {
              return 'Description';
            }
            return formatChangedField(key, value);
          })
          .join(', ');
        return `updated ${changes}`;
      }
      return 'updated this task';
    }
    
    if (action === 'status_changed') {
      if (changedFields?.status?.new) {
        const newStatus = formatFieldValue('status', changedFields.status.new);
        return `changed status to ${newStatus}`;
      }
      return 'changed task status';
    }
    
    return action.replace('_', ' ');
  };

  const handleActivityClick = (activityId: string) => {
    console.log('[TASK_ACTIVITY_LOG] Activity clicked:', activityId);
    setSelectedActivityId(activityId);
    setShowActivityDetail(true);
  };

  const handleActivityDetailClose = (open: boolean) => {
    if (!open) {
      setShowActivityDetail(false);
      setSelectedActivityId(null);
    }
  };

  // Limit activities shown by default
  const displayedActivities = showAllActivities ? activities : activities.slice(0, 5);
  const hasMoreActivities = activities.length > 5;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <Activity className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <p className="font-medium">Failed to load activity log</p>
        <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Status & Basic Info */}
      {updatedAt && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-blue-800 dark:text-blue-300">Current Status: {status}</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Last updated {format(new Date(updatedAt), 'MMM dd, yyyy • h:mm a')}
            </p>
          </div>
        </div>
      )}

      {/* Activities from API */}
      {activities.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Activity History ({activities.length})
            </h4>
            
            {displayedActivities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.entityType, activity.action);
              const iconColor = getActivityColor(activity.entityType, activity.action);
              
              return (
                <div 
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => handleActivityClick(activity.id)}
                >
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                      {getMemberInitials(activity.actor)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className={`h-4 w-4 ${iconColor}`} />
                      <p className="text-sm">
                        <span className="font-medium">{getMemberName(activity.actor)}</span>
                        <span className="text-muted-foreground"> {formatActivityMessage(activity)}</span>
                      </p>
                    </div>
                    
                    {/* Changed Fields Display */}
                    {activity.changedFields && typeof activity.changedFields === 'object' && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(activity.changedFields).map(([key, value], idx) => {
                          const fieldDisplayNames: { [key: string]: string } = {
                            'projectId': 'Project',
                            'assigneeId': 'Assignee',
                            'status': 'Status',
                            'priority': 'Priority',
                            'title': 'Title',
                            'description': 'Description',
                            'startDate': 'Start Date',
                            'dueDate': 'Due Date',
                            'percentProgress': 'Progress'
                          };
                          
                          const displayName = fieldDisplayNames[key] || key;
                          
                          // Special handling for description field with HTML content
                          if (key === 'description' && typeof value === 'object' && (value as any)?.old !== undefined && (value as any)?.new !== undefined) {
                            return (
                              <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-xs text-muted-foreground">{displayName}:</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border">
                                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">Previous:</span>
                                    <div 
                                      className="prose prose-xs dark:prose-invert max-w-none break-words mt-1"
                                      style={{ 
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word'
                                      }}
                                      dangerouslySetInnerHTML={{ __html: (value as any).old || '<em>Empty</em>' }} 
                                    />
                                  </div>
                                  <div className="flex justify-center">
                                    <span className="text-xs text-gray-500">→</span>
                                  </div>
                                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border">
                                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Updated:</span>
                                    <div 
                                      className="prose prose-xs dark:prose-invert max-w-none break-words mt-1"
                                      style={{ 
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word'
                                      }}
                                      dangerouslySetInnerHTML={{ __html: (value as any).new || '<em>Empty</em>' }} 
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          
                          // Handle description field without old/new structure
                          if (key === 'description') {
                            return (
                              <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                                <span className="font-medium text-xs text-muted-foreground">{displayName}:</span>
                                <div 
                                  className="prose prose-xs dark:prose-invert max-w-none break-words mt-1"
                                  style={{ 
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word'
                                  }}
                                  dangerouslySetInnerHTML={{ __html: (value as any)?.new || value || '<em>Empty</em>' }} 
                                />
                              </div>
                            );
                          }
                          
                          // Standard field handling for non-description fields
                          return (
                            <div key={idx} className="text-xs bg-white dark:bg-gray-800 rounded px-2 py-1 border">
                              <span className="font-medium text-muted-foreground">{displayName}:</span>
                              {typeof value === 'object' && (value as any)?.old !== undefined && (value as any)?.new !== undefined ? (
                                <span className="ml-1">
                                  <span className="text-red-600">{formatFieldValue(key, (value as any).old)}</span>
                                  <span className="mx-1">→</span>
                                  <span className="text-green-600">{formatFieldValue(key, (value as any).new)}</span>
                                </span>
                              ) : (
                                <span className="ml-1">{formatFieldValue(key, (value as any)?.new || value)}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(activity.createdAt), 'MMM dd, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {/* Show More/Less Button */}
            {hasMoreActivities && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllActivities(!showAllActivities)}
                className="w-full mt-2"
              >
                {showAllActivities ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show {activities.length - 5} More Activities
                  </>
                )}
              </Button>
            )}
          </div>
        </>
      )}

      {/* Task Creation Info */}
      {createdAt && (
        <>
          <Separator />
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <Calendar className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-300">Task Created</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {format(new Date(createdAt), 'MMMM dd, yyyy • h:mm a')}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {activities.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="font-medium">No activity recorded yet</p>
          <p className="text-sm mt-1">Activity will appear here as the task progresses.</p>
        </div>
      )}

      {/* Activity Detail Dialog */}
      <ActivityDetailDialog
        activityId={selectedActivityId}
        open={showActivityDetail}
        onOpenChange={handleActivityDetailClose}
      />
    </div>
  );
}
