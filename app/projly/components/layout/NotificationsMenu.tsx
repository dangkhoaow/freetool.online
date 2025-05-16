
'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
// Mock notifications hook since the original is not available
function useNotifications() {
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:NOTIFICATIONS] ${message}`, data);
    } else {
      console.log(`[PROJLY:NOTIFICATIONS] ${message}`);
    }
  };
  
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    path: string;
    timeAgo: string;
    isRead: boolean;
  }>>([]);
  
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Initialize with mock data on component mount
  useEffect(() => {
    log('Initializing mock notifications');
    const mockNotifications = [
      {
        id: '1',
        title: 'Task Assignment',
        message: 'You have been assigned a new task: "Update documentation"',
        path: '/projly/tasks/1',
        timeAgo: '5 min ago',
        isRead: false
      },
      {
        id: '2',
        title: 'Project Update',
        message: 'Project "Website Redesign" status changed to "In Progress"',
        path: '/projly/projects/1',
        timeAgo: '2 hours ago',
        isRead: false
      },
      {
        id: '3',
        title: 'Deadline Reminder',
        message: 'Task "Update API Documentation" is due tomorrow',
        path: '/projly/tasks/3',
        timeAgo: '1 day ago',
        isRead: true
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  }, []);
  
  // Mark a notification as read
  const markAsRead = (id: string) => {
    log('Marking notification as read:', id);
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    log('Marking all notifications as read');
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };
  
  return { notifications, unreadCount, markAsRead, markAllAsRead };
}

export const NotificationsMenu = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:NOTIFICATIONS_MENU] ${message}`, data);
    } else {
      console.log(`[PROJLY:NOTIFICATIONS_MENU] ${message}`);
    }
  };
  
  log('Rendering with unread count:', unreadCount);
  
  const handleNotificationClick = (path: string, id: string) => {
    log('Notification clicked, marking as read:', id);
    markAsRead(id);
    setOpen(false);
    router.push(path);
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="h-5 w-5 absolute -top-1 -right-1 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No notifications at this time.
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`cursor-pointer flex flex-col items-start py-2 px-4 ${!notification.isRead ? 'bg-muted/50' : ''}`}
                onClick={() => handleNotificationClick(notification.path, notification.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">{notification.timeAgo}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 whitespace-normal">
                  {notification.message}
                </p>
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        <div className="text-xs text-center text-muted-foreground p-2 border-t">
          Showing notifications for projects and tasks
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
