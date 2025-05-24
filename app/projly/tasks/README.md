# Projly Tasks Page

> **Updated:** 2025-05-24 (Full Hierarchical Task Display Implementation)

## Overview

The Tasks page provides a comprehensive interface for managing tasks across all projects in the Projly application. It has been refactored to use a centralized task management system that ensures consistent functionality across the main tasks page, task detail page, and project detail page. The system now supports full hierarchical task organization with unlimited nesting depth, displaying n+2 level subtasks directly under their respective parent tasks with proper visual hierarchy indicators.

## Implementation Details

### Key Components

- **TasksPage**: Main page component that now uses the centralized TasksContainer
- **TasksContainer**: Reusable container component that manages task loading, filtering, and display
- **TasksTable**: Component for displaying tasks in a sortable, filterable table
- **useTaskHierarchy**: Custom hook for managing task hierarchies across the application
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

## Full Hierarchical Task Display System (Updated 2025-05-24)

The Tasks page now implements a comprehensive approach to task management using the enhanced `TasksContainer` component and `organizeTasksHierarchy` function. This ensures that tasks at any nesting level (n+1, n+2, n+3, etc.) are displayed with proper hierarchical relationships while maintaining a clean and intuitive user interface:

```tsx
export default function TasksPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-sm text-gray-500">Manage your tasks across all projects</p>
      </div>

      {/* Use the enhanced TasksContainer with full hierarchy support */}
      <TasksContainer 
        context="main"
        hierarchyOptions={{
          maxDepth: Infinity, // Support unlimited nesting depth
          showAllSubtasks: false
        }}
      />
    </div>
  );
}
```

This refactored implementation provides several benefits:

1. **Code Reusability**: The same container component is used across different task views
2. **Consistent Behavior**: Filtering, sorting, and hierarchy management work the same way everywhere
3. **Simplified Maintenance**: Changes to task display logic only need to be made in one place
4. **Improved Error Handling**: Centralized error states and loading indicators

## Task Hierarchy Management

### Recursive Depth Calculation

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
- **Unlimited Nesting Display**: Shows tasks at any nesting level (n+1, n+2, n+3, etc.) directly under their respective parent tasks
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

### 2025-05-24: Centralized Task Management Implementation
- Refactored the Tasks page to use the new TasksContainer component
- Implemented useTaskHierarchy hook for consistent task hierarchy management
- Fixed filtering issues to properly maintain filters between component refreshes
- Added optimization to prevent infinite request loops when applying filters
- Implemented robust error handling and loading states
- Improved task data loading with proper context awareness

### 2025-05-24: Improved Task Hierarchy Management
- Implemented recursive depth calculation for accurate task hierarchy tracking
- Added filtering to show only top-level tasks and direct children in the main list
- Fixed issues with deeply nested subtasks appearing in the main task list
- Added circular reference detection for robustness
