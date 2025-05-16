# Projly Frontend Documentation

## Overview
The Projly frontend is a Next.js application that provides a modern, responsive user interface for project management. It follows a component-based architecture with React hooks for state management and data fetching.

## Directory Structure

```
app/projly/
├── page.tsx                # Root page (redirects to login or dashboard)
├── login/                  # Authentication pages
├── dashboard/              # Main dashboard
├── projects/               # Project management
├── tasks/                  # Task management
├── teams/                  # Team management
├── calendar/               # Calendar view
├── analytics/              # Analytics and reporting
├── profiles/               # User profiles
└── components/             # Shared components
    ├── layout/             # Layout components
    ├── projects/           # Project-specific components
    ├── tasks/              # Task-specific components
    ├── teams/              # Team-specific components
    ├── calendar/           # Calendar components
    ├── analytics/          # Analytics components
    ├── pages/              # Page management components
    ├── ProtectedRouteJWT.tsx  # Auth protection wrapper
    └── RoleProtectedRoute.tsx # Role-based protection
```

## Key Features

### Authentication and Authorization
- JWT-based authentication
- Protected routes with `ProtectedRouteJWT` component
- Role-based access control with `RoleProtectedRoute`

### Project Management
- Project creation, viewing, editing, and deletion
- Task assignment and tracking
- Team collaboration
- Resource management

### UI Components
- Modern UI with responsive design
- Dashboard layout with sidebar navigation
- Data tables with sorting and filtering
- Form components for data entry
- Charts and visualizations for analytics

### State Management
- React Query for server state management
- Local state with React hooks
- Toast notifications for user feedback

## Data Flow

1. **Data Fetching**: Custom hooks in `/lib/services/projly` make API calls
2. **State Management**: React Query manages cache, loading states, and refetching
3. **UI Rendering**: Components consume data from hooks
4. **User Interactions**: Actions trigger mutations (create, update, delete)
5. **Feedback**: Toast notifications inform users of operation results

## Authentication Flow

1. User enters credentials on login page
2. Credentials sent to backend via `projlyAuthService`
3. Upon success, JWT token stored in cookie
4. Protected routes check authentication status
5. Unauthorized access redirected to login page

## Key Components

### Layout
- `DashboardLayout`: Provides consistent layout with sidebar and header
- `Sidebar`: Navigation menu for different sections
- `Header`: Top bar with user actions and search

### Projects
- `ProjectsList`: Displays all accessible projects
- `ProjectDetails`: Shows detailed project information
- `ProjectForm`: Form for creating/editing projects

### Tasks
- `TasksList`: Lists tasks with filtering options
- `TaskDetails`: Detailed task information
- `TaskForm`: Task creation and editing

### Teams
- `TeamsList`: Shows available teams
- `TeamMembers`: Displays team membership
- `TeamForm`: Team management form

## Integration with Backend

The frontend connects to the backend API through custom hooks located in `/lib/services/projly/`. These hooks provide:

- Data fetching with proper loading/error states
- Mutation functions for creating, updating, and deleting data
- Automatic cache invalidation
- Error handling with toast notifications

For more details on the API hooks and services, see [Frontend Services Documentation](/lib/services/projly/README.md).

## Running Locally

To run the frontend locally:
```bash
cd /Users/ktran/Documents/Code/NewCode/freetool/freetool.online
npm run dev -- -p 3000
```

Access the application at http://localhost:3000/projly
