'use client';

import { useState, useEffect } from 'react';
import { 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  startOfWeek,
  endOfWeek,
  getDay
} from 'date-fns';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  type?: string;
  status?: string;
  color?: string;
}

interface CalendarGridProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  currentDate?: Date;
  onCurrentDateChange?: (date: Date) => void;
}

export function CalendarGrid({
  events = [],
  onEventClick,
  onDateClick,
  currentDate = new Date(),
  onCurrentDateChange
}: CalendarGridProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [daysInMonth, setDaysInMonth] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date(currentDate));
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:CALENDAR_GRID] ${message}`, data);
    } else {
      console.log(`[PROJLY:CALENDAR_GRID] ${message}`);
    }
  };
  
  // Calculate days to display in the calendar
  useEffect(() => {
    log('Recalculating calendar days for:', currentMonth);
    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));
    
    log('Calendar range:', { startDate, endDate });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    setDaysInMonth(days);
  }, [currentMonth]);
  
  // When currentDate prop changes, update internal state
  useEffect(() => {
    if (currentDate && !isSameMonth(currentDate, currentMonth)) {
      log('External current date changed, updating calendar:', currentDate);
      setCurrentMonth(currentDate);
    }
  }, [currentDate, currentMonth]);
  
  // Navigate to previous month
  const previousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    log('Navigating to previous month:', newDate);
    setCurrentMonth(newDate);
    if (onCurrentDateChange) {
      onCurrentDateChange(newDate);
    }
  };
  
  // Navigate to next month
  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    log('Navigating to next month:', newDate);
    setCurrentMonth(newDate);
    if (onCurrentDateChange) {
      onCurrentDateChange(newDate);
    }
  };
  
  // Navigate to today
  const goToToday = () => {
    const today = new Date();
    log('Navigating to today:', today);
    setCurrentMonth(today);
    if (onCurrentDateChange) {
      onCurrentDateChange(today);
    }
  };
  
  // Handle date click
  const handleDateClick = (date: Date) => {
    log('Date clicked:', date);
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date);
    }
  };
  
  // Handle event click
  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    log('Event clicked:', event);
    if (onEventClick) {
      onEventClick(event);
    }
  };
  
  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      // Include events that start on this day
      // For multi-day events, we should also include days between start and end
      return isSameDay(event.start, day) || 
        (event.end && day >= event.start && day <= event.end);
    });
  };
  
  // Determine cell styles based on the day
  const getDayClass = (day: Date) => {
    return cn(
      "h-24 border p-1 text-sm transition-colors hover:bg-muted/50 relative",
      {
        "bg-muted/20": !isSameMonth(day, currentMonth),
        "bg-accent/5": isToday(day),
        "ring-2 ring-primary": selectedDate && isSameDay(day, selectedDate),
      }
    );
  };
  
  // Get appropriate color for event based on its type or status
  const getEventColor = (event: CalendarEvent) => {
    if (event.color) return event.color;
    
    // Default colors based on status
    switch(event.status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };
  
  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline" 
            size="sm"
            onClick={goToToday}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={previousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div 
            key={day} 
            className="h-10 flex items-center justify-center text-sm font-medium"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border rounded-lg overflow-hidden">
        {daysInMonth.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          
          return (
            <div
              key={idx}
              className={getDayClass(day)}
              onClick={() => handleDateClick(day)}
            >
              <div className="flex justify-between">
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday(day) && "bg-primary text-primary-foreground font-medium",
                    !isSameMonth(day, currentMonth) && "text-muted-foreground"
                  )}
                >
                  {format(day, 'd')}
                </span>
                
                {/* Day indicator for different month */}
                {!isSameMonth(day, currentMonth) && (
                  <span className="text-xs text-muted-foreground">
                    {format(day, 'MMM')}
                  </span>
                )}
              </div>
              
              {/* Events for this day */}
              <div className="mt-1 max-h-16 overflow-y-auto space-y-1">
                {dayEvents.map((event, eventIdx) => (
                  <div
                    key={`${event.id}-${eventIdx}`}
                    className={`text-xs truncate px-1 py-0.5 rounded-sm border ${getEventColor(event)}`}
                    onClick={(e) => handleEventClick(e, event)}
                  >
                    {event.title}
                  </div>
                ))}
                
                {/* Show counter if there are more events than can fit */}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
