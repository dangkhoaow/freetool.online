'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { projlyTasksService } from '@/lib/services/projly';

// Import form field components
import {
  TitleField,
  DescriptionField,
  StatusField,
  PriorityField,
  AssigneeField,
  DateField,
  ProgressField,
  LabelField
} from './form-fields';

interface SubTaskCreateFormProps {
  parentTask: any;
  projects: any[];
  projectMembers: any[];
  onSuccess: (newSubTask: any) => void;
  onCancel: () => void;
}

export function SubTaskCreateForm({ 
  parentTask, 
  projects, 
  projectMembers, 
  onSuccess, 
  onCancel 
}: SubTaskCreateFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: 'none',
    startDate: null,
    dueDate: null,
    percentProgress: 0,
    label: ''
  });

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Task title is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare data for API
      const createData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        projectId: parentTask.projectId, // Inherit from parent
        assignedTo: formData.assignedTo === 'none' ? undefined : formData.assignedTo,
        startDate: formData.startDate || undefined,
        dueDate: formData.dueDate || undefined,
        percentProgress: formData.percentProgress,
        label: formData.label || undefined,
        parentTaskId: parentTask.id // Set parent task ID
      };

      console.log('[SUB_TASK_CREATE] Creating sub-task with data:', createData);
      
      const newSubTask = await projlyTasksService.createTask(createData);
      
      toast({
        title: 'Success',
        description: 'Sub-task created successfully',
      });
      
      onSuccess(newSubTask);
    } catch (error) {
      console.error('[SUB_TASK_CREATE] Error creating sub-task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create sub-task',
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
        <StatusField
          value={formData.status}
          onChange={(value) => handleFieldChange('status', value)}
        />
        
        <PriorityField
          value={formData.priority}
          onChange={(value) => handleFieldChange('priority', value)}
        />
      </div>
      
      <AssigneeField
        value={formData.assignedTo}
        onChange={(value) => handleFieldChange('assignedTo', value)}
        projectMembers={projectMembers}
        isLoadingMembers={false}
      />
      
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
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Sub-Task'}
        </Button>
      </div>
    </div>
  );
}
