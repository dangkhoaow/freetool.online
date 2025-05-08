# VS Code Editor Backup

This directory contains backup files from the original VS Code editor implementation 
that were removed during the refactoring to a more modular structure.

The files were moved here as part of the cleanup process.
All functionality from these components has been refactored into the new modular structure
in the `vs-code-modules` directory.

## Original Structure
- `vs-code/` - Core VS Code components
  - `ActivityBar.tsx` - Activity bar on the left
  - `Panel.tsx` - Bottom panel
  - `Sidebar.tsx` - Sidebar container
  - `VSCodeLayout.tsx` - Main layout
  - `explorer/` - File explorer components
    - `ExplorerView.tsx` - File tree view
    - `FileTreeItem.tsx` - File tree items
    - `FileUtils.tsx` - File operations
    - `NewFileDialog.tsx` - Create file dialog
    - `NewFolderDialog.tsx` - Create folder dialog
