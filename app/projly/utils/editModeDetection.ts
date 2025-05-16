
/**
 * Utility for consistent edit mode detection across the application
 */

// Check if we're in edit mode - consistent implementation used by all components
export function isInEditMode(): boolean {
  try {
    // Check window flag first (set by App.tsx)
    if ((window as any).LOVABLE_EDIT_MODE === true) {
      return true;
    }

    // Check localStorage 
    if (localStorage.getItem('lovable_edit_mode') === 'true') {
      return true;
    }
    
    // Check URL for edit mode patterns
    const url = window.location.href;
    
    // Check for Lovable domains
    const isLovableDomain = url.includes('lovable.dev') || 
                           url.includes('lovableproject.com');
    
    // Check for edit patterns in URL
    const editPatterns = ['/edit', '?editMode=true', '/edit/'];
    const hasEditPattern = editPatterns.some(pattern => url.includes(pattern));
    
    // Check for edit mode query param
    const queryParams = new URLSearchParams(window.location.search);
    const queryEditMode = queryParams.get('editMode') === 'true';
    
    // If we're on a Lovable domain and have an edit pattern or query param, we're in edit mode
    if (isLovableDomain && (hasEditPattern || queryEditMode)) {
      // Set localStorage for future calls
      localStorage.setItem('lovable_edit_mode', 'true');
      // Set window flag for other components
      (window as any).LOVABLE_EDIT_MODE = true;
      return true;
    }
    
    return false;
  } catch (e) {
    // If any errors (like localStorage not available), default to false
    console.error("Error detecting edit mode:", e);
    return false;
  }
}

// Set up edit mode - call this early in App initialization
export function setupEditMode(): boolean {
  const inEditMode = isInEditMode();
  
  if (inEditMode) {
    console.log("%c LOVABLE EDIT MODE ACTIVE ", "background: #4CAF50; color: white; font-size: 16px; padding: 4px;");
    
    // Clear potentially corrupted tokens
    try {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('auth-session');
      sessionStorage.removeItem('auth-session');
    } catch (e) {
      // Ignore errors
    }
  }
  
  return inEditMode;
}

// Clear any corrupted tokens in edit mode
export function clearTokensInEditMode(): void {
  if (isInEditMode()) {
    try {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('auth-session');
      sessionStorage.removeItem('auth-session');
      console.log("Cleared authentication tokens in edit mode");
    } catch (e) {
      // Ignore errors
    }
  }
}
