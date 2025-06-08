# Projly Task Edit Page
*Updated: 2025-06-08*

## Overview
This directory contains the task editing page for the Projly application. The form has been refactored to use modular components for better maintainability and reusability.

## Key Components

### Page Structure
- `page.tsx` - Main task editing page that orchestrates the form components and handles API interactions

### Form Field Components
The task edit page uses reusable form field components located in `/app/projly/components/tasks/form-fields/`:

- **TitleField** - For editing the task title
- **DescriptionField** - For editing the task description
- **ProjectField** - For changing the associated project
- **StatusField** - For updating the task status
- **PriorityField** - For modifying the task priority level
- **AssigneeField** - For reassigning the task to different team members
- **ParentTaskFieldWithToggle** - Specialized component for selecting a parent task with a toggle to show all tasks
- **DateField** - Reusable component used for both start and due dates
- **EditFormButtons** - Form action buttons specific to edit operations (Save Changes, Cancel)

## Technical Details

### Component Architecture
Each form field component:
1. Follows a consistent props pattern to ensure compatibility across different forms
2. Handles its own rendering logic with proper validation
3. Includes detailed logging for debugging purposes
4. Maintains separation of UI and business logic

### State Management
The edit page maintains central state management while delegating UI rendering to form components:
- The page loads existing task data from the API
- State is managed through React hooks at the page level
- Changes are propagated to components via props
- Form submission updates the task via the task service API

### Navigation
The edit page implements intelligent navigation handling:
- Uses `handleIntelligentBackNavigation` for back button functionality
- Maintains navigation history to improve user experience
- Provides clear cancellation options

### Project-Task Relationship
The edit page handles hierarchical task relationships:
- Parent task selection with toggle for showing all tasks or only top-level tasks
- Filtering of task lists to prevent circular parent-child relationships
- Dynamic loading of project members when the project selection changes

## Integration Points
The form integrates with:
- Task update API through `projlyTasksService`
- Project data through `projlyProjectsService`
- User authentication through `projlyAuthService`
- Team member data through the `useAccessibleProjectMembers` hook

## Usage Examples

```typescript
// Example of loading a task for editing
const initPage = async () => {
  try {
    const isAuthenticated = await projlyAuthService.isAuthenticated();
    if (!isAuthenticated) {
      router.push('/projly/login');
      return;
    }
    
    // Load task data
    const taskData = await projlyTasksService.getTask(taskId);
    
    // Load related data (projects, members, parent tasks)
    const projectsData = await projlyProjectsService.getProjects();
    
    // Update form state with task data
    setTaskForm({
      id: taskData.id,
      title: taskData.title,
      description: taskData.description,
      // ... other fields
    });
  } catch (error) {
    // Error handling
  }
};
```

## Related Documentation
- [Task Creation Form](/app/projly/tasks/new/README.md)
- [Task Form Field Components](/app/projly/components/tasks/form-fields/README.md)
- [Navigation Utilities](/app/projly/utils/navigation-utils/README.md)
