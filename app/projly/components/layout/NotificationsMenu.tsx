'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
import { useNotifications } from '@/lib/services/projly/use-notifications';

export const NotificationsMenu = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refetch } = useNotifications(10);
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
  
  // Refetch notifications when the dropdown is opened
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      log('Dropdown opened, refetching notifications');
      refetch();
    }
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
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
      <DropdownMenuContent align="end" className="w-[350px] max-h-[80vh] overflow-hidden flex flex-col">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="overflow-y-auto max-h-[calc(80vh-100px)]" role="menu">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No notifications at this time.
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <DropdownMenuItem asChild key={notification.id}>
                  <Link
                    href={notification.path}
                    className={`cursor-pointer flex flex-col items-start py-2 px-4 w-full ${!notification.isRead ? 'bg-muted/50' : ''}`}
                    onClick={() => handleNotificationClick(notification.path, notification.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold">{notification.title}</span>
                      <span className="text-xs text-muted-foreground">{notification.timeAgo}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-normal">
                      {notification.message}
                    </p>
                  </Link>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer flex justify-center p-2 text-center border-t"
          onClick={() => {
            setOpen(false);
            router.push('/projly/notifications?tab=notifications');
          }}
        >
          View All Notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
