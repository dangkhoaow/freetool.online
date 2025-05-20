# Forgot Password Feature

## Overview
The Forgot Password feature allows users to reset their password when they've forgotten it. This implementation follows a secure token-based approach where users receive a reset link via email.

## Key Components

### Frontend Pages
- **Forgot Password Page** (`/app/projly/forgot-password/page.tsx`): Form for users to request a password reset
- **Reset Password Page** (`/app/projly/reset-password/page.tsx`): Form for users to set a new password using a token

### Custom Hooks
- **useForgotPassword** (`/lib/services/projly/use-forgot-password.ts`): Handles the API call to request a password reset
- **useResetPassword** (`/lib/services/projly/use-reset-password.ts`): Handles the API call to reset a password with a token

### API Integration
- **Forgot Password Endpoint**: `POST /api/projly/auth/forgot-password`
- **Reset Password Endpoint**: `POST /api/projly/auth/reset-password`

## User Flow

1. **Request Reset**:
   - User navigates to the forgot password page
   - User enters their email address
   - System sends a reset link to the provided email

2. **Reset Password**:
   - User clicks the reset link in their email
   - User is taken to the reset password page
   - User enters a new password and confirms it
   - System validates the token and updates the password
   - User is redirected to the login page

## Security Considerations

- Reset tokens expire after 1 hour
- Passwords must be at least 8 characters long
- The system always returns a success message for forgot password requests, even if the email doesn't exist (prevents email enumeration attacks)
- Tokens are invalidated after use
- All actions are logged for audit purposes

## Technical Implementation

### Forgot Password Page
- Uses the `useForgotPassword` hook to handle API communication
- Provides clear feedback to users about the status of their request
- Redirects authenticated users to the dashboard

### Reset Password Page
- Uses the `useResetPassword` hook to handle API communication
- Validates the token from the URL query parameters
- Performs client-side validation of passwords
- Provides clear feedback on success or failure

### API Hooks
- Use React Query for state management and caching
- Handle loading states, errors, and success messages
- Provide detailed logging for debugging

## Recent Updates (2025-05-20)
- Implemented complete forgot password flow with email integration
- Added client-side validation for passwords
- Enhanced security with token-based authentication
- Added comprehensive logging for debugging

## Related Documentation
- [Forgot Password API Documentation](/service.freetool.online/app/api/projly/auth/forgot-password/README.md)
- [Authentication Service Documentation](/service.freetool.online/lib/services/prisma/auth.README.md)
- [Email Service Documentation](/service.freetool.online/lib/utils/email.ts)
