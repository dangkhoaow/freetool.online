'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { TimelineEvent } from './ResourceTimelineCalendar';

interface FullCalendarWrapperProps {
  events: any[];
  resources: any[];
  onEventClick?: (event: TimelineEvent) => void;
  onDateClick?: (date: Date) => void;
  onDatesSet?: (info: any) => void;
}

const FullCalendarWrapper: React.FC<FullCalendarWrapperProps> = ({
  events,
  resources,
  onEventClick,
  onDateClick,
  onDatesSet
}) => {
  // Log function for debugging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:FULLCALENDAR] ${message}`, data);
    } else {
      console.log(`[PROJLY:FULLCALENDAR] ${message}`);
    }
  };

  // Handle event click
  const handleEventClick = (info: { event: any }) => {
    if (onEventClick) {
      log('Event clicked', info.event);
      const eventData = {
        id: info.event.id,
        title: info.event.title,
        start: new Date(info.event.start),
        end: info.event.end ? new Date(info.event.end) : undefined,
        status: info.event.extendedProps.status,
        projectId: info.event.resourceId,
        assignee: info.event.extendedProps.assignee,
        owner: info.event.extendedProps.owner
      };
      onEventClick(eventData);
    }
  };

  // Handle date click
  const handleDateClick = (info: { date: Date }) => {
    if (onDateClick) {
      log('Date clicked', info.date);
      onDateClick(info.date);
    }
  };

  return (
    <div className="resource-timeline-calendar">
      <FullCalendar
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        initialView="resourceTimelineMonth"
        headerToolbar={false}
        resources={resources}
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        datesSet={onDatesSet}
        height="auto"
        resourceAreaWidth="15%"
        slotMinWidth={60}
        nowIndicator={true}
        schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
        eventContent={(info: { event: any }) => {
          log('Rendering event', info.event.title);
          return (
            <>
              <div className="fc-event-title">
                {info.event.title}
              </div>
              <div className="fc-event-desc text-xs">
                {info.event.extendedProps.assignee || info.event.extendedProps.owner || 'Unassigned'}
              </div>
            </>
          );
        }}
        eventDidMount={(info: { event: any; el: HTMLElement }) => {
          // Add status class to event element
          if (info.event.extendedProps.status) {
            const statusClass = `status-${info.event.extendedProps.status.toLowerCase().replace(/\s+/g, '-')}`;
            info.el.classList.add(statusClass);
            log('Added status class', statusClass);
          }
          
          // Add completed/in-progress classes based on status
          if (info.event.extendedProps.status === 'completed') {
            info.el.classList.add('event-completed');
          } else {
            info.el.classList.add('event-in-progress');
          }
        }}
        resourceLabelDidMount={(info: { resource: any; el: HTMLElement }) => {
          const { resource, el } = info;
          log('Resource label mounted', resource.title);
          
          // Create container for icon and name
          const containerEl = document.createElement('div');
          containerEl.className = 'flex items-center';
          
          // Create project icon
          const iconEl = document.createElement('div');
          iconEl.className = 'resource-icon';
          iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>';
          
          // Create project name element
          const nameEl = document.createElement('div');
          nameEl.className = 'font-medium';
          nameEl.innerText = resource.title;
          
          // Add icon and name to container
          containerEl.appendChild(iconEl);
          containerEl.appendChild(nameEl);
          
          // Replace the default cell text with our custom container
          el.querySelector('.fc-cell-text')?.replaceWith(containerEl);
        }}
      />
    </div>
  );
};

export default FullCalendarWrapper;
