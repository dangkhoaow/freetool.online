// Use the any type for router for simplicity
// This avoids issues with Next.js internal types changing between versions
import { Router } from 'next/router';

// Define a minimal interface for the router that includes the methods we need
interface MinimalRouter {
  back: () => void;
  push: (url: string) => void;
}


/**
 * Type for custom logging function
 */
type LogFunction = (message: string, data?: any) => void;

/**
 * Intelligent back navigation that prevents infinite loops between task views
 * Handles various loop scenarios:
 * 1. Detail -> Edit -> Detail loops
 * 2. Parent -> Child -> Parent loops
 * 3. Complex navigation patterns involving related tasks
 * 
 * @param router - Next.js router instance
 * @param taskId - Current task ID
 * @param log - Optional logging function
 */
export function handleIntelligentBackNavigation(
  router: MinimalRouter, 
  taskId: string, 
  log: LogFunction = console.log
): void {
  if (typeof window === 'undefined') {
    router.back();
    return;
  }

  try {
    // Check if we're in a potential loop by examining session storage
    const navHistory = JSON.parse(sessionStorage.getItem('projlyNavHistory') || '[]') as string[];
    const currentPath = `/projly/tasks/${taskId}`;
    const editPath = `/projly/tasks/${taskId}/edit`;
    
    log('Current navigation history:', navHistory);
    
    // Extract all unique task IDs from navigation history
    const pathTaskIds = navHistory.map((path: string) => {
      const match = path.match(/\/projly\/tasks\/([\w-]+)/);
      return match ? match[1] : null;
    }).filter(Boolean) as string[];
    
    // Count occurrences of each task ID
    const taskIdCounts: Record<string, number> = {};
    pathTaskIds.forEach((id: string) => {
      taskIdCounts[id] = (taskIdCounts[id] || 0) + 1;
    });
    
    // Detect if we're bouncing between related tasks
    const relatedTasksLoop = Object.entries(taskIdCounts).filter(([_, count]) => count >= 3).length >= 2;
    
    log('Task ID counts in navigation history:', taskIdCounts);
    
    // Check if we have enough entries to detect a loop pattern
    if (navHistory.length >= 4) {
      // Check for alternating pattern indicating a loop
      const lastFourPaths = navHistory.slice(-4);
      
      // Check for edit->detail->edit->detail or detail->edit->detail->edit patterns
      const hasAlternatingPattern = (
        (lastFourPaths[0].includes('/edit') && !lastFourPaths[1].includes('/edit') && 
          lastFourPaths[2].includes('/edit') && !lastFourPaths[3].includes('/edit')) ||
        (!lastFourPaths[0].includes('/edit') && lastFourPaths[1].includes('/edit') && 
          !lastFourPaths[2].includes('/edit') && lastFourPaths[3].includes('/edit'))
      );
      
      // Check for parent-child loop pattern
      // This happens when we repeatedly navigate between parent and child tasks
      const lastSixPaths = navHistory.slice(-6);
      const taskIds = lastSixPaths.map((path: string) => {
        const match = path.match(/\/projly\/tasks\/([\w-]+)/);
        return match ? match[1] : '';
      });
      
      // Count unique task IDs in the last 6 paths
      const uniqueTaskIds = [...new Set(taskIds.filter((id: string) => id !== ''))];
      
      // If we have only 2-3 unique task IDs in the last 6 paths, and we're seeing them repeatedly,
      // it's likely a parent-child loop
      const isParentChildLoop = uniqueTaskIds.length <= 3 && uniqueTaskIds.length > 1 && 
        lastSixPaths.length >= 6 && relatedTasksLoop;
      
      if (hasAlternatingPattern || isParentChildLoop) {
        log('Detected infinite loop pattern! Breaking loop by redirecting to tasks list');
        router.push('/projly/tasks');
        return;
      }
    }
    
    // Simple loop detection for recent navigation
    if (navHistory.length >= 2) {
      const lastPath = navHistory[navHistory.length - 2]; // Check second last path
      
      // If we just came from edit page of the same task
      if (lastPath === editPath) {
        log('Detected coming from edit page, looking for safe navigation target');
        
        // Try to find a path before the edit page that isn't part of the current task navigation
        for (let i = navHistory.length - 3; i >= 0; i--) {
          if (!navHistory[i].includes(taskId)) {
            log(`Found safe navigation target: ${navHistory[i]}`);
            router.push(navHistory[i]);
            return;
          }
        }
        
        // If no safe path found, go to tasks list
        log('No safe navigation target found, going to tasks list');
        router.push('/projly/tasks');
        return;
      }
    }
    
    // Default case: normal back behavior
    log('Using normal browser back navigation');
    router.back();
  } catch (error) {
    console.error('[PROJLY:NAVIGATION_UTILS] Error in back navigation logic:', error);
    // Fallback to simple back in case of errors
    router.back();
  }
}

/**
 * Update navigation history in session storage
 * @param path Current path to add to history
 * @param maxHistoryLength Maximum number of paths to keep in history
 * @param log Optional logging function
 */
export function updateNavigationHistory(
  path: string,
  maxHistoryLength: number = 10,
  log: LogFunction = console.log
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = JSON.parse(sessionStorage.getItem('projlyNavHistory') || '[]') as string[];
    
    // If the last path is the same as current, don't add duplicate
    if (history.length > 0 && history[history.length - 1] === path) {
      return;
    }
    
    // Add current path to history
    history.push(path);
    
    // Trim history to max length
    const trimmedHistory = history.slice(-maxHistoryLength);
    
    // Save back to session storage
    sessionStorage.setItem('projlyNavHistory', JSON.stringify(trimmedHistory));
    log('Navigation history updated:', trimmedHistory);
  } catch (error) {
    console.error('[PROJLY:NAVIGATION_UTILS] Error updating navigation history:', error);
  }
}
