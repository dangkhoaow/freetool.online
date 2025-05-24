# Projly Utilities

This directory contains utility functions used across the Projly application to enhance functionality and maintain code consistency.

## Table of Contents

- [Navigation Utilities](#navigation-utilities)
- [Other Utilities](#other-utilities)

## Navigation Utilities

### Overview

The navigation utilities provide robust handling of browser navigation, particularly preventing navigation loops and maintaining a navigation history in session storage.

**File:** [`navigation-utils.ts`](./navigation-utils.ts)

### Key Components

#### `handleIntelligentBackNavigation`

This function provides advanced back navigation with loop detection to prevent users from getting stuck in navigation cycles.

```typescript
function handleIntelligentBackNavigation(
  router: MinimalRouter, 
  taskId: string, 
  log: LogFunction = console.log
): void
```

**Features:**
- Detects and breaks infinite loops between task detail and edit pages
- Identifies complex parent-child task navigation patterns
- Analyzes navigation history to find safe navigation targets
- Falls back to tasks list when no safe navigation target is found
- Degrades gracefully in non-browser environments

**Usage Example:**

```typescript
import { handleIntelligentBackNavigation } from "@/app/projly/utils/navigation-utils";

// In a component with router and taskId
<Button
  onClick={() => handleIntelligentBackNavigation(router, taskId, log)}
>
  Back
</Button>
```

#### `updateNavigationHistory`

This function manages the navigation history stored in session storage, ensuring it remains at a reasonable size.

```typescript
function updateNavigationHistory(
  path: string,
  maxHistoryLength: number = 10,
  log: LogFunction = console.log
): void
```

**Features:**
- Maintains a history of navigation paths in session storage
- Prevents duplicate consecutive entries
- Limits history size to prevent memory issues
- Provides detailed logging for debugging

**Usage Example:**

```typescript
import { updateNavigationHistory } from "@/app/projly/utils/navigation-utils";

// In a useEffect hook to track page visits
useEffect(() => {
  const currentPath = `/projly/tasks/${taskId}`;
  updateNavigationHistory(currentPath, 10, log);
}, [taskId]);
```

### Technical Details

- **Implementation Notes:**
  - Uses session storage to maintain navigation history between page loads
  - Implements pattern matching to detect various loop scenarios
  - Uses TypeScript interfaces for type safety

- **Recent Updates (2025-05-24):**
  - Initial implementation of navigation utilities
  - Added enhanced pattern detection for parent-child task relationships
  - Extracted from page.tsx to improve code maintainability

## Other Utilities

*(This section will be expanded as more utilities are added)*

## Integration Points

- **Tasks Detail Page:** Uses both utilities to manage back navigation and history tracking
- **Task Edit Page:** Uses both utilities to maintain consistent navigation behavior
