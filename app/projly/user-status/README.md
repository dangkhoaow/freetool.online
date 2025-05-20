# User Status Management Documentation

## Overview
This document details the user status system for Projly, including status definitions (Active, Inactive, Deleted), login restrictions, and UI integration. It ensures only 'Active' users can log in, with admin controls for status changes.

## Key Components
- **Status Enum**: Active (default), Inactive, Deleted.
- **Backend Integration**: Uses ProjlyUser schema and API endpoints for status updates.
- **Frontend Integration**: UI components for status toggling in user settings.
- **Service Layer**: Dedicated service for user status operations in the backend.

## Technical Details
- Added 'status' field to ProjlyUser model with default 'Active'.
- Login endpoint checks status and returns error for non-'Active' users.
- Status updates handled via API mutations with role-based access control.
- Proper error handling and validation for status update operations.

## Recent Updates (2025-05-20)
- Fixed API endpoint path resolution in frontend to prevent 404 errors
- Implemented proper service layer in backend for user status operations
- Enhanced role-based access control to fix 403 Forbidden errors
- Added comprehensive error handling and detailed logging

## Usage Examples
```typescript
// Backend: Update user status
await prisma.projlyUser.update({ where: { id: userId }, data: { status: 'Inactive' } });

// Frontend: Toggle status in React component
const handleStatusChange = async (newStatus: string) => {
  await apiClient.put('/api/projly/users/status', { status: newStatus });
  queryClient.invalidateQueries(['user']);
};
```

## Integration Points
- Links to [Central Frontend README](../README.md) and [Backend API README]../../../../service.freetool.online/app/api/projly/README.md.
- Updated 2025-05-19 for user status feature.
