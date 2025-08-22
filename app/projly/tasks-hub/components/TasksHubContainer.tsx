/**
 * TasksHubContainer Component - Optimized for Performance
 * 
 * An optimized container for displaying tasks with server-side filtering,
 * search, and pagination for better performance with large datasets.
 * 
 * Key optimizations:
 * - Server-side search and filtering 
 * - Pagination with configurable page size
 * - Minimal data loading for list views
 * - Debounced search input
 * - Fast popup loading with progressive data fetching
 * 
 * @created 2025-08-21
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TasksTable } from '@/app/projly/components/tasks/TasksTable';
import { TasksBoard } from '@/app/projly/components/tasks/TasksBoard';
import { TaskDialog } from '@/components/projects/TaskDialog';
import { Task } from '@/app/projly/components/tasks/TasksTable';
import { tasksHubService } from '@/lib/services/projly/tasks/hub/new-task-service';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageLoading } from '@/app/projly/components/ui/PageLoading';
import { Filter, List, LayoutGrid, Search, Circle, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/app/projly/contexts/AuthContextCustom';
import { projlyProjectsService } from '@/lib/services/projly';
import { TaskFilters as TaskFiltersComponent } from '@/app/projly/components/tasks/TaskFilters';
import { TaskDetailDialogHub } from './TaskDetailDialogHub';

// Create a detailed log function for debugging
const log = (...args: any[]) => console.log('[TasksHubContainer]', ...args);

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
  
  const parts = label.split(/[ \-_]/);
  
  if (parts.length > 1) {
    return parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
  }
  
  if (label.length > 1) {
    return label.slice(0, 2).toUpperCase();
  } else {
    return label.charAt(0).toUpperCase();
  }
};

// Interface for server-side filters
interface HubFilters {
  q?: string; // search query
  status?: string;
  projectId?: string;
  assignedTo?: string;
  label?: string;
  parentOnly?: boolean;
  includeSubTasks?: boolean;
  hideParentTasksByStatus?: string[];
  hideChildTasksByStatus?: string[];
  page?: number;
  pageSize?: number;
  sort?: string;
}

export function TasksHubContainer() {
  // Get current user from AuthContext
  const { user } = useAuth();
  log("Current user:", user?.id);
  
  // State management
  const [filters, setFilters] = useState<HubFilters>({
    page: 1,
    pageSize: 50,
    includeSubTasks: true,
    hideParentTasksByStatus: [],
    hideChildTasksByStatus: []
  });
  
  // Additional state for UI
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);
  
  const [searchInput, setSearchInput] = useState<string>('');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState<boolean>(false);
  
  // State for filter visibility with localStorage persistence
  const [showFilters, setShowFilters] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('projly_tasks_hub_show_filters');
      return storedValue === 'true';
    }
    return false;
  });
  
  // View mode state (list or board)
  const [viewMode, setViewMode] = useState<'list' | 'board'>(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('projly_tasks_hub_view_mode');
      return (storedValue === 'board') ? 'board' : 'list';
    }
    return 'list';
  });
  
  // Track if this is the initial load to control loading indicator
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  
  // React Query for server-side data fetching with caching
  const {
    data: serverResponse,
    isLoading: isQueryLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tasks-hub', filters],
    queryFn: () => tasksHubService.getTasks(filters),
    staleTime: 1 * 60 * 1000, // 1 minute - data won't refetch until stale
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
  });
  
  // Only show loading indicator on initial load, not on filter changes
  const isLoading = isQueryLoading && !hasInitiallyLoaded;
  
  // Track when we've loaded data for the first time
  useEffect(() => {
    if (serverResponse && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [serverResponse, hasInitiallyLoaded]);
  
  // Extract tasks and pagination meta from server response
  const tasks = serverResponse?.tasks || [];
  const meta = serverResponse?.meta || { page: 1, pageSize: 50, total: 0, totalPages: 0 };
  
  // React Query for projects data with caching
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // React Query for labels data with caching
  const { data: labelsData } = useQuery({
    queryKey: ['labels'],
    queryFn: async () => {
      log('Loading labels for filter dropdown via React Query');
      try {
        const labels = await tasksHubService.getLabels();
        log(`Loaded ${labels.length} labels for filter`);
        return labels;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load labels';
        log('Error loading labels:', errorMessage);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user?.id
  });
  
  // Set available labels from React Query
  useEffect(() => {
    if (labelsData) {
      setAvailableLabels(labelsData);
    }
  }, [labelsData]);
  
  // Get unique values for filter dropdowns - use all possible statuses to prevent disappearing checkboxes
  const uniqueStatuses = useMemo(() => {
    // Always include these common statuses to prevent checkboxes from disappearing
    // Don't depend on current tasks to ensure all statuses are always available
    const allPossibleStatuses = new Set<string>([
      'Not Started',
      'In Progress',
      'In Review',
      'Completed',
      'Golive',
      'On Hold',
      'Pending',
      'Cancelled'
    ]);
    
    return Array.from(allPossibleStatuses).sort();
  }, []); // Remove tasks dependency to always show all statuses
  
  const uniqueUsers = useMemo(() => {
    const users = new Map<string, any>();
    tasks.forEach(task => {
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
  }, [tasks]);
  
  const uniqueLabels = useMemo(() => {
    const labels = new Set<string>();
    tasks.forEach(task => {
      if (task.label) labels.add(task.label);
    });
    return Array.from(labels).sort();
  }, [tasks]);
  
  // Check if any filters are currently active
  const hasActiveFilters = useMemo(() => {
    return !!(
      (filters.q && filters.q.trim()) ||
      (filters.status && filters.status !== 'all') ||
      (filters.projectId && filters.projectId !== 'all') ||
      (filters.assignedTo && filters.assignedTo !== 'all') ||
      (filters.label && filters.label !== 'all') ||
      filters.parentOnly ||
      (filters.hideParentTasksByStatus && filters.hideParentTasksByStatus.length > 0) ||
      (filters.hideChildTasksByStatus && filters.hideChildTasksByStatus.length > 0)
    );
  }, [filters]);
  
  // Debounced search handler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== (filters.q || '')) {
        setFilters(prev => ({
          ...prev,
          q: searchInput.trim() || undefined,
          page: 1 // Reset to first page on search
        }));
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchInput, filters.q]);
  
  // Handle view mode change
  const handleViewModeChange = (value: string) => {
    if (value === 'list' || value === 'board') {
      log(`Changing view mode to: ${value}`);
      setViewMode(value);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('projly_tasks_hub_view_mode', value);
      }
    }
  };
  
  // Function to toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
    if (typeof window !== 'undefined') {
      localStorage.setItem('projly_tasks_hub_show_filters', (!showFilters).toString());
    }
    log(`Toggled filters visibility to: ${!showFilters}`);
  };
  
  // Filter handlers
  const handleProjectFilterChange = (value: string) => {
    log('Project filter changed:', value);
    setFilters(prev => ({
      ...prev,
      projectId: value === 'all' ? undefined : value,
      page: 1
    }));
  };

  const handleStatusFilterChange = (value: string) => {
    log('Status filter changed:', value);
    setFilters(prev => ({
      ...prev,
      status: value === 'all' ? undefined : value,
      page: 1
    }));
  };

  const handleAssigneeFilterChange = (value: string) => {
    log('Assignee filter changed:', value);
    setFilters(prev => ({
      ...prev,
      assignedTo: value === 'all' ? undefined : value,
      page: 1
    }));
  };

  const handleTaskHierarchyFilterChange = (value: string) => {
    log('Task hierarchy filter changed:', value);
    const updates: Partial<HubFilters> = { page: 1 };
    
    if (value === 'parent_only') {
      updates.parentOnly = true;
      updates.includeSubTasks = false;
    } else {
      updates.parentOnly = false;
      updates.includeSubTasks = true;
    }
    
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const handleLabelFilterChange = (value: string) => {
    log('Label filter changed:', value);
    setFilters(prev => ({
      ...prev,
      label: value === 'all' ? undefined : value,
      page: 1
    }));
  };

  const handleHideParentTasksByStatusChange = (status: string, checked: boolean) => {
    log('Hide parent tasks by status changed:', status, checked);
    setFilters(prev => {
      const currentHidden = prev.hideParentTasksByStatus || [];
      const newHidden = checked 
        ? [...currentHidden, status]
        : currentHidden.filter(s => s !== status);
      
      return {
        ...prev,
        hideParentTasksByStatus: newHidden.length > 0 ? newHidden : undefined,
        page: 1
      };
    });
  };

  const handleHideChildTasksByStatusChange = (status: string, checked: boolean) => {
    log('Hide child tasks by status changed:', status, checked);
    setFilters(prev => {
      const currentHidden = prev.hideChildTasksByStatus || [];
      const newHidden = checked 
        ? [...currentHidden, status]
        : currentHidden.filter(s => s !== status);
      
      return {
        ...prev,
        hideChildTasksByStatus: newHidden.length > 0 ? newHidden : undefined,
        page: 1
      };
    });
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    log(`Changing to page ${newPage}`);
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    log(`Changing page size to ${newPageSize}`);
    setFilters(prev => ({
      ...prev,
      pageSize: newPageSize,
      page: 1 // Reset to first page
    }));
  };
  
  // React Query client for cache invalidation
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Handle task operations (create, update, delete)
  const handleOperationComplete = useCallback(() => {
    log('Operation completed, invalidating cache');
    queryClient.invalidateQueries({ queryKey: ['tasks-hub'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    refetch();
  }, [queryClient, refetch]);
  
  // Router for navigation
  const router = useRouter();
  
  // Handle adding a new task
  const handleAddTask = () => {
    log('Opening add task dialog');
    setIsAddTaskOpen(true);
  };

  // Handle task row click to open detail dialog
  const handleTaskClick = (task: Task) => {
    log('Opening task detail dialog for:', task.id);
    setSelectedTaskId(task.id);
    setIsTaskDetailOpen(true);
  };
  
  // Context-specific title
  const getTitle = () => {
    const taskCount = meta.total || 0;
    return `Tasks Hub (${taskCount})`;
  };
  
  return (
    <Card className="w-full p-6">
      <CardHeader className="flex p-0 flex-row items-center justify-between">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <CardTitle>{getTitle()}</CardTitle>
        </div>
        
        <Button onClick={handleAddTask} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </CardHeader>
      
      <CardContent className='p-0 pt-4'>
        {isLoading ? (
          <PageLoading 
            standalone={true} 
            logContext="PROJLY:TASKS_HUB:CONTAINER" 
            height="20vh" 
          />
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            {error instanceof Error ? error.message : 'Failed to load tasks'}
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Filter and search section */}
            <div className="mb-6">
              {/* Top row - Search and controls */}
              <div className="flex flex-row items-center justify-between gap-2 flex-wrap mb-4">
                <div className="flex items-center flex-1 min-w-0 gap-2">
                  <Input 
                    placeholder="Search tasks..." 
                    className="max-w-[300px] w-full"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
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
                    className="flex items-center justify-end gap-1 flex-shrink-0 relative"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Circle className="h-2 w-2 fill-blue-500 text-blue-500 absolute -top-1 -right-1" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Expandable filters section */}
              {showFilters && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    {/* Project Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Project</label>
                      <Select value={filters.projectId || 'all'} onValueChange={handleProjectFilterChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Projects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Projects</SelectItem>
                          {projects.map(project => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={filters.status || 'all'} onValueChange={handleStatusFilterChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {uniqueStatuses.map(status => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Label Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Label</label>
                      <Select value={filters.label || 'all'} onValueChange={handleLabelFilterChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Labels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Labels</SelectItem>
                          {availableLabels.map(label => (
                            <SelectItem key={label} value={label}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assigned To Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assigned To</label>
                      <Select value={filters.assignedTo || 'all'} onValueChange={handleAssigneeFilterChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Members" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Members</SelectItem>
                          <SelectItem value="current">My Tasks</SelectItem>
                          {uniqueUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Task Hierarchy Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Task Hierarchy</label>
                      <Select 
                        value={
                          filters.parentOnly ? 'parent_only' : 'all'
                        } 
                        onValueChange={handleTaskHierarchyFilterChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Tasks" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tasks</SelectItem>
                          <SelectItem value="parent_only">Parent Tasks Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Hide Parent Tasks by Status */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3">Hide Parent Tasks by Status</h3>
                    <p className="text-xs text-muted-foreground mb-3">Hides parent tasks and all their subtasks when the parent has the selected status</p>
                    <div className="flex flex-wrap gap-4">
                      {uniqueStatuses.map(status => (
                        <label key={status} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.hideParentTasksByStatus?.includes(status) || false}
                            onChange={(e) => handleHideParentTasksByStatusChange(status, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Hide Child/Subtasks by Status */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3">Hide Child/Subtasks by Status</h3>
                    <p className="text-xs text-muted-foreground mb-3">Hides individual Child/subtasks that have the selected status (parent tasks remain visible)</p>
                    <div className="flex flex-wrap gap-4">
                      {uniqueStatuses.map(status => (
                        <label key={status} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.hideChildTasksByStatus?.includes(status) || false}
                            onChange={(e) => handleHideChildTasksByStatusChange(status, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Pagination controls - top */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Showing {((meta.page - 1) * meta.pageSize) + 1} to {Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total} tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={meta.pageSize.toString()} onValueChange={(value) => handlePageSizeChange(parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={meta.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">Page {meta.page} of {meta.totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={meta.page >= meta.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* View content - Either table or board */}
            {viewMode === 'list' ? (
              <TasksTable
                tasks={tasks as Task[]}
                initialFilters={{}} // No client-side filters needed
                onOperationComplete={handleOperationComplete}
                compact={false}
                context="main"
                hideFilterUI={true}
                onTaskClick={handleTaskClick}
              />
            ) : (
              <TasksBoard
                tasks={tasks as Task[]}
                initialFilters={{}}
                onOperationComplete={handleOperationComplete}
                compact={false}
                context="main"
                onTaskClick={handleTaskClick}
              />
            )}

            {/* Pagination controls - bottom */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-center mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={meta.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">Page {meta.page} of {meta.totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={meta.page >= meta.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Add task dialog */}
        {isAddTaskOpen && (
          <TaskDialog
            open={isAddTaskOpen}
            onOpenChange={setIsAddTaskOpen}
            projectId=""
            onTaskChange={handleOperationComplete}
          />
        )}

        {/* Task detail dialog - optimized for fast loading */}
        {isTaskDetailOpen && selectedTaskId && (
          <TaskDetailDialogHub
            taskId={selectedTaskId}
            open={isTaskDetailOpen}
            onOpenChange={setIsTaskDetailOpen}
            onTaskChange={handleOperationComplete}
          />
        )}
      </CardContent>
    </Card>
  );
}
