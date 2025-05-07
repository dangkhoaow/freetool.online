# VS Code Layout Components

This directory contains a modular implementation of a VS Code-like editor layout.

## Architecture

The components are organized hierarchically:

```
vs-code/
├── types.ts                   # Shared types and constants
├── index.ts                   # Main export file
├── VSCodeLayout.tsx           # Main layout component
├── ActivityBar.tsx            # Left sidebar with icons
├── Sidebar.tsx                # Main sidebar container
├── Panel.tsx                  # Bottom panel component
└── explorer/                  # Explorer-related components
    ├── ExplorerView.tsx       # File explorer view
    ├── FileTreeItem.tsx       # Individual file/folder item
    ├── FileUtils.tsx          # File system utility functions
    ├── NewFileDialog.tsx      # Dialog for creating new files
    └── NewFolderDialog.tsx    # Dialog for creating new folders
```

## Component Relationships

- `VSCodeLayout`: The parent component that manages the overall layout and state
- `ActivityBar`: Renders the left sidebar icons
- `Sidebar`: Container for sidebar content (Explorer, Search, etc.)
- `Panel`: Bottom panel for terminal, problems, output
- `ExplorerView`: Manages the file explorer functionality
- `FileTreeItem`: Renders individual files and folders in the tree
- `FileUtils`: Provides utility functions for file operations
- `NewFileDialog` & `NewFolderDialog`: Modal dialogs for creating files/folders

## Usage

The VS Code layout can be used by importing the `VSCodeLayout` component from this directory:

```tsx
import { VSCodeLayout } from '@/app/code-editor/components/vs-code';

function MyEditor() {
  return (
    <VSCodeLayout>
      {/* Editor content goes here */}
    </VSCodeLayout>
  );
}
```

## Customization

The layout can be customized using props:

- `children`: The main editor content
- `className`: Additional CSS classes
- `showPanel`: Whether to show the bottom panel
- `showSidebar`: Whether to show the sidebar
- `defaultSizes`: Default sizes for panels
- `sidebarContent`: Custom sidebar content
- `panelContent`: Custom panel content
- `activityBarItems`: Custom activity bar items
- `activeBarItem`: Initial active sidebar item
- `panelTabs`: Custom panel tabs
- `activePanelTab`: Initial active panel tab

## Styling

The components use Tailwind CSS for styling, with colors matching VS Code's default dark theme.
