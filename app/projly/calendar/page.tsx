'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDays, format, startOfMonth } from "date-fns";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { CalendarGrid } from "@/app/projly/components/calendar/CalendarGrid";
import { EventDetailsDialog, CalendarEvent } from "@/app/projly/components/calendar/EventDetailsDialog";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Filter } from "lucide-react";
import { projlyAuthService, projlyTasksService, projlyProjectsService } from '@/lib/services/projly';
import { useToast } from "@/components/ui/use-toast";

export default function CalendarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterProject, setFilterProject] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  
  // Event state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  
  // Date state for new event
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:CALENDAR] ${message}`, data);
    } else {
      console.log(`[PROJLY:CALENDAR] ${message}`);
    }
  };
  
  // Check authentication and load calendar data on page load
  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        log('Checking authentication');
        const isAuthenticated = await projlyAuthService.isAuthenticated();
        
        if (!isAuthenticated) {
          log('User not authenticated, redirecting to login');
          router.push('/projly/login');
          return;
        }
        
        log('Loading calendar data');
        
        // Load projects first
        const projectsData = await projlyProjectsService.getProjects();
        log('Projects loaded:', projectsData.length);
        setProjects(projectsData);
        
        // Load tasks which will be converted to calendar events
        const tasksData = await projlyTasksService.getMyTasks();
        log('Tasks loaded:', tasksData.length);
        
        // Define a Task interface that matches our service
        interface Task {
          id: string;
          title: string;
          description?: string;
          status: string;
          projectId?: string;
          dueDate?: string;
          startDate?: string;
        }

        // Convert tasks to calendar events
        const calendarEvents = tasksData.map((task: any) => {
          // Get the associated project
          const taskProject = projectsData.find(p => p.id === task.projectId);
          
          // Make sure we have proper date objects
          const startDate = task.startDate ? new Date(task.startDate) : new Date();
          const endDate = task.dueDate ? new Date(task.dueDate) : undefined;
          
          log('Processing task to calendar event:', { id: task.id, title: task.title, start: startDate, end: endDate });
          
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            start: startDate,
            end: endDate,
            status: task.status || 'Not Started',
            type: 'Task',
            projectId: task.projectId,
            taskId: task.id,
            project: taskProject
          };
        });
        
        log('Calendar events created:', calendarEvents.length);
        setEvents(calendarEvents);
        setFilteredEvents(calendarEvents);
        
      } catch (error) {
        console.error('[PROJLY:CALENDAR] Error loading calendar data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load calendar data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
        log('Calendar page initialization completed');
      }
    };
    
    loadCalendarData();
  }, [router, toast]);
  
  // Apply filters when they change
  useEffect(() => {
    log('Applying filters', { project: filterProject, status: filterStatus });
    
    const filtered = events.filter(event => {
      // Filter by project
      if (filterProject && event.projectId !== filterProject) {
        return false;
      }
      
      // Filter by status
      if (filterStatus && event.status !== filterStatus) {
        return false;
      }
      
      return true;
    });
    
    log('Filtered events:', filtered.length);
    setFilteredEvents(filtered);
  }, [events, filterProject, filterStatus]);
  
  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    log('Event clicked:', event);
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
    setIsEditing(false);
  };
  
  // Handle date click
  const handleDateClick = (date: Date) => {
    log('Date clicked:', date);
    setNewEventDate(date);
    setIsNewEventDialogOpen(true);
  };
  
  // Toggle edit mode
  const handleEditToggle = () => {
    log('Toggling edit mode');
    setIsEditing(!isEditing);
  };
  
  // Handle save event
  const handleSaveEvent = async (event: CalendarEvent) => {
    try {
      log('Saving event:', event);
      
      // Convert back to task format with required fields
      const taskData = {
        title: event.title || 'Untitled Task',
        description: event.description || '',
        startDate: event.start.toISOString(),
        dueDate: event.end ? event.end.toISOString() : event.start.toISOString(),
        status: event.status || 'Not Started',
        projectId: event.projectId || undefined
      };
      
      // Update or create task
      if (event.taskId) {
        log('Updating existing task:', { id: event.taskId, data: taskData });
        // Extract ID and pass taskData separately as required by the API
        await projlyTasksService.updateTask(event.taskId, taskData);
      } else {
        log('Creating new task:', taskData);
        try {
          // Ensure all required fields have values for task creation
          const createTaskData = {
            ...taskData,
            // Set default project ID if none provided
            projectId: taskData.projectId || projects[0]?.id || '',
          };
          
          log('Creating task with data:', createTaskData);
          const newTask = await projlyTasksService.createTask(createTaskData);
          log('New task created with ID:', newTask?.id);
          
          // Update event with new task ID
          if (newTask && newTask.id) {
            event.taskId = newTask.id;
          }
        } catch (error) {
          console.error('[PROJLY:CALENDAR] Error creating task:', error);
          throw error; // Re-throw to be caught by the outer catch block
        }
      }
      
      // Update events list
      setEvents(prevEvents => {
        const updatedEvents = [...prevEvents];
        const index = updatedEvents.findIndex(e => e.id === event.id);
        
        if (index >= 0) {
          // Update existing event
          updatedEvents[index] = event;
        } else {
          // Add new event
          updatedEvents.push({
            ...event,
            id: event.taskId || `temp-${Date.now()}`
          });
        }
        
        return updatedEvents;
      });
      
      toast({
        title: 'Success',
        description: event.taskId ? 'Event updated successfully' : 'Event created successfully'
      });
      
    } catch (error) {
      console.error('[PROJLY:CALENDAR] Error saving event:', error);
      toast({
        title: 'Error',
        description: 'Failed to save event. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      log('Deleting event:', eventId);
      
      // Find the event to get the task ID
      const event = events.find(e => e.id === eventId);
      
      if (event && event.taskId) {
        log('Deleting associated task:', event.taskId);
        await projlyTasksService.deleteTask(event.taskId);
      }
      
      // Remove from events list
      setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
      
      toast({
        title: 'Success',
        description: 'Event deleted successfully'
      });
      
    } catch (error) {
      console.error('[PROJLY:CALENDAR] Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Create new event
  const handleCreateNewEvent = () => {
    const date = newEventDate || new Date();
    log('Creating new event on date:', date);
    
    const newEvent: CalendarEvent = {
      id: `new-${Date.now()}`,
      title: 'New Event',
      description: '',
      start: date,
      end: addDays(date, 1),
      status: 'Not Started',
      type: 'Task'
    };
    
    setSelectedEvent(newEvent);
    setIsNewEventDialogOpen(false);
    setIsEventDialogOpen(true);
    setIsEditing(true);
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">View and manage your tasks and events</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={() => {
              setNewEventDate(new Date());
              setIsNewEventDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Select 
              value={filterProject} 
              onValueChange={(value) => {
                log('Project filter changed:', value);
                setFilterProject(value === 'all' ? '' : value);
              }}
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
            
            <Select 
              value={filterStatus || 'all'} 
              onValueChange={(value) => {
                log('Status filter changed:', value);
                setFilterStatus(value === 'all' ? '' : value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            
            {(filterProject || filterStatus) && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setFilterProject("");
                  setFilterStatus("");
                }}
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue={view} value={view} onValueChange={setView} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
          </TabsList>
          
          <TabsContent value="month" className="mt-0">
            <CalendarGrid 
              events={filteredEvents}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              currentDate={currentDate}
              onCurrentDateChange={setCurrentDate}
            />
          </TabsContent>
          
          <TabsContent value="week" className="mt-0">
            <div className="bg-muted/30 border p-12 rounded-md flex justify-center items-center">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Week View</h3>
                <p className="text-muted-foreground mb-4">
                  Week view coming soon. This feature is under development.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setView("month")}
                >
                  Return to Month View
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="day" className="mt-0">
            <div className="bg-muted/30 border p-12 rounded-md flex justify-center items-center">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Day View</h3>
                <p className="text-muted-foreground mb-4">
                  Day view coming soon. This feature is under development.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setView("month")}
                >
                  Return to Month View
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Event Details Dialog */}
        <EventDetailsDialog
          event={selectedEvent}
          isOpen={isEventDialogOpen}
          onClose={() => {
            setIsEventDialogOpen(false);
            setIsEditing(false);
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          isEditing={isEditing}
          onEditToggle={handleEditToggle}
          projects={projects}
        />
        
        {/* New Event Dialog */}
        {isNewEventDialogOpen && (
          <EventDetailsDialog
            event={{
              id: `new-${Date.now()}`,
              title: '',
              start: newEventDate || new Date(),
              end: newEventDate ? addDays(newEventDate, 1) : addDays(new Date(), 1),
              status: 'Not Started',
              type: 'Task'
            }}
            isOpen={isNewEventDialogOpen}
            onClose={() => setIsNewEventDialogOpen(false)}
            onSave={handleSaveEvent}
            isEditing={true}
            projects={projects}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
