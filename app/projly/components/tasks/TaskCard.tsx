/**
 * TaskCard Component
 * 
 * Displays a task in card format for the board view.
 * Implements drag functionality for moving tasks between status columns.
 * 
 * @created 2025-05-29
 */

"use client";

import React from 'react';
import { useDrag } from 'react-dnd';
import { useRouter } from 'next/navigation';
import { Task } from './TasksTable';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock } from 'lucide-react';
import { TaskTitleCell } from './TaskTitleCell';
import { useAuth } from '@/app/projly/contexts/AuthContextCustom';
import { Progress } from "@/components/ui/progress";
import { getAssigneeInitials } from './TasksContainer';
import Link from 'next/link';

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
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Check if current user is assigned to the task
  const isAssignedToUser = user && task.assignedTo === user.id;
  
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
  
  return (
    <Link
      href={`/projly/tasks/${task.id}`}
      className="block"
      onClick={e => e.stopPropagation()}
    >
      <div
        ref={drag}
        className={`cursor-pointer ${isDragging ? 'opacity-50' : 'opacity-100'} ${
          compact ? 'p-0' : 'p-0'
        } hover:shadow-md transition-all ${isAssignedToUser ? 'border-blue-300' : ''}`}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <Card>
          <CardContent className="p-2 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1" title={task.title}>
                <TaskTitleCell 
                  task={task} 
                  hasSubtasks={!!task.subTasks && task.subTasks.length > 0} 
                  subtaskCount={task.subTasks?.length || 0} 
                />
              </div>
              {task.parentTaskId && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Subtask
                </Badge>
              )}
            </div>
            
            {/* Display label if available */}
            {task.label && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Label:</span>
                <Badge variant="outline" className="text-xs">{task.label}</Badge>
              </div>
            )}

            {/* Display progress bar if percentProgress is available */}
            {task.percentProgress !== undefined && task.percentProgress !== null && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Progress:</span>
                  <span className="text-xs text-muted-foreground">{Math.round(task.percentProgress || 0)}%</span>
                </div>
                <Progress value={task.percentProgress} className="h-1" />
              </div>
            )}
            
            {task.project && (
              <div className="text-xs text-gray-500">
                Project: {task.project.name}
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              {task.dueDate && (
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Due: {formatDateForDisplay(task.dueDate)}</span>
                </div>
              )}
              
              {task.startDate && !compact && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Start: {formatDateForDisplay(task.startDate)}</span>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="px-4 py-3 flex justify-between items-center">
            <Badge className={`text-xs ${statusColor}`}>
              {task.status}
            </Badge>
            
            <Avatar className="h-6 w-6">
              {task.assignee?.avatar && (
                <AvatarImage src={task.assignee.avatar} alt={getAssigneeName()} />
              )}
              <AvatarFallback className="text-xs" title={getAssigneeName()}>
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </CardFooter>
        </Card>
      </div>
    </Link>
  );
}

export default TaskCard;
