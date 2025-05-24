# Projly Task Service

> **Updated:** 2025-05-24

## Overview

The Task Service provides a centralized API for managing tasks and sub-tasks in the Projly application. It handles all task-related operations including creation, retrieval, updating, and deletion of tasks and sub-tasks.

This service consolidates the previous implementations (`task-service.ts` and `projlyTasksService` from `index.ts`) into a single, consistent API with improved error handling and logging.

## Key Components

### Files Structure

- `/lib/services/projly/tasks/tasks-service.ts` - Main service implementation
- `/lib/services/projly/use-tasks.ts` - React hooks for task operations

### Service Exports

The service provides three different exports for backward compatibility:

```typescript
// Main export (recommended for new code)
export const tasksService = new TasksService();

// For backward compatibility with existing code
export const taskService = tasksService;
export const projlyTasksService = tasksService;
```

## Technical Details

### Task Operations

The service provides the following core operations:

#### Task Retrieval

```typescript
// Get all tasks with optional filters
async getTasks(filters?: TaskFilters): Promise<Task[]>

// Get a specific task by ID
async getTaskById(id: string): Promise<Task | null>

// Get tasks for the current user
async getMyTasks(): Promise<Task[]>

// Get all user tasks
async getUserTasks(): Promise<Task[]>

// Get tasks for a specific project
async getProjectTasks(projectId: string): Promise<Task[]>
```

#### Task Management

```typescript
// Create a new task
async createTask(taskData: Omit<Task, 'id'>): Promise<Task>

// Update an existing task
async updateTask(id: string, taskData: Partial<Task>): Promise<Task>

// Delete a task
async deleteTask(id: string): Promise<void>
```

### Sub-Task Handling

Sub-tasks are managed using the same API as regular tasks, but with the `parentTaskId` property set to reference the parent task. The API provides specialized handling for sub-tasks:

- When creating a sub-task, set the `parentTaskId` property to the ID of the parent task
- When retrieving tasks, you can filter to include only sub-tasks of a specific parent task
- Sub-tasks can have their own assignees, due dates, and statuses independent of the parent task

```typescript
// Example: Creating a sub-task
const subTaskData = {
  title: "Sub-task title",
  description: "Sub-task description",
  status: "Not Started",
  projectId: "project-id",
  parentTaskId: "parent-task-id" // Reference to parent task
};

const createdSubTask = await tasksService.createTask(subTaskData);
```

### Error Handling

The service implements consistent error handling with detailed logging:

- Authentication errors when token is missing
- API errors with detailed error messages
- Network errors with proper error propagation
- Validation errors for invalid task data

All errors are logged with the `[TasksService]` prefix for easy filtering in logs.

## Integration Points

### With React Hooks

The service is used by the `use-tasks.ts` hooks for React components:

```typescript
// In a React component
import { useTasks, useTask, useCreateTask, useUpdateTask, useDeleteTask } from '@/lib/services/projly';

// Get all tasks
const { data: tasks, isLoading } = useTasks();

// Get a specific task
const { data: task } = useTask(taskId);

// Create a task
const createTaskMutation = useCreateTask();
createTaskMutation.mutate(taskData);

// Update a task
const updateTaskMutation = useUpdateTask();
updateTaskMutation.mutate({ id: taskId, data: updatedData });

// Delete a task
const deleteTaskMutation = useDeleteTask();
deleteTaskMutation.mutate(taskId);
```

### With Task Forms

The service is used in task creation and editing forms like `CreateTaskForm.tsx`:

```typescript
// In CreateTaskForm.tsx
import { tasksService } from '@/lib/services/projly/tasks/tasks-service';

// Example: form submission handler
const onSubmit = async (data) => {
  try {
    const createdTask = await tasksService.createTask(data);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## Recent Updates (2025-05-24)

- Consolidated duplicate task service implementations into a single service
- Fixed response handling to correctly process API responses
- Added robust error handling with detailed logging
- Improved type safety with TypeScript interfaces
- Added backward compatibility for existing code references

## Security & Best Practices

- All API calls verify authentication token before proceeding
- All API calls use proper error handling
- Service uses consistent logging for debugging
- API responses are properly typed for type safety
- Authentication headers are automatically included in all requests
