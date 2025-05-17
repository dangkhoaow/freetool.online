/**
 * Utility functions for the Projly application
 */

/**
 * Extracts an error message from an unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
}

/**
 * Extracts an HTTP status code from an unknown error type
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    if ('status' in error && typeof error.status === 'number') {
      return error.status;
    }
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return error.statusCode;
    }
  }
  return undefined;
}

/**
 * Checks if the application is in edit mode by checking URL params and localStorage
 */
export function isInEditMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check URL for edit mode
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('edit') === 'true') return true;
  
  // Check localStorage for edit mode
  try {
    const editMode = localStorage.getItem('editMode');
    if (editMode === 'true') return true;
  } catch (e) {
    console.warn('Could not access localStorage:', e);
  }
  
  // Check for global edit mode flag
  return !!(window as any).LOVABLE_EDIT_MODE;
}
