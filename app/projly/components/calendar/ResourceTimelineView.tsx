'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Import styles
import "./styles/resource-timeline.css";

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
  assignee?: string;
  description?: string;
  taskId?: string;
}

// Define the component props interface
export interface ResourceTimelineViewProps {
  events: TimelineEvent[];
  projects: any[];
  taskViewMode?: "myTasks" | "allTasks";
  onTaskViewModeChange?: (mode: "myTasks" | "allTasks") => void;
  isLoading?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
  onDateClick?: (date: Date) => void;
  onAddEvent?: () => void;
}

// FullCalendar wrapper with dynamic import
const FullCalendarWithNoSSR = dynamic(
  () => import('@fullcalendar/react').then(mod => mod.default),
  { ssr: false }
);

// Resource Timeline View Component
const ResourceTimelineView = ({
  events,
  projects,
  taskViewMode = "myTasks",
  onTaskViewModeChange,
  isLoading = false,
  onEventClick,
  onDateClick,
  onAddEvent
}: ResourceTimelineViewProps): React.ReactElement => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentViewTitle, setCurrentViewTitle] = useState(format(new Date(), 'MMMM yyyy'));
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [calendarApi, setCalendarApi] = useState<any>(null);
  
  // Log function for debugging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:RESOURCE_TIMELINE] ${message}`, data);
    } else {
      console.log(`[PROJLY:RESOURCE_TIMELINE] ${message}`);
    }
  };
  
  // Define a consistent color scheme matching our status badges
  const STATUS_COLORS = {
    'Completed': { bg: '#16a34a', border: '#15803d' }, // green-600/700
    'In Progress': { bg: '#2563eb', border: '#1d4ed8' }, // blue-600/700
    'In Review': { bg: '#a855f7', border: '#9333ea' }, // purple-500/600
    'Not Started': { bg: '#6b7280', border: '#4b5563' }, // gray-500/600
    'On Hold': { bg: '#f97316', border: '#ea580c' }, // orange-500/600
    'Pending': { bg: '#f59e0b', border: '#d97706' }, // amber-500/600
    'Active': { bg: '#2563eb', border: '#1d4ed8' }, // blue-600/700 (same as In Progress)
    'Planned': { bg: '#8b5cf6', border: '#7c3aed' }, // violet-500/600
    'Canceled': { bg: '#ef4444', border: '#dc2626' }, // red-500/600
    'Archived': { bg: '#6b7280', border: '#4b5563' }, // gray-500/600 (same as Not Started)
    'Overdue': { bg: '#ef4444', border: '#dc2626' }, // red-500/600
    'default': { bg: '#9ca3af', border: '#6b7280' }, // gray-400/500
  };
  
  // Helper function to get color by status
  const getStatusColor = (status: string) => {
    const colors = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
    return colors;
  };

  // Filter events by selected project
  const filteredEvents = events.filter(event => 
    selectedProject === 'all' || event.projectId === selectedProject
  );
  
  // Effect to update calendar size when filtered events change
  useEffect(() => {
    if (calendarApi && filteredEvents) {
      // Allow DOM to update before resizing
      setTimeout(() => {
        log('Updating calendar size after events filtering');
        calendarApi.updateSize();
      }, 50);
    }
  }, [filteredEvents.length, calendarApi]);

  // Handle date navigation
  const handlePrev = () => {
    if (calendarApi) {
      calendarApi.prev();
      updateViewTitle(calendarApi.getDate());
      log('Navigated to previous period');
    }
  };

  const handleNext = () => {
    if (calendarApi) {
      calendarApi.next();
      updateViewTitle(calendarApi.getDate());
      log('Navigated to next period');
    }
  };

  const handleToday = () => {
    if (calendarApi) {
      calendarApi.today();
      updateViewTitle(calendarApi.getDate());
      log('Navigated to today');
    }
  };

  // Update view title based on current date
  const updateViewTitle = (date: Date) => {
    setCurrentDate(date);
    setCurrentViewTitle(format(date, 'MMMM yyyy'));
  };

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    log('Project selected', projectId);
    setSelectedProject(projectId);
    
    // Force re-render and recalculate heights after a slight delay
    if (calendarApi) {
      setTimeout(() => {
        log('Forcing calendar update after project filter change');
        calendarApi.updateSize();
      }, 50);
    }
  };

  // Handle event click
  const handleEventClick = (info: any) => {
    if (onEventClick) {
      log('Event clicked', info.event);
      const eventData: TimelineEvent = {
        id: info.event.id,
        title: info.event.title,
        start: new Date(info.event.start),
        end: info.event.end ? new Date(info.event.end) : undefined,
        status: info.event.extendedProps.status,
        projectId: info.event.resourceId,
        assignee: info.event.extendedProps.assignee,
        description: info.event.extendedProps.description,
        taskId: info.event.extendedProps.taskId
      };
      onEventClick(eventData);
    }
  };

  // Handle date click
  const handleDateClick = (info: any) => {
    if (onDateClick) {
      log('Date clicked', info.date);
      onDateClick(info.date);
    }
  };

  // Handle calendar ready
  const handleCalendarReady = (calendar: any) => {
    setCalendarApi(calendar);
    log('Calendar ready', calendar);
    
    // Set a specific height for the calendar to ensure consistency
    if (calendar) {
      calendar.setOption('height', 600);
    }
  };

  // Handle dates set
  const handleDatesSet = (info: any) => {
    const startDate = info.view.currentStart;
    const endDate = info.view.currentEnd;
    
    // Format the date range for better understanding
    const startStr = format(startDate, 'MMM d');
    const endStr = format(new Date(endDate.getTime() - 86400000), 'MMM d, yyyy');
    setCurrentViewTitle(`${startStr} - ${endStr}`);
    
    // Store the calendar API for navigation if not already set
    if (!calendarApi && info.view.calendar) {
      handleCalendarReady(info.view.calendar);
    }
    
    log('Calendar dates set', { start: startDate, end: endDate });
  };
  
  // Effect hook to initialize calendar API when component mounts
  useEffect(() => {
    return () => {
      // Cleanup function
      log('Calendar component unmounted');
    };
  }, []);

  return (
    <Card className="border rounded-md shadow-sm">
      <CardHeader className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
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
            <div className="text-lg font-semibold ml-2 flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              {currentViewTitle}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select 
              value={taskViewMode} 
              onValueChange={(value) => onTaskViewModeChange?.(value as "myTasks" | "allTasks")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Tasks View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="myTasks">My Tasks</SelectItem>
                <SelectItem value="allTasks">All Tasks</SelectItem>
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
            
            {false && onAddEvent && (
              <Button 
                size="sm" 
                onClick={onAddEvent}
                aria-label="Add event"
              >
                Add Event
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="resource-timeline-calendar overflow-x-auto">
          <FullCalendarWithNoSSR
            plugins={[resourceTimelinePlugin, interactionPlugin]}
            initialView="resourceTimelineMonth"
            headerToolbar={false}
            resources={projects.map(project => ({
              id: project.id,
              title: project.name
            }))}
            events={filteredEvents.map(event => ({
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
            dateClick={handleDateClick}
            datesSet={handleDatesSet}
            height="auto"
            resourceAreaWidth="200px"
            slotMinWidth={100}
            nowIndicator={true}
            resourcesInitiallyExpanded={true}
            slotLabelFormat={[
              { month: 'long', year: 'numeric' }, // top level of text
              { weekday: 'short', day: 'numeric' } // lower level of text
            ]}
            dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'short' }}
            schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
            resourceAreaHeaderContent="Projects"
            stickyHeaderDates={true}
            eventContent={(arg) => {
              const status = arg.event.extendedProps.status || 'Not Started';
              const assignee = arg.event.extendedProps.assignee || 'Unassigned';
              
              return (
                <div className="event-content-wrapper p-1">
                  <div className="event-title font-medium">{arg.event.title}</div>
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
                    <span className="assignee">{assignee}</span>
                  </div>
                </div>
              );
            }}
            resourceLabelDidMount={(arg) => {
              // Add custom styling to resource labels
              arg.el.style.fontWeight = 'bold';
              arg.el.style.fontSize = '14px';
              arg.el.style.padding = '8px';
            }}
            eventDidMount={(arg) => {
              // Add custom styling to events
              arg.el.style.borderRadius = '4px';
              arg.el.style.padding = '2px';
              arg.el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)';
            }}
            datesSet={handleDatesSet}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceTimelineView;