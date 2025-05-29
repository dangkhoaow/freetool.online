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
 */

"use client";

import React, { useState, useEffect } from 'react';
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
import { PlusCircle, List, LayoutGrid } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
  // State for tasks and loading
  const [rawTasks, setRawTasks] = useState<ProjlyTask[]>(initialTasks || []);
  const [loading, setLoading] = useState<boolean>(autoLoad && !initialTasks);
  const [error, setError] = useState<string | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [currentFilters, setCurrentFilters] = useState<TaskFilters>(initialFilters);
  
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
  
  // Load tasks on mount if autoLoad is true
  useEffect(() => {
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
            
            {/* View mode toggle */}
            <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange} className="ml-0 md:ml-4">
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
                <span className="sr-only md:not-sr-only md:ml-2">List</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="board" aria-label="Board view">
                <LayoutGrid className="h-4 w-4" />
                <span className="sr-only md:not-sr-only md:ml-2">Board</span>
              </ToggleGroupItem>
            </ToggleGroup>
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
        ) : viewMode === 'list' ? (
          <TasksTable
            tasks={filteredTasks as Task[]}
            initialFilters={currentFilters}
            onOperationComplete={handleOperationComplete}
            compact={displayOptions.compact}
            context={context}
            parentTaskId={tableParentTaskId}
            hideParentRow={context === 'task'}
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
