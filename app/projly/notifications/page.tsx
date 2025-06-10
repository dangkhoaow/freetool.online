'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/app/projly/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/app/projly/components/ui/PageLoading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bell, Filter, Eye, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useNotifications } from '@/lib/services/projly/use-notifications';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, isLoading, markAsRead, markAllAsRead, refetch } = useNotifications();
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({ 
    field: 'createdAt', 
    direction: 'desc' 
  });
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:NOTIFICATIONS_PAGE] ${message}`, data);
    } else {
      console.log(`[PROJLY:NOTIFICATIONS_PAGE] ${message}`);
    }
  };

  // When the page loads, refetch notifications to ensure we have the latest data
  useEffect(() => {
    log('Notifications page loaded, refetching data');
    refetch();
  }, [refetch]);
  
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
  
  if (isLoading) {
    log('Showing notifications loading spinner');
    return <PageLoading logContext="PROJLY:NOTIFICATIONS_PAGE" />;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">View and manage your notifications</p>
          </div>
          {filteredNotifications.some(notification => !notification.isRead) && (
            <Button onClick={handleMarkAllAsRead}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Notifications</CardTitle>
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
                    className="cursor-pointer"
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
                    className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                    onClick={() => handleNotificationClick(notification.path, notification.id)}
                  >
                    <TableCell>
                      {notification.isRead ? (
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Bell className="h-4 w-4 text-blue-600" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        {notification.title}
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
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
      </div>
    </DashboardLayout>
  );
} 