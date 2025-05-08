# VS Code Editor Component Modules

This directory contains the modular components that make up the VS Code-inspired code editor. This project has been refactored to move all VS Code components into a unified modules directory for better organization and maintenance.

## Component Overview

### Core Components
- `index.tsx`: Main entry point that integrates all modules
- `editor-instance-manager.ts`: Manages Monaco editor instances
- `file-operations.ts`: Handles file system operations (create, open, save, etc.)
- `folder-handler.ts`: Manages folder operations and validation
- `main-editor.tsx`: Main Monaco editor component
- `types.ts`: TypeScript type definitions
- `utils.ts`: Utility functions

### UI Components (Refactored from parent directory)
- `command-palette.tsx`: VS Code-like command palette for executing actions
- `editor-tabs.tsx`: Tabs for open files with save/close functionality
- `file-browser.tsx`: File browser dialog for opening files
- `file-explorer.tsx`: Explorer-like file system navigation
- `layout.tsx`: Main VS Code layout structure with sidebar, panels, etc.
- `menu-bar.tsx`: Menu bar with file, edit, view operations
- `quick-picker.tsx`: Quick file finder dialog (Ctrl+P equivalent)
- `status-bar.tsx`: Status bar showing line numbers, language, etc.

### Supporting Components
- `menu-bar-adapter.tsx`: Adapter for the VS Code menu bar
- `monaco.d.ts`: TypeScript declarations for Monaco
- `shortcuts.ts`: Keyboard shortcut definitions
- `themes.ts`: Editor themes
- `ui-components.tsx`: Reusable UI components

## Refactoring Information

The VS Code editor implementation has been refactored to move all components from the parent directory into this modular structure. Previously, these components were spread across individual files in the parent directory:

- `vs-code-command-palette.tsx` → `command-palette.tsx`
- `vs-code-editor-tabs.tsx` → `editor-tabs.tsx`
- `vs-code-file-browser.tsx` → `file-browser.tsx`
- `vs-code-file-explorer.tsx` → `file-explorer.tsx`
- `vs-code-layout.tsx` → `layout.tsx`
- `vs-code-menu-bar.tsx` → `menu-bar.tsx`
- `vs-code-quick-picker.tsx` → `quick-picker.tsx`
- `vs-code-status-bar.tsx` → `status-bar.tsx`

All imports have been updated to reference the local modules, and enhanced logging has been added to all components.

## Usage

The main entry point is `index.tsx` which combines all modules into a functional VS Code-like editor.

### Configuration & Customization

- `themes.ts`: Editor themes configuration (dark and light modes)
- `shortcuts.ts`: Keyboard shortcuts definitions and handlers

### State Management

- `editor-instance-manager.ts`: Monaco editor instance management with hooks

## Recent Improvements

1. **Enhanced File Operations**:
   - Improved file opening with parent folder expansion
   - Better retry mechanisms for file operations
   - Comprehensive error logging for debugging

2. **UI Enhancements**:
   - Updated EmptyEditorState and InvalidFolderState components
   - Consistent styling across the editor
   - Better user guidance with keyboard shortcuts

3. **Architecture**:
   - Removed dependency on legacy vs-code directory
   - Made all components modular and independent
   - Improved TypeScript typing for better development experience

4. **Performance**:
   - Optimized file tree rendering
   - Reduced unnecessary re-renders
   - More efficient event handling

## Usage

The VS Code Editor is integrated into the application through the main `VSCodeEditor` component in `app/code-editor/components/vs-code-editor.tsx`, which imports all functionality from this modular structure.

## Debugging

Each module includes detailed logging for easier debugging. Check browser console logs with the prefix `[VSCodeEditor]` to trace execution flow and identify issues.

All files are kept under 300 lines for better maintainability and readability.
