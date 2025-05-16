# Projly Frontend Services Documentation

## Overview
This directory contains custom React hooks and service modules that facilitate communication between the frontend UI components and the backend API. These services abstract the API calls, handle authentication, manage state, and provide a consistent interface for data operations.

## Service Architecture

```
lib/services/projly/
├── jwt-auth-adapter.ts        # Authentication utilities
├── use-analytics.ts           # Analytics data hooks
├── use-members.ts             # Team membership hooks
├── use-mobile.tsx             # Mobile detection utilities
├── use-notifications.ts       # Notification system
├── use-pages-api.ts           # Pages API integration
├── use-pages.ts               # Content pages hooks
├── use-profile.ts             # User profile hooks
├── use-project-ownership.ts   # Project ownership checks
├── use-project-permissions.ts # Permission management
├── use-projects.ts            # Project management hooks
├── use-resources.ts           # Resource management hooks
├── use-search.ts              # Search functionality
├── use-storage.ts             # Storage utilities
├── use-tasks.ts               # Task management hooks
├── use-team.ts                # Team management hooks
├── use-toast.ts               # Toast notification utilities
├── use-user-extended.ts       # Extended user operations
└── use-user-roles.ts          # Role-based permissions
```

## Key Services

### Authentication (jwt-auth-adapter.ts) (Updated 2025-05-16)
- Manages JWT authentication state
- Provides enhanced registration with validation:
  - Email format validation using regex
  - Password strength validation (minimum 8 characters)
  - Comprehensive error handling with specific messages
- Secure login with proper error handling
- Password reset and change functionality
- Exposes current user session information
- Refreshes tokens automatically
- Detailed error feedback for better user experience

### Project Management (use-projects.ts)
- Fetch all accessible projects
- Get detailed project information
- Create new projects
- Update existing projects
- Delete projects
- Query project members

### Task Management (use-tasks.ts)
- Fetch tasks for a project
- Create, update, and delete tasks
- Filter tasks by status, priority, assignee
- Track task completion

### Team Management (use-team.ts, use-members.ts)
- Create and manage teams
- Add/remove team members
- Assign team roles
- Associate teams with projects

### User Management (use-profile.ts, use-user-roles.ts)
- Fetch and update user profiles
- Manage user roles and permissions
- Check user authorization for specific actions

## Implementation Pattern

Each service hook typically follows this pattern:
1. **Query Hooks**: Using React Query for data fetching
   - Loading, error, and success states
   - Automatic refetching and caching
   - Data transformation

2. **Mutation Hooks**: For data modification
   - Create, update, delete operations
   - Optimistic updates
   - Cache invalidation
   - Error handling with toast notifications

3. **Utility Functions**: Helper methods for common operations

## API Communication

Services connect to the backend using the `apiClient` utility, which:
- Manages request headers
- Handles authentication tokens
- Standardizes error responses
- Provides consistent response formatting

Example API call pattern:
```typescript
// Inside a query hook
const response = await apiClient.get('projects');
if (response.error) {
  // Handle error with toast
  return fallback;
}
return response.data;
```

## Error Handling

Services implement consistent error handling:
- API errors are caught and displayed as toast notifications
- Failed queries have graceful fallbacks (empty arrays, null objects)
- Network errors are properly captured and reported

## Integration with UI Components

These services are consumed by UI components in the `/app/projly/` directory:
- Components use hooks to fetch and manipulate data
- Loading states trigger skeleton loaders or spinners
- Error states show appropriate feedback
- Success notifications inform users of completed operations

## Authentication Flow

1. User credentials are submitted via login form
2. Authentication service exchanges credentials for JWT token
3. Token is stored securely in cookies
4. Subsequent API requests include the token
5. Protected routes verify token validity
6. Expired tokens trigger automatic logout

## Data Refresh Strategies

- Critical data is refreshed on focus
- Lists invalidate when individual items are modified
- Background polling for time-sensitive data
- Manual refresh triggers for user-initiated updates
