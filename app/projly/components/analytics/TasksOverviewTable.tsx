
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
  startDate: Date | string | null;
  dueDate: Date | string | null;
  assignee: {
    firstName: string;
    lastName: string;
  } | null;
  project: {
    name: string;
  } | null;
}

// Render status badge with appropriate color - moved outside component to avoid conditional hook calls
const renderStatusBadge = (status: string) => {
  console.log(`[TasksOverviewTable] Rendering badge for status: ${status}`);
  
  // Define style object for more consistent styling
  let style = {};
  let className = "";
  
  // Normalize status string to handle case sensitivity and null/undefined
  const normalizedStatus = status ? status.trim() : 'Unknown';
  
  switch (normalizedStatus) {
    case "Active":
    case "In Progress":
      style = { 
        backgroundColor: '#2563eb !important', 
        color: 'white !important', 
        borderColor: '#2563eb !important' 
      };
      className = "bg-blue-600 text-white border-blue-600";
      break;
    case "Completed":
      style = { 
        backgroundColor: '#16a34a !important', 
        color: 'white !important', 
        borderColor: '#16a34a !important' 
      };
      className = "bg-green-600 text-white border-green-600";
      break;
    case "In Review":
      style = { 
        backgroundColor: '#a855f7 !important', 
        color: 'white !important', 
        borderColor: '#a855f7 !important' 
      };
      className = "bg-purple-500 text-white border-purple-500";
      break;
    case "Not Started":
      style = { 
        backgroundColor: '#6b7280 !important', 
        color: 'white !important', 
        borderColor: '#6b7280 !important' 
      };
      className = "bg-gray-500 text-white border-gray-500";
      break;
    case "On Hold":
      style = { 
        backgroundColor: '#f97316 !important', 
        color: 'white !important', 
        borderColor: '#f97316 !important' 
      };
      className = "bg-orange-500 text-white border-orange-500";
      break;
    case "Pending":
      style = { 
        backgroundColor: '#f59e0b !important', 
        color: 'white !important', 
        borderColor: '#f59e0b !important' 
      };
      className = "bg-amber-500 text-white border-amber-500";
      break;
    case "Archived":
      style = { 
        backgroundColor: '#64748b !important', 
        color: 'white !important', 
        borderColor: '#64748b !important' 
      };
      className = "bg-gray-500 text-white border-gray-500";
      break;
    case "Planning":
      style = { 
        backgroundColor: '#3b82f6 !important', 
        color: 'white !important', 
        borderColor: '#3b82f6 !important' 
      };
      className = "bg-blue-500 text-white border-blue-500";
      break;
    default:
      style = { 
        backgroundColor: '#9ca3af !important', 
        color: 'white !important', 
        borderColor: '#9ca3af !important' 
      };
      className = "bg-gray-400 text-white border-gray-400";
  }
  
  return { style, className };
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
      // Skip invalid task objects
      if (!task) {
        console.error("[ANALYTICS] Invalid task object encountered:", task);
        return null;
      }
      
      // Log task data for debugging
      if (task.id) {
        console.log(`[ANALYTICS] Processing task ${task.id}:`, {
          hasProject: task.project !== null && task.project !== undefined,
          hasAssignee: task.assignee !== null && task.assignee !== undefined,
          status: task.status || 'Unknown'
        });
      }
      
      // Return normalized data with default values
      return {
        id: task.id || `unknown-id-${Math.random().toString(36).substring(2, 9)}`,
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
    }).filter(task => task !== null) as Task[]; // Filter out null tasks and cast to Task[]
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
                  {
                    (() => {
                      const { style, className } = renderStatusBadge(task.status);
                      return <Badge style={style} className={className}>{task.status}</Badge>;
                    })()
                  }
                </TableCell>
                <TableCell>
                  {task.startDate ? (() => {
                    try {
                      const parsedDate = parseDateSafe(task.startDate);
                      return parsedDate ? format(parsedDate, 'MMM d, yyyy') : '-';
                    } catch (err) {
                      console.error(`[ANALYTICS] Error formatting start date: ${task.startDate}`, err);
                      return '-';
                    }
                  })() : '-'}
                </TableCell>
                <TableCell>
                  {task.dueDate ? (
                    <span className={isOverdue(task.dueDate, task.status) ? 'text-red-600 font-semibold' : ''}>
                      {(() => {
                        try {
                          const parsedDate = parseDateSafe(task.dueDate);
                          return parsedDate ? format(parsedDate, 'MMM d, yyyy') : 'Invalid date';
                        } catch (err) {
                          console.error(`[ANALYTICS] Error formatting due date: ${task.dueDate}`, err);
                          return 'Invalid date';
                        }
                      })()}
                      {isOverdue(task.dueDate, task.status) ? ' (Overdue)' : ''}
                    </span>
                  ) : 'Not set'}
                </TableCell>
                <TableCell>
                  {task.assignee ? `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() || '-' : '-'}
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
