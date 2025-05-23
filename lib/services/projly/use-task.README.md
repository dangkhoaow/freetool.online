# Frontend Task Service Documentation

## Overview
The Frontend Task Service provides React hooks and utilities for managing tasks and sub-tasks in the Projly frontend application. It handles API integration, state management, and UI interactions for task operations.

## Hooks and Functions

### useTasks(filters?: TaskFilters)
- Custom hook for fetching and managing tasks
- Supports filtering by:
  - Status
  - Project
  - Assignee
  - Due date
  - Parent/Sub-task relationship
- Returns tasks with their relationships
- Handles loading and error states

### useTask(id: string)
- Custom hook for managing a single task
- Fetches task details with relationships
- Handles loading and error states
- Returns task data and mutation functions

### useCreateTask()
- Custom hook for creating new tasks
- Handles parent task selection
- Validates task hierarchy
- Returns mutation function and status

### useUpdateTask(id: string)
- Custom hook for updating tasks
- Handles parent task relationship updates
- Validates task hierarchy changes
- Returns mutation function and status

### useDeleteTask(id: string)
- Custom hook for deleting tasks
- Handles sub-task cascade behavior
- Returns mutation function and status

## Task Form Components

### TaskForm
- Form component for creating/updating tasks
- Includes parent task selection dropdown
- Validates task hierarchy rules
- Shows validation errors
- Handles form submission

### ParentTaskSelect
- Dropdown component for selecting parent tasks
- Filters tasks by project
- Shows only valid parent tasks
- Handles selection change

## Task List Components

### TaskList
- List component for displaying tasks
- Supports filtering options:
  - Parent tasks only
  - Include sub-tasks
- Shows task hierarchy
- Handles task selection

### TaskFilter
- Filter component for task list
- Includes parent/sub-task filter
- Handles filter changes
- Updates task list view

## State Management
- Uses React Query for server state
- Manages local state for UI
- Handles optimistic updates
- Maintains task hierarchy state

## Error Handling
- Shows validation errors
- Displays API error messages
- Handles network errors
- Provides retry options

## Related Documentation
- [Tasks API Documentation](/service.freetool.online/app/api/projly/tasks/README.md)
- [Task Service Documentation](/service.freetool.online/lib/services/prisma/tasks.README.md)
- [UI Components Documentation](/components/projly/README.md)

## Recent Updates (2025-05-21)
- Added sub-task management UI
- Implemented parent task selection
- Enhanced task filtering options
- Added task hierarchy display 