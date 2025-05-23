# Task Components Documentation

## Overview
The task components provide the UI for managing tasks in the Projly application, including support for hierarchical task organization through parent-child relationships.

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
- Task list display with sorting
- Sub-task filtering options
- Parent-child relationship visualization
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
- Indentation for sub-tasks
- Parent-child relationship indicators
- Collapsible sub-task sections
- Progress bars for parent tasks

### Parent Task Selection
- Dropdown with project tasks
- Validation feedback
- Clear selection option
- Search/filter functionality

### Filtering Options
- Toggle for sub-task visibility
- Parent task only view
- Combined filters with other criteria

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
