'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSession } from "@/lib/services/projly/jwt-auth-adapter";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";

// Import styles
import "../../components/calendar/styles/resource-timeline.css";

// Use dynamic import for FullCalendar
import dynamic from 'next/dynamic';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';

// Define the event interface
export interface TimelineEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  status?: string;
  projectId: string;
  assignee?: {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
  } | string;
  description?: string;
  taskId?: string;
}

// FullCalendar wrapper with dynamic import
const FullCalendarWithNoSSR = dynamic(
  () => import('@fullcalendar/react').then(mod => mod.default),
  { ssr: false }
);

export function TaskTimelineDashboard() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  // Fetch tasks data from API - only parent tasks
  const { 
    data: tasksData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['tasks', 'dashboard-timeline'],
    queryFn: async () => {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/projly/tasks?includeSubTasks=false', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error.message);
      }

      return result;
    },
    enabled: !!userId
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentViewTitle, setCurrentViewTitle] = useState(format(new Date(), 'MMMM yyyy'));
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [taskViewMode, setTaskViewMode] = useState<string>('allTasks');
  const [calendarApi, setCalendarApi] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  // Log function for debugging
  const log = (message: string, data?: any) => {
    console.log(`[PROJLY:TASK_TIMELINE_DASHBOARD] ${message}`, data || '');
  };

  // Define status colors
  const STATUS_COLORS = {
    'Completed': { bg: '#16a34a', border: '#15803d' },
    'In Progress': { bg: '#2563eb', border: '#1d4ed8' },
    'In Review': { bg: '#a855f7', border: '#9333ea' },
    'Not Started': { bg: '#6b7280', border: '#4b5563' },
    'On Hold': { bg: '#f97316', border: '#ea580c' },
    'Pending': { bg: '#f59e0b', border: '#d97706' },
    'Golive': { bg: '#10b981', border: '#047857' },
    'Cancelled': { bg: '#ef4444', border: '#dc2626' },
    'default': { bg: '#9ca3af', border: '#6b7280' },
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
  };

  // Extract projects from tasks
  const projects = useMemo(() => {
    if (!tasksData?.data) return [];
    
    const projectMap = new Map();
    tasksData.data.forEach((task: any) => {
      if (task.project && !projectMap.has(task.project.id)) {
        projectMap.set(task.project.id, {
          id: task.project.id,
          name: task.project.name
        });
      }
    });
    
    return Array.from(projectMap.values());
  }, [tasksData]);

  // Convert tasks to timeline events
  const events = useMemo(() => {
    if (!tasksData?.data) return [];
    
    return tasksData.data
      .filter((task: any) => {
        // Filter by user view mode
        if (taskViewMode === 'myTasks') {
          return task.assigneeId === userId;
        } else if (taskViewMode === 'allTasks') {
          return true;
        } else {
          // Specific user ID
          return task.assigneeId === taskViewMode;
        }
      })
      .map((task: any) => ({
        id: task.id,
        title: task.title,
        start: task.startDate ? new Date(task.startDate) : new Date(task.createdAt),
        end: task.dueDate ? new Date(task.dueDate) : undefined,
        status: task.status,
        projectId: task.project?.id || 'unknown',
        assignee: task.assignee ? {
          id: task.assignee.id,
          firstName: task.assignee.firstName,
          lastName: task.assignee.lastName,
          name: `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() || task.assignee.email,
          email: task.assignee.email
        } : undefined,
        description: task.description,
        taskId: task.id
      }));
  }, [tasksData, taskViewMode, userId]);

  // Extract unique users from tasks
  const uniqueUsers = useMemo(() => {
    if (!tasksData?.data) return [];
    
    const userMap = new Map();
    tasksData.data.forEach((task: any) => {
      if (task.assignee && !userMap.has(task.assignee.id)) {
        userMap.set(task.assignee.id, {
          id: task.assignee.id,
          name: `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() || task.assignee.email
        });
      }
    });
    
    return Array.from(userMap.values());
  }, [tasksData]);

  // Filter events by selected project
  const filteredEvents = useMemo(() => {
    return events.filter((event: any) => {
      return selectedProject === 'all' || event.projectId === selectedProject;
    });
  }, [events, selectedProject]);

  // Handle date navigation
  const handlePrev = () => {
    if (calendarApi) {
      calendarApi.prev();
      updateViewTitle(calendarApi.getDate());
    }
  };

  const handleNext = () => {
    if (calendarApi) {
      calendarApi.next();
      updateViewTitle(calendarApi.getDate());
    }
  };

  const handleToday = () => {
    if (calendarApi) {
      calendarApi.today();
      updateViewTitle(calendarApi.getDate());
    }
  };

  // Update view title based on current date
  const updateViewTitle = (date: Date) => {
    setCurrentDate(date);
    setCurrentViewTitle(format(date, 'MMMM yyyy'));
  };

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
  };

  // Handle event click
  const handleEventClick = (info: any) => {
    const taskId = info.event.extendedProps.taskId || info.event.id;
    
    // Find the task from our data
    const task = tasksData?.data?.find((t: any) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setShowTaskDialog(true);
    }
  };

  // Handle opening task in new tab
  const openTaskInNewTab = (taskId: string) => {
    window.open(`/projly/tasks/${taskId}`, '_blank');
  };

  // Handle dates set
  const handleDatesSet = (info: any) => {
    const startDate = info.view.currentStart;
    const endDate = info.view.currentEnd;
    
    const startStr = format(startDate, 'MMM d');
    const endStr = format(new Date(endDate.getTime() - 86400000), 'MMM d, yyyy');
    setCurrentViewTitle(`${startStr} - ${endStr}`);
    
    if (!calendarApi && info.view.calendar) {
      setCalendarApi(info.view.calendar);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Parent Tasks Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Failed to load tasks data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border rounded-md shadow-sm">
      <CardHeader className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">Parent Tasks Timeline</CardTitle>
            <div className="flex items-center gap-2 ml-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrev}
                aria-label="Previous period"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToday}
                aria-label="Today"
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNext}
                aria-label="Next period"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="text-sm font-semibold ml-2 flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                {currentViewTitle}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select 
              value={taskViewMode} 
              onValueChange={setTaskViewMode}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Tasks View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allTasks">All Members</SelectItem>
                <SelectItem value="myTasks">My Tasks</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {isLoading && (
              <div className="inline-flex ml-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            
            <Select 
              value={selectedProject} 
              onValueChange={handleProjectSelect}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading tasks...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No parent tasks found for the selected filters
          </div>
        ) : (
          <div className="resource-timeline-calendar overflow-x-auto">
            <FullCalendarWithNoSSR
              plugins={[resourceTimelinePlugin, interactionPlugin]}
              initialView="resourceTimelineMonth"
              headerToolbar={false}
              resources={projects.map((project: any) => ({
                id: project.id,
                title: project.name
              }))}
              events={filteredEvents.map((event: any) => ({
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end,
                resourceId: event.projectId,
                backgroundColor: getStatusColor(event.status || 'default').bg,
                borderColor: getStatusColor(event.status || 'default').border,
                textColor: '#ffffff',
                extendedProps: {
                  description: event.description,
                  status: event.status || 'Not Started',
                  taskId: event.taskId || event.id,
                  assignee: event.assignee || 'Unassigned'
                }
              }))}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              height="auto"
              resourceAreaWidth="200px"
              slotMinWidth={100}
              nowIndicator={true}
              resourcesInitiallyExpanded={true}
              slotLabelFormat={[
                { month: 'long', year: 'numeric' },
                { weekday: 'short', day: 'numeric' }
              ]}
              dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'short' }}
              schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
              resourceAreaHeaderContent="Projects"
              stickyHeaderDates={true}
              eventContent={(arg) => {
                const status = arg.event.extendedProps.status || 'Not Started';
                const rawAssignee = arg.event.extendedProps.assignee;
                const assignee = typeof rawAssignee === 'object'
                  ? rawAssignee.name || (rawAssignee.firstName && rawAssignee.lastName
                    ? `${rawAssignee.firstName} ${rawAssignee.lastName}`
                    : rawAssignee.id)
                  : (rawAssignee || 'Unassigned');
                
                return (
                  <div className="event-content-wrapper p-1">
                    <div className="event-title font-medium text-xs">{arg.event.title}</div>
                    <div className="event-details flex items-center justify-between text-xs mt-1">
                      <Badge 
                        variant="outline" 
                        className="text-xs px-1 py-0"
                        style={{
                          backgroundColor: getStatusColor(status).bg,
                          color: 'white',
                          borderColor: getStatusColor(status).border
                        }}
                      >
                        {status}
                      </Badge>
                      <span className="assignee text-xs">{assignee}</span>
                    </div>
                  </div>
                );
              }}
              resourceLabelDidMount={(arg) => {
                arg.el.style.fontWeight = 'bold';
                arg.el.style.fontSize = '14px';
                arg.el.style.padding = '8px';
              }}
              eventDidMount={(arg) => {
                arg.el.style.borderRadius = '4px';
                arg.el.style.padding = '2px';
                arg.el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)';
              }}
            />
          </div>
        )}
      </CardContent>

      {/* Task Detail Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Task Details</span>
              {selectedTask && (
                <Button
                  size="sm"
                  title='Open full task details at new tab'
                  style={{marginRight: '30px', marginTop: '-10px'}}
                  onClick={() => openTaskInNewTab(selectedTask.id)}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              Quick overview of task information
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <h3 className="text-lg font-semibold">{selectedTask.title}</h3>
                {selectedTask.description && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div 
                      dangerouslySetInnerHTML={{ __html: selectedTask.description }} 
                      className="prose prose-sm max-w-none"
                    />
                  </div>
                )}
              </div>

              {/* Task Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Status:</span>
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${getStatusColor(selectedTask.status || 'default').bg}`}
                      style={{
                        backgroundColor: getStatusColor(selectedTask.status || 'default').bg,
                        color: 'white',
                        borderColor: getStatusColor(selectedTask.status || 'default').border
                      }}
                    >
                      {selectedTask.status}
                    </Badge>
                  </div>
                  
                  {selectedTask.priority && (
                    <div>
                      <span className="text-sm font-medium">Priority:</span>
                      <span className="ml-2 text-sm">{selectedTask.priority}</span>
                    </div>
                  )}

                  {selectedTask.assignee && (
                    <div>
                      <span className="text-sm font-medium">Assignee:</span>
                      <span className="ml-2 text-sm">
                        {`${selectedTask.assignee.firstName || ''} ${selectedTask.assignee.lastName || ''}`.trim() || selectedTask.assignee.email}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {selectedTask.project && (
                    <div>
                      <span className="text-sm font-medium">Project:</span>
                      <span className="ml-2 text-sm">{selectedTask.project.name}</span>
                    </div>
                  )}

                  {selectedTask.startDate && (
                    <div>
                      <span className="text-sm font-medium">Start Date:</span>
                      <span className="ml-2 text-sm">
                        {format(new Date(selectedTask.startDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {selectedTask.dueDate && (
                    <div>
                      <span className="text-sm font-medium">Due Date:</span>
                      <span className="ml-2 text-sm">
                        {format(new Date(selectedTask.dueDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {selectedTask.percentProgress !== null && selectedTask.percentProgress !== undefined && (
                    <div>
                      <span className="text-sm font-medium">Progress:</span>
                      <span className="ml-2 text-sm">{selectedTask.percentProgress}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Creation Info */}
              <div className="pt-4 border-t">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Created: {format(new Date(selectedTask.createdAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                  <span>
                    Updated: {format(new Date(selectedTask.updatedAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
