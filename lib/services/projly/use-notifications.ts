
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/app/projly/contexts/AuthContextCustom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';

// Define the base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Enhanced fetch function for Projly API calls
 * @param endpoint - API endpoint path (without the base URL)
 * @param options - Fetch options
 * @returns Promise with the fetch response
 */
async function projlyFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:FETCH] ${message}`, data);
    } else {
      console.log(`[PROJLY:FETCH] ${message}`);
    }
  };

  // Construct the full URL
  const url = `${API_BASE_URL}${endpoint}`;
  log(`Making ${options.method || 'GET'} request to: ${url}`);

  // Set default headers if not provided
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add credentials to include cookies in the request
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(url, fetchOptions);
    
    // Log the response status
    log(`Response status: ${response.status}`);
    
    return response;
  } catch (error) {
    log(`Error in fetch: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// Add debugging logs to track initialization
console.log('[NOTIFICATIONS] Loading notifications hook');

export interface Notification {
  id: string;
  type: string;
  entityId: string;
  title: string;
  message: string;
  path: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  timeAgo?: string; // Calculated field on the frontend
}

export function useNotifications(limit?: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Add detailed logging to show user authentication state
  console.log('[NOTIFICATIONS] Auth user data:', user ? `User ID: ${user?.id}` : 'Not authenticated');
  console.log('[NOTIFICATIONS] Limit parameter:', limit);
  
  // Fetch notifications from the backend
  const { data: fetchedNotifications = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['notifications', limit], // Include limit in query key for proper caching
    queryFn: async () => {
      console.log('[NOTIFICATIONS] Fetching notifications from backend with limit:', limit);
      
      if (!user) {
        console.log('[NOTIFICATIONS] No user, returning empty array');
        return [];
      }
      
      try {
        // Add limit parameter to the URL if provided
        const url = limit ? `/api/projly/notifications?limit=${limit}` : '/api/projly/notifications';
        const response = await projlyFetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[NOTIFICATIONS] Error fetching notifications:', errorData);
          throw new Error(errorData.error || 'Failed to fetch notifications');
        }
        
        const data = await response.json();
        console.log(`[NOTIFICATIONS] Successfully fetched ${data.length} notifications ${limit ? `(limited to ${limit})` : '(no limit)'}`);
        return data;
      } catch (error) {
        console.error('[NOTIFICATIONS] Error in notifications fetch:', error);
        throw error;
      }
    },
    // Refetch periodically and on window focus to ensure we have latest data
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // Refetch every minute
    enabled: !!user // Only run query if user is authenticated
  });
  
  // Process notifications to add calculated fields
  const notifications: Notification[] = fetchedNotifications.map((notification: Notification) => {
    // The server is storing UTC time, but the timestamp actually represents local time
    // We need to adjust for this discrepancy
    
    // First, parse the ISO string which has the Z suffix (indicating UTC)
    const utcDate = parseISO(notification.createdAt);
    
    // Create a corrected date by adjusting for the timezone offset
    // This effectively converts "16:50 UTC wrongly recorded" to "16:50 local time correctly interpreted"
    const correctedDate = new Date(utcDate);
    correctedDate.setHours(correctedDate.getHours() - 7); // Subtract 7 hours to fix the timezone issue
    
    console.log('[NOTIFICATIONS] Original date from server:', notification.createdAt, 
      '→ UTC interpreted date:', utcDate.toLocaleString(), 
      '→ Corrected local date:', correctedDate.toLocaleString(),
      '→ Current time:', new Date().toLocaleString());
    
    return {
      ...notification,
      timeAgo: formatDistanceToNow(correctedDate, { addSuffix: true })
    };
  });
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;
  console.log(`[NOTIFICATIONS] Processed ${notifications.length} notifications, ${unreadCount} unread`);
  
  // Mark a single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('[NOTIFICATIONS] Marking notification as read:', id);
      try {
        const response = await projlyFetch(`/api/projly/notifications/${id}/read`, {
          method: 'PUT'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[NOTIFICATIONS] Error marking notification as read:', errorData);
          throw new Error(errorData.error || 'Failed to mark notification as read');
        }
        
        const data = await response.json();
        console.log('[NOTIFICATIONS] Successfully marked notification as read:', id);
        return data;
      } catch (error) {
        console.error('[NOTIFICATIONS] Error in mark as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
  
  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      console.log('[NOTIFICATIONS] Marking all notifications as read');
      try {
        const response = await projlyFetch('/api/projly/notifications/read', {
          method: 'PUT'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[NOTIFICATIONS] Error marking all notifications as read:', errorData);
          throw new Error(errorData.error || 'Failed to mark all notifications as read');
        }
        
        const data = await response.json();
        console.log(`[NOTIFICATIONS] Successfully marked ${data.count} notifications as read`);
        return data;
      } catch (error) {
        console.error('[NOTIFICATIONS] Error in mark all as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
  
  // Use callbacks for the mark as read functions to prevent unnecessary re-renders
  const markAsRead = useCallback((id: string) => {
    markAsReadMutation.mutate(id);
  }, [markAsReadMutation]);
  
  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);
  
  // Refetch notifications when navigating between pages
  useEffect(() => {
    const handleRouteChange = () => {
      console.log('[NOTIFICATIONS] Route changed, refetching notifications');
      refetch();
    };
    
    // Add event listener for navigation events
    window.addEventListener('popstate', handleRouteChange);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [refetch]);
  
  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    error,
    markAsRead,
    markAllAsRead,
    refetch
  };
}
