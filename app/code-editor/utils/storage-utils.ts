/**
 * Storage utilities for the code editor
 * Provides consistent access to localStorage across components
 */

// Consistent storage keys
export const STORAGE_KEYS = {
  CURRENT_FOLDER_PATH: 'freetool_current_folder_path',
  RECENT_FOLDERS: 'freetool_recent_folders',
  VS_CODE_TABS: 'vs-code-tab-history',
  VS_CODE_STORE: 'vs-code-store',
  VS_CODE_FILE_SYSTEM: 'vs-code-file-system'
};

/**
 * Save a value to localStorage with proper error handling
 */
export const saveToStorage = (key: string, value: string): boolean => {
  console.log(`StorageUtils: Saving to key [${key}]:`, value);
  
  if (typeof window === 'undefined') {
    console.log('StorageUtils: Cannot save - window is undefined (server-side)');
    return false;
  }

  try {
    localStorage.setItem(key, value);
    console.log(`StorageUtils: Successfully saved data to [${key}]`);
    return true;
  } catch (error) {
    console.error(`StorageUtils: Error saving to localStorage key [${key}]:`, error);
    return false;
  }
};

/**
 * Get a value from localStorage with proper error handling
 */
export const getFromStorage = (key: string, defaultValue: string = ''): string => {
  console.log(`StorageUtils: Getting value from key [${key}]`);
  
  if (typeof window === 'undefined') {
    console.log(`StorageUtils: Cannot get [${key}] - window is undefined (server-side)`);
    return defaultValue;
  }

  try {
    const value = localStorage.getItem(key);
    console.log(`StorageUtils: Retrieved from [${key}]:`, value);
    return value || defaultValue;
  } catch (error) {
    console.error(`StorageUtils: Error retrieving from localStorage key [${key}]:`, error);
    return defaultValue;
  }
};

/**
 * Save the current folder path with proper validation
 */
export const saveCurrentFolderPath = (path: string): boolean => {
  if (!path || path.trim() === '') {
    console.log('StorageUtils: Not saving empty folder path');
    return false;
  }
  
  return saveToStorage(STORAGE_KEYS.CURRENT_FOLDER_PATH, path);
};

/**
 * Get the current folder path
 */
export const getCurrentFolderPath = (): string => {
  return getFromStorage(STORAGE_KEYS.CURRENT_FOLDER_PATH, '');
};

/**
 * Log all localStorage keys for debugging
 */
export const logAllStorageKeys = (): void => {
  if (typeof window === 'undefined') {
    console.log('StorageUtils: Cannot log keys - window is undefined (server-side)');
    return;
  }

  try {
    const keys = Object.keys(localStorage);
    console.log('StorageUtils: All localStorage keys:', keys);
    console.log('StorageUtils: localStorage.length:', localStorage.length);
  } catch (error) {
    console.error('StorageUtils: Error logging localStorage keys:', error);
  }
};
