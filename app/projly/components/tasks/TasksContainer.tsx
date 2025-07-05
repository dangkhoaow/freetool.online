/**
 * TasksContainer Component
 * 
 * A reusable container component for displaying tasks in different contexts:
 * - Main tasks page
 * - Project detail page (Tasks tab)
 * - Task detail page (Subtasks tab)
 * 
 * Uses the useTaskHierarchy hook for consistent task filtering and organization.
 * Supports both list and board views for task visualization.
 * 
 * @created 2025-05-24
 * @updated 2025-05-29 - Added board view support
 * @updated 2025-05-30 - Added filters in container for both view modes
 */

"use client";

// Declare global interface for window to add searchTimeout property
declare global {
  interface Window {
    searchTimeout?: NodeJS.Timeout;
  }
}

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TasksTable } from './TasksTable';
import { TasksBoard } from './TasksBoard';
import { TaskDialog } from '@/components/projects/TaskDialog';
import { Task as ProjlyTask, TaskFilters } from '@/lib/services/projly/types';
import { Task } from './TasksTable'; // Import the Task type from TasksTable for compatibility
import { useTaskHierarchy, TaskHierarchyOptions } from '@/lib/services/projly/tasks/use-task-hierarchy';
import { tasksService } from '@/lib/services/projly/tasks/tasks-service';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLoading } from '@/app/projly/components/ui/PageLoading';
import { PlusCircle, List, LayoutGrid, Filter } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/app/projly/contexts/AuthContextCustom';
import { projlyProjectsService } from '@/lib/services/projly';
import { TaskFilters as TaskFiltersComponent } from './TaskFilters';

// Create a detailed log function for debugging
const log = (...args: any[]) => console.log('[TasksContainer]', ...args);

// Helper function to get assignee initials for avatar fallback
export const getAssigneeInitials = (assignee?: any) => {
  if (assignee) {
    if (assignee.firstName && assignee.lastName) {
      return `${assignee.firstName.charAt(0)}${assignee.lastName.charAt(0)}`.toUpperCase();
    } else if (assignee.name) {
      const parts = assignee.name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return parts[0].charAt(0);
    } else if (assignee.email) {
      return assignee.email.charAt(0).toUpperCase();
    }
  }
  return 'U';
};

// Helper function to get label initials
export const getLabelInitials = (label?: string) => {
  if (!label) return '-';
  
  // Split by spaces, hyphens or underscores
  const parts = label.split(/[ \-_]/);
  
  if (parts.length > 1) {
    // Take first letter of each part, up to 2 parts
    return parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
  }
  
  // For single word labels
  if (label.length > 1) {
    return label.slice(0, 2).toUpperCase(); // First two characters
  } else {
    return label.charAt(0).toUpperCase(); // Just the first character
  }
};

export interface TaskWithDepth extends Task {
  depth?: number;
  children?: TaskWithDepth[];
  // Ensure parentTask is fully compatible with Task type
  parentTask?: Task;
  // Flag to track if nested subtasks have been loaded
  nestedSubtasksLoaded?: boolean;
}

export interface TasksContainerProps {
  // Context type determines behavior and UI
  context: 'main' | 'project' | 'task';
  // ID of the parent entity (project ID for project context, task ID for task context)
  parentId?: string;
  // Initial task data (passed from parent)
  initialTasks?: ProjlyTask[];
  // Whether to load tasks automatically (default: true)
  autoLoad?: boolean;
  // Optional initial filters
  initialFilters?: TaskFilters;
  // Display options
  displayOptions?: {
    showHeader?: boolean;
    showAddButton?: boolean;
    compact?: boolean;
    title?: string;
  };
  // Optional hierarchy options
  hierarchyOptions?: TaskHierarchyOptions;
  // Callback when data changes
  onDataChange?: (tasks: ProjlyTask[]) => void;
  // Whether to recursively load subtasks
  recursiveSubtasks?: boolean;
  tableParentTaskId?: string; // Forwards to TasksTable as parentTaskId
  parentProjectId?: string;
}

// Define interface for UI filters
interface UIFilters {
  projectId?: string;
  assignedTo?: string;
  status?: string;
  search?: string;
  taskHierarchy?: string; // Filter for parent tasks only or include sub-tasks
  label?: string; // Add label field to UIFilters
  excludeStatuses?: string[]; // Add excludeStatuses field to UIFilters
}

// Define interface for API filters that includes backend parameters
interface APIFilters extends UIFilters {
  parentOnly?: string;
  includeSubTasks?: string;
  excludeStatuses?: string[]; // Add excludeStatuses field to APIFilters
}

export function TasksContainer({
  context = 'main',
  parentId,
  parentProjectId,
  initialTasks,
  autoLoad = true,
  initialFilters = {},
  displayOptions = {
    showHeader: true,
    showAddButton: true,
    compact: false,
    title: 'Tasks'
  },
  hierarchyOptions = {
    maxDepth: Number.MAX_SAFE_INTEGER,  // Show all levels deep
    showAllSubtasks: true
  },
  onDataChange,
  recursiveSubtasks = false,
  tableParentTaskId
}: TasksContainerProps) {
  // Get current user from AuthContext
  const { user } = useAuth();
  log("Current user:", user?.id);
  
  // State for tasks data
  const [rawTasks, setRawTasks] = useState<ProjlyTask[]>(initialTasks || []);
  const [loading, setLoading] = useState<boolean>(autoLoad && !initialTasks);
  const [error, setError] = useState<string | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [currentFilters, setCurrentFilters] = useState<UIFilters>({
    ...initialFilters,
    excludeStatuses: initialFilters.excludeStatuses || ['Completed', 'Golive'] // Default to exclude 'Completed' and 'Golive' tasks
  });
  
  // State for client-side filtering
  const [clientSideFilters, setClientSideFilters] = useState<UIFilters>({});
  const [lastNavigationTime, setLastNavigationTime] = useState<number>(Date.now());

  // State for filter visibility with localStorage persistence
  const [showFilters, setShowFilters] = useState<boolean>(() => {
    // Try to get stored value from localStorage
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('projly_tasks_show_filters');
      return storedValue === 'true';
    }
    return false;
  });
  
  // State for projects list used in filters
  // Use React Query for projects data with 5-minute staleTime to prevent unnecessary API calls
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'], // Match the existing invalidation key in handleOperationComplete
    queryFn: async () => {
      log('Loading projects for filter dropdown via React Query');
      try {
        const projectsList = await projlyProjectsService.getProjects();
        log(`Loaded ${projectsList.length} projects for filter`);
        return projectsList;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
        log('Error loading projects:', errorMessage);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data won't refetch until stale
  });
  
  // Get unique statuses from tasks for status filter
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    rawTasks.forEach(task => {
      if (task.status) statuses.add(task.status);
    });
    return Array.from(statuses).sort();
  }, [rawTasks]);
  
  // Get unique users from tasks for assignee filter
  const uniqueUsers = useMemo(() => {
    const users = new Map<string, any>();
    rawTasks.forEach(task => {
      if (task.assignee && task.assignee.id) {
        users.set(task.assignee.id, {
          id: task.assignee.id,
          name: task.assignee.firstName && task.assignee.lastName 
            ? `${task.assignee.firstName} ${task.assignee.lastName}` 
            : task.assignee.email || 'Unknown'
        });
      }
    });
    return Array.from(users.values());
  }, [rawTasks]);
  
  // Get unique labels from tasks for label filter
  const uniqueLabels = useMemo(() => {
    const labels = new Set<string>();
    rawTasks.forEach(task => {
      if (task.label) labels.add(task.label);
    });
    return Array.from(labels).sort();
  }, [rawTasks]);
  
  // Function to toggle filter visibility
  const toggleFilters = () => {
    const newState = !showFilters;
    setShowFilters(newState);
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('projly_tasks_show_filters', newState.toString());
    }
    log(`Toggled filters visibility to: ${newState}`);
  };
  
  // View mode state (list or board)
  const [viewMode, setViewMode] = useState<'list' | 'board'>(() => {
    // Try to get stored value from localStorage
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('projly_tasks_view_mode');
      return (storedValue === 'board') ? 'board' : 'list';
    }
    return 'list'; // Default to list view
  });
  
  // Handle view mode change
  const handleViewModeChange = (value: string) => {
    if (value === 'list' || value === 'board') {
      log(`Changing view mode to: ${value}`);
      setViewMode(value);
      
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('projly_tasks_view_mode', value);
      }
    }
  };
  
  // Convert UI filters to API filters compatible with TaskFilters type
  const toApiFilters = (uiFilters: UIFilters): TaskFilters => {
    // Start with a copy of the UI filters
    const apiFilters: any = { ...uiFilters };
    
    // Deliberately exclude search from API filters - search is always handled client-side
    if (apiFilters.search) {
      delete apiFilters.search;
    }
    
    // Exclude excludeStatuses from API filters - this is client-side only filtering
    if (apiFilters.excludeStatuses) {
      delete apiFilters.excludeStatuses;
    }
    
    // Handle special case for 'current' assignee - replace with actual user ID
    if (apiFilters.assignedTo === 'current') {
      if (user?.id) {
        log(`[TASKS CONTAINER] Replacing 'current' assignee with actual user ID: ${user.id}`);
        apiFilters.assignedTo = user.id;
      } else {
        log(`[TASKS CONTAINER] Warning: 'current' assignee specified but no user ID available`);
        delete apiFilters.assignedTo; // Remove if we can't resolve the user ID
      }
    }
    
    // Convert task hierarchy filter to boolean values
    if (uiFilters.taskHierarchy) {
      if (uiFilters.taskHierarchy === 'parent_only') {
        apiFilters.parentOnly = true;
        apiFilters.includeSubTasks = false;
      } else if (uiFilters.taskHierarchy === 'include_subtasks') {
        apiFilters.parentOnly = false;
        apiFilters.includeSubTasks = true;
      }
      // Remove UI-only property
      delete apiFilters.taskHierarchy;
    }
    
    log('[TASKS CONTAINER] Converted UI filters to API filters (excluding search):', apiFilters);
    return apiFilters as TaskFilters;
  };
  
  // Functions to handle filter changes
  const handleProjectFilterChange = (value: string) => {
    log('[TASKS CONTAINER] Project filter changed:', value);
    const updatedFilters = { 
      ...currentFilters, 
      projectId: value === 'all' ? undefined : value 
    };
    setCurrentFilters(updatedFilters);
    
    // Apply filters immediately if callback provided
    loadTasks(toApiFilters(updatedFilters));
  };
  
  const handleStatusFilterChange = (value: string) => {
    log('[TASKS CONTAINER] Status filter changed:', value);
    const updatedFilters = { 
      ...currentFilters, 
      status: value === 'all' ? undefined : value 
    };
    setCurrentFilters(updatedFilters);
    
    // Apply filters immediately if callback provided
    loadTasks(toApiFilters(updatedFilters));
  };
  
  const handleAssigneeChange = (value: string) => {
    log('[TASKS CONTAINER] Assignee filter changed:', value);
    
    // Update UI filters (this keeps 'current' as the value for the dropdown)
    const updatedFilters = { 
      ...currentFilters, 
      assignedTo: value === 'all' ? undefined : value 
    };
    setCurrentFilters(updatedFilters);
    
    // Let toApiFilters handle the 'current' user conversion
    const apiFilters = toApiFilters(updatedFilters);
    
    log('[TASKS CONTAINER] Applying API filters:', apiFilters);
    // Apply filters immediately
    loadTasks(apiFilters);
  };
  
  const handleTaskHierarchyFilterChange = (value: string) => {
    log('[TASKS CONTAINER] Task hierarchy filter changed:', value);
    const updatedFilters = { 
      ...currentFilters, 
      taskHierarchy: value === 'all' ? undefined : value 
    };
    setCurrentFilters(updatedFilters);
    
    // Apply filters immediately if callback provided
    loadTasks(toApiFilters(updatedFilters));
  };
  
  const handleLabelFilterChange = (value: string) => {
    log('[TASKS CONTAINER] Label filter changed:', value);
    const updatedFilters = { 
      ...currentFilters, 
      label: value === 'all' ? undefined : value 
    };
    setCurrentFilters(updatedFilters);
    
    // Apply filters immediately if callback provided
    loadTasks(toApiFilters(updatedFilters));
  };

  const handleExcludeStatusesFilterChange = (statuses: string[]) => {
    log('[TASKS CONTAINER] Exclude statuses filter changed:', statuses);
    const updatedFilters = { 
      ...currentFilters, 
      excludeStatuses: statuses 
    };
    setCurrentFilters(updatedFilters);
    
    // This is client-side filtering only, no need to reload tasks from server
    log('Updated exclude statuses filter:', statuses);
  };
  
  // Handle search filter changes
  // Use a local state for search to prevent loading animation
  const [searchValue, setSearchValue] = useState<string>((currentFilters as any).search || '');

  // Initialize searchValue from currentFilters when they change
  useEffect(() => {
    setSearchValue((currentFilters as any).search || '');
  }, [currentFilters]);

  // Enhanced navigation detection and task refresh mechanism
  useEffect(() => {
    // Always force a refresh when component mounts
    log('[TASKS CONTAINER] Component mounted, checking for task edits');
    
    // Check if a task was edited
    const taskEdited = localStorage.getItem('projly_task_edited') === 'true';
    const lastEditedTask = localStorage.getItem('projly_last_edited_task');
    const editTimestamp = localStorage.getItem('projly_edit_timestamp');
    
    if (taskEdited) {
      log(`[TASKS CONTAINER] Task edit detected! Last edited task: ${lastEditedTask}, timestamp: ${editTimestamp}`);
      
      // Force a refresh of the tasks
      log('[TASKS CONTAINER] Forcing data refresh after task edit');
      loadTasks();
      
      // Don't clear the flag here - let the ProjectDetail component handle it
      // This ensures all instances of TasksContainer refresh their data
    } else {
      // Even without a task edit, refresh if we have initialTasks to ensure fresh data
      if (initialTasks && initialTasks.length > 0) {
        log('[TASKS CONTAINER] Has initialTasks, refreshing data to ensure freshness');
        loadTasks();
      } else if (autoLoad) {
        // If no initialTasks but autoLoad is true, load tasks
        log('[TASKS CONTAINER] No initialTasks but autoLoad is true, loading tasks');
        loadTasks();
      }
    }
  }, []);
  
  // Add a listener for visibility changes to detect when the user returns to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        log('[TASKS CONTAINER] Tab became visible, checking for task edits');
        
        // Check if a task was edited
        const taskEdited = localStorage.getItem('projly_task_edited') === 'true';
        
        if (taskEdited) {
          log('[TASKS CONTAINER] Task edit detected on visibility change, refreshing data');
          loadTasks();
        }
      }
    };
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Add a listener for storage events to detect changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'projly_task_edited' && event.newValue === 'true') {
        log('[TASKS CONTAINER] Task edit detected from storage event, refreshing data');
        loadTasks();
      }
    };
    
    // Add storage event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Debounced search handler with pure client-side filtering
  const handleSearchChange = (value: string) => {
    log('[TASKS CONTAINER] Search filter changed:', value);
    // Update the local search value immediately for UI responsiveness
    setSearchValue(value);
    
    // Use setTimeout to debounce the filter application
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    window.searchTimeout = setTimeout(() => {
      // Update client-side filters for local filtering
      setClientSideFilters(prev => ({
        ...prev,
        search: value
      } as UIFilters));
      
      // For search, we NEVER make an API call - always filter client-side
      // However, we still update the currentFilters state for consistency
      const updatedFilters = { ...currentFilters, search: value };
      setCurrentFilters(updatedFilters);
      
      // Log for debugging
      log(`[TASKS CONTAINER] Applied client-side search filter: "${value}" to ${rawTasks.length} tasks`);
    }, 300); // 300ms debounce
  };
  
  // React Query client for cache invalidation
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Determine effective hierarchy options based on context
  const effectiveHierarchyOptions: TaskHierarchyOptions = {
    ...hierarchyOptions,
    // For project context, filter by project ID
    projectId: context === 'project' ? parentId : null,
    // For task context, filter by parent task ID
    parentTaskId: context === 'task' ? parentId : null,
    // For task context, always show all subtasks
    showAllSubtasks: context === 'task' ? true : hierarchyOptions.showAllSubtasks
  };
  
  // Apply hierarchy filter (parent_only) before other client-side filtering
  const tasksForHierarchy = useMemo(() => {
    if (currentFilters.taskHierarchy === 'parent_only') {
      console.log('[TASKS CONTAINER] Applying parent_only hierarchy filter');
      return rawTasks.filter(task => !task.parentTaskId);
    }
    return rawTasks;
  }, [rawTasks, currentFilters.taskHierarchy]);

  // Apply client-side search filtering on tasks prepared for hierarchy
  const searchFilteredTasks = useMemo(() => {
    const searchTerm = (clientSideFilters as any).search;
    if (!searchTerm) {
      return tasksForHierarchy;
    }
    const lower = (searchTerm as string).toLowerCase();
    console.log(`[TASKS CONTAINER] Applying client-side search filter: "${lower}"`);
    return tasksForHierarchy.filter(task => {
      return (
        (task.title?.toLowerCase().includes(lower)) ||
        (task.id?.toLowerCase().includes(lower))
      );
    });
  }, [tasksForHierarchy, (clientSideFilters as any).search]);

  // Apply exclude statuses filtering at the highest level (parent tasks only)
  const clientSideFilteredTasks = useMemo(() => {
    const excludeStatuses = currentFilters.excludeStatuses;
    if (!excludeStatuses || excludeStatuses.length === 0) {
      return searchFilteredTasks;
    }
    console.log(`[TASKS CONTAINER] Applying exclude statuses filter at highest level: ${excludeStatuses.join(', ')}`);
    
    // Create a map of parent tasks to check their status
    const parentTaskStatusMap = new Map<string, string>();
    const excludedParentIds = new Set<string>();
    
    // First pass: identify parent tasks and their statuses
    searchFilteredTasks.forEach(task => {
      if (!task.parentTaskId) {
        // This is a parent task
        parentTaskStatusMap.set(task.id, task.status);
        if (excludeStatuses.includes(task.status)) {
          excludedParentIds.add(task.id);
        }
      }
    });
    
    // Second pass: filter tasks based on parent task status
    return searchFilteredTasks.filter(task => {
      // If this is a parent task, exclude it if its status is in the excluded list
      if (!task.parentTaskId) {
        return !excludeStatuses.includes(task.status);
      }
      
      // If this is a child task, exclude it only if its parent is excluded
      // Find the root parent task ID
      let rootParentId = task.parentTaskId;
      
      // Traverse up the hierarchy to find the root parent
      let currentTask = searchFilteredTasks.find(t => t.id === rootParentId);
      while (currentTask && currentTask.parentTaskId) {
        rootParentId = currentTask.parentTaskId;
        currentTask = searchFilteredTasks.find(t => t.id === rootParentId);
      }
      
      // Only exclude if the root parent is excluded
      return !excludedParentIds.has(rootParentId);
    });
  }, [searchFilteredTasks, currentFilters.excludeStatuses]);

  // Use the task hierarchy hook with filtered tasks
  const {
    tasks: filteredTasks,
    getTaskDepth,
    isParentTask,
    getSubtaskCount
  } = useTaskHierarchy(clientSideFilteredTasks, effectiveHierarchyOptions);
  
  // Context-specific title
  const getContextTitle = () => {
    const taskCount = filteredTasks?.length || 0;
    switch (context) {
      case 'project':
        return displayOptions.title || `Project Tasks (${taskCount})`;
      case 'task':
        return displayOptions.title || `Subtasks (${taskCount})`;
      default:
        return displayOptions.title || `Tasks (${taskCount})`;
    }
  };
  
  // Context-specific loading function
  const loadTasks = async (filters?: TaskFilters) => {
    if (!autoLoad) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Remove search from API filters - search is always handled client-side
      const apiFilters = { ...filters } as any;
      if (apiFilters && 'search' in apiFilters) {
        delete apiFilters.search;
        log(`[TASKS CONTAINER] Removed search filter from API call, will filter client-side instead`);
      }
      
      log(`Loading tasks for context: ${context}, parentId: ${parentId}, filters:`, apiFilters);
      
      let tasks: ProjlyTask[] = [];
      const effectiveFilters = apiFilters || currentFilters;
      
      switch (context) {
        case 'project':
          if (!parentId) {
            throw new Error('Project ID is required for project context');
          }
          tasks = await tasksService.getProjectTasks(parentId, effectiveFilters);
          break;
        case 'task':
          if (!parentId) {
            throw new Error('Task ID is required for task context');
          }
          // If we want to load subtasks recursively, fetch the task and its subtasks directly
          if (recursiveSubtasks) {
            log('Loading task with recursive subtasks', parentId);
            const parentTask = await tasksService.getTask(parentId);
            if (parentTask && parentTask.subTasks) {
              log(`Loaded parent task with ${parentTask.subTasks.length} direct subtasks`);
              tasks = [parentTask, ...parentTask.subTasks];
              
              // Recursive function to load all levels of subtasks
              const loadNestedSubtasks = async (parentTasks: any[]): Promise<any[]> => {
                if (!parentTasks.length) return [];
                
                const allNestedTasks: any[] = [];
                
                // Process each parent task to get its subtasks
                for (const task of parentTasks) {
                  try {
                    log(`Loading nested subtasks for task ${task.id}`);
                    const fullTask = await tasksService.getTask(task.id);
                    
                    if (fullTask?.subTasks && fullTask.subTasks.length > 0) {
                      log(`Task ${task.id} has ${fullTask.subTasks.length} subtasks`);
                      // Add these subtasks to our results
                      allNestedTasks.push(...fullTask.subTasks);
                      
                      // Recursively get subtasks of these subtasks
                      const deeperSubtasks = await loadNestedSubtasks(fullTask.subTasks);
                      allNestedTasks.push(...deeperSubtasks);
                    }
                  } catch (error) {
                    log(`Error loading nested subtasks for ${task.id}`, error);
                  }
                }
                
                return allNestedTasks;
              };
              
              // Start recursive loading with the direct subtasks
              const allNestedSubtasks = await loadNestedSubtasks(parentTask.subTasks);
              log(`Loaded ${allNestedSubtasks.length} nested subtasks across all levels`);
              tasks = [...tasks, ...allNestedSubtasks];
            } else {
              log('Parent task not found or has no subtasks');
            }
          } else {
            // Original implementation - load all tasks and filter by parent task ID in the hierarchy hook
            tasks = await tasksService.getUserTasks(effectiveFilters);
          }
          break;
        default:
          tasks = await tasksService.getUserTasks(effectiveFilters);
      }
      
      log(`Loaded ${tasks.length} tasks`);
      setRawTasks(tasks);
      
      // Notify parent of data change
      if (onDataChange) {
        onDataChange(tasks);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks';
      log('Error loading tasks:', errorMessage);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Projects are now loaded via React Query with caching
  
  // Load tasks on mount (projects are now loaded via React Query with caching)
  useEffect(() => {
    // Load tasks
    if (initialTasks) {
      log('Using initial tasks:', initialTasks.length);
      setRawTasks(initialTasks);
    } else if (autoLoad) {
      log('Auto-loading tasks with initial filters:', initialFilters);
      // Update current filters with initial filters
      setCurrentFilters(initialFilters);
      loadTasks(initialFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, parentId, context, initialTasks]); // Removed initialFilters from dependency array to prevent infinite loops
  
  // Refresh data after operations
  const handleOperationComplete = (updatedFilters?: TaskFilters) => {
    log('Operation completed, refreshing data with filters:', updatedFilters);
    // Invalidate queries to trigger refetch
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    if (context === 'project' && parentId) {
      queryClient.invalidateQueries({ queryKey: ['project', parentId] });
    }
    if (context === 'task' && parentId) {
      queryClient.invalidateQueries({ queryKey: ['task', parentId] });
    }
    
    // First, notify parent component of data change before reloading
    // This is crucial for parent components to prepare for the reload
    if (onDataChange) {
      log('Calling onDataChange callback to notify parent component');
      // We pass an empty array to indicate data is about to change
      // The parent can use this to reset its state before the new data arrives
      onDataChange([]);
    }
    
    // Only update filters if they've actually changed to prevent render loops
    if (updatedFilters) {
      const hasFilterChanges = JSON.stringify(updatedFilters) !== JSON.stringify(currentFilters);
      if (hasFilterChanges) {
        log('Filters have changed, updating and reloading tasks');
        setCurrentFilters(updatedFilters);
        // Reload tasks with updated filters
        loadTasks(updatedFilters);
      } else {
        log('No filter changes detected, reloading with current filters');
        loadTasks(currentFilters);
      }
    } else {
      log('No filters provided, reloading with current filters');
      loadTasks(currentFilters);
    }
  };
  
  // Router for navigation
  const router = useRouter();
  
  // Handle adding a new task (either navigate or open dialog based on context)
  const handleAddTask = () => {
    // For main tasks list, navigate to the dedicated new task page
    if (context === 'main') {
      log('Navigating to new task page');
      router.push('/projly/tasks/new');
    } else {
      // For project detail or task detail (subtasks), open the dialog
      log(`Opening add task dialog for ${context} context`);
      setIsAddTaskOpen(true);
    }
  };
  
  return (
    <Card className={`w-full ${displayOptions.compact ? 'shadow-none border-0' : 'p-6'}`}>
      {displayOptions.showHeader && (
        <CardHeader className="flex p-0 flex-row items-center justify-between">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <CardTitle>{getContextTitle()}</CardTitle>
          </div>
          
          {displayOptions.showAddButton && (
            <Button onClick={handleAddTask} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              {context === 'task' ? 'Add Subtask' : 'Add Task'}
            </Button>
          )}
        </CardHeader>
      )}
      
      <CardContent className='p-0 pt-4'>
        {loading ? (
          <PageLoading 
            standalone={true} 
            logContext="PROJLY:TASKS:CONTAINER" 
            height="20vh" 
          />
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            {error}
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => loadTasks()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Filter section - Always visible in both list and board views */}
            <div className="mb-6">
              {/* Filter toggle button */}
              <div className="flex flex-row items-center justify-between gap-2 flex-wrap mb-4">
                <div className="flex items-center flex-1 min-w-0 gap-2">
                  <Input 
                    placeholder="Search tasks..." 
                    className="max-w-[300px] w-full"
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {/* View mode toggle */}
                  <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange}>
                    <ToggleGroupItem value="list" aria-label="List view">
                      <List className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:ml-2">List</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="board" aria-label="Board view">
                      <LayoutGrid className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:ml-2">Board</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFilters}
                    className="flex items-center justify-end gap-1 flex-shrink-0"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </div>
              </div>
              
              {/* Expandable filters section */}
              {showFilters && (
                <TaskFiltersComponent
                  filters={currentFilters}
                  projects={projects}
                  uniqueStatuses={uniqueStatuses}
                  uniqueLabels={uniqueLabels}
                  uniqueUsers={uniqueUsers}
                  onProjectChange={handleProjectFilterChange}
                  onStatusChange={handleStatusFilterChange}
                  onLabelChange={handleLabelFilterChange}
                  onAssigneeChange={handleAssigneeChange}
                  onTaskHierarchyChange={handleTaskHierarchyFilterChange}
                  onExcludeStatusesChange={handleExcludeStatusesFilterChange}
                />
              )}
            </div>
            
            {/* View content - Either table or board */}
            {viewMode === 'list' ? (
              <TasksTable
                tasks={filteredTasks as Task[]}
                initialFilters={currentFilters}
                onOperationComplete={handleOperationComplete}
                compact={displayOptions.compact}
                context={context}
                parentTaskId={tableParentTaskId}
                hideParentRow={context === 'task'}
                hideFilterUI={true}
              />
            ) : (
              <TasksBoard
                tasks={filteredTasks as Task[]}
                initialFilters={currentFilters}
                onOperationComplete={handleOperationComplete}
                compact={displayOptions.compact}
                context={context}
              />
            )}
          </>
        )}
        
        {isAddTaskOpen && (
          <TaskDialog
            open={isAddTaskOpen}
            onOpenChange={setIsAddTaskOpen}
            projectId={
              context === 'project' && parentId
                ? parentId
                : context === 'task' && parentProjectId
                ? parentProjectId
                : ''
            }
            parentTaskId={tableParentTaskId}
            onTaskChange={async () => handleOperationComplete()}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default TasksContainer;
