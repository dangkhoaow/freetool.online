
# Tasks Components

This directory contains components related to task management in the application.

## Components

- **CreateTaskForm.tsx**: A form component for creating new tasks. It includes fields for title, description, project selection, due date, and status.
- **CreateTaskButton.tsx**: A button component that opens either a Dialog (on desktop) or a Drawer (on mobile) containing the task creation form.

## Features

- Responsive design that adapts to different screen sizes
- Form validation using zod schema
- Integration with the project's existing task management system
- Status selection with appropriate styling
- Date selection with calendar popup

## Usage

The `CreateTaskButton` can be placed anywhere in the application where users need to create tasks. Currently, it's used in the Dashboard page in two locations:
1. In the header section next to the "New Project" button
2. In the "Your Tasks" card header

## Dependencies

These components rely on:
- react-hook-form for form handling
- zod for validation
- shadcn UI components
- Lucide React for icons
