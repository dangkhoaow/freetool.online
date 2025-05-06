# VS Code Editor Tool

This folder contains the implementation of a full-featured VS Code-like code editor for FreeTool.online. The editor replicates the look, feel, and functionality of Microsoft Visual Studio Code in a web environment.

## Architecture Overview

The VS Code editor is built using a component-based architecture with the following primary components:

### Core Components

- **VSCodeEditor** (`vs-code-editor.tsx`): The main component that integrates all sub-components
- **MonacoEditor** (`monaco-editor.tsx`): The wrapper around the Monaco editor core functionality
- **VSCodeLayout** (`vs-code-layout.tsx`): Implements the VS Code UI layout with activity bar, sidebar, editor area, panel, and status bar

### UI Components

- **VSCodeFileExplorer** (`vs-code-file-explorer.tsx`): File explorer sidebar component
- **VSCodeEditorTabs** (`vs-code-editor-tabs.tsx`): Editor tabs component for managing open files
- **VSCodeStatusBar** (`vs-code-status-bar.tsx`): Status bar component showing line/column info and other indicators
- **VSCodeCommandPalette** (`vs-code-command-palette.tsx`): Command palette for executing commands (Ctrl+Shift+P)
- **VSCodeQuickPicker** (`vs-code-quick-picker.tsx`): Quick file opener component (Ctrl+P)

### State Management

- **VSCodeStore** (`store/vs-code-store.ts`): Zustand store for managing editor state
- **VSCodeFileSystem** (`lib/services/vs-code-file-system.ts`): Virtual file system service for managing files and directories

## Features

- **Full VS Code Layout**: Activity bar, sidebar, editor area, panel, and status bar
- **File System**: Virtual file system with create, rename, delete, load/save files
- **Command Palette**: Fuzzy search of commands (Ctrl+Shift+P)
- **Quick Open**: Quick file opening (Ctrl+P)
- **Editor Tabs**: Multiple tabbed editors with undo/redo
- **Theme Support**: Light/dark theme toggle
- **Keyboard Shortcuts**: VS Code-like keybindings
- **Syntax Highlighting**: Powered by Monaco Editor
- **Editor Panels**: Terminal, problems, output panels
- **Status Bar**: Line/column indicator, language selector, theme toggle

## Implementation Details

### Monaco Editor Integration

The editor uses the Monaco Editor (the same editor that powers VS Code) for core editing functionality. This integration is done through the `@monaco-editor/react` package, which provides a React wrapper around the Monaco Editor.

### Virtual File System

The editor uses a virtual file system that's persisted in localStorage. This allows users to create, edit, and manage files without a backend. The file system structure mimics VS Code's with files and folders.

### State Management

State is managed with Zustand for a clean and reactive state management solution. The store includes actions for file operations, UI state, and editor configuration.

### Theme Customization

The editor supports both light and dark themes with custom Monaco theme definitions that match VS Code's color schemes.

### Keyboard Shortcuts

The editor implements common VS Code keyboard shortcuts using a custom shortcut handler. This includes commands for file operations, navigation, and UI toggling.

## Key Files and Their Purpose

- `vs-code-editor.tsx`: Main entry point that integrates all components
- `vs-code-layout.tsx`: Implements the VS Code UI layout structure
- `monaco-editor.tsx`: Wrapper around Monaco Editor with theme support
- `vs-code-file-explorer.tsx`: File explorer component with file operations
- `vs-code-editor-tabs.tsx`: Editor tabs component for managing open files
- `vs-code-status-bar.tsx`: Status bar component for displaying editor info
- `vs-code-command-palette.tsx`: Command palette component for executing commands
- `vs-code-quick-picker.tsx`: Quick file opener component
- `vs-code-store.ts`: Zustand store for state management
- `vs-code-file-system.ts`: Virtual file system implementation

## Usage

The VS Code editor is integrated into the FreeTool.online platform and can be accessed at the `/code-editor` route. It provides a fully featured code editing experience similar to VS Code but running entirely in the browser.

## Future Improvements

- Integration with external services for file persistence
- Additional language support and extensions
- More advanced code completion and intellisense
- Git integration
- Debugging capabilities

## Dependencies

- `@monaco-editor/react`: React wrapper for Monaco Editor
- `monaco-editor`: Core Monaco Editor
- `zustand`: State management
- `lucide-react`: Icon components
- `@/components/ui/*`: UI components from the shadcn/ui library
