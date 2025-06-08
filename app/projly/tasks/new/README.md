# Projly Task Creation Form
*Updated: 2025-06-08*

## Overview
This directory contains the task creation page for the Projly application. The form has been refactored into modular components for better maintainability and reusability.

## Key Components

### Page Structure
- `page.tsx` - Main task creation page that orchestrates the form components

### Form Field Components
All form field components are located in `/app/projly/components/tasks/form-fields/`:

- **TitleField** - Handles the task title input field
- **DescriptionField** - Handles the task description text area
- **ProjectField** - Project selection dropdown
- **StatusField** - Task status selection dropdown
- **PriorityField** - Task priority selection dropdown
- **AssigneeField** - User assignment dropdown with loading states
- **ParentTaskField** - Parent task selection dropdown
- **DateField** - Reusable date picker for start and due dates
- **FormButtons** - Form action buttons (submit, cancel)

## Technical Details

### Component Architecture
Each form field component:
1. Accepts specific props for its functionality
2. Handles its own rendering logic
3. Includes logging for debugging
4. Returns a consistent UI structure

### State Management
The main page maintains central state management while the form field components are purely presentational, following a one-way data flow:
- Parent component provides values and change handlers
- Child components trigger callbacks when values change
- Parent updates state and passes new values back down

### Integration Points
The form components integrate with:
- Task creation API through `projlyTasksService`
- Project data through `projlyProjectsService`
- User authentication through `projlyAuthService`
- Team member data through the `useAccessibleProjectMembers` hook

## Usage Examples

```typescript
// Example of using a form field component
<TitleField 
  value={taskForm.title}
  onChange={(value) => handleChange('title', value)}
/>

// Example of handling form changes
const handleChange = (field: string, value: any) => {
  setTaskForm(prev => ({
    ...prev,
    [field]: value
  }));
  
  // Special handling for project selection
  if (field === 'projectId') {
    // Trigger member loading for the selected project
    refetchMembers();
  }
};
```

## Related Documentation
- [Task Components Documentation](/app/projly/components/tasks/README.md)
- [Project Management Core](/app/projly/README.md)
- [API Services Documentation](/lib/services/projly/README.md)
