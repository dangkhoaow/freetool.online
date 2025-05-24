# Task Components Documentation

## Overview
The task components provide the UI for managing tasks in the Projly application, including support for hierarchical task organization through parent-child relationships. The UI features visual indicators for sub-tasks, preserves parent-child relationships during filtering/sorting, and offers flexible task hierarchy display options.

## Components

### TasksTable
Main component for displaying tasks in a table format:
```typescript
interface TasksTableProps {
  tasks: TaskWithRelations[];
  initialFilters?: TaskFilters;
  onOperationComplete?: (filters?: TaskFilters) => void;
}
```

Features:
- Task list display with sorting that preserves parent-child relationships
- Smart filtering that maintains task hierarchy in all views
- Visual indicators for sub-tasks (indentation, left border, tree lines)
- User-specific filtering with distinct user dropdown
- Progress indicators
- Action buttons for CRUD operations

### TaskForm
Form component for creating and updating tasks:
```typescript
interface TaskFormProps {
  initialData?: Task;
  projectId: string;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}
```

Features:
- Parent task selection dropdown
- Project-specific task filtering
- Validation for task hierarchy
- Status and priority selection
- Due date and assignment fields

### ParentTaskSelect
Component for selecting parent tasks:
```typescript
interface ParentTaskSelectProps {
  projectId: string;
  currentTaskId?: string;
  value?: string;
  onChange: (value: string) => void;
}
```

Features:
- Filters tasks by project
- Excludes current task and its sub-tasks
- Shows only valid parent tasks
- Handles selection changes

### TaskFilter
Component for filtering tasks:
```typescript
interface TaskFilterProps {
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
}
```

Features:
- Status filter
- Project filter
- Assignee filter
- Sub-task filter options:
  - Parent tasks only
  - Include sub-tasks
- Date range filter

## Sub-task UI Features

### Task Hierarchy Display
- Indentation for sub-tasks with left blue border
- Tree-style connector lines (└─) for visual parent-child relationship
- Consistent hierarchy visualization across all views
- Progress indicators for parent tasks reflecting sub-task status
- Badge indicator showing the number of subtasks for parent tasks

### Parent Task Selection
- Dropdown with project tasks (excludes current task and descendants)
- Validation feedback to prevent circular references
- Clear selection option
- Search/filter functionality

### Filtering and Sorting Features
- Dedicated dropdown for task hierarchy filtering:
  - "All Tasks" - shows all tasks without hierarchy filtering
  - "Parent Tasks Only" - shows only parent tasks (no sub-tasks)
  - "Include Sub-Tasks" - explicitly shows all tasks including sub-tasks
- Smart filtering that maintains parent-child relationships:
  - Parent tasks remain visible when any of their sub-tasks match filters
  - Sub-tasks remain visible when their parent matches filters
- Intelligent sorting that keeps sub-tasks grouped with their parents

## Task Hierarchy Implementation

### Recursive Task Level Calculation (Updated 2025-05-24)

The task hierarchy is managed using a recursive approach that accurately identifies the nesting level of each task:

```typescript
// Recursive function to calculate task depth
const calculateTaskDepth = (taskId: string, visited: Set<string> = new Set()): number => {
  // Base case: If we've already visited this task, there's a circular reference
  if (visited.has(taskId)) {
    return 0; // Break the circular reference by treating it as a top-level task
  }
  
  // Base case: If we've already calculated this task's depth, return it
  if (taskLevels.has(taskId)) {
    return taskLevels.get(taskId) || 0;
  }
  
  // Get the task object
  const task = taskMap.get(taskId);
  if (!task) return 0;
  
  // If it's a top-level task (no parent), its depth is 0
  if (!task.parentTaskId) {
    taskLevels.set(taskId, 0);
    return 0;
  }
  
  // Mark this task as visited to detect circular references
  const newVisited = new Set(visited);
  newVisited.add(taskId);
  
  // Recursively calculate the parent's depth and add 1 for this task's depth
  const parentDepth = calculateTaskDepth(task.parentTaskId, newVisited);
  const thisDepth = parentDepth + 1;
  
  // Store and return the calculated depth
  taskLevels.set(taskId, thisDepth);
  return thisDepth;
};
```

### Key Features

- **Accurate Depth Calculation**: Recursively traces the entire parent chain to determine exact nesting level
- **Circular Reference Detection**: Prevents infinite recursion in case of cyclic task references
- **Task Level Filtering**: Only shows top-level tasks (level 0) and direct children (level 1) in the main task list
- **Filter Implementation**: Tasks with depth > 1 are filtered out of the main list view
- **Caching**: Stores calculated depths to avoid redundant calculations

### Task Page Implementation

The task page (`/app/projly/tasks/page.tsx`) filters tasks before rendering:

```typescript
// Filter out deeply nested subtasks before setting state
const filteredTasks = filterNestedTasks(userTasks);
```

This ensures that deeply nested tasks (level 2+) don't appear in the main task list view, keeping the UI clean and focused on the most important tasks.
- Distinct users dropdown for filtering by specific assignees

## Usage Examples

### Basic Task List
```tsx
<TasksTable 
  tasks={tasks}
  initialFilters={{ includeSubTasks: true }}
  onOperationComplete={handleRefresh}
/>
```

### Task Creation Form
```tsx
<TaskForm
  projectId="123"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

### Parent Task Selection
```tsx
<ParentTaskSelect
  projectId="123"
  currentTaskId="456"
  value={parentTaskId}
  onChange={handleParentChange}
/>
```

## Styling
- Uses shadcn/ui components
- Consistent spacing and alignment
- Clear visual hierarchy
- Responsive design

## Error Handling
- Form validation messages
- API error displays
- Loading states
- Empty state handling

## Recent Updates
- 2024-03-21: Added sub-task UI components
- 2024-03-20: Enhanced task filtering
- 2024-03-19: Added progress indicators

## Related Documentation
- [Task Service](../../lib/services/projly/use-task.README.md)
- [Task API Integration](../../lib/services/projly/task-service.README.md)
- [UI Components](../README.md)
