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
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLoading } from '@/app/projly/components/ui/PageLoading';
import { PlusCircle, List, LayoutGrid, Filter } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/app/projly/contexts/AuthContextCustom';
import { projlyProjectsService } from '@/lib/services/projly';

// Create a detailed log function for debugging
const log = (...args: any[]) => console.log('[TasksContainer]', ...args);

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
}

// Define interface for UI filters
interface UIFilters {
  projectId?: string;
  assignedTo?: string;
  status?: string;
  search?: string;
  taskHierarchy?: string; // Filter for parent tasks only or include sub-tasks
}

// Define interface for API filters that includes backend parameters
interface APIFilters extends UIFilters {
  parentOnly?: string;
  includeSubTasks?: string;
}

export function TasksContainer({
  context = 'main',
  parentId,
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
    maxDepth: 1,
    showAllSubtasks: false
  },
  onDataChange,
  recursiveSubtasks = false,
  tableParentTaskId
}: TasksContainerProps) {
  // Get current user from AuthContext
  const { user } = useAuth();
  log("Current user:", user?.id);
  
  // State for tasks and loading
  const [rawTasks, setRawTasks] = useState<ProjlyTask[]>(initialTasks || []);
  const [loading, setLoading] = useState<boolean>(autoLoad && !initialTasks);
  const [error, setError] = useState<string | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [currentFilters, setCurrentFilters] = useState<UIFilters>(initialFilters);
  
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
  const [projects, setProjects] = useState<any[]>([]);
  
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
    
    log('[TASKS CONTAINER] Converted UI filters to API filters:', apiFilters);
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
  
  const handleAssigneeFilterChange = (value: string) => {
    log('[TASKS CONTAINER] Assignee filter changed:', value);
    
    // If 'current' is selected, use the actual user ID for the API filter
    // but keep 'current' in the UI filter for the dropdown selection
    let apiValue = value === 'all' ? undefined : value;
    
    // For API calls, replace 'current' with the actual user ID
    if (value === 'current' && user?.id) {
      log('[TASKS CONTAINER] Using current user ID for filtering:', user.id);
      apiValue = user.id;
    }
    
    // Update UI filters (this keeps 'current' as the value for the dropdown)
    const updatedFilters = { 
      ...currentFilters, 
      assignedTo: value === 'all' ? undefined : value 
    };
    setCurrentFilters(updatedFilters);
    
    // Create API filters with the resolved user ID
    const apiFilters = toApiFilters({
      ...updatedFilters,
      assignedTo: apiValue
    });
    
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
  
  // Handle search filter changes
  const handleSearchChange = (value: string) => {
    log('[TASKS CONTAINER] Search filter changed:', value);
    const updatedFilters = { ...currentFilters, search: value };
    setCurrentFilters(updatedFilters);
    
    // Apply filters immediately
    loadTasks(toApiFilters(updatedFilters));
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
  
  // Use the task hierarchy hook
  const {
    tasks: filteredTasks,
    getTaskDepth,
    isParentTask,
    getSubtaskCount
  } = useTaskHierarchy(rawTasks, effectiveHierarchyOptions);
  
  // Context-specific title
  const getContextTitle = () => {
    switch (context) {
      case 'project':
        return displayOptions.title || 'Project Tasks';
      case 'task':
        return displayOptions.title || 'Subtasks';
      default:
        return displayOptions.title || 'Tasks';
    }
  };
  
  // Context-specific loading function
  const loadTasks = async (filters?: TaskFilters) => {
    if (!autoLoad) return;
    
    try {
      setLoading(true);
      setError(null);
      log(`Loading tasks for context: ${context}, parentId: ${parentId}, filters:`, filters);
      
      let tasks: ProjlyTask[] = [];
      const effectiveFilters = filters || currentFilters;
      
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
              
              // If recursive loading is enabled, fetch nested subtasks for each direct subtask
              if (recursiveSubtasks && parentTask.subTasks.length > 0) {
                const nestedSubtasks = await Promise.all(
                  parentTask.subTasks.map(async (subtask) => {
                    try {
                      log(`Loading nested subtasks for subtask ${subtask.id}`);
                      const fullSubtask = await tasksService.getTask(subtask.id);
                      return fullSubtask?.subTasks || [];
                    } catch (error) {
                      log(`Error loading nested subtasks for ${subtask.id}`, error);
                      return [];
                    }
                  })
                );
                
                // Flatten nested subtasks and add to tasks array
                const flattenedNestedSubtasks = nestedSubtasks.flat();
                log(`Loaded ${flattenedNestedSubtasks.length} nested subtasks across all direct subtasks`);
                tasks = [...tasks, ...flattenedNestedSubtasks];
              }
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
  
  // Load projects for filter dropdown
  const loadProjects = async () => {
    try {
      log('Loading projects for filter dropdown');
      const projectsList = await projlyProjectsService.getProjects();
      log(`Loaded ${projectsList.length} projects for filter`);
      setProjects(projectsList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      log('Error loading projects:', errorMessage);
    }
  };
  
  // Load tasks and projects on mount
  useEffect(() => {
    // Load projects for filter dropdown
    loadProjects();
    
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
                    value={(currentFilters as any).search || ""}
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
                <Card className="mt-4 mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Filters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Project Filter */}
                        <div className="flex flex-col gap-2">
                          <label htmlFor="project-filter" className="text-sm font-medium">
                            Project
                          </label>
                          <Select 
                            value={currentFilters.projectId || "all"}
                            onValueChange={handleProjectFilterChange}
                          >
                            <SelectTrigger id="project-filter">
                              <SelectValue placeholder="All Projects" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Projects</SelectItem>
                              {Array.isArray(projects) && projects.map(project => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Status Filter */}
                        <div className="flex flex-col gap-2">
                          <label htmlFor="status-filter" className="text-sm font-medium">
                            Status
                          </label>
                          <Select
                            value={currentFilters.status || "all"}
                            onValueChange={handleStatusFilterChange}
                          >
                            <SelectTrigger id="status-filter">
                              <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              {uniqueStatuses.map((status) => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Assigned To Filter */}
                        <div className="flex flex-col gap-2">
                          <label htmlFor="assigned-filter" className="text-sm font-medium">
                            Assigned To
                          </label>
                          <Select
                            value={currentFilters.assignedTo || "all"}
                            onValueChange={handleAssigneeFilterChange}
                          >
                            <SelectTrigger id="assigned-filter">
                              <SelectValue placeholder="All Members" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Members</SelectItem>
                              <SelectItem value="current">My Tasks</SelectItem>
                              {uniqueUsers.length > 0 && (
                                <>
                                  <SelectItem value="divider" disabled>
                                    <Separator className="my-1" />
                                  </SelectItem>
                                  {uniqueUsers.map(assignee => (
                                    <SelectItem key={assignee.id} value={assignee.id}>
                                      {assignee.name}
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Task Hierarchy Filter */}
                        <div className="flex flex-col gap-2">
                          <label htmlFor="hierarchy-filter" className="text-sm font-medium">
                            Task Hierarchy
                          </label>
                          <Select
                            value={currentFilters.taskHierarchy || "all"}
                            onValueChange={handleTaskHierarchyFilterChange}
                          >
                            <SelectTrigger id="hierarchy-filter">
                              <SelectValue placeholder="All Tasks" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Tasks</SelectItem>
                              <SelectItem value="parent_only">Parent Tasks Only</SelectItem>
                              <SelectItem value="include_subtasks">Include Subtasks</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
            projectId={context === 'project' && parentId ? parentId : ''}
            taskId={context === 'task' ? parentId : undefined}
            onTaskChange={async () => handleOperationComplete()}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default TasksContainer;
