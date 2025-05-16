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

## Registration Flow (Updated 2025-05-16)

1. User fills out registration form with email, password, and optional profile information
2. Frontend performs initial validation:
   - Checks required fields (email, password)
   - Validates email format
   - Ensures password meets strength requirements (minimum 8 characters)
3. Form data submitted to backend via `projlyAuthService.register()`
4. Backend performs additional validation and creates user account
5. User receives feedback based on registration result:
   - Success: Redirected to login page with success message
   - Validation Error: Form displays specific error messages
   - Duplicate Email: Form shows "Email already in use" message
   - Server Error: Generic error message with retry option

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

## Documentation Structure

### Core Architecture
- [Prisma Schema Documentation](/service.freetool.online/prisma/README.md) - Database models and relationships
- [Services Documentation](/service.freetool.online/lib/services/README.md) - Business logic implementation

### Authentication System
- [Authentication API Documentation](/service.freetool.online/app/api/projly/auth/README.md) - Auth endpoints and flow
- [Authentication Service Documentation](/service.freetool.online/lib/services/prisma/auth.README.md) - Auth business logic
- [JWT Middleware Documentation](/service.freetool.online/app/api/projly/middleware/jwtAuth.README.md) - Token management
- [CORS Helper Documentation](/service.freetool.online/lib/cors/cors-helper.README.md) - CORS handling implementation

### API Documentation
- [Auth Routes Documentation](/service.freetool.online/app/api/projly/auth/README.md) - Authentication endpoints
- [Projects Routes Documentation](/service.freetool.online/app/api/projly/projects/README.md) - Project management endpoints
- [Tasks Routes Documentation](/service.freetool.online/app/api/projly/tasks/README.md) - Task management endpoints
- [Teams Routes Documentation](/service.freetool.online/app/api/projly/teams/README.md) - Team management endpoints
- [Profiles Routes Documentation](/service.freetool.online/app/api/projly/profiles/README.md) - Profile management endpoints

### Service Layer
- [Prisma Services Documentation](/service.freetool.online/lib/services/prisma/README.md) - Database service implementations
- [Auth Service Documentation](/service.freetool.online/lib/services/prisma/auth.README.md) - Authentication service details
- [Projects Service Documentation](/service.freetool.online/lib/services/prisma/projects.README.md) - Project service implementation
- [Tasks Service Documentation](/service.freetool.online/lib/services/prisma/tasks/README.md) - Task service implementation
- [Teams Service Documentation](/service.freetool.online/lib/services/prisma/teams/README.md) - Team service implementation
- [Profiles Service Documentation](/service.freetool.online/lib/services/prisma/profiles.README.md) - Profile service implementation

### Frontend Integration
- [Frontend Services Documentation](/freetool.online/lib/services/projly/README.md) - API hooks and service implementations
- [Authentication Adapter Documentation](/freetool.online/lib/services/projly/auth/README.md) - Auth integration details
- [API Configuration Documentation](/freetool.online/lib/services/projly/api-config/README.md) - API setup and configuration
- [Error Handling Documentation](/freetool.online/lib/services/projly/error-handling/README.md) - Error management implementation
- [State Management Documentation](/freetool.online/lib/services/projly/state/README.md) - State management patterns
- [UI Components Documentation](/freetool.online/components/projly/README.md) - Reusable UI components
- [Hooks Documentation](/freetool.online/hooks/projly/README.md) - Custom React hooks implementation
- [Utils Documentation](/freetool.online/lib/utils/projly/README.md) - Utility functions and helpers

### Frontend Services
- [Frontend Services Documentation](/lib/services/projly/README.md) - Frontend service implementations
- [Authentication Adapter Documentation](/lib/services/projly/jwt-auth-adapter.README.md) - Frontend auth integration
- [API Configuration Documentation](/lib/services/projly/api-config.README.md) - API integration details

## Integration with Backend

### API Migration Strategy (Updated 2025-05-16)

The backend API is being gradually migrated from Express-style routers to Next.js App Router patterns. During this migration, the following approach is being taken to ensure smooth frontend integration:

1. **Backward Compatibility Endpoints**: Legacy endpoints are maintained during migration to avoid breaking frontend integrations
2. **Phased Migration**: APIs are migrated one module at a time, starting with the profiles API
3. **Consistent Response Formats**: All endpoints maintain the same response structure and data formats

#### Current Migration Status

- **Profiles API**: Migrated to Next.js App Router pattern with backward compatibility endpoints
  - New endpoints: `/api/projly/profiles/me`, `/api/projly/profiles/[id]`
  - Legacy endpoint (still works): `/api/projly/auth/profile`
- **Other APIs**: Will be migrated in future phases

#### Frontend Integration Guidelines

- Existing frontend code will continue to work with backward compatibility endpoints
- New frontend features should use the new API structure
- The API configuration (`apiConfig.ts`) will be updated gradually to point to new endpoints

### API Integration

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
