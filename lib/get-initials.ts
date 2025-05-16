/**
 * Utility function to get initials from a name
 * Used for avatar fallbacks when no image is available
 */

/**
 * Extract initials from a name
 * @param name - The full name to extract initials from
 * @param fallback - Optional fallback if name is empty or undefined
 * @returns The initials (usually 1-2 characters) or the fallback value
 */
export function getInitials(name?: string, fallback: string = 'U'): string {
  // Log the input for debugging
  console.log('[PROJLY:UTILS] Getting initials for:', name);
  
  // Handle empty or undefined name
  if (!name) {
    console.log('[PROJLY:UTILS] Using fallback for empty name:', fallback);
    return fallback;
  }
  
  // Split the name and get initials
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 0) {
    console.log('[PROJLY:UTILS] No name parts found, using fallback:', fallback);
    return fallback;
  }
  
  if (parts.length === 1) {
    // Just get the first character of the single name
    const initial = parts[0].charAt(0).toUpperCase();
    console.log('[PROJLY:UTILS] Single initial for:', name, initial);
    return initial;
  }
  
  // Get first initial + last initial
  const firstInitial = parts[0].charAt(0).toUpperCase();
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  const initials = `${firstInitial}${lastInitial}`;
  
  console.log('[PROJLY:UTILS] Initials for:', name, initials);
  return initials;
}
