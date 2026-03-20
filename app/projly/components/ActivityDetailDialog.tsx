'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, FileText, ArrowRight, AlertCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useProfile } from '@/lib/services/projly/use-profile';
import { buildBrowserRouteUrl } from '@/src/router/hash-path';

interface ActivityDetailDialogProps {
  activityId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ActivityDetail {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changedFields: any;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
  entityDetails: any;
  lookupData?: {
    users?: Record<string, { id: string; firstName: string; lastName: string; email: string }>;
    projects?: Record<string, { id: string; name: string }>;
    tasks?: Record<string, { id: string; title: string }>;
  };
}

// Fix timezone offset using user's profile timezone preference
const fixTimezone = (utcDateString: string, userTimezone: number = 7): Date => {
  const dbDate = new Date(utcDateString);
  return dbDate;
};

export function ActivityDetailDialog({ activityId, open, onOpenChange }: ActivityDetailDialogProps) {
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: profile } = useProfile();

  useEffect(() => {
    if (activityId && open) {
      fetchActivityDetail(activityId);
    }
  }, [activityId, open]);

  const fetchActivityDetail = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projly/analytics/activity-detail/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity detail');
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error.message);
      }

      setActivity(result.data);
    } catch (err) {
      console.error('Error fetching activity detail:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activity detail');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return '➕';
      case 'updated': return '✏️';
      case 'status_changed': return '🔄';
      case 'commented': return '💬';
      default: return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'text-green-600';
      case 'updated': return 'text-blue-600';
      case 'status_changed': return 'text-purple-600';
      case 'commented': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const openTaskInNewTab = (taskId: string) => {
    window.open(buildBrowserRouteUrl(`/projly/tasks/${taskId}`), '_blank');
  };

  const formatFieldName = (fieldName: string) => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const getStatusBadgeProps = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let customClass = "";
    
    switch (status) {
      case "Completed":
        variant = "default";
        customClass = "bg-green-600 text-white hover:bg-green-700 border-green-600";
        break;
      case "In Progress":
        variant = "secondary";
        customClass = "bg-blue-600 text-white hover:bg-blue-700 border-blue-600";
        break;
      case "In Review":
        variant = "outline";
        customClass = "bg-purple-500 text-white hover:bg-purple-600 border-purple-500";
        break;
      case "Golive":
        variant = "default";
        customClass = "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500";
        break;
      case "Not Started":
        variant = "outline";
        customClass = "bg-gray-500 text-white hover:bg-gray-600 border-gray-500";
        break;
      case "On Hold":
        variant = "outline";
        customClass = "bg-orange-500 text-white hover:bg-orange-600 border-orange-500";
        break;
      case "Pending":
        variant = "destructive";
        customClass = "bg-amber-500 text-white hover:bg-amber-600 border-amber-500";
        break;
      case "Cancelled":
        variant = "destructive";
        customClass = "bg-red-500 text-white hover:bg-red-600 border-red-500";
        break;
      default:
        variant = "outline";
        customClass = "bg-gray-400 text-white hover:bg-gray-500 border-gray-400";
    }
    
    return { variant, customClass };
  };

  const getReadableValue = (fieldName: string, value: any): string => {
    if (!value) return 'Empty';
    
    // Handle specific field mappings to human-readable names
    switch (fieldName) {
      case 'projectId':
        // First try lookup data, then fallback to entity details
        if (activity?.lookupData?.projects?.[value]) {
          return activity.lookupData.projects[value].name;
        }
        if (activity?.entityDetails?.project?.name && activity.entityDetails.project.id === value) {
          return activity.entityDetails.project.name;
        }
        break;
      case 'assigneeId':
        // First try lookup data, then fallback to entity details
        if (activity?.lookupData?.users?.[value]) {
          const user = activity.lookupData.users[value];
          return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
        }
        if (activity?.entityDetails?.assignee && activity.entityDetails.assignee.id === value) {
          const assignee = activity.entityDetails.assignee;
          return `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || assignee.email;
        }
        break;
      case 'parentTaskId':
        // Use lookup data for parent task names
        if (activity?.lookupData?.tasks?.[value]) {
          return activity.lookupData.tasks[value].title;
        }
        if (activity?.entityDetails?.parentTask && activity.entityDetails.parentTask.id === value) {
          return activity.entityDetails.parentTask.title;
        }
        // Fallback to shortened ID format
        if (typeof value === 'string' && value.length > 20) {
          return `Parent Task (${value.substring(0, 8)}...)`;
        }
        break;
      case 'status':
        return value.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      case 'priority':
        return value.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      case 'dueDate':
      case 'startDate':
      case 'endDate':
        // Format date fields as DD/MM/YYYY
        if (typeof value === 'string' && (value.includes('T') || value.includes('-'))) {
          try {
            const date = new Date(value);
            return format(date, 'dd/MM/yyyy');
          } catch (error) {
            return String(value);
          }
        }
        break;
    }
    
    // For UUID-like strings, show a shortened version
    if (typeof value === 'string' && value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return `ID: ${value.substring(0, 8)}...`;
    }
    
    return String(value);
  };

  const renderFieldChange = (fieldName: string, change: any) => {
    if (typeof change === 'object' && change !== null && change.old !== undefined && change.new !== undefined) {
      // Handle description field with HTML content
      if (fieldName === 'description') {
        return (
          <div key={fieldName} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">{formatFieldName(fieldName)}:</span>
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border">
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">Previous:</span>
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none break-words mt-1"
                  style={{ 
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{ __html: change.old || '<em>Empty</em>' }} 
                />
              </div>
              <div className="flex justify-center">
                <ArrowRight className="h-4 w-4 text-gray-500" />
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border">
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Updated:</span>
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none break-words mt-1"
                  style={{ 
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{ __html: change.new || '<em>Empty</em>' }} 
                />
              </div>
            </div>
          </div>
        );
      }
      
      return (
        <div key={fieldName} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{formatFieldName(fieldName)}:</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded">
              {getReadableValue(fieldName, change.old)}
            </span>
            <ArrowRight className="h-4 w-4 text-gray-500" />
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
              {getReadableValue(fieldName, change.new)}
            </span>
          </div>
        </div>
      );
    }
    
    return (
      <div key={fieldName} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <span className="font-medium text-sm">{formatFieldName(fieldName)}:</span>
        <span className="text-sm">{getReadableValue(fieldName, change)}</span>
      </div>
    );
  };

  const renderEntityInfo = () => {
    if (!activity?.entityDetails) return null;

    if (activity.entityType === 'task') {
      return (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Task Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-xs">Title:</span>
              <span className="text-xs text-right max-w-md">{activity.entityDetails.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-xs">Status:</span>
              {(() => {
                const { variant, customClass } = getStatusBadgeProps(activity.entityDetails.status);
                return <Badge variant={variant} className={`text-xs h-5 ${customClass}`}>{activity.entityDetails.status}</Badge>;
              })()}
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-xs">Priority:</span>
              <span className="text-xs">{activity.entityDetails.priority}</span>
            </div>
            {activity.entityDetails.project && (
              <div className="flex justify-between">
                <span className="font-medium text-xs">Project:</span>
                <span className="text-xs text-right max-w-md">{activity.entityDetails.project.name}</span>
              </div>
            )}
            {activity.entityDetails.assignee && (
              <div className="flex justify-between">
                <span className="font-medium text-xs">Assignee:</span>
                <span className="text-xs text-right max-w-md">
                  {`${activity.entityDetails.assignee.firstName || ''} ${activity.entityDetails.assignee.lastName || ''}`.trim() || activity.entityDetails.assignee.email}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (activity.entityType === 'comment') {
      return (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Comment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="space-y-1">
              <span className="font-medium text-xs">Content:</span>
              <div className="rounded-md bg-muted/50 p-2">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none break-words"
                  style={{ 
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{ __html: activity.entityDetails.content || '<em>No content</em>' }} 
                />
              </div>
            </div>
            {activity.entityDetails.task && (
              <>
                <div className="flex justify-between">
                  <span className="font-medium text-xs">Task:</span>
                  <span className="text-xs text-right max-w-md">{activity.entityDetails.task.title}</span>
                </div>
                {activity.entityDetails.task.project && (
                  <div className="flex justify-between">
                    <span className="font-medium text-xs">Project:</span>
                    <span className="text-xs text-right max-w-md">{activity.entityDetails.task.project.name}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{activity && getActionIcon(activity.action)}</span>
                Activity Details
              </DialogTitle>
              <DialogDescription>
                View detailed information about this activity and the changes made
              </DialogDescription>
            </div>
            
            {/* Open Task in New Tab Button - only show for task activities */}
            {activity && (activity.entityType === 'task' || (activity.entityType === 'comment' && activity.entityDetails?.task)) && (
              <button
                onClick={() => {
                  const taskId = activity.entityType === 'task' 
                    ? activity.entityId 
                    : activity.entityDetails?.task?.id;
                  if (taskId) openTaskInNewTab(taskId);
                }}
                className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors"
                title="Open task in new tab"
                style={{
                  position: 'absolute',
                  right: '50px',
                  top: '10px',
                }}
              >
                <ExternalLink className="h-4 w-4 text-white" />
              </button>
            )}
          </div>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {activity && !loading && !error && (
          <div className="space-y-6">
            {/* Actor Information */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {activity.actor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{activity.actor.name}</span>
                  <Badge variant="outline" className={getActionColor(activity.action)}>
                    {activity.action.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="h-4 w-4" />
                  {format(fixTimezone(activity.createdAt, profile?.timezone || 7), 'dd/MM/yyyy')}
                </div>
              </div>
            </div>

            <Separator />

            {/* Changed Fields */}
            {activity.changedFields && Object.keys(activity.changedFields).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Changes Made</h3>
                <div className="space-y-3">
                  {Object.entries(activity.changedFields).map(([fieldName, change]) =>
                    renderFieldChange(fieldName, change)
                  )}
                </div>
              </div>
            )}

            {(!activity.changedFields || Object.keys(activity.changedFields).length === 0) && (
              <div className="text-center py-4 text-muted-foreground">
                No specific field changes recorded for this activity
              </div>
            )}

            {/* Entity Information */}
            {renderEntityInfo()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
