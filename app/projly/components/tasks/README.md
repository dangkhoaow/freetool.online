# Task Components Documentation

> **Updated:** 2025-05-24 (Full Hierarchical Task Display Implementation)

## Overview
The task components provide the UI for managing tasks in the Projly application, with a centralized approach to task hierarchy and filtering. The system maintains consistent functionality across different views (main tasks page, project tasks, and subtasks) through reusable components and hooks. The UI features comprehensive visual indicators for multi-level sub-tasks, preserves parent-child relationships during filtering/sorting, and offers flexible task hierarchy display options with unlimited nesting depth.

## Components

### TasksContainer
**New centralized container component added 2025-05-24**

A reusable container for displaying tasks in different contexts:
```typescript
interface TasksContainerProps {
  // Context type determines behavior and UI
  context: 'main' | 'project' | 'task';
  // ID of the parent entity (project ID for project context, task ID for task context)
  parentId?: string;
  // Initial task data (passed from parent)
  initialTasks?: ProjlyTask[];
  // Whether to load tasks automatically (default: true)
  autoLoad?: boolean;
  // Optional initial filters
  initialFilters?: TaskFilters;
  // Display options
  displayOptions?: {
    showHeader?: boolean;
    showAddButton?: boolean;
    compact?: boolean;
    title?: string;
  };
  // Optional hierarchy options
  hierarchyOptions?: TaskHierarchyOptions;
  // Callback when data changes
  onDataChange?: (tasks: ProjlyTask[]) => void;
}
```

Features:
- Context-aware behavior (main tasks, project tasks, subtasks)
- Consistent filtering and loading across contexts
- Automatic parent-child relationship preservation
- Loading and error states management
- Task creation dialog integration
- Compatible with the useTaskHierarchy hook

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
- Multi-level indentation for sub-tasks with dynamically colored left borders based on nesting level
- Tree-style connector lines (└─) with increasing indentation for deeper levels
- Full hierarchical visualization for n+2, n+3, etc. subtasks directly under their parent tasks
- Adaptive visual styling with increasing indentation proportional to task depth
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

## Centralized Task Management (Updated 2025-05-24)

### TasksContainer Implementation

The `TasksContainer` component serves as a reusable solution that centralizes task display logic across different contexts:

```typescript
export function TasksContainer({
  context = 'main',
  parentId,
  initialTasks,
  autoLoad = true,
  initialFilters = {},
  displayOptions = {
    showHeader: true,
    showAddButton: true,
    compact: false,
    title: 'Tasks'
  },
  hierarchyOptions = {
    maxDepth: 1,
    showAllSubtasks: false
  },
  onDataChange
}: TasksContainerProps) {
  // Component implementation with filtering and hierarchy management
}
```

This container centralizes:
- Task loading and filtering logic with recursive subtask fetching
- Error handling and loading states
- Filter management and persistence
- Comprehensive task hierarchy visualization for tasks at any nesting level
- Add task dialog integration
- Support for unlimited nesting depth of subtasks

### Integration with useTaskHierarchy Hook

The `TasksContainer` uses the `useTaskHierarchy` hook to maintain consistent hierarchy management for tasks at any nesting level:

```typescript
// Determine effective hierarchy options based on context
const effectiveHierarchyOptions: TaskHierarchyOptions = {
  ...hierarchyOptions,
  // For project context, filter by project ID
  projectId: context === 'project' ? parentId : null,
  // For task context, filter by parent task ID
  parentTaskId: context === 'task' ? parentId : null,
  // For task context, always show all subtasks
  showAllSubtasks: context === 'task' ? true : hierarchyOptions.showAllSubtasks
};

// Use the task hierarchy hook
const {
  tasks: filteredTasks,
  getTaskDepth,
  isParentTask,
  getSubtaskCount
} = useTaskHierarchy(rawTasks, effectiveHierarchyOptions);
```

## Technical Implementation Details

### Full Hierarchical Task Organization

The task hierarchy is now managed through a comprehensive approach that supports unlimited nesting depth in `TasksTable.tsx`:

```typescript
// Helper function to organize tasks into a complete hierarchy showing ALL nested levels
export const organizeTasksHierarchy = (tasks: Task[], sortBy: { field: string; direction: "asc" | "desc" }): Task[] => {
  console.log('[TASKS TABLE] Organizing tasks into full hierarchy with ALL nested levels');
  
  // Create a map for tracking parent-child relationships
  const parentTaskMap = new Map<string, Task[]>();
  const taskLevels = new Map<string, number>(); // Track nesting level for each task
  
  // First pass - identify all tasks and determine their level
  tasks.forEach(task => {
    // Initialize all tasks as level 0 (top level)
    if (!taskLevels.has(task.id)) {
      taskLevels.set(task.id, 0);
    }
    
    // If task has a parent, set its level and add to parent's children
    if (task.parentTaskId) {
      // This is a child task
      if (!parentTaskMap.has(task.parentTaskId)) {
        parentTaskMap.set(task.parentTaskId, []);
      }
      
      // Add to parent's children list
      parentTaskMap.get(task.parentTaskId)?.push(task);
      
      // Find the parent's level and set this task's level to parent+1
      const parentLevel = taskLevels.get(task.parentTaskId) || 0;
      taskLevels.set(task.id, parentLevel + 1);
    }
  });
  
  // Recursive function to add a task and all its descendants in hierarchical order
  const addTaskWithDescendants = (task: Task, parentLevel: number) => {
    // Add the task itself
    organizedTasks.push(task);
    taskLevels.set(task.id, parentLevel);
    
    // Get all children of this task
    const children = parentTaskMap.get(task.id) || [];
    if (children.length > 0) {
      // Recursively add each child and its descendants
      children.forEach(child => {
        addTaskWithDescendants(child, parentLevel + 1);
      });
    }
  };
  
  // Process each top-level task and all its descendants recursively
  topLevelTasks.forEach(task => {
    addTaskWithDescendants(task, 0);
  });
  
  // Store the calculated levels for easier access during rendering
  organizedTasks.forEach(task => {
    if (!task._meta) task._meta = {};
    task._meta.level = taskLevels.get(task.id) || 0;
  });
  
  return organizedTasks;
};
```

### Enhanced Task Interface

The Task interface was enhanced to store metadata about its position in the hierarchy:

```typescript
export interface Task {
  // Existing properties...
  
  // New metadata field for hierarchy information
  _meta?: {
    level?: number;  // Store the task nesting level for UI purposes
    [key: string]: any;
  };
}
```

### Task Data Flow with Recursive Loading

The process for fetching and displaying tasks now includes recursive loading of n+2 level subtasks:

1. `TasksContainer` initiates the data flow with the new `recursiveSubtasks` option

2. In the task details page, a recursive function loads all levels of subtasks:

```typescript
// Recursive function to load subtasks for each task
const loadSubTasksRecursive = async (parentTask: ProjlyTaskData) => {
  try {
    const subTasks = await projlyTasksService.getTask(parentTask.id);
    if (subTasks?.subTasks && subTasks.subTasks.length > 0) {
      // Process each subtask recursively
      for (const subTask of subTasks.subTasks) {
        await loadSubTasksRecursive(subTask as ProjlyTaskData);
      }
    }
  } catch (error) {
    console.error(`Error loading subtasks for task ${parentTask.id}:`, error);
  }
};
```

3. The `refreshSubTasks` function in task detail page now supports recursive loading:

```typescript
const refreshSubTasks = async () => {
  try {
    setIsLoading(true);
    const subTasksData = await projlyTasksService.getTask(taskId);
    
    if (subTasksData?.subTasks && Array.isArray(subTasksData.subTasks)) {
      // Create a copy to avoid modifying the original data
      const subTasksList = [...subTasksData.subTasks] as ProjlyTaskData[];
      
      // If recursive loading is enabled, load nested subtasks
      if (recursiveSubtasks) {
        for (const subTask of subTasksList) {
          await loadSubTasksRecursive(subTask);
        }
      }
      
      setSubTasks(subTasksList);
    }
  } catch (error) {
    console.error('Error refreshing subtasks:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### Dynamic Hierarchical Rendering

The `TasksTable` component now displays tasks with adaptive styling based on their nesting level:

```tsx
<TableCell className="font-medium">
  <div className={`flex items-center ${task._meta?.level && task._meta.level > 0 ? 
    `pl-${Math.min(task._meta.level * 6, 12)} border-l-4 border-blue-${Math.min(task._meta.level * 100, 400)}` : ''}`}>
    {task._meta?.level && task._meta.level > 0 && (
      <span className="text-gray-400 mr-2">
        {task._meta.level === 1 ? '└─' : '└─'.padStart(task._meta.level + 1, '─')}
      </span>
    )}
    {task.title}
    {task._meta?.level === 0 && taskRelationships.has(task.id) && !hideParentRow && (
      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 hover:bg-blue-100">
        {taskRelationships.get(task.id)?.length || 0} subtasks
      </Badge>
    )}
  </div>
</TableCell>
```

### Key Features

- **Full Hierarchical Display**: Shows all levels of subtasks (n+1, n+2, n+3, etc.) directly under their respective parent tasks
- **Dynamic Visual Styling**: Indentation and styling adapt based on the task's nesting level
- **Recursive Data Loading**: Automatically loads all subtasks at any nesting depth
- **Adaptive Tree Connectors**: Visually shows the hierarchical relationship between tasks
- **Circular Reference Detection**: Prevents infinite recursion in case of cyclic task references
- **Metadata Storage**: Caches calculated levels to optimize rendering
- **Dynamic Border Colors**: Uses color gradients based on nesting depth for better visualization
- Distinct users dropdown for filtering by specific assignees

## Usage Examples

### Using TasksContainer with Full Hierarchy Support
```tsx
// For the main tasks page with unlimited nesting depth
<TasksContainer 
  context="main"
  initialFilters={{ status: 'In Progress' }}
  hierarchyOptions={{ 
    maxDepth: Infinity,  // Support unlimited nesting depth
    showAllSubtasks: true
  }}
/>

// For a project's tasks tab with complete hierarchy
<TasksContainer 
  context="project"
  parentId={projectId}
  displayOptions={{ compact: true, title: 'Project Tasks' }}
  hierarchyOptions={{ 
    maxDepth: Infinity,  // Support unlimited nesting depth
    showAllSubtasks: true
  }}
/>

// For a task's subtasks with recursive loading
<TasksContainer 
  context="task"
  parentId={taskId}
  recursiveSubtasks={true}  // Enable loading of n+2, n+3, etc. levels
  hierarchyOptions={{ 
    maxDepth: Infinity,  // Support unlimited nesting depth
    showAllSubtasks: true
  }}
  displayOptions={{ title: 'Subtasks' }}
/>
```

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
- 2025-05-24: Implemented full hierarchical task display for n+2 level subtasks
- 2025-05-24: Enhanced task organization algorithm to support unlimited nesting depth
- 2024-03-21: Added sub-task UI components
- 2024-03-20: Enhanced task filtering
- 2024-03-19: Added progress indicators

## Related Documentation
- [Task Service](../../lib/services/projly/use-task.README.md)
- [Task API Integration](../../lib/services/projly/task-service.README.md)
- [UI Components](../README.md)
