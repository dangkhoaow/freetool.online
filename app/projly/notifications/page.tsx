'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/app/projly/components/layout/DashboardLayout';
import { PageLoading } from '@/app/projly/components/ui/PageLoading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bell, Filter, Eye, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/lib/services/projly/use-notifications';
import { useRecentUpdatesAnalytics, useActivityFilters } from '@/lib/services/projly/use-analytics';
import { useProfile } from '@/lib/services/projly/use-profile';
import { ActivityDetailDialog } from '@/app/projly/components/ActivityDetailDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Activity, MessageSquare, Edit3, Plus, ExternalLink } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Fix timezone offset using user's profile timezone preference
const fixTimezone = (utcDateString: string, userTimezone: number = 7): Date => {
  const dbDate = new Date(utcDateString);
  // Database stores UTC time, convert to local time by creating a new Date
  // The Date constructor already handles timezone conversion, so we just return the UTC date
  return dbDate;
};

export default function NotificationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications();
  // Activity filters and pagination state
  const [activityPage, setActivityPage] = useState(1);
  const [activityFilters, setActivityFilters] = useState({
    activityType: 'all',
    entityType: 'all',
    actorId: 'all',
    startDate: '',
    endDate: ''
  });
  const activityLimit = 20;

  const { data: activitiesData, isLoading: activitiesLoading } = useRecentUpdatesAnalytics(
    activityLimit, 
    activityPage, 
    Object.fromEntries(Object.entries(activityFilters).filter(([_, value]) => value !== '' && value !== 'all'))
  );
  const activities = activitiesData?.activities || [];
  const activityPagination = activitiesData?.pagination;

  const { data: filterOptions } = useActivityFilters();
  const { data: profile } = useProfile();
  
  // Get initial tab from URL parameter, default to 'notifications'
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    return (tabParam === 'activities' || tabParam === 'notifications') ? tabParam : 'notifications';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({ 
    field: 'createdAt', 
    direction: 'desc' 
  });
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:NOTIFICATIONS_PAGE] ${message}`, data);
    } else {
      console.log(`[PROJLY:NOTIFICATIONS_PAGE] ${message}`);
    }
  };

  // When the page loads, log the data loading
  useEffect(() => {
    log('Notifications page loaded');
  }, []);
  
  // Get unique notification types for filter dropdown
  const notificationTypes = notifications
    ? [...new Set(notifications.map(notification => notification.type))]
    : [];
    
  log('Available notification types:', notificationTypes);
  
  // Filter notifications based on search and filters
  const filteredNotifications = notifications
    ? notifications.filter(notification => {
        // Filter by read status
        if (readFilter === 'read' && !notification.isRead) return false;
        if (readFilter === 'unread' && notification.isRead) return false;
        
        // Filter by notification type
        if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
        
        // Filter by search text (in title and message)
        if (search.trim()) {
          const searchLower = search.toLowerCase();
          return (
            (notification.title && notification.title.toLowerCase().includes(searchLower)) ||
            (notification.message && notification.message.toLowerCase().includes(searchLower))
          );
        }
        
        return true;
      })
    : [];
    
  log('Filtered notifications:', filteredNotifications.length);
    
  // Sort notifications based on current sort settings
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (sortBy.field === 'title') {
      return sortBy.direction === 'asc'
        ? (a.title || '').localeCompare(b.title || '')
        : (b.title || '').localeCompare(a.title || '');
    } else if (sortBy.field === 'type') {
      return sortBy.direction === 'asc'
        ? (a.type || '').localeCompare(b.type || '')
        : (b.type || '').localeCompare(a.type || '');
    } else if (sortBy.field === 'createdAt') {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });
  
  // Handle sort toggle
  const toggleSort = (field: string) => {
    log('Toggling sort field:', field);
    setSortBy(prevSort => ({
      field,
      direction: prevSort.field === field && prevSort.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  // Function to handle notification click
  const handleNotificationClick = (path: string, id: string) => {
    log('Notification clicked, marking as read:', `${id} - ${path}`);
    markAsRead(id);
    router.push(path);
  };

  // Function to handle activity click
  const handleActivityClick = (activityId: string) => {
    setSelectedActivityId(activityId);
    setActivityDialogOpen(true);
  };

  // Function to handle tab change with URL update
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newTab);
    router.push(url.pathname + url.search, { scroll: false });
  };

  // Update tab when URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'activities' || tabParam === 'notifications') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  
  // Function to mark all as read
  const handleMarkAllAsRead = () => {
    log('Marking all notifications as read');
    markAllAsRead();
  };
  
  // Function to format notification type for display
  const formatNotificationType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Helper function to determine badge color based on notification type
  const getNotificationBadgeClass = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600';
      case 'task_due_soon':
        return 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500';
      case 'task_overdue':
        return 'bg-red-600 text-white hover:bg-red-700 border-red-600';
      case 'task_status_changed':
        return 'bg-purple-600 text-white hover:bg-purple-700 border-purple-600';
      case 'project_created':
        return 'bg-green-600 text-white hover:bg-green-700 border-green-600';
      case 'project_updated':
        return 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600';
      case 'project_deadline_approaching':
        return 'bg-orange-500 text-white hover:bg-orange-600 border-orange-500';
      case 'team_member_added':
        return 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600';
      default:
        return 'bg-gray-600 text-white hover:bg-gray-700 border-gray-600';
    }
  };
  
  // Helper functions for team activities (matching dashboard pattern)
  const getStatusBadgeClass = (status: string) => {
    if (!status) return 'bg-gray-600 text-white hover:bg-gray-700 border-gray-600';
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-600 text-white hover:bg-green-700 border-green-600';
      case 'in progress':
      case 'in-progress':
        return 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600';
      case 'review':
      case 'under review':
        return 'bg-purple-600 text-white hover:bg-purple-700 border-purple-600';
      case 'testing':
        return 'bg-yellow-600 text-white hover:bg-yellow-700 border-yellow-600';
      case 'blocked':
        return 'bg-red-600 text-white hover:bg-red-700 border-red-600';
      case 'not started':
      case 'todo':
        return 'bg-gray-600 text-white hover:bg-gray-700 border-gray-600';
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

  const formatActivityMessage = (activity: any) => {
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

  if (isLoading || activitiesLoading) {
    log('Showing notifications loading spinner');
    return <PageLoading logContext="PROJLY:NOTIFICATIONS_PAGE" />;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications & Activities</h1>
            <p className="text-muted-foreground">View your notifications and team activities</p>
          </div>
          {activeTab === 'notifications' && filteredNotifications.some(notification => !notification.isRead) && (
            <Button onClick={handleMarkAllAsRead}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              My Notifications
              {notifications?.filter(n => !n.isRead).length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {notifications.filter(n => !n.isRead).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Team Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Notifications</CardTitle>
              </CardHeader>
              <CardContent>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="w-[200px]">
                <Input
                  placeholder="Search notifications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <Select
                  value={readFilter}
                  onValueChange={(value) => setReadFilter(value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center">
                <Select
                  value={typeFilter}
                  onValueChange={(value) => setTypeFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {notificationTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {formatNotificationType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => toggleSort('title')}
                  >
                    Title
                    {sortBy.field === 'title' && (
                      <span className="ml-1">
                        {sortBy.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => toggleSort('type')}
                  >
                    Type
                    {sortBy.field === 'type' && (
                      <span className="ml-1">
                        {sortBy.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => toggleSort('createdAt')}
                  >
                    Date
                    {sortBy.field === 'createdAt' && (
                      <span className="ml-1">
                        {sortBy.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedNotifications.length > 0 ? sortedNotifications.map((notification) => (
                  <TableRow 
                    key={notification.id} 
                    className={`cursor-pointer transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-950/30 border-l-4 border-l-blue-500 dark:border-l-blue-400' : 'hover:border-l-4 hover:border-l-gray-300 dark:hover:border-l-gray-600'}`}
                    onClick={() => handleNotificationClick(notification.path, notification.id)}
                  >
                    <TableCell>
                      {notification.isRead ? (
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Bell className="h-4 w-4 text-blue-600" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium p-0">
                      <Link
                        href={notification.path}
                        className="block p-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <div>
                          {notification.title}
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge className={getNotificationBadgeClass(notification.type)}>
                        {formatNotificationType(notification.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {notification.createdAt ? (
                        <div>
                          {format(new Date(notification.createdAt), 'MMM d, yyyy')}
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(notification.createdAt), 'h:mm a')}
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Bell className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          {search || readFilter !== 'all' || typeFilter !== 'all' 
                            ? 'No notifications match your filters' 
                            : 'No notifications found'}
                        </p>
                        {(search || readFilter !== 'all' || typeFilter !== 'all') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSearch('');
                              setReadFilter('all');
                              setTypeFilter('all');
                            }}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-4 mt-4">
                  {/* Activity Type Filter */}
                  <Select 
                    value={activityFilters.activityType} 
                    onValueChange={(value) => {
                      setActivityFilters(prev => ({ ...prev, activityType: value === 'all' ? '' : value }));
                      setActivityPage(1);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Activity Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {filterOptions?.activityTypes?.map((type: string) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Entity Type Filter */}
                  <Select 
                    value={activityFilters.entityType} 
                    onValueChange={(value) => {
                      setActivityFilters(prev => ({ ...prev, entityType: value === 'all' ? '' : value }));
                      setActivityPage(1);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Entity Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entities</SelectItem>
                      {filterOptions?.entityTypes?.map((type: string) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* User Filter */}
                  <Select 
                    value={activityFilters.actorId} 
                    onValueChange={(value) => {
                      setActivityFilters(prev => ({ ...prev, actorId: value === 'all' ? '' : value }));
                      setActivityPage(1);
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="User" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {filterOptions?.users?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Date Range Filters */}
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={activityFilters.startDate}
                    onChange={(e) => {
                      setActivityFilters(prev => ({ ...prev, startDate: e.target.value }));
                      setActivityPage(1);
                    }}
                    className="w-40"
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={activityFilters.endDate}
                    onChange={(e) => {
                      setActivityFilters(prev => ({ ...prev, endDate: e.target.value }));
                      setActivityPage(1);
                    }}
                    className="w-40"
                  />

                  {/* Clear Filters Button */}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActivityFilters({
                        activityType: 'all',
                        entityType: 'all',
                        actorId: 'all',
                        startDate: '',
                        endDate: ''
                      });
                      setActivityPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activities && activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity: any) => {
                      const IconComponent = getActivityIcon(activity.entityType, activity.action);
                      const iconColor = getActivityColor(activity.entityType, activity.action);
                      const { message, link } = formatActivityMessage(activity);
                      const actorName = `${activity.actor.firstName || ''} ${activity.actor.lastName || ''}`.trim() || activity.actor.email;
                      const initials = actorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

                      return (
                        <div 
                          key={activity.id} 
                          className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm dark:hover:shadow-gray-900/20 cursor-pointer"
                          onClick={() => handleActivityClick(activity.id)}
                        >
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
                                  {activity.changedFields?.status?.new && (
                                    <Badge 
                                      className={`text-xs ${getStatusBadgeClass(activity.changedFields.status.new)}`}
                                    >
                                      {activity.changedFields.status.new}
                                    </Badge>
                                  )}
                                  {activity.entityDetails?.project && (
                                    <Badge variant="outline" className="text-xs">
                                      {activity.entityDetails.project.name}
                                    </Badge>
                                  )}
                                  {activity.entityType === 'comment' && activity.entityDetails?.task?.project && (
                                    <Badge variant="outline" className="text-xs">
                                      {activity.entityDetails.task.project.name}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {link && (
                                <Link target="_blank" href={link} onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Pagination Controls */}
                    {activityPagination && activityPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Showing {((activityPagination.page - 1) * activityPagination.limit) + 1} to{' '}
                          {Math.min(activityPagination.page * activityPagination.limit, activityPagination.totalCount)} of{' '}
                          {activityPagination.totalCount} activities
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActivityPage(prev => Math.max(1, prev - 1))}
                            disabled={!activityPagination.hasPreviousPage}
                          >
                            Previous
                          </Button>
                          <div className="flex items-center space-x-1">
                            {(() => {
                              const currentPage = activityPagination.page;
                              const totalPages = activityPagination.totalPages;
                              const maxVisiblePages = 5;
                              
                              let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                              let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                              
                              // Adjust start page if we're near the end
                              if (endPage - startPage + 1 < maxVisiblePages) {
                                startPage = Math.max(1, endPage - maxVisiblePages + 1);
                              }
                              
                              const pages = [];
                              for (let i = startPage; i <= endPage; i++) {
                                pages.push(i);
                              }
                              
                              return pages.map(pageNum => (
                                <Button
                                  key={pageNum}
                                  variant={pageNum === currentPage ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setActivityPage(pageNum)}
                                  className="w-8 h-8 p-0"
                                >
                                  {pageNum}
                                </Button>
                              ));
                            })()}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActivityPage(prev => Math.min(activityPagination.totalPages, prev + 1))}
                            disabled={!activityPagination.hasNextPage}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-muted-foreground">No team activities found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      
      <ActivityDetailDialog 
        activityId={selectedActivityId}
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
      />
      </div>
    </DashboardLayout>
  );
}