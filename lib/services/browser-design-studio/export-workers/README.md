# Export Workers Module

This directory contains the modular export functionality for the Browser Design Studio's various export formats.

## Structure

- **types.ts**: Common types, interfaces, and utility functions used across all export workers
- **svg-worker.ts**: SVG export implementation
- **raster-worker.ts**: PNG and JPG export implementation
- **pdf-worker.ts**: PDF export implementation
- **ai-worker.ts**: Adobe Illustrator (AI) export implementation
- **css-worker.ts**: CSS export implementation
- **index.ts**: Main coordinator that handles messages and routes to appropriate export workers

## Architecture

The export system has been modularized for better maintainability. Each export format has its own dedicated worker file that handles the specifics of that format. The main export-worker.ts file serves as an entry point that delegates to these specialized modules.

This separation of concerns makes the codebase:
1. Easier to maintain (each file is less than 300 lines)
2. More focused (each file does one thing well)
3. More testable (each export function can be tested independently)
4. More extensible (new export formats can be added with minimal changes)

## How to Add a New Export Format

1. Create a new worker file (e.g., `new-format-worker.ts`)
2. Implement the export function for your format
3. Import and add the new export function to the `index.ts` file
4. Update the format selector in the UI to include your new format

## Debug Logging

All export functions include extensive logging to help diagnose issues during the export process. Each log message is prefixed with `[Export Worker]` for easy filtering.
