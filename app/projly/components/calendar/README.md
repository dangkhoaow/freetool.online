
# Project Calendar Component

This directory contains components for the project timeline calendar using FullCalendar.

## Components

- `ProjectCalendar.tsx` - The main calendar component that displays projects and tasks in a timeline view.
- `CalendarHeader.tsx` - Header component with navigation and filtering controls.
- `CalendarContent.tsx` - The main FullCalendar content area.

## Hooks

- `useCalendarControls.ts` - Custom hook for managing calendar navigation and date state.

## Utils

- `eventUtils.ts` - Utility functions for transforming tasks to FullCalendar events.
- `resourceUtils.ts` - Utility functions for transforming projects to FullCalendar resources.

## Styles

- `calendar.css` - Custom styles for the FullCalendar components.

## Features

- Timeline view with projects as resources and tasks as events
- Filter by project
- Interactive navigation (prev, next, today)
- Color-coded tasks based on status
- Tooltips showing task details
- Responsive design

## Usage

```tsx
import { ProjectCalendar } from '@/components/calendar/RefactoredProjectCalendar';

// Example usage
<ProjectCalendar
  projects={projects}
  tasks={tasks}
  isLoading={loading}
  onMonthChange={(start, end) => console.log(start, end)}
  onProjectSelect={(projectId) => setSelectedProject(projectId)}
  selectedProject={selectedProject}
/>
```

## Dependencies

This component requires the following dependencies:

- @fullcalendar/react
- @fullcalendar/core
- @fullcalendar/resource-timeline
- @fullcalendar/daygrid
- @fullcalendar/interaction
- date-fns
- date-fns-tz
