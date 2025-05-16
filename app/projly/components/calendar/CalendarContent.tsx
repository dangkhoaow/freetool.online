
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarEvent } from './utils/eventUtils';
import { CalendarResource } from './utils/resourceUtils';
import { toast } from '@/components/ui/use-toast';

interface CalendarContentProps {
  events: CalendarEvent[];
  resources: CalendarResource[];
  calendarRef: React.RefObject<any>;
  onDatesSet: (info: any) => void;
}

export const CalendarContent = ({
  events,
  resources,
  calendarRef,
  onDatesSet
}: CalendarContentProps) => {
  console.log('Rendering calendar with resources:', resources.length);
  console.log('Rendering calendar with events:', events.length);
  
  // Handle event clicks
  const handleEventClick = (info: any) => {
    const { event } = info;
    const taskId = event.extendedProps.taskId;
    
    toast({
      title: event.title,
      description: `Status: ${event.extendedProps.status}, Assigned to: ${event.extendedProps.assignee}`,
    });
    
    console.log('Event clicked:', event);
    console.log('Task ID:', taskId);
  };
  
  // Create calendar options object to properly type the properties
  const calendarOptions = {
    plugins: [resourceTimelinePlugin, dayGridPlugin, interactionPlugin],
    initialView: "resourceTimelineMonth",
    headerToolbar: false as const, // Explicitly type as 'false' constant
    events: events,
    resources: resources,
    eventClick: handleEventClick,
    datesSet: onDatesSet,
    slotMinWidth: 60,
    height: "auto",
    nowIndicator: true,
    now: new Date(),
    slotLabelFormat: [
      { month: 'long' as const, year: 'numeric' as const }, // Fix: Added 'as const' to month
      { day: 'numeric' as const, weekday: 'short' as const }
    ],
    schedulerLicenseKey: "GPL-My-Project-Is-Open-Source",
    resourceAreaWidth: "15%",
    resourceLabelText: "Projects",
    eventContent: (info: any) => {
      return (
        <>
          <div className="fc-event-title">
            {info.event.title}
          </div>
          <div className="fc-event-desc text-xs">
            {info.event.extendedProps.assignee}
          </div>
        </>
      );
    },
    eventDidMount: (info: any) => {
      const { el, event } = info;
      // Add tooltip using title attribute
      el.setAttribute(
        "title", 
        `${event.title} | Assignee: ${event.extendedProps.assignee} | Status: ${event.extendedProps.status}`
      );
    },
    resourceLabelDidMount: (info: any) => {
      const { resource, el } = info;
      // Set project name in resource label
      const nameEl = document.createElement('div');
      nameEl.className = 'font-medium';
      nameEl.innerText = resource.title;
      el.querySelector('.fc-cell-text')?.replaceWith(nameEl);
      
      // Add project icon
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'h-6 w-6 mr-2 rounded-md flex items-center justify-center bg-project-primary/10';
      iconWrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-project-primary"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>';
      
      const cellContent = el.querySelector('.fc-datagrid-cell-main');
      if (cellContent) {
        cellContent.prepend(iconWrapper);
        cellContent.className += ' flex items-center';
      }
    }
  };
  
  return (
    <div className="calendar-container p-0 overflow-x-auto">
      <FullCalendar
        ref={calendarRef}
        {...calendarOptions}
      />
    </div>
  );
};
