
import { useCallback, useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useTasks } from "@/hooks/use-tasks";
import { parseDateSafe, isDate } from "@/utils/dateUtils";
import { toast } from "@/components/ui/use-toast";

interface Task {
  id: string;
  title: string;
  status: string;
  startDate: Date | null;
  dueDate: Date | null;
  assignee: {
    firstName: string;
    lastName: string;
  } | null;
  project: {
    name: string;
  } | null;
}

// Move all status color logic outside the component to avoid conditional hook calls
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'In Progress':
      return 'bg-orange-100 text-orange-800';
    case 'Pending':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Move isOverdue function outside the component to avoid hook dependencies
const isOverdue = (dueDate: Date | string | null, status: string): boolean => {
  if (!dueDate || status === 'Completed') return false;
  
  // Safely parse the date
  const parsedDate = parseDateSafe(dueDate);
  if (!parsedDate) {
    console.error("[TasksOverviewTable] Failed to parse due date:", dueDate);
    return false;
  }
  
  return parsedDate < new Date();
};

export function TasksOverviewTable() {
  // All hooks declared at the top level in a consistent order
  const [sortConfig, setSortConfig] = useState({ key: 'dueDate', direction: 'asc' });
  
  // Fetch tasks - this is the ONLY call to useTasks in the entire component
  const { data: rawTasks, isLoading, error: apiError } = useTasks();
  
  // Process and transform the task data only when rawTasks changes
  const processedTasks = useMemo(() => {
    // Ensure rawTasks is an array for type safety with explicit null/undefined check
    const tasksArray = Array.isArray(rawTasks) ? rawTasks : [];
    
    console.log("[ANALYTICS] Tasks data received from API:", {
      count: tasksArray.length,
      hasError: !!apiError,
      isLoading
    });
    
    return tasksArray.map(task => {
      // Log task data for debugging
      if (task && task.id) {
        console.log(`[ANALYTICS] Processing task ${task.id}:`, {
          hasProject: task.project !== null && task.project !== undefined,
          hasAssignee: task.assignee !== null && task.assignee !== undefined
        });
      }
      
      // Return normalized data with default values
      return {
        id: task.id || 'unknown-id',
        title: task.title || 'Untitled Task',
        status: task.status || 'Unknown',
        startDate: task.startDate || null,
        dueDate: task.dueDate || null,
        assignee: task.assignee ? {
          firstName: task.assignee.firstName || '',
          lastName: task.assignee.lastName || ''
        } : null,
        // Safely handle null or undefined project
        project: task.project ? {
          name: task.project.name || 'Unnamed Project'
        } : { name: 'No Project' }
      };
    });
  }, [rawTasks, apiError, isLoading]); // Depend on all data from useTasks
  
  // Error handling effect - runs consistently
  useEffect(() => {
    if (apiError) {
      console.error("[ANALYTICS] Error in TasksOverviewTable:", apiError);
      toast({
        title: "Error loading tasks",
        description: "Failed to load task data. Please try again later.",
        variant: "destructive"
      });
    }
  }, [apiError]);

  // Define sort handling function - ensure it's always declared in the same place
  const requestSort = useCallback((key: string) => {
    setSortConfig((prevSortConfig) => {
      if (prevSortConfig.key === key) {
        return {
          key,
          direction: prevSortConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  // Sort the processed tasks based on the current sort configuration
  const sortedTasks = useMemo(() => {
    if (!processedTasks || processedTasks.length === 0) return [];
    
    const sortableItems = [...processedTasks];
    sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Task];
      const bValue = b[sortConfig.key as keyof Task];
      
      // Explicit null/undefined checks
      if (aValue === null && bValue === null) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (sortConfig.key === 'dueDate' || sortConfig.key === 'startDate') {
        // Safely parse dates using our utility function
        const parsedA = aValue ? parseDateSafe(aValue as string | Date) : null;
        const parsedB = bValue ? parseDateSafe(bValue as string | Date) : null;
        
        // Safe date comparison with explicit null checks
        const dateA = parsedA !== null && parsedA !== undefined ? parsedA.getTime() : 0;
        const dateB = parsedB !== null && parsedB !== undefined ? parsedB.getTime() : 0;
        
        console.log(`[TasksOverviewTable] Comparing dates: ${aValue} (${dateA}) vs ${bValue} (${dateB})`);
        
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      // Fallback for other types with safe conversion
      const valA = aValue !== null && aValue !== undefined ? String(aValue) : '';
      const valB = bValue !== null && bValue !== undefined ? String(bValue) : '';
      
      return sortConfig.direction === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    });
    
    return sortableItems;
  }, [processedTasks, sortConfig]);

  // This is the component's render logic - all hooks are called before this point
  // Conditional rendering based on loading/error states
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Spinner />
      </div>
    );
  }
  
  if (apiError) {
    return (
      <div className="text-center p-4 text-red-500">Error loading tasks data</div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50" 
              onClick={() => requestSort('title')}
            >
              Task
              {sortConfig.key === 'title' && (
                <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => requestSort('status')}
            >
              Status
              {sortConfig.key === 'status' && (
                <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => requestSort('startDate')}
            >
              Start Date
              {sortConfig.key === 'startDate' && (
                <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => requestSort('dueDate')}
            >
              Due Date
              {sortConfig.key === 'dueDate' && (
                <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Project</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">No tasks available</TableCell>
            </TableRow>
          ) : (
            sortedTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.startDate ? (() => {
                    const parsedDate = parseDateSafe(task.startDate);
                    return parsedDate ? format(parsedDate, 'MMM d, yyyy') : '-';
                  })() : '-'}
                </TableCell>
                <TableCell>
                  {task.dueDate ? (
                    <span className={isOverdue(task.dueDate, task.status) ? 'text-red-600 font-semibold' : ''}>
                      {(() => {
                        const parsedDate = parseDateSafe(task.dueDate);
                        return parsedDate ? format(parsedDate, 'MMM d, yyyy') : 'Invalid date';
                      })()}
                      {isOverdue(task.dueDate, task.status) ? ' (Overdue)' : ''}
                    </span>
                  ) : 'Not set'}
                </TableCell>
                <TableCell>
                  {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : '-'}
                </TableCell>
                <TableCell>{task.project?.name || 'Not assigned'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
