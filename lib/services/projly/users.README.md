# Users API Integration

## Overview
This document outlines the integration between the frontend and backend for user management operations in the Projly application. The implementation follows a clean separation of concerns with React hooks for data fetching and mutations.

## Key Components

### Backend API Endpoints
- `GET /api/projly/users` - List all users (admin/site_owner only)
- `POST /api/projly/users` - Create a new user (site_owner only)
- `GET /api/projly/users/id/[id]` - Get a specific user by ID
- `PUT /api/projly/users/id/[id]` - Update a specific user
- `DELETE /api/projly/users/id/[id]` - Delete a specific user (soft delete)

### Frontend Integration
- `use-users.ts` - React hook for user management operations
- `UserSettings.tsx` - Component for user management UI

## Implementation Details

### `use-users.ts` Hook
The `use-users.ts` hook provides a clean interface for interacting with the users API:

```typescript
// Example usage
const { 
  users,              // Query for fetching all users
  getUserById,        // Function to get a specific user
  createUser,         // Mutation for creating users
  updateUser,         // Mutation for updating users
  deleteUser,         // Mutation for deleting users
  refreshUsers,       // Function to manually refresh user data
  isRefreshing        // Loading state for refresh operation
} = useUsers();
```

#### Data Fetching
- Uses React Query for efficient data fetching and caching
- Handles loading, error, and success states
- Provides automatic refetching on window focus
- Implements manual refresh capability

#### Mutations
- Create user: Only site owners can create new users
- Update user: Users can update their own data, admins can update status, site owners can update roles
- Delete user: Soft delete by setting status to 'Deleted'
- All mutations automatically invalidate relevant queries for data consistency

### Integration with UserSettings.tsx
The UserSettings component has been updated to use the new `useUsers` hook:

1. Imports the hook: `import { useUsers } from "@/lib/services/projly/use-users";`
2. Initializes the hook: `const { users, createUser, refreshUsers, isRefreshing } = useUsers();`
3. Uses the hook for user operations:
   - Fetching users: `users.data`
   - Creating users: `createUser.mutateAsync(data)`
   - Refreshing data: `refreshUsers()`

## Error Handling
- Comprehensive error handling in both the hook and component
- Detailed error logging for debugging
- User-friendly error messages via toast notifications
- Graceful fallbacks for failed operations

## Type Safety
- Strong TypeScript typing for all operations
- Consistent type definitions between frontend and backend
- Proper handling of nullable fields

## Recent Updates (2025-05-20)
1. Migrated backend API from Express-style router to Next.js App Router pattern
2. Created dedicated Prisma service for user operations
3. Implemented frontend hook for user management
4. Updated UserSettings component to use the new hook
5. Added detailed documentation and logging

## Integration with Other Systems
- Authentication: Uses JWT for secure API access
- User Roles: Integrates with the role-based permission system
- User Status: Supports the user activation status system

## Future Improvements
- Add pagination for large user lists
- Implement filtering and sorting on the server side
- Add bulk operations for user management
- Enhance validation for user inputs
