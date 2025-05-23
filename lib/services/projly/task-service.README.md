# Task Service Documentation

## Overview
The task service provides a comprehensive solution for task management in the Projly application, including API integration, hooks, and utilities for managing tasks with support for hierarchical organization through parent-child relationships.

## Key Features
- Task CRUD operations
- Sub-task management
- Task filtering and sorting
- Progress tracking
- Real-time updates
- Error handling and validation

## API Integration

### API Endpoints

#### GET /api/projly/tasks
Fetches tasks with optional filtering:
```typescript
interface TaskFilters {
  status?: string;
  projectId?: string;
  assignedTo?: string;
  dueDate?: Date;
  includeSubTasks?: boolean;
  parentOnly?: boolean;
}
```

#### POST /api/projly/tasks
Creates a new task:
```typescript
interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;
  assignedTo?: string;
  dueDate?: Date;
  startDate?: Date;
  status: string;
  priority?: string;
  parentTaskId?: string;
}
```

#### PUT /api/projly/tasks/[id]
Updates an existing task:
```typescript
interface UpdateTaskData {
  title?: string;
  description?: string;
  projectId?: string;
  assignedTo?: string;
  dueDate?: Date;
  startDate?: Date;
  status?: string;
  priority?: string;
  parentTaskId?: string;
}
```

#### DELETE /api/projly/tasks/[id]
Deletes a task and its sub-tasks.

## React Hooks

### useTasks
Fetches tasks with optional filtering:
```typescript
const { data: tasks, isLoading } = useTasks({
  projectId: "123",
  includeSubTasks: true,
  parentOnly: false
});
```

### useTask
Fetches a single task by ID:
```typescript
const { data: task } = useTask("task-id");
```

### useCreateTask
Creates a new task:
```typescript
const createTask = useCreateTask();
createTask.mutate({
  title: "New Task",
  projectId: "123",
  parentTaskId: "parent-id" // Optional
});
```

### useUpdateTask
Updates an existing task:
```typescript
const updateTask = useUpdateTask();
updateTask.mutate({
  id: "task-id",
  data: {
    status: "In Progress",
    parentTaskId: "new-parent-id" // Optional
  }
});
```

### useDeleteTask
Deletes a task:
```typescript
const deleteTask = useDeleteTask();
deleteTask.mutate("task-id");
```

## Helper Functions

### Task Progress
```typescript
function calculateTaskProgress(task: Task): number {
  if (!task.subTasks || task.subTasks.length === 0) {
    return 0;
  }
  const completedSubTasks = task.subTasks.filter(
    (subTask) => subTask.status === 'completed'
  ).length;
  return Math.round((completedSubTasks / task.subTasks.length) * 100);
}
```

### Parent Task Validation
```typescript
function validateParentTask(task: Task, parentTaskId: string): boolean {
  if (task.id === parentTaskId) return false;
  if (task.subTasks?.some(subTask => subTask.id === parentTaskId)) return false;
  return true;
}
```

### UI Helpers
```typescript
function getTaskStatusColor(status: string): string
function getTaskPriorityColor(priority: string): string
function formatTaskDate(date: Date | string | null | undefined): string
function isTaskOverdue(task: Task): boolean
```

## Sub-task Management

### Parent Task Validation
- Parent task must exist
- Parent task must be in the same project
- Parent task cannot be a sub-task
- No circular references allowed

### Task Hierarchy Rules
- Sub-tasks inherit project from parent
- Sub-tasks can be moved to different parent
- Parent task progress based on sub-tasks
- Sub-tasks can be deleted independently

## Error Handling

### Validation Errors
- Invalid parent task selection
- Project mismatch
- Circular reference
- Missing required fields

### API Errors
- Authentication errors
- Authorization errors
- Network errors
- Server errors

### Error Feedback
- Toast notifications for user feedback
- Console logging for debugging
- Error boundaries for component-level errors

## Recent Updates
- 2024-03-21: Merged task hooks into single file
- 2024-03-21: Added sub-task API support
- 2024-03-20: Enhanced task filtering
- 2024-03-19: Added progress tracking

## Related Documentation
- [Task Components](../../app/projly/components/tasks/README.md)
- [Backend API](../../service.freetool.online/app/api/projly/tasks/README.md) 