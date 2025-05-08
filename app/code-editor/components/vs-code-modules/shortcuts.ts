/**
 * Keyboard shortcuts and handling utilities for VS Code editor
 */

// Keyboard shortcuts definition
export const SHORTCUTS = {
  COMMAND_PALETTE: ['Control', 'Shift', 'P'],
  QUICK_OPEN: ['Control', 'P'],
  SAVE: ['Control', 's'],
  TOGGLE_SIDEBAR: ['Control', 'b'],
  TOGGLE_PANEL: ['Control', 'j'],
  TOGGLE_COMMENT: ['Control', '/'],
  SPLIT_EDITOR: ['Control', '\\'],
  CLOSE_TAB: ['Control', 'w'],
  REOPEN_CLOSED_TAB: ['Control', 'Shift', 't'],
  FIND: ['Control', 'f'],
  RUN_CODE: ['Control', 'Enter'],
};

/**
 * Helper to check if a keyboard event matches a shortcut
 * @param e Keyboard event to check
 * @param shortcut Array of keys that make up the shortcut
 * @returns boolean indicating if the event matches the shortcut
 */
export const matchesShortcut = (e: KeyboardEvent, shortcut: string[]): boolean => {
  console.log(`Checking shortcut: [${shortcut.join('+')}] against event: ${e.key}`);
  const key = e.key.toLowerCase();
  
  // Check if all modifier keys match
  const ctrlMatch = shortcut.includes('Control') === e.ctrlKey;
  const shiftMatch = shortcut.includes('Shift') === e.shiftKey;
  const altMatch = shortcut.includes('Alt') === e.altKey;
  
  // Find the non-modifier key
  const mainKey = shortcut.find(k => !['Control', 'Shift', 'Alt'].includes(k));
  
  // Check if the main key matches (case insensitive)
  const mainKeyMatch = mainKey?.toLowerCase() === key;
  
  const matches = ctrlMatch && shiftMatch && altMatch && mainKeyMatch;
  if (matches) {
    console.log(`Shortcut match found: [${shortcut.join('+')}]`);
  }
  
  return matches;
};
