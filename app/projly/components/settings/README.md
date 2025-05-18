# User Settings Components

## Overview
The User Settings components provide functionality for managing user profiles, passwords, notifications, and system-wide user management for site administrators. These components are designed to be modular and reusable across different parts of the application.

## Key Components

### ProfileSettings
- **File**: `ProfileSettings.tsx`
- **Purpose**: Allows users to update their personal information including name and avatar
- **Features**:
  - Profile image upload with preview
  - Form validation for required fields
  - Responsive layout for different screen sizes

### PasswordSettings
- **File**: `PasswordSettings.tsx`
- **Purpose**: Provides interface for users to change their password
- **Features**:
  - Password strength validation
  - Show/hide password toggle
  - Real-time password requirement feedback

### NotificationSettings
- **File**: `NotificationSettings.tsx`
- **Purpose**: Controls user notification preferences
- **Features**:
  - Toggle switches for different notification types
  - Grouped by notification category
  - Immediate feedback on preference changes

## Integration Points

### User Roles API
- These components integrate with the User Roles API via the `useUserRoles` hook
- API endpoints are defined in `/service.freetool.online/app/api/projly/user-roles/`
- See [User Roles API Documentation](/service.freetool.online/app/api/projly/user-roles/README.md) for details

### Authentication System
- Components check user permissions via the JWT authentication system
- Site owner permissions are required for user management features
- Regular users can only modify their own settings

## Implementation Notes

### State Management
- Uses React Query for server state management
- Local form state handled with React hooks
- Form validation with real-time feedback

### Security Considerations
- Only site owners can access the user management interface
- Password changes require current password verification
- Role changes are restricted based on user permissions

## Recent Updates (2025-05-18)
- Added detailed logging for debugging
- Improved error handling for API interactions
- Enhanced type safety with proper TypeScript interfaces
- Fixed user role checking to properly handle site owner permissions

## Usage Examples

### Basic Profile Settings Integration
```tsx
import { ProfileSettings } from "@/app/projly/components/settings/ProfileSettings";

// Component usage with required props
<ProfileSettings 
  profile={userProfile}
  onProfileChange={handleProfileChange}
  onSubmit={handleSubmit}
  isSaving={isSubmitting}
/>
```

### Password Settings Integration
```tsx
import { PasswordSettings } from "@/app/projly/components/settings/PasswordSettings";

// Component usage with required props
<PasswordSettings 
  passwordForm={passwordData}
  onPasswordChange={handlePasswordChange}
  onSubmit={handlePasswordSubmit}
  isSaving={isSubmitting}
/>
```
