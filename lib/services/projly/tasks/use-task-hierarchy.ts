/**
 * Task Hierarchy Hook
 * 
 * A custom hook for managing task hierarchies, including recursive depth calculation,
 * filtering, and organization of tasks in parent-child relationships.
 * 
 * @created 2025-05-24
 */

import { useState, useEffect, useMemo } from 'react';
import { Task } from '../types';

// Define a more specific type for the task hierarchy
export interface TaskWithDepth extends Task {
  depth?: number;
  children?: TaskWithDepth[];
}

export interface TaskHierarchyOptions {
  // Maximum depth to display (default: 1 - only show parent and direct children)
  maxDepth?: number;
  // Whether to include all subtasks regardless of depth
  showAllSubtasks?: boolean;
  // Filter by parent task ID (to show only children of a specific task)
  parentTaskId?: string | null;
  // Filter by project ID
  projectId?: string | null;
}

const LOG_PREFIX = '[useTaskHierarchy]';

/**
 * Custom hook for managing task hierarchies
 * 
 * @param tasks Array of tasks to organize
 * @param options Configuration options for hierarchy display
 * @returns Object containing filtered tasks and utility functions
 */
export function useTaskHierarchy(
  tasks: Task[],
  options: TaskHierarchyOptions = {}
) {
  const {
    maxDepth = 1,
    showAllSubtasks = false,
    parentTaskId = null,
    projectId = null,
  } = options;

  // State for processed tasks
  const [filteredTasks, setFilteredTasks] = useState<TaskWithDepth[]>([]);
  
  // Memoized task map for efficient lookups
  const taskMap = useMemo(() => {
    console.log(`${LOG_PREFIX} Building task map for ${tasks.length} tasks`);
    const map = new Map<string, TaskWithDepth>();
    tasks.forEach(task => {
      map.set(task.id, { ...task });
    });
    return map;
  }, [tasks]);

  // Calculate task depths using recursion
  const calculateTaskDepths = useMemo(() => {
    console.log(`${LOG_PREFIX} Calculating task depths with maxDepth: ${maxDepth}`);
    
    const depthMap = new Map<string, number>();
    
    // Recursive function to calculate depth
    const calculateDepth = (taskId: string, visited: Set<string> = new Set()): number => {
      // Handle circular references
      if (visited.has(taskId)) {
        console.log(`${LOG_PREFIX} Circular reference detected for task ${taskId}`);
        return 0;
      }
      
      // Return cached depth if available
      if (depthMap.has(taskId)) {
        return depthMap.get(taskId) || 0;
      }
      
      const task = taskMap.get(taskId);
      if (!task) {
        console.log(`${LOG_PREFIX} Task ${taskId} not found in task map`);
        return 0;
      }
      
      // Top-level tasks have depth 0
      if (!task.parentTaskId) {
        depthMap.set(taskId, 0);
        return 0;
      }
      
      // Track visited tasks to prevent infinite recursion
      const newVisited = new Set(visited);
      newVisited.add(taskId);
      
      // Calculate depth recursively
      const parentDepth = calculateDepth(task.parentTaskId, newVisited);
      const depth = parentDepth + 1;
      
      // Cache and return the depth
      depthMap.set(taskId, depth);
      return depth;
    };
    
    // Calculate depths for all tasks
    Array.from(taskMap.keys()).forEach(taskId => {
      if (!depthMap.has(taskId)) {
        calculateDepth(taskId);
      }
    });
    
    return depthMap;
  }, [taskMap, maxDepth]);

  // Build a hierarchical representation of tasks
  const buildHierarchy = useMemo(() => {
    console.log(`${LOG_PREFIX} Building task hierarchy`);
    
    // Create a map of parent -> children
    const parentChildMap = new Map<string | null, string[]>();
    
    // Initialize with an empty array for tasks with no parent
    parentChildMap.set(null, []);
    
    // Organize tasks by parent
    tasks.forEach(task => {
      const parentId = task.parentTaskId || null;
      
      if (!parentChildMap.has(parentId)) {
        parentChildMap.set(parentId, []);
      }
      
      parentChildMap.get(parentId)?.push(task.id);
      
      // If task has no parent, add to root tasks
      if (!parentId) {
        parentChildMap.get(null)?.push(task.id);
      }
    });
    
    return parentChildMap;
  }, [tasks]);

  // Filter tasks based on configuration
  useEffect(() => {
    console.log(`${LOG_PREFIX} Filtering tasks based on options`, options);
    
    // Start with all tasks
    let result: TaskWithDepth[] = tasks.map(task => ({
      ...task,
      depth: calculateTaskDepths.get(task.id) || 0
    }));
    
    // Filter by project if specified
    if (projectId) {
      console.log(`${LOG_PREFIX} Filtering by project ID: ${projectId}`);
      result = result.filter(task => task.projectId === projectId);
    }
    
    // If we're showing tasks for a specific parent
    if (parentTaskId) {
      console.log(`${LOG_PREFIX} Filtering by parent task ID: ${parentTaskId}`);
      // Only include direct children of the specified parent
      result = result.filter(task => task.parentTaskId === parentTaskId);
    } else {
      // Main list view filtering
      if (!showAllSubtasks) {
        // Filter by maximum depth
        result = result.filter(task => {
          const depth = calculateTaskDepths.get(task.id) || 0;
          return depth <= maxDepth;
        });
      }
    }
    
    // Log the distribution of task depths
    const depthCounts = new Map<number, number>();
    result.forEach(task => {
      const depth = calculateTaskDepths.get(task.id) || 0;
      depthCounts.set(depth, (depthCounts.get(depth) || 0) + 1);
    });
    
    console.log(`${LOG_PREFIX} Task depth distribution after filtering:`);
    depthCounts.forEach((count, depth) => {
      console.log(`${LOG_PREFIX} Depth ${depth}: ${count} tasks`);
    });
    
    console.log(`${LOG_PREFIX} Filtered from ${tasks.length} to ${result.length} tasks`);
    
    setFilteredTasks(result);
  }, [tasks, calculateTaskDepths, maxDepth, showAllSubtasks, parentTaskId, projectId, buildHierarchy]);

  // Utility functions for working with the hierarchy
  const getTaskDepth = (taskId: string): number => {
    return calculateTaskDepths.get(taskId) || 0;
  };
  
  const getChildTasks = (parentId: string | null): TaskWithDepth[] => {
    const childIds = buildHierarchy.get(parentId) || [];
    return childIds
      .map(id => taskMap.get(id))
      .filter(Boolean) as TaskWithDepth[];
  };
  
  const isParentTask = (taskId: string): boolean => {
    return buildHierarchy.has(taskId) && (buildHierarchy.get(taskId)?.length || 0) > 0;
  };
  
  const getSubtaskCount = (taskId: string): number => {
    return buildHierarchy.get(taskId)?.length || 0;
  };
  
  const getTaskWithChildren = (taskId: string): TaskWithDepth | null => {
    const task = taskMap.get(taskId);
    if (!task) return null;
    
    // Recursively get children
    const getChildren = (parentId: string): TaskWithDepth[] => {
      const childIds = buildHierarchy.get(parentId) || [];
      return childIds.map(id => {
        const childTask = taskMap.get(id);
        if (!childTask) return null;
        
        return {
          ...childTask,
          depth: calculateTaskDepths.get(id) || 0,
          children: getChildren(id)
        };
      }).filter(Boolean) as TaskWithDepth[];
    };
    
    return {
      ...task,
      depth: calculateTaskDepths.get(taskId) || 0,
      children: getChildren(taskId)
    };
  };

  return {
    // Filtered tasks based on options
    tasks: filteredTasks,
    // Raw task data
    taskMap,
    // Hierarchy information
    calculateTaskDepths,
    buildHierarchy,
    // Utility functions
    getTaskDepth,
    getChildTasks,
    isParentTask,
    getSubtaskCount,
    getTaskWithChildren
  };
}

export default useTaskHierarchy;
