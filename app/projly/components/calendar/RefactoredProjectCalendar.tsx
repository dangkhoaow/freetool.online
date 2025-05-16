
import React, { useState, useEffect } from 'react';
import { TaskWithDetails } from '@/services/tasks';
import { Tables } from '@/types';
import { transformTasksToEvents, CalendarEvent } from './utils/eventUtils';
import { transformProjectsToResources, CalendarResource } from './utils/resourceUtils';
import { Card } from '@/components/ui/card';
import { CalendarHeader } from './CalendarHeader';
import { CalendarContent } from './CalendarContent';
import { useCalendarControls } from './hooks/useCalendarControls';
import './styles/calendar.css';

interface ProjectCalendarProps {
  projects: Tables.Project[] | null;
  tasks: TaskWithDetails[] | null;
  isLoading: boolean;
  onMonthChange?: (start: Date, end: Date) => void;
  onProjectSelect?: (projectId: string | null) => void;
  selectedProject: string | null;
}

export const ProjectCalendar = ({
  projects,
  tasks,
  isLoading,
  onMonthChange,
  onProjectSelect,
  selectedProject
}: ProjectCalendarProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [resources, setResources] = useState<CalendarResource[]>([]);
  
  const {
    currentViewTitle,
    calendarRef,
    handlePrev,
    handleNext,
    handleToday,
    handleDatesSet
  } = useCalendarControls(onMonthChange);

  // Transform tasks to calendar events whenever tasks data changes
  useEffect(() => {
    if (tasks) {
      const calendarEvents = transformTasksToEvents(tasks);
      console.log('Calendar events created:', calendarEvents);
      setEvents(calendarEvents);
    }
  }, [tasks]);

  // Transform projects to calendar resources whenever projects data changes
  useEffect(() => {
    if (projects) {
      const calendarResources = transformProjectsToResources(projects);
      console.log('Calendar resources created:', calendarResources);
      setResources(calendarResources);
    }
  }, [projects]);

  const handleProjectSelectChange = (projectId: string | null) => {
    if (onProjectSelect) {
      console.log('Project selected:', projectId);
      onProjectSelect(projectId);
    }
  };

  return (
    <Card className="relative">
      <CalendarHeader
        currentViewTitle={currentViewTitle}
        projects={projects}
        selectedProject={selectedProject}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onProjectSelect={handleProjectSelectChange}
      />
      
      <CalendarContent
        events={events}
        resources={resources}
        calendarRef={calendarRef}
        onDatesSet={handleDatesSet}
      />
    </Card>
  );
};
