# Projly Tasks Page

## Overview

The Tasks page provides a comprehensive interface for managing tasks across all projects in the Projly application. It supports hierarchical task organization, filtering, sorting, and CRUD operations for tasks.

## Implementation Details

### Key Components

- **TasksPage**: Main page component that fetches and displays tasks
- **TasksTable**: Component for displaying tasks in a sortable, filterable table
- **TaskForm**: Form component for creating and editing tasks
- **CreateTaskForm**: Reusable form component for task creation/editing

### Directory Structure

```
/app/projly/tasks/
├── page.tsx           - Main tasks page
├── [id]/              - Task detail pages
│   ├── page.tsx       - Task detail view
│   └── edit/          - Task edit page
│       └── page.tsx
├── new/               - New task creation page
│   └── page.tsx
└── README.md          - This documentation file
```

## Task Hierarchy Management

### Recursive Depth Calculation (Updated 2025-05-24)

The Tasks page implements a recursive algorithm to properly manage task hierarchies and filter out deeply nested subtasks. This ensures that only top-level tasks and their direct children (level 1) appear in the main task list.

```typescript
// Function to filter out deeply nested subtasks (level 2+) using a recursive approach
const filterNestedTasks = (allTasks: any[]) => {
  // Create maps to track relationships and visited tasks
  const taskMap = new Map<string, any>();
  const taskLevels = new Map<string, number>();
  
  // Build task map for easy lookup
  allTasks.forEach(task => {
    taskMap.set(task.id, task);
  });
  
  // Recursive function to calculate task depth
  const calculateTaskDepth = (taskId: string, visited: Set<string> = new Set()): number => {
    // Base cases and circular reference handling
    if (visited.has(taskId)) return 0;
    if (taskLevels.has(taskId)) return taskLevels.get(taskId) || 0;
    
    const task = taskMap.get(taskId);
    if (!task || !task.parentTaskId) {
      taskLevels.set(taskId, 0);
      return 0;
    }
    
    // Mark this task as visited to detect circular references
    const newVisited = new Set(visited);
    newVisited.add(taskId);
    
    // Recursively calculate the parent's depth and add 1 for this task's depth
    const parentDepth = calculateTaskDepth(task.parentTaskId, newVisited);
    const thisDepth = parentDepth + 1;
    
    taskLevels.set(taskId, thisDepth);
    return thisDepth;
  };
  
  // Calculate depth for all tasks
  allTasks.forEach(task => {
    if (!taskLevels.has(task.id)) {
      calculateTaskDepth(task.id);
    }
  });
  
  // Filter tasks to include only levels 0 and 1
  return allTasks.filter(task => {
    const level = taskLevels.get(task.id) || 0;
    return level <= 1; // Only include levels 0 and 1
  });
};
```

### Key Features

- **Recursive Depth Calculation**: Accurately determines the exact nesting level of each task by traversing the complete parent chain
- **Circular Reference Detection**: Prevents infinite recursion in case of cyclic task relationships
- **Memoization**: Caches calculated depths to avoid redundant calculations
- **Two-Level Display**: Shows only top-level tasks and their direct children in the main list view
- **Error Handling**: Gracefully handles missing tasks or broken references

## API Integration

The Tasks page uses the following services and endpoints:

- **projlyTasksService.getUserTasks()**: Fetches all tasks for the current user
- **projlyAuthService.isAuthenticated()**: Verifies user authentication before loading tasks

## User Experience Features

- **Loading States**: Shows appropriate loading indicators during data fetching
- **Error Handling**: Provides user feedback for authentication and data loading errors
- **Task Hierarchy Visualization**: Visually distinguishes parent tasks and subtasks
- **Filtering and Sorting**: Maintains parent-child relationships during filtering operations

## Recent Updates

### 2025-05-24: Improved Task Hierarchy Management
- Implemented recursive depth calculation for accurate task hierarchy tracking
- Added filtering to show only top-level tasks and direct children in the main list
- Fixed issues with deeply nested subtasks appearing in the main task list
- Added circular reference detection for robustness
