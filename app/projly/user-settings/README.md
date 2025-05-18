# User Settings Page

## Overview
The User Settings page provides an interface for site administrators to manage users, their roles, and access permissions. This page is restricted to users with the 'site_owner' role and provides comprehensive user management capabilities.

## Key Features

### User Management
- View all users in the system with their roles and activation status
- Filter users by role and activation status
- Search users by name or email
- Promote or demote users between roles (Regular User, Admin, Site Owner)
- Activate or deactivate user accounts
- Reset user passwords

### Role-Based Access Control
- Only site owners can access this page
- Non-site owners are shown an "Access Denied" message
- Special handling for fixed system users

### User Interface
- Responsive data table with sorting capabilities
- Role and status badges for visual identification
- Action dropdown menus for each user
- Modal dialogs for password resets and adding new users

## Technical Implementation

### Component Structure
- `page.tsx` - Main page component using Next.js App Router pattern
- Leverages components from `/app/projly/components/settings/`
- Uses the `useUserRoles` hook for data fetching and mutations

### API Integration
- Connects to the User Roles API via the `useUserRoles` hook
- API endpoints are defined in `/service.freetool.online/app/api/projly/user-roles/`
- See [User Roles API Documentation](/service.freetool.online/app/api/projly/user-roles/README.md) for details

### State Management
- Uses React Query for server state management
- Local state for UI interactions (dialogs, filters, etc.)
- Form handling with React Hook Form and Zod validation

## Recent Updates (2025-05-18)
- Migrated from pages directory to App Router pattern
- Enhanced error handling with detailed logging
- Improved type safety with proper TypeScript interfaces
- Added comprehensive filtering and search capabilities

## Security Considerations
- Role-based access control restricts page access to site owners
- Password reset functionality uses secure password handling
- Special protection for system users to prevent accidental changes

## Related Documentation
- [User Settings Components](/app/projly/components/settings/README.md) - Reusable settings components
- [User Roles API](/service.freetool.online/app/api/projly/user-roles/README.md) - Backend API documentation
- [Authentication System](/service.freetool.online/app/api/projly/auth/README.md) - Authentication flow details
