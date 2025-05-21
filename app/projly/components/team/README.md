# Team Management Components

## Overview
This directory contains React components for managing teams and team members in the Projly application. The components follow the shadcn/ui design system and integrate with the backend API via custom hooks.

## Key Components (Updated 2025-05-21)

### MembersTable.tsx
- Displays a table of team members with filtering and sorting capabilities
- Integrates with the team invitation system
- Supports role-based access control for actions
- Provides edit and delete functionality for team members

### AddMemberForm.tsx
- Email-based team member invitation form
- Supports inviting both existing and new users
- Validates email input and provides feedback
- Integrates with the backend invitation API

### EditMemberForm.tsx
- Form for editing team member details
- Allows updating role and department information
- Validates input and provides feedback

## Recent Updates (2025-05-21)
1. Enhanced team member invitation to use email input instead of user dropdown
2. Added support for inviting users not yet in the system
3. Improved error handling and validation
4. Added detailed logging for debugging

## Implementation Notes
- Uses React Hook Form with Zod validation
- Integrates with custom hooks from `/lib/services/projly/use-members.ts`
- Follows shadcn/ui component patterns
- Implements proper error handling and loading states

## Technical Details
- Email validation ensures proper format before submission
- Team selection includes associated project information
- Role selection provides standard role options
- Department field is optional free-text input

## Integration Points
- Backend API: `/api/projly/members/invite` for email invitations
- Email service: Sends invitation emails to new and existing users
- Authentication system: Creates placeholder users for new invitees

## Related Documentation
- [Team API Documentation](/service.freetool.online/app/api/projly/members/README.md)
- [Team Service Documentation](/service.freetool.online/lib/services/prisma/teams.README.md)
- [Email Service Documentation](/service.freetool.online/lib/utils/email.ts)
