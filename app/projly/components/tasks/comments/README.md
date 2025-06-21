# Task Comments System

## Overview
The Task Comments System provides a comprehensive solution for adding, editing, and deleting comments on tasks within the Projly application. It features a rich text editor, real-time updates, and proper authentication and authorization.

## Components

### TaskCommentsSection
The main component that orchestrates the entire comments system for a task.

**Features:**
- Displays all comments for a task
- Provides interface to add new comments
- Handles loading and error states
- Shows comment count in the header
- Responsive design with empty states

**Usage:**
```tsx
import { TaskCommentsSection } from '@/app/projly/components/tasks/comments';

<TaskCommentsSection taskId="task-id" className="mt-4" />
```

### CommentEditor
A rich text editor component for creating and editing comments.

**Features:**
- Rich text formatting (bold, italic, underline, links, headings, lists)
- Keyboard shortcuts (Ctrl/Cmd+Enter to submit)
- Content validation (prevents empty submissions)
- Loading states and disabled states
- Configurable placeholders and button text

**Usage:**
```tsx
import { CommentEditor } from '@/app/projly/components/tasks/comments';

<CommentEditor
  initialContent=""
  onContentChange={setContent}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isLoading={isSubmitting}
/>
```

### CommentItem
Individual comment display component with edit/delete functionality.

**Features:**
- User avatar with initials
- User display name and timestamp
- Edit indicator for modified comments
- Inline editing with rich text editor
- Delete confirmation dialog
- Permission-based actions (only comment owner can edit/delete)

**Usage:**
```tsx
import { CommentItem } from '@/app/projly/components/tasks/comments';

<CommentItem
  comment={comment}
  onEdit={handleEdit}
  onDelete={handleDelete}
  isEditing={isUpdating}
  isDeleting={isDeleting}
/>
```

## Backend API

### Database Schema
The system uses a `ProjlyTaskComment` model with the following structure:

```prisma
model ProjlyTaskComment {
  id          String    @id @default(uuid())
  taskId      String
  content     String    // Rich text content
  createdById String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  task        ProjlyTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
  createdBy   ProjlyUser @relation("TaskCommentCreator", fields: [createdById], references: [id])
}
```

### API Endpoints

#### GET /api/projly/tasks/[id]/comments
Retrieves all comments for a task.
- Requires authentication
- Validates user access to the task
- Returns comments with user information

#### POST /api/projly/tasks/[id]/comments
Creates a new comment.
- Requires authentication
- Validates user access to the task
- Validates content is not empty
- Returns created comment with user information

#### PUT /api/projly/tasks/[id]/comments/[commentId]
Updates an existing comment.
- Requires authentication
- Validates user owns the comment
- Validates content is not empty
- Returns updated comment

#### DELETE /api/projly/tasks/[id]/comments/[commentId]
Deletes a comment.
- Requires authentication
- Validates user owns the comment
- Permanently removes the comment

## Frontend Services

### taskCommentsService
Low-level API client for comment operations.

**Methods:**
- `getComments(taskId)` - Get all comments for a task
- `createComment(taskId, data)` - Create a new comment
- `updateComment(taskId, commentId, data)` - Update a comment
- `deleteComment(taskId, commentId)` - Delete a comment

### React Query Hooks
High-level hooks for managing comment state with caching and optimistic updates.

**Hooks:**
- `useTaskComments(taskId)` - Get comments with caching
- `useCreateTaskComment()` - Create comment mutation
- `useUpdateTaskComment()` - Update comment mutation
- `useDeleteTaskComment()` - Delete comment mutation

**Helper Functions:**
- `getUserDisplayName(user)` - Format user display name
- `formatCommentDate(date)` - Format relative timestamps

## Security & Permissions

### Access Control
- Users can only view comments on tasks they have access to
- Task access is determined by:
  - Task creator
  - Task assignee
  - Project owner
  - Team members of associated teams

### Comment Ownership
- Only comment creators can edit or delete their comments
- No admin override (follows principle of user ownership)
- Proper validation on both frontend and backend

### Data Sanitization
- User sensitive data (passwords, tokens) are removed from API responses
- Rich text content is sanitized to prevent XSS attacks
- Proper HTML rendering with security considerations

## Rich Text Editor

### Features
- Based on TipTap editor with Prosemirror
- Supports: Bold, Italic, Underline, Links, Headings, Lists
- Link management with URL prompts
- Consistent styling with dark mode support
- Word wrapping and responsive design

### Keyboard Shortcuts
- **Bold**: Ctrl/Cmd + B
- **Italic**: Ctrl/Cmd + I
- **Submit**: Ctrl/Cmd + Enter

### Content Handling
- HTML content storage for rich formatting
- Empty content validation (strips HTML tags)
- Proper content updates and synchronization

## Integration Points

### Task Detail Page
Comments are integrated into the task detail page as a new tab:
- Located at `/projly/tasks/[id]` in the "Comments" tab
- Seamlessly integrated with existing task workflow
- Consistent with other task detail sections

### Authentication
Uses the existing JWT authentication system:
- Cookie-based authentication
- Automatic token refresh
- Proper error handling for auth failures

### State Management
Uses React Query for optimal user experience:
- Automatic caching and synchronization
- Optimistic updates for better responsiveness
- Error handling with retry mechanisms
- Cache invalidation on mutations

## Future Enhancements

### Potential Features
- Comment threading/replies
- File attachments in comments
- Comment notifications
- Comment reactions/emoji
- Comment search and filtering
- Comment history/audit trail
- Bulk comment operations
- Comment templates

### Performance Optimizations
- Pagination for large comment lists
- Virtual scrolling for performance
- Image lazy loading in rich content
- Comment preview generation
- Incremental loading strategies

## Development Notes

### File Structure
```
app/projly/components/tasks/comments/
├── index.ts                    # Export barrel
├── README.md                   # This documentation
├── TaskCommentsSection.tsx     # Main comments container
├── CommentEditor.tsx          # Rich text editor
└── CommentItem.tsx            # Individual comment display

lib/services/projly/
├── task-comments-service.ts   # API client
└── use-task-comments.ts       # React Query hooks

service.freetool.online/
├── lib/services/prisma/
│   └── task-comments.ts       # Database service
└── app/api/projly/tasks/[id]/comments/
    ├── route.ts               # Comments CRUD endpoints
    └── [commentId]/
        └── route.ts           # Individual comment endpoints
```

### Dependencies
- **Frontend**: TipTap, React Query, Lucide Icons
- **Backend**: Prisma, Next.js App Router
- **Shared**: TypeScript, Zod (future validation)

### Testing Considerations
- Unit tests for comment operations
- Integration tests for API endpoints
- E2E tests for user workflows
- Accessibility testing for rich text editor
- Performance testing for large comment lists

## Changelog

### Initial Implementation (2025-01-XX)
- ✅ Database schema with ProjlyTaskComment model
- ✅ Backend API endpoints for CRUD operations
- ✅ Frontend service layer with proper error handling
- ✅ React Query hooks with caching and optimistic updates
- ✅ Rich text editor component with formatting options
- ✅ Individual comment component with edit/delete
- ✅ Main comments section with empty states
- ✅ Integration with task detail page
- ✅ Authentication and authorization
- ✅ User-friendly timestamps and display names
- ✅ Responsive design and dark mode support 