
import React, { useState, useEffect } from "react";
import { format, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { Spinner } from "@/components/ui/spinner";
import { ProjectCalendar } from "@/components/calendar/ProjectCalendar";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
  // Calculate date range for current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Fetch projects and tasks
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: tasks, isLoading: tasksLoading } = useTasks(
    selectedProject ? { projectId: selectedProject } : undefined
  );

  console.log("Loaded tasks for calendar:", tasks);
  console.log("Current calendar date range:", { start: monthStart, end: monthEnd });

  // Filter visible projects
  const visibleProjects = selectedProject && projects 
    ? projects.filter(project => project.id === selectedProject)
    : projects;

  // Handle date range changes from the calendar
  const handleMonthChange = (start: Date, end: Date) => {
    console.log("Calendar date range changed:", { start, end });
    setCurrentDate(start);
  };
  
  // Handle project selection
  const handleProjectSelect = (projectId: string | null) => {
    console.log("Selected project:", projectId);
    setSelectedProject(projectId);
  };

  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ProjectCalendar
        projects={visibleProjects}
        tasks={tasks}
        isLoading={projectsLoading || tasksLoading}
        onMonthChange={handleMonthChange}
        onProjectSelect={handleProjectSelect}
        selectedProject={selectedProject}
      />
    </div>
  );
};

export default Calendar;
