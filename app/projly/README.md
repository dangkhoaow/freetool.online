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
  - Profile-based project ownership
  - User lookup from profiles during project creation
- Task assignment and tracking
- Team collaboration
- Resource management

### User Management
- User status management (Active, Inactive, Deleted)
  - Site owners can activate/deactivate users
  - Status-based access control
  - Integration with authentication system
- User role management (site_owner, admin, regular_user)
- Team member invitation system
  - Email-based invitations for existing and new users
  - Automatic user creation for new invitees with 'Inactive' status
  - Email notifications with signup/login links
- User profile management

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
  - Handles profile-based owner selection
  - Displays user information from profiles

### Tasks
- `TasksList`: Lists tasks with filtering options
- `TaskDetails`: Detailed task information
- `TaskForm`: Task creation and editing
- `navigation-utils.ts`: Utilities for intelligent navigation between tasks
  - Prevents navigation loops between task views and edit pages
  - Handles parent-child task navigation scenarios
  - Maintains navigation history in session storage

### Teams
- `TeamsList`: Shows available teams
- `TeamMembers`: Displays team membership
- `TeamForm`: Team management form

## Recent Updates

### Latest Updates (2025-05-26)

Task management enhancements:
- Fixed critical issue with subtask list not refreshing after subtask deletion
- Implemented robust two-phase state update pattern for reliable UI refreshes
- Enhanced error handling with fallback mechanisms for state updates
- Ensured consistent behavior between task detail pages and project detail pages
- For full implementation details, see [Tasks Documentation](/app/projly/tasks/README.md)

### Previous Updates (2025-05-25)

Task component architecture improvements:
- Implemented task details page code cleanup for better separation of concerns
- Removed duplicated task editing functionality to improve maintainability
- Streamlined component responsibility boundaries between detail and edit views
- Reduced file complexity while preserving all UI elements and functionality

### Previous Updates (2025-05-24)

Enhanced task navigation system:
- Added new navigation utilities to improve user experience
  - Created centralized intelligent back navigation handling to prevent navigation loops
  - Implemented session storage-based navigation history tracking
  - Added parent-child task relationship detection in navigation
  - Extracted common navigation logic into reusable utility functions
- For details, see [Navigation Utils Documentation](/app/projly/utils/README.md)

### Previous Updates (2025-05-21)

Enhanced team member management:
- Added email-based team member invitation system
  - Allows inviting users by email address instead of selecting from existing users
  - Creates placeholder users for emails not yet in the system
  - Sends email notifications with appropriate links for signup or login
- Updated AddMemberForm component to use email input
- Added new API endpoint at `/api/projly/members/invite`
- Added email template for team invitations
- For details, see [Team Components Documentation](/freetool.online/app/projly/components/team/README.md)

Enhanced analytics dashboard:
- Implemented status-based color scheme for charts
- Added consistent color mapping for all status types and resource categories
- Improved data visualization with semantic colors
- Added comprehensive logging for debugging
- Integrated with backend analytics API endpoints

For details, see [Analytics Dashboard Documentation](/app/projly/dashboard/analytics/README.md).

Enhanced task management system:
- Added comprehensive sub-task functionality
  - Implemented parent-child task relationships in UI
  - Added task hierarchy display
  - Enhanced task filtering options
  - Added parent task selection in forms
- For details, see [Frontend Task Service Documentation](/lib/services/projly/use-task.README.md)

### Previous Updates (2025-05-20)

Implemented forgot password functionality:
- Added complete password reset flow with email integration
- Created secure token-based authentication for password resets
- Implemented client-side validation for passwords
- Added comprehensive logging for debugging

For details, see [Forgot Password Documentation](/freetool.online/app/projly/forgot-password/README.md).

### Previous Updates (2025-05-19)

Added support for user status management:
- Introduced a 'status' field (enum: Active, Inactive, Deleted) in the ProjlyUser model, with default 'Active' on registration.
- Updated login logic to restrict access for non-'Active' users, showing an error message.
- Enhanced UI in UserSettings for status toggling and access controls in Sidebar.
- Ensured consistent data fetching with hooks like useUserProfile and useUserRoles.

For details, see [User Status Documentation](/freetool.online/app/projly/user-status/README.md) if created, or related satellite files.

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
- [Layout Components Documentation](/app/projly/components/layout/README.md) - Layout structure and user role issues (Updated 2025-05-18)
- [Hooks Documentation](/freetool.online/hooks/projly/README.md) - Custom React hooks implementation
- [Utils Documentation](/freetool.online/lib/utils/projly/README.md) - Utility functions and helpers
- [Navigation Utils Documentation](/app/projly/utils/README.md) - Navigation utilities for preventing loops and tracking history (Updated 2025-05-24)

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

### Analytics System
- [Analytics Dashboard Documentation](/app/projly/dashboard/analytics/README.md) - Analytics UI and visualization
- [Analytics Hooks Documentation](/lib/services/projly/use-analytics.README.md) - Analytics data fetching hooks
- [Analytics Components Documentation](/app/projly/components/analytics/README.md) - Reusable analytics components

## Task Management
The task management system supports hierarchical task organization through parent-child relationships. For detailed documentation:
- [Task Service Documentation](../../lib/services/projly/use-task.README.md)
- [Task Components Documentation](./components/tasks/README.md)
- [Task API Integration](../../lib/services/projly/task-service.README.md)

## Recent Updates
- 2024-03-21: Added sub-task functionality for hierarchical task management
- 2024-03-20: Implemented task filtering and sorting
- 2024-03-19: Added task progress tracking

## Getting Started
1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Start the development server:
```bash
npm run dev
```

3. Access the application at http://localhost:3000

## Development Guidelines
- Follow TypeScript best practices
- Maintain component reusability
- Keep files under 300 lines
- Add proper error handling and logging
- Document all major changes

## Integration Points
- Backend API: service.freetool.online
- Authentication: JWT-based
- State Management: React Query
- UI Components: Custom components with shadcn/ui

## Security Considerations
- JWT token management
- Role-based access control
- Input validation
- XSS prevention

## Error Handling
- Global error boundary
- Toast notifications for user feedback
- Detailed error logging
- Graceful fallbacks

## Performance Optimization
- Code splitting
- Lazy loading
- Image optimization

## Caching Strategies

### Overview
The Projly application implements multiple caching mechanisms to improve performance and reduce redundant API calls. Caching is implemented at different levels with configurable expiration times via environment variables.

### Environment Configuration
Cache expiration times are configured in the `.env` file:

```
# Cache configuration
NEXT_PUBLIC_USER_CACHE_EXPIRY_MINUTES=5
NEXT_PUBLIC_USER_ROLE_CACHE_EXPIRY_MINUTES=5
NEXT_PUBLIC_PROJECT_LIST_CACHE_EXPIRY_MINUTES=1
```

### Implemented Caching Mechanisms

#### 1. Session Storage Caching
Session storage is used to cache frequently accessed data with configurable expiration times:

| Cache Type | Key | Expiration | Environment Variable |
|------------|-----|-----------|----------------------|
| User Data | `projly_user_cache` | 5 minutes | `NEXT_PUBLIC_USER_CACHE_EXPIRY_MINUTES` |
| User Role | `projly_user_role_cache` | 5 minutes | `NEXT_PUBLIC_USER_ROLE_CACHE_EXPIRY_MINUTES` |
| Projects List | `projly_projects_cache` | 1 minute | `NEXT_PUBLIC_PROJECT_LIST_CACHE_EXPIRY_MINUTES` |
| Authentication Status | `projly_auth_cache` | 5 minutes | `NEXT_PUBLIC_USER_CACHE_EXPIRY_MINUTES` |

#### 2. React Query Caching
React Query is used for more sophisticated caching with automatic invalidation:

| Query Key | Component | Stale Time | Refetch Behavior |
|-----------|-----------|------------|------------------|
| `['projects']` | `ProjectActivityTracker`, `TasksContainer` | 5 minutes | On mount, window focus |
| `['project-ownership', userId]` | `useProjectOwnership` hook | Default | On mount, window focus |
| `['tasks']` | Task components | Default | On mount, window focus |

### Cache Implementation Details

#### Session Storage Cache Structure
All session storage caches follow a consistent structure:
```typescript
{
  data: any, // The cached data
  expiry: number // Timestamp when the cache expires
}
```

#### Cache Helper Functions
Standardized helper functions are used across the application:

1. **Get Cache**:
   ```typescript
   const getCacheData = () => {
     try {
       if (typeof window === 'undefined') return null;
       const cachedData = sessionStorage.getItem('cache_key');
       if (!cachedData) return null;
       const { data, expiry } = JSON.parse(cachedData);
       if (new Date().getTime() > expiry) {
         sessionStorage.removeItem('cache_key');
         return null;
       }
       return data;
     } catch (error) {
       console.error('Error reading cache:', error);
       return null;
     }
   };
   ```

2. **Set Cache**:
   ```typescript
   const setCacheData = (data: any) => {
     try {
       if (typeof window === 'undefined') return;
       const expiryMinutes = process.env.CACHE_EXPIRY_ENV_VAR ? 
         parseInt(process.env.CACHE_EXPIRY_ENV_VAR) : 5;
       const expiry = new Date().getTime() + (expiryMinutes * 60 * 1000);
       sessionStorage.setItem('cache_key', JSON.stringify({ data, expiry }));
     } catch (error) {
       console.error('Error setting cache:', error);
     }
   };
   ```

### Cache Invalidation Strategies

1. **Automatic Expiration**: All caches automatically expire after their configured time
2. **Manual Invalidation**: Caches are manually invalidated on specific actions:
   - Project caches are invalidated when projects are created, updated, or deleted
   - User caches are invalidated on login, logout, or profile updates
   - React Query cache invalidation is triggered by the `queryClient.invalidateQueries()` method

### Logging
All cache operations include detailed logging for debugging:
- Cache hits and misses
- Cache expiration events
- Cache invalidation events
- Error handling during cache operations

### Recent Updates (2025-06-06)
- Added session storage caching for project API calls
- Implemented configurable cache expiration via environment variables
- Enhanced logging for all cache operations
- Standardized cache implementation patterns across the application

## Testing
- Unit tests for components
- Integration tests for API calls
- E2E tests for critical flows

## Deployment
- Vercel deployment
- Environment configuration
- Build optimization
- Monitoring setup
