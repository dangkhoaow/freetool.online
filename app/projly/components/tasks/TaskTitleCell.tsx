import React, { useEffect, useRef } from 'react';
import { Badge } from "@/components/ui/badge";

// Define the Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  projectId: string;
  assignedTo?: string;
  startDate?: string;
  dueDate?: string;
  parentTaskId?: string;
  _meta?: {
    level?: number;
    [key: string]: any;
  };
}

interface TaskTitleCellProps {
  task: Task;
  level?: number;
  hasSubtasks: boolean;
  subtaskCount: number;
  displayMode?: 'table' | 'board'; // New prop to control display
}

/**
 * A custom cell component specifically for rendering task titles
 * This component uses direct DOM manipulation to prevent unwanted characters
 */
export const TaskTitleCell: React.FC<TaskTitleCellProps> = ({
  task,
  level,
  hasSubtasks,
  subtaskCount,
  displayMode = 'table' // Default to table mode for backward compatibility
}) => {
  // Create refs for direct DOM manipulation
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  
  // Use useEffect to directly manipulate the DOM after render
  useEffect(() => {
    // Log for debugging
    console.log(`[TaskTitleCell] Rendering task: ${task.id}, title: "${task.title}", level: ${level || 0}`);
    
    // Clean up any unwanted text nodes in the container
    if (containerRef.current) {
      // Find and remove any text nodes that are direct children of the container
      const childNodes = Array.from(containerRef.current.childNodes);
      childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          containerRef.current?.removeChild(node);
        }
      });
    }
    
    // Directly set the title text using DOM manipulation
    if (titleRef.current) {
      // Clear any existing content first
      titleRef.current.innerHTML = '';
      
      // Create a text node (not an element) to prevent React evaluation
      const textNode = document.createTextNode(String(task.title || '').trim());
      titleRef.current.appendChild(textNode);
    }
  }, [task.id, task.title, level]); // Re-run when these props change
  
  return (
    <div 
      ref={containerRef}
      className="task-title-cell"
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        paddingLeft: level && level > 0 ? `${level * 12}px` : '0'
      }}
    >
      {/* Indentation for nested tasks */}
      <div style={{ color: '#9CA3AF', display: displayMode === 'board' ? 'none' : 'block' }}>
        {level && level > 0 ? '└─' : ''}
      </div>
      
             {/* Task title - clamp to two lines with ellipsis */}
       <div
         ref={titleRef}
         style={{
           display: '-webkit-box',
           WebkitLineClamp: 3,
           WebkitBoxOrient: 'vertical',
           overflow: 'hidden',
           whiteSpace: 'normal',
           fontSize: displayMode === 'board' ? '11px' : '14px',
           lineHeight: displayMode === 'board' ? '1.2' : '1.3',
           fontWeight: '500'
         }}
       />
       
       {/* Subtask badge - hidden in board mode */}
       <div>
         {hasSubtasks && displayMode === 'table' && (
           <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
             {subtaskCount} subtasks
           </Badge>
         )}
       </div>
    </div>
  );
};

export default TaskTitleCell;
