'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { projlyTasksService } from '@/lib/services/projly';

// Import form field components
import {
  TitleField,
  DescriptionField,
  ProjectField,
  StatusField,
  PriorityField,
  AssigneeField,
  DateField,
  ProgressField,
  LabelField
} from './form-fields';

interface TaskEditFormInlineProps {
  taskData: any;
  onSave: (updatedTask: any) => void;
  onCancel: () => void;
  projects: any[];
  projectMembers: any[];
}

export function TaskEditFormInline({ 
  taskData, 
  onSave, 
  onCancel, 
  projects, 
  projectMembers 
}: TaskEditFormInlineProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: taskData?.title || '',
    description: taskData?.description || '',
    status: taskData?.status || 'Not Started',
    priority: taskData?.priority || 'Medium',
    projectId: taskData?.projectId || '',
    assignedTo: taskData?.assignedTo || 'none',
    startDate: taskData?.startDate || null,
    dueDate: taskData?.dueDate || null,
    percentProgress: taskData?.percentProgress || 0,
    label: taskData?.label || ''
  });

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      
      // Prepare data for API
      const updateData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        projectId: formData.projectId,
        assignedTo: formData.assignedTo === 'none' ? null : formData.assignedTo,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        percentProgress: formData.percentProgress,
        label: formData.label || null,
        parentTaskId: taskData?.parentTaskId || null
      };

      console.log('[TASK_EDIT_INLINE] Saving task with data:', updateData);
      
      const updatedTask = await projlyTasksService.updateTask(taskData.id, updateData);
      
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
      
      onSave(updatedTask);
    } catch (error) {
      console.error('[TASK_EDIT_INLINE] Error saving task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <TitleField
        value={formData.title}
        onChange={(value) => handleFieldChange('title', value)}
      />
      
      <DescriptionField
        value={formData.description}
        onChange={(value) => handleFieldChange('description', value)}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProjectField
          value={formData.projectId}
          onChange={(value) => handleFieldChange('projectId', value)}
          projects={projects}
        />
        
        <StatusField
          value={formData.status}
          onChange={(value) => handleFieldChange('status', value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PriorityField
          value={formData.priority}
          onChange={(value) => handleFieldChange('priority', value)}
        />
        
        <AssigneeField
          value={formData.assignedTo}
          onChange={(value) => handleFieldChange('assignedTo', value)}
          projectMembers={projectMembers}
          isLoadingMembers={false}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateField
          label="Start Date"
          id="startDate"
          date={formData.startDate}
          setDate={(value) => handleFieldChange('startDate', value)}
        />
        
        <DateField
          label="Due Date"
          id="dueDate"
          date={formData.dueDate}
          setDate={(value) => handleFieldChange('dueDate', value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProgressField
          value={formData.percentProgress}
          onChange={(value) => handleFieldChange('percentProgress', value)}
        />
        
        <LabelField
          value={formData.label}
          onChange={(value) => handleFieldChange('label', value)}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
