# Projly Tasks Page

> **Updated:** 2025-05-29 (Board View Implementation with Drag-and-Drop Functionality)
> **Previous Update:** 2025-05-26 (Subtask Deletion Fix and UI Refresh Enhancement)
> **Earlier Update:** 2025-05-25 (Task Details Page Code Cleanup and Enhanced Component Separation)

## Overview

The Tasks page provides a comprehensive interface for managing tasks across all projects in the Projly application. It has been refactored to use a centralized task management system that ensures consistent functionality across the main tasks page, task detail page, and project detail page. The system now supports full hierarchical task organization with unlimited nesting depth, displaying n+2 level subtasks directly under their respective parent tasks with proper visual hierarchy indicators.

The Tasks page now offers two view modes:
1. **List View**: Traditional table-based view with sorting and filtering capabilities
2. **Board View**: Kanban-style board with status columns and drag-and-drop functionality for task status updates

## Implementation Details

### Key Components

- **TasksPage**: Main page component that now uses the centralized TasksContainer
- **TasksContainer**: Reusable container component that manages task loading, filtering, and display
- **TasksTable**: Component for displaying tasks in a sortable, filterable table
- **TasksBoard**: Component for displaying tasks in a Kanban-style board with status columns
- **TaskCard**: Card component for displaying individual tasks in the board view
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

## Task Details Page Code Cleanup (Added 2025-05-25)

The Task Details page (`/app/projly/tasks/[id]/page.tsx`) has been refactored to improve code quality and maintainability by removing unused functions and variables while preserving all functionality and UI elements.

### Key Improvements

1. **Separation of Concerns**: 
   - Removed edit functionality that was duplicated from the dedicated edit page
   - Established clear boundaries between viewing (detail page) and editing (edit page) responsibilities

2. **Code Cleanup**:
   - Removed unused functions: `handleDeleteSubTask`, `fetchSubTasksRecursive`, `renderStatusBadge`, `handleChange`, `handleSubmit`
   - Removed unused variables like `idToTask` in the `getTaskSubtree` function
   - Preserved all UI functionality and component structure

3. **Architecture Benefits**:
   - Reduced file size and complexity

## Board View Implementation (Added 2025-05-29)

A new Kanban-style board view has been implemented for the Tasks page, providing users with a visual way to manage tasks and update their status through drag-and-drop interactions.

### Key Features

1. **View Mode Toggle**:
   - Users can switch between list and board views using a toggle in the page header
   - View preference is persisted in localStorage for a consistent user experience

2. **Status Columns**:
   - Tasks are organized into columns by status (Not Started, In Progress, In Review, etc.)
   - Each column shows a count of tasks with that status
   - Visual indicators for empty columns

3. **Drag-and-Drop Functionality**:
   - Tasks can be dragged between status columns to update their status
   - Visual feedback during drag operations
   - Immediate status updates in the backend

4. **Task Cards**:
   - Compact visual representation of tasks
   - Shows key information: title, assignee, due date, project
   - Visual indicators for subtasks
   - Consistent status color coding

### Implementation Details

1. **Component Structure**:
   ```
   TasksContainer
   ├── View Mode Toggle
   └── TasksBoard
       └── StatusColumn (for each status)
           └── TaskCard (for each task)
   ```

2. **Drag-and-Drop Implementation**:
   - Uses React DnD (react-dnd) for drag-and-drop functionality
   - Implements drag sources (task cards) and drop targets (status columns)
   - Updates task status via the tasksService when a task is dropped in a new column

3. **Code Example**:
   ```typescript
   // In TasksBoard.tsx - Status column drop target
   const [{ isOver }, drop] = useDrop({
     accept: ItemTypes.TASK,
     drop: (item: { id: string }) => {
       onTaskDrop(item.id, status);
     },
     collect: (monitor) => ({
       isOver: !!monitor.isOver(),
     }),
   });

   // In TaskCard.tsx - Task drag source
   const [{ isDragging }, drag] = useDrag({
     type: ItemTypes.TASK,
     item: { id: task.id },
     collect: (monitor) => ({
       isDragging: !!monitor.isDragging(),
     }),
   });
   ```

4. **Status Update Logic**:
   ```typescript
   const handleTaskDrop = async (taskId: string, newStatus: string) => {
     try {
       await tasksService.updateTask(taskId, { status: newStatus });
       // Refresh task list
       onOperationComplete();
     } catch (error) {
       console.error('Error updating task status:', error);
     }
   };
   ```

### Benefits

- **Improved Visualization**: Users can see task distribution across different statuses at a glance
- **Efficient Status Updates**: Drag-and-drop provides a more intuitive way to update task status
- **Consistent Experience**: Board view maintains the same filtering capabilities as the list view
- **Enhanced Productivity**: Kanban-style workflow supports agile project management methodologies

## Subtask Deletion and UI Refresh Fix (Added 2025-05-26)

A critical issue was identified and fixed where the subtask list in the task details page wasn't automatically refreshing after a subtask was deleted. The solution implements a robust two-phase state update pattern that ensures consistent UI updates.

### Implementation Details

1. **Enhanced `refreshSubTasks` Function**:
   - Implemented a two-phase state update pattern to force proper UI re-rendering
   - First clears the subtask list to ensure immediate visual feedback
   - Uses a deferred update with a short timeout to ensure React's state batching doesn't interfere
   - Adds deep cloning of task data to ensure React detects the change as new data
   - Includes error handling with fallback mechanisms

2. **Connection to Task Container**:
   - Proper connection of the `onDataChange` callback to ensure the `refreshSubTasks` function is called after any subtask operations
   - Ensures consistent behavior between task deletion in task detail pages and project detail pages

3. **Technical Implementation**:
   ```typescript
   // Two-phase state update pattern for reliable UI refresh
   setSubTasks([]); // First clear the state
   
   // Then set the new state after a short delay
   setTimeout(() => {
     // Deep clone to ensure React treats this as new data
     const subtreeCopy = JSON.parse(JSON.stringify(subtree));
     setSubTasks(subtreeCopy as ProjlyTaskData[]);
   }, 50);
   ```

4. **Error Handling**:
   - Added additional error handling for the JSON parsing operations
   - Implemented a fallback mechanism using array spread operator if JSON operations fail
   - Improved readability and maintainability
   - Better adherence to the single responsibility principle
   - Clearer separation between task detail viewing and editing workflows

### Implementation Details

The Task Details page now focuses solely on displaying task information and managing sub-tasks through the centralized `TasksTable` component, while delegating editing functionality to the dedicated edit page:

```typescript
// Navigation to edit page (simplified):
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    router.push(`/projly/tasks/${taskId}/edit`);
  }}
>
  <Edit className="h-4 w-4 mr-2" />
  Edit
</Button>
```

This clean separation ensures that:
- The detail page focuses exclusively on displaying information
- The edit page handles all form state and submission logic
- No duplication of edit functionality across multiple files
- Clear user workflow with distinct viewing and editing modes

## Task Navigation System (Added 2025-05-24)

A new navigation utility system has been implemented to enhance user experience when navigating between tasks, especially in complex scenarios involving task hierarchies and edit flows.

### Navigation Utilities

The utilities are located in `/app/projly/utils/navigation-utils.ts` and provide the following features:

1. **Intelligent Back Navigation**: The `handleIntelligentBackNavigation` function prevents navigation loops and provides a smooth user experience:

```typescript
function handleIntelligentBackNavigation(
  router: MinimalRouter, 
  taskId: string, 
  log: LogFunction = console.log
): void
```

- Prevents infinite loops between task detail and edit pages
- Detects parent-child task navigation patterns to avoid circular navigation
- Falls back to the tasks list when no safe navigation target is found
- Maintains navigation history for smarter decision-making

2. **Navigation History Management**: The `updateNavigationHistory` function maintains a history of page visits in session storage:

```typescript
function updateNavigationHistory(
  path: string,
  maxHistoryLength: number = 10,
  log: LogFunction = console.log
): void
```

- Stores navigation paths in session storage
- Prevents duplicate consecutive entries
- Limits history size to prevent memory issues

### Implementation

The navigation utilities have been integrated into both the Task Detail and Task Edit pages:

```typescript
// Task detail page back button
<Button
  onClick={() => handleIntelligentBackNavigation(router, task.id)}
  variant="ghost"
  className="mr-2"
>
  <ArrowLeft className="mr-2 h-4 w-4" />
  Back
</Button>

// Task edit page back button
<Button
  onClick={() => handleIntelligentBackNavigation(router, taskId)}
  variant="ghost"
  className="mr-2"
>
  <ArrowLeft className="mr-2 h-4 w-4" />
  Back
</Button>
```

In addition, both pages use the `updateNavigationHistory` function in a `useEffect` hook to track page visits:

```typescript
useEffect(() => {
  const currentPath = `/projly/tasks/${taskId}`;
  updateNavigationHistory(currentPath);
}, [taskId]);
```

### Benefits

- **Improved UX**: Users can navigate confidently without getting stuck in navigation loops
- **Consistent Behavior**: Navigation works the same way across all task-related pages
- **Easier Maintenance**: Navigation logic is centralized for easier updates
- **Better Debugging**: Detailed logs help diagnose navigation issues

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
