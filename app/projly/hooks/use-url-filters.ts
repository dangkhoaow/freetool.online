import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/projly/contexts/AuthContextCustom';

export interface URLFilterParams {
  projectId?: string;
  status?: string;
  label?: string;
  assignedTo?: string | string[];
  taskHierarchy?: string;
  excludeStatuses?: string[];
  excludeChildStatuses?: string[];
  search?: string;
}

/**
 * Custom hook to manage URL parameters for task filters
 * Provides bidirectional sync between URL params and filter state
 */
export function useURLFilters(initialFilters: URLFilterParams = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Parse filters from URL parameters
  const parseFiltersFromURL = useCallback((): URLFilterParams => {
    const filters: URLFilterParams = {};
    
    // Simple string parameters - check both parameter names for compatibility
    const projectId = searchParams.get('project') || searchParams.get('projectId');
    if (projectId && projectId !== 'all') {
      filters.projectId = projectId;
      console.log('[USE_URL_FILTERS] Parsed projectId from URL:', projectId);
    }
    
    const status = searchParams.get('status');
    if (status && status !== 'all') filters.status = status;
    
    const label = searchParams.get('label');
    if (label && label !== 'all') filters.label = label;
    
    const assignedTo = searchParams.get('assignedTo');
    if (assignedTo && assignedTo !== 'all') {
      // Handle comma-separated values for multi-select
      if (assignedTo.includes(',')) {
        const assigneeIds = assignedTo.split(',').map(s => s.trim()).filter(Boolean);
        // Convert user IDs to 'current' for UI display if they match current user
        filters.assignedTo = assigneeIds.map(id => 
          user && id === user.id ? 'current' : id
        );
      } else {
        // Single value - convert to 'current' if it matches current user ID
        if (user && assignedTo === user.id) {
          filters.assignedTo = 'current';
        } else {
          filters.assignedTo = assignedTo;
        }
      }
    }
    
    // Task hierarchy - check both parameter formats for compatibility
    const taskHierarchy = searchParams.get('hierarchy');
    const parentOnly = searchParams.get('parentOnly');
    const includeSubTasks = searchParams.get('includeSubTasks');
    
    if (taskHierarchy && taskHierarchy !== 'all') {
      filters.taskHierarchy = taskHierarchy;
      console.log('[USE_URL_FILTERS] Parsed taskHierarchy from URL:', taskHierarchy);
    } else if (parentOnly !== null || includeSubTasks !== null) {
      // Convert boolean parameters from main task hub to string format
      const isParentOnly = parentOnly === '1' || parentOnly === 'true';
      const isIncludeSubTasks = includeSubTasks === '1' || includeSubTasks === 'true';
      
      if (isParentOnly && !isIncludeSubTasks) {
        filters.taskHierarchy = 'parent_only';
      } else if (!isParentOnly && isIncludeSubTasks) {
        filters.taskHierarchy = 'include_subtasks';
      } else {
        filters.taskHierarchy = 'all';
      }
      console.log('[USE_URL_FILTERS] Converted parentOnly/includeSubTasks to taskHierarchy:', filters.taskHierarchy);
    }
    
    const search = searchParams.get('search');
    if (search) filters.search = search;
    
    // Array parameter for excludeStatuses - check both parameter names for compatibility
    const excludeStatuses = searchParams.get('exclude') || searchParams.get('hideParentStatuses');
    if (excludeStatuses) {
      filters.excludeStatuses = excludeStatuses.split(',').filter(s => s.trim());
      console.log('[USE_URL_FILTERS] Parsed excludeStatuses from URL:', filters.excludeStatuses);
    }
    
    // Array parameter for excludeChildStatuses - check both parameter names for compatibility
    const excludeChildStatuses = searchParams.get('excludeChild') || searchParams.get('hideChildStatuses');
    if (excludeChildStatuses) {
      filters.excludeChildStatuses = excludeChildStatuses.split(',').filter(s => s.trim());
      console.log('[USE_URL_FILTERS] Parsed excludeChildStatuses from URL:', filters.excludeChildStatuses);
    }
    
    console.log('[USE_URL_FILTERS] Final parsed filters:', filters);
    return filters;
  }, [searchParams, user]);

  // Get current filters from URL on mount
  const [filters, setFilters] = useState<URLFilterParams>(() => {
    if (typeof window !== 'undefined') {
      return { ...initialFilters, ...parseFiltersFromURL() };
    }
    return initialFilters;
  });

  // Update URL when filters change
  const updateURL = useCallback((newFilters: URLFilterParams) => {
    const params = new URLSearchParams();
    
    // Add non-empty filter values to URL - use consistent parameter names
    if (newFilters.projectId && newFilters.projectId !== 'all') {
      params.set('projectId', newFilters.projectId);
    }
    
    if (newFilters.status && newFilters.status !== 'all') {
      params.set('status', newFilters.status);
    }
    
    if (newFilters.label && newFilters.label !== 'all') {
      params.set('label', newFilters.label);
    }
    
    if (newFilters.assignedTo && newFilters.assignedTo !== 'all') {
      if (Array.isArray(newFilters.assignedTo)) {
        // Multi-select: convert array to comma-separated string
        const assigneeIds = newFilters.assignedTo.map(id => 
          id === 'current' && user?.id ? user.id : id
        );
        params.set('assignedTo', assigneeIds.join(','));
      } else {
        // Single value: convert 'current' to actual user ID for URL
        const assignedToValue = newFilters.assignedTo === 'current' && user?.id 
          ? user.id 
          : newFilters.assignedTo;
        params.set('assignedTo', assignedToValue);
      }
    }
    
    // Task hierarchy - convert string format to boolean parameters for consistency with main task hub
    if (newFilters.taskHierarchy && newFilters.taskHierarchy !== 'all') {
      if (newFilters.taskHierarchy === 'parent_only') {
        params.set('parentOnly', '1');
        params.set('includeSubTasks', '0');
      } else if (newFilters.taskHierarchy === 'include_subtasks') {
        params.set('parentOnly', '0');
        params.set('includeSubTasks', '1');
      }
      // For other values, we could set hierarchy parameter as fallback
      // params.set('hierarchy', newFilters.taskHierarchy);
    }
    
    if (newFilters.search) {
      params.set('search', newFilters.search);
    }
    
    if (newFilters.excludeStatuses && newFilters.excludeStatuses.length > 0) {
      params.set('hideParentStatuses', newFilters.excludeStatuses.join(','));
    }
    
    if (newFilters.excludeChildStatuses && newFilters.excludeChildStatuses.length > 0) {
      params.set('hideChildStatuses', newFilters.excludeChildStatuses.join(','));
    }
    
    // Build the new URL
    const newURL = params.toString() ? `?${params.toString()}` : '';
    const currentPath = window.location.pathname;
    
    // Only update if URL actually changed
    if (window.location.search !== newURL) {
      router.replace(`${currentPath}${newURL}`, { scroll: false });
    }
  }, [router, user]);

  // Update filters and sync to URL
  const updateFilters = useCallback((newFilters: URLFilterParams) => {
    setFilters(newFilters);
    updateURL(newFilters);
  }, [updateURL]);

  // Initialize filters from URL on mount
  useEffect(() => {
    if (!isInitialized) {
      const urlFilters = parseFiltersFromURL();
      const mergedFilters = { ...initialFilters, ...urlFilters };
      setFilters(mergedFilters);
      setIsInitialized(true);
    }
  }, [parseFiltersFromURL, initialFilters, isInitialized]);

  // Listen for URL changes (browser back/forward)
  useEffect(() => {
    if (isInitialized) {
      const urlFilters = parseFiltersFromURL();
      const mergedFilters = { ...initialFilters, ...urlFilters };
      
      // Only update state if filters actually changed
      if (JSON.stringify(filters) !== JSON.stringify(mergedFilters)) {
        setFilters(mergedFilters);
      }
    }
  }, [searchParams, parseFiltersFromURL, initialFilters, filters, isInitialized]);

  // Helper functions for individual filter updates
  const updateProjectFilter = useCallback((projectId: string) => {
    const newFilters = { 
      ...filters, 
      projectId: projectId === 'all' ? undefined : projectId 
    };
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  const updateStatusFilter = useCallback((status: string) => {
    const newFilters = { 
      ...filters, 
      status: status === 'all' ? undefined : status 
    };
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  const updateLabelFilter = useCallback((label: string) => {
    const newFilters = { 
      ...filters, 
      label: label === 'all' ? undefined : label 
    };
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  const updateAssigneeFilter = useCallback((assignedTo: string | string[]) => {
    let assignedToValue: string | string[] | undefined;
    
    if (Array.isArray(assignedTo)) {
      // Multi-select array
      const cleanedValue = assignedTo.filter(v => v && v.trim() !== '' && v !== 'all');
      assignedToValue = cleanedValue.length === 0 ? undefined : cleanedValue;
    } else {
      // Single value
      assignedToValue = assignedTo === 'all' ? undefined : assignedTo;
    }
    
    const newFilters = { 
      ...filters, 
      assignedTo: assignedToValue
    };
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  const updateHierarchyFilter = useCallback((taskHierarchy: string) => {
    const newFilters = { 
      ...filters, 
      taskHierarchy: taskHierarchy === 'all' ? undefined : taskHierarchy 
    };
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  const updateExcludeStatusesFilter = useCallback((statuses: string[]) => {
    updateFilters({ ...filters, excludeStatuses: statuses });
  }, [filters, updateFilters]);

  const updateExcludeChildStatusesFilter = useCallback((statuses: string[]) => {
    updateFilters({ ...filters, excludeChildStatuses: statuses });
  }, [filters, updateFilters]);

  const updateSearchFilter = useCallback((search: string) => {
    const newFilters = { 
      ...filters, 
      search: search || undefined 
    };
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  const clearAllFilters = useCallback(() => {
    const clearedFilters = { ...initialFilters };
    updateFilters(clearedFilters);
  }, [initialFilters, updateFilters]);

  return {
    filters,
    updateProjectFilter,
    updateStatusFilter,
    updateLabelFilter,
    updateAssigneeFilter,
    updateHierarchyFilter,
    updateExcludeStatusesFilter,
    updateExcludeChildStatusesFilter,
    updateSearchFilter,
    clearAllFilters,
    isInitialized
  };
}
