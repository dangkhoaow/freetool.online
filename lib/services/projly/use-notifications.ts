
import { useEffect, useState, useCallback } from 'react';
// Use the correct AuthContext import with the useAuth hook
import { useAuth } from '@/app/projly/contexts/AuthContextCustom';
// Use local imports for our project services
import { useProjects } from './use-projects';
import { useTasks } from './use-tasks';
import { formatDistanceToNow } from 'date-fns';

// Add debugging logs to track initialization
console.log('[NOTIFICATIONS] Loading notifications hook');

export interface Notification {
  id: string;
  type: 'project' | 'task';
  title: string;
  message: string;
  date: string;
  timeAgo: string;
  path: string;
  isRead: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth(); // Using user instead of profile from the AuthContext
  
  // Add detailed logging to show user authentication state
  console.log('[NOTIFICATIONS] Auth user data:', user ? `User ID: ${user.id}` : 'Not authenticated');
  
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTasks({ assignedTo: user?.id });
  
  // Use useCallback for these functions to prevent unnecessary re-renders
  const markAsRead = useCallback((id: string) => {
    console.log("useNotifications: Marking notification as read:", id);
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);
  
  const markAllAsRead = useCallback(() => {
    console.log("useNotifications: Marking all notifications as read");
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    
    setUnreadCount(0);
  }, []);
  
  // Generate notifications based on projects and tasks
  useEffect(() => {
    if (!user) return;
    console.log("useNotifications: Generating notifications based on projects and tasks");

    const newNotifications: Notification[] = [];
    const now = new Date();
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
    
    // Define Task interface to resolve type errors
    interface Task {
      id: string;
      title: string;
      due_date?: string;
    }
    
    // Define Project interface to resolve type errors
    interface Project {
      id: string;
      name: string;
      end_date?: string;
    }
    
    // Check for tasks assigned to user that are due soon or overdue
    tasks.forEach((task: Task) => {
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        const timeRemaining = dueDate.getTime() - now.getTime();
        
        // Task is overdue
        if (timeRemaining < 0) {
          newNotifications.push({
            id: `task-overdue-${task.id}`,
            type: 'task',
            title: 'Overdue Task',
            message: `Task "${task.title}" is overdue.`,
            date: dueDate.toISOString(),
            timeAgo: formatDistanceToNow(dueDate, { addSuffix: true }),
            path: `/tasks/${task.id}`,
            isRead: false
          });
        } 
        // Task is due soon (within 3 days)
        else if (timeRemaining < THREE_DAYS) {
          newNotifications.push({
            id: `task-soon-${task.id}`,
            type: 'task',
            title: 'Task Due Soon',
            message: `Task "${task.title}" is due soon.`,
            date: dueDate.toISOString(),
            timeAgo: formatDistanceToNow(dueDate, { addSuffix: true }),
            path: `/tasks/${task.id}`,
            isRead: false
          });
        }
      }
    });
    
    // Check for projects with end dates that are coming up or overdue
    projects.forEach((project: Project) => {
      if (project.end_date) {
        const endDate = new Date(project.end_date);
        const timeRemaining = endDate.getTime() - now.getTime();
        
        // Project is overdue
        if (timeRemaining < 0) {
          newNotifications.push({
            id: `project-overdue-${project.id}`,
            type: 'project',
            title: 'Overdue Project',
            message: `Project "${project.name}" is past its end date.`,
            date: endDate.toISOString(),
            timeAgo: formatDistanceToNow(endDate, { addSuffix: true }),
            path: `/projects/${project.id}`,
            isRead: false
          });
        } 
        // Project is ending soon (within 3 days)
        else if (timeRemaining < THREE_DAYS) {
          newNotifications.push({
            id: `project-soon-${project.id}`,
            type: 'project',
            title: 'Project Ending Soon',
            message: `Project "${project.name}" is ending soon.`,
            date: endDate.toISOString(),
            timeAgo: formatDistanceToNow(endDate, { addSuffix: true }),
            path: `/projects/${project.id}`,
            isRead: false
          });
        }
      }
    });
    
    // Sort notifications by date (newest first)
    newNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.isRead).length);
    
    // Log the number of notifications generated for debugging
    console.log(`[NOTIFICATIONS] Generated ${newNotifications.length} notifications, ${unreadCount} unread`);
    
  }, [user?.id, tasks, projects]);
  
  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}
