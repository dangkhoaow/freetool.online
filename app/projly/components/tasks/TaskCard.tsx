/**
 * TaskCard Component
 * 
 * Displays a task in card format for the board view.
 * Implements drag functionality for moving tasks between status columns.
 * 
 * @created 2025-05-29
 */

"use client";

import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { useRouter } from 'next/navigation';
import { Task } from './TasksTable';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { TaskTitleCell } from './TaskTitleCell';
import { useAuth } from '@/app/projly/contexts/AuthContextCustom';
import { Progress } from "@/components/ui/progress";
import { getAssigneeInitials } from './TasksContainer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Define detailed log function for debugging
const log = (...args: any[]) => console.log('[TaskCard]', ...args);

// Define drag item types
const ItemTypes = {
  TASK: 'task',
};

// Define status colors for visual consistency
const STATUS_COLORS: Record<string, string> = {
  'Not Started': 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'In Review': 'bg-purple-100 text-purple-700',
  'Completed': 'bg-green-100 text-green-700',
  'Golive': 'bg-emerald-100 text-emerald-700',
  'On Hold': 'bg-amber-100 text-amber-700',
  'Pending': 'bg-orange-100 text-orange-700',
  'Cancelled': 'bg-red-100 text-red-700',
};

// Helper function for date formatting
const formatDateForDisplay = (dateStr: string | undefined): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
};

// Props for TaskCard
export interface TaskCardProps {
  task: Task;
  compact?: boolean;
  renderSubtasks?: boolean;
}

export function TaskCard({ task, compact = false, renderSubtasks = true }: TaskCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubtasksCollapsed, setIsSubtasksCollapsed] = useState(true);
  
  // Check if current user is assigned to the task
  const isAssignedToUser = user && task.assignedTo === user.id;
  
  // Check if task has subtasks
  const hasSubtasks = task.subTasks && task.subTasks.length > 0;
  
  // Set up drag source
  const [{ isDragging }, dragRef] = useDrag({
    type: ItemTypes.TASK,
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  // Create a ref function that calls the drag ref (accepts any HTMLElement)
  const drag = (element: HTMLElement | null) => {
    // Cast to HTMLDivElement for react-dnd
    dragRef(element as HTMLDivElement | null);
  };
  
  // Handle click to view task details
  const handleClick = () => {
    log(`Navigating to task details: ${task.id}`);
    router.push(`/projly/tasks/${task.id}`);
  };
  
  // Get assignee display name
  const getAssigneeName = () => {
    if (task.assignee) {
      if (task.assignee.firstName && task.assignee.lastName) {
        return `${task.assignee.firstName} ${task.assignee.lastName} - ${task.assignee.email}`;
      } else if (task.assignee.name) {
        return task.assignee.name;
      } else {
        return task.assignee.email || 'Unassigned';
      }
    }
    return 'Unassigned';
  };
  
  // Using the shared getAssigneeInitials function from TasksContainer
  const getInitials = () => {
    return getAssigneeInitials(task.assignee);
  };
  
  // Get status color
  const statusColor = STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-700';
  
  // Toggle subtasks visibility
  const toggleSubtasks = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubtasksCollapsed(!isSubtasksCollapsed);
  };
  
  return (
    <div
      ref={drag}
      className={`cursor-pointer ${isDragging ? 'opacity-50' : 'opacity-100'} ${
        compact ? 'p-0' : 'p-0'
      } hover:shadow-md transition-all ${isAssignedToUser ? 'border-blue-300' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Link
        href={`/projly/tasks/${task.id}`}
        className="block"
        onClick={e => e.stopPropagation()}
      >
        <Card className={`${task.parentTaskId ? 'border-l-4 border-l-blue-300' : ''}`}>
          <CardContent className="p-1 space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex-1" title={task.title}>
                <TaskTitleCell 
                  task={task} 
                  hasSubtasks={!!task.subTasks && task.subTasks.length > 0} 
                  subtaskCount={task.subTasks?.length || 0}
                  displayMode="board"
                />
              </div>
              {task.parentTaskId && (
                <Badge variant="outline" className="ml-1 text-[9px] py-0 px-1">
                  Sub
                </Badge>
              )}
            </div>
            
            {/* Display label if available */}
            {task.label && (
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-[10px] py-0 px-1">{task.label}</Badge>
              </div>
            )}

            {/* Display progress bar if percentProgress is available */}
            {task.percentProgress !== undefined && task.percentProgress !== null && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{Math.round(task.percentProgress || 0)}%</span>
                </div>
                <Progress value={task.percentProgress} className="h-0.5" />
              </div>
            )}
            
            {task.project && (
              <div className="text-[10px] text-gray-500 truncate">
                {task.project.name}
              </div>
            )}
            
            <div className="flex flex-col gap-0.5 text-[10px] text-gray-500">
              {task.dueDate && (
                <div className="flex items-center">
                  <Calendar className="h-2.5 w-2.5 mr-0.5" />
                  <span>{formatDateForDisplay(task.dueDate)}</span>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="px-1 py-0.5 flex justify-between items-center">
            <Badge className={`text-[10px] py-0 px-1 ${statusColor}`}>
              {task.status}
            </Badge>
            
            <Avatar className="h-3 w-3">
              {task.assignee?.avatar && (
                <AvatarImage src={task.assignee.avatar} alt={getAssigneeName()} />
              )}
              <AvatarFallback className="text-[8px]" title={getAssigneeName()}>
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </CardFooter>
          
          {/* Subtasks toggle button - only show if task has subtasks and we're rendering subtasks */}
          {hasSubtasks && renderSubtasks && (
            <div className="px-1 pb-0.5 pt-0">
              <Button 
                variant="ghost" 
                size="sm" 
                title={isSubtasksCollapsed ? 'Expand subtasks' : 'Collapse subtasks'}
                className="w-full flex items-center justify-center text-[10px] py-0 h-auto hover:bg-blue-50 hover:text-blue-700"
                onClick={toggleSubtasks}
              >
                {isSubtasksCollapsed ? (
                  <>
                    <ChevronRight className="h-2.5 w-2.5 mr-0.5" />
                    <span className="text-[10px]">{task.subTasks?.length} subtasks</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-2.5 w-2.5 mr-0.5" />
                    <span className="text-[10px]">Hide</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
      </Link>
      
      {/* Subtasks section - only render if task has subtasks, we're rendering subtasks, and they're not collapsed */}
      {hasSubtasks && renderSubtasks && !isSubtasksCollapsed && (
        <div className="pl-1 mt-1 space-y-1 border-l-2 border-blue-200" title="Expanded subtasks">
          {task.subTasks?.map((subtask) => (
            <TaskCard 
              key={subtask.id} 
              task={subtask} 
              compact={compact} 
              renderSubtasks={false} // Prevent infinite nesting by not rendering subtasks of subtasks
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskCard;
