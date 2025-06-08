# Task Details Page Documentation

## Overview
This directory contains the implementation of the Task Details page for the Projly application. The page displays detailed information about a specific task, including its properties, sub-tasks, and activity log.

## Key Components

- **TaskDetailsPage**: The main page component located at `page.tsx`. It handles the overall layout and state management for the task details view.
- **Reusable UI Components**: Located in `../../../components/tasks/details/`, these components are used to build the Task Details UI in a modular way:
  - **TaskActionButtons**: Renders action buttons like Back, Edit, and Delete.
  - **TaskHeader**: Displays the task title and ID.
  - **TaskDetailsContent**: Shows the main content of task details such as description, status, dates, and assignee.
  - **ActivityContent**: Displays the activity log with timestamps for updates and creation.
  - **SubTasksContent**: Manages the display of sub-tasks using `TasksContainer` with options for hierarchy and compactness.
  - **TaskDeleteDialog**: A confirmation dialog for deleting a task.

## Technical Details

- **State Management**: The `TaskDetailsPage` manages state for task data (`taskForm`), sub-tasks (`subTasks`), projects (`projects`), and project members (`projectMembers`). It uses hooks like `useProjectMembers` for data fetching.
- **Type Mapping**: Due to type discrepancies between `ProjlyTaskData` and `Task`, a utility function `mapToTask` is used to ensure type compatibility when passing data to components like `SubTasksContent`.
- **Navigation**: Utilizes `useRouter` and custom navigation utilities (`handleIntelligentBackNavigation`, `updateNavigationHistory`) for smart navigation within the Projly app.
- **UI Framework**: Built with Next.js, React, and Tailwind CSS, using shadcn/ui components for consistent UI elements (Cards, Tabs, Buttons, Dialogs).

## Usage Examples

```typescript
// Example of how TaskDetailsPage fetches and displays task data
import { projlyTasksService } from '@/lib/services/projly';
const taskData = await projlyTasksService.getTaskById(taskId);
setTaskForm({
  id: taskData.id,
  title: taskData.title,
  // ... other properties
});

// Example of rendering a reusable component
<TaskDetailsContent 
  task={taskForm}
  projects={projects}
  projectMembers={projectMembers}
  parentTask={parentTask}
  isLoadingMembers={isLoadingMembers}
/>
```

## Integration Points

- **API Services**: Integrates with `projlyTasksService`, `projlyProjectsService`, and `projlyAuthService` for data operations.
- **Hooks**: Uses custom hooks like `useProjectMembers` and `useToast` for accessing project member data and showing notifications.
- **Dynamic Routing**: Leverages Next.js dynamic routing with `[id]` to load specific task details.

## Recent Updates (2025-06-08)
- Refactored the Task Details page to use modular, reusable components for improved maintainability.
- Addressed type compatibility issues between different task data structures.
