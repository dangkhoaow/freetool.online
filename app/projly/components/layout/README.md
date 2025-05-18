# Projly Layout Components Documentation

## Overview
This directory contains layout-related components for the Projly application, including the main dashboard layout, sidebar, header, and other structural UI elements.

## Key Components

### Sidebar.tsx (Updated 2025-05-18)
- Main navigation component for the application
- Renders different menu items based on user role
- Responsible for role-based conditional rendering of UI elements

### Header.tsx
- Top application bar with user profile, notifications, and actions
- Handles search functionality and mobile menu toggles
- Provides consistent header across all application pages

### DashboardLayout.tsx
- Main wrapper component for authenticated pages
- Combines Sidebar and Header in a responsive layout
- Handles responsive behavior for mobile and desktop views

## Technical Implementation Notes

### Authentication and Authorization (Updated 2025-05-18)
- The Sidebar component includes role-based display logic:
  - Different menu items are shown based on user roles
  - Admin users see team management options
  - Site owners see additional user settings options

#### Current User Role Detection (Updated 2025-05-18)
The Sidebar.tsx component currently determines user roles using a mock implementation:

```typescript
// Current mock implementation (needs to be replaced)
const mockRole = userData?.email?.includes('admin') ? 'admin' : 
                 userData?.email?.includes('owner') ? 'site_owner' : 'user';
```

This implementation has known issues:
1. It incorrectly determines roles based on string matching in email addresses
2. Users with the email "info@freetoolonline.com" (defined as site_owner in the database) are not correctly identified
3. The menu items that should display for site_owner users (lines 202-204) are not shown for legitimate site owners

#### Implementation Being Added (2025-05-18)
A dedicated user_roles table is being added to the database schema to explicitly store global user roles. This will provide a direct source of truth for special roles like 'site_owner'.

The proper implementation will use the user roles API endpoint which accesses this table:

```typescript
// API-based implementation being implemented
try {
  // Fetch user role from the API
  const roleResponse = await apiClient.get('/api/projly/user-roles/current');
  const userRole = roleResponse.error ? 'user' : roleResponse.data;
  setUserRole(userRole);
  console.log('User role fetched from API:', userRole);
} catch (error) {
  console.error('Error fetching user role:', error);
  setUserRole('user'); // Fallback to basic user role
}
```

This approach will ensure that all users, including those with special roles like info@freetoolonline.com, have their correct roles displayed in the UI.

## Integration Points
- Sidebar component integrates with the user roles API to determine access rights
- Header component integrates with authentication services for user information

## Usage

The layout components are used throughout the application as follows:

```tsx
// Example usage in a page component
import DashboardLayout from '@/app/projly/components/layout/DashboardLayout';

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <h1>Projects</h1>
      {/* Page content */}
    </DashboardLayout>
  );
}
```

## Related Documentation
- [Frontend Services Documentation](/lib/services/projly/README.md) - Details on API hooks and service implementations
- [Authentication Adapter Documentation](/lib/services/projly/jwt-auth-adapter.README.md) - Details on JWT authentication
- [User Roles Service Documentation](/service.freetool.online/app/api/projly/user-roles/README.md) - Backend user roles API
