/**
 * TaskDetailDialogHub Component - Optimized for Fast Loading
 * 
 * An optimized task detail dialog that loads minimal data first for fast popup
 * opening, then progressively loads additional data sections as needed.
 * 
 * Key optimizations:
 * - Light mode initial load for minimal data
 * - Progressive loading of heavy sections
 * - Lazy loading of relations and descriptions
 * - Reuse existing UI components for consistency
 * 
 * @created 2025-08-21
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { tasksHubService } from '@/lib/services/projly/tasks/hub/new-task-service';
import { Calendar, Clock, User, Tag, BarChart3, FileText, Link, ArrowLeft, Edit, Trash2, Filter, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/app/projly/contexts/AuthContextCustom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { TasksTable } from '@/app/projly/components/tasks/TasksTable';
import { TasksBoard } from '@/app/projly/components/tasks/TasksBoard';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { List, LayoutGrid } from 'lucide-react';
import { getAssigneeInitials } from './TasksHubContainer';

// Log function for debugging
const log = (...args: any[]) => console.log('[TaskDetailDialogHub]', ...args);

interface TaskDetailDialogHubProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskChange?: () => void;
}

export function TaskDetailDialogHub({ 
  taskId, 
  open, 
  onOpenChange, 
  onTaskChange 
}: TaskDetailDialogHubProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [lightTask, setLightTask] = useState<any>(null);
  const [fullTask, setFullTask] = useState<any>(null);
  const [isLightLoading, setIsLightLoading] = useState(true);
  const [isFullLoading, setIsFullLoading] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Subtask filtering state
  const [subtaskFilters, setSubtaskFilters] = useState<any>({
    search: '',
    status: 'all',
    assignedTo: [],
    label: 'all'
  });
  const [subtaskViewMode, setSubtaskViewMode] = useState<'list' | 'board'>('list');
  const [showSubtaskFilters, setShowSubtaskFilters] = useState(false);
  const [availableMembers, setAvailableMembers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  
  // Local state for assignee popover to prevent uncontrollable behavior
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  const [localAssigneeSelection, setLocalAssigneeSelection] = useState<string[]>([]);
  
  // Load light task data immediately when dialog opens
  useEffect(() => {
    if (!open || !taskId) return;
    
    const loadLightTask = async () => {
      try {
        setIsLightLoading(true);
        setError(null);
        log('Loading light task data for:', taskId);
        
        const task = await tasksHubService.getTaskById(taskId, { light: true });
        setLightTask(task);
        log('Light task data loaded:', task?.title);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load task';
        log('Error loading light task:', errorMessage);
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      } finally {
        setIsLightLoading(false);
      }
    };
    
    loadLightTask();
  }, [open, taskId, toast]);
  
  // Fetch available members when component mounts
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        log('Fetching available members for subtask dialog');
        const response = await tasksHubService.getMembers();
        log('Members API response:', response);
        
        if (response && 'data' in response && Array.isArray(response.data)) {
          log(`Setting ${response.data.length} members from response.data`);
          setAvailableMembers(response.data);
        } else if (Array.isArray(response)) {
          log(`Setting ${response.length} members from direct array response`);
          setAvailableMembers(response);
        } else {
          log('Unexpected response format:', response);
          setAvailableMembers([]);
        }
      } catch (error) {
        console.error('Failed to fetch members:', error);
        setAvailableMembers([]);
      }
    };
    
    if (user && open) {
      fetchMembers();
    }
  }, [user, open]);
  
  // Load full task data when user requests more details
  const loadFullDetails = async () => {
    if (fullTask || isFullLoading) return;
    
    try {
      setIsFullLoading(true);
      log('Loading full task data for:', taskId);
      
      const task = await tasksHubService.getTaskById(taskId, { light: false });
      setFullTask(task);
      setShowFullDetails(true);
      log('Full task data loaded:', task?.title);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load full task details';
      log('Error loading full task:', errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsFullLoading(false);
    }
  };
  
  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setLightTask(null);
      setFullTask(null);
      setIsLightLoading(true);
      setIsFullLoading(false);
      setShowFullDetails(false);
      setError(null);
      // Reset subtask filters
      setSubtaskFilters({
        search: '',
        status: 'all',
        assignedTo: [],
        label: 'all'
      });
      setShowSubtaskFilters(false);
      setLocalAssigneeSelection([]);
    }
  }, [open]);
  
  // Initialize local assignee selection from filters
  useEffect(() => {
    const currentAssignees = Array.isArray(subtaskFilters.assignedTo) 
      ? subtaskFilters.assignedTo 
      : subtaskFilters.assignedTo 
        ? [subtaskFilters.assignedTo] 
        : [];
    setLocalAssigneeSelection(currentAssignees);
  }, [subtaskFilters.assignedTo]);
  
  // Get the task data to display (full if available, light otherwise)
  const currentTask = fullTask || lightTask;
  
  // Check if current user can delete task
  const canDeleteTask = () => {
    if (!user?.id || !currentTask) return false;
    return currentTask.assigneeId === user.id || currentTask.createdById === user.id;
  };
  
  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!taskId || !canDeleteTask()) return;
    
    try {
      log('Deleting task:', taskId);
      await tasksHubService.deleteTask(taskId);
      
      toast({
        title: 'Task deleted',
        description: 'Task has been successfully deleted.',
        variant: 'default'
      });
      
      onOpenChange(false);
      onTaskChange?.();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      log('Error deleting task:', errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };
  
  // Format date helper
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'Not set';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Filter subtasks based on current filters
  const filteredSubtasks = useMemo(() => {
    if (!fullTask?.subTasks) return [];
    
    let filtered = fullTask.subTasks;
    
    // Search filter
    if (subtaskFilters.search) {
      const searchTerm = subtaskFilters.search.toLowerCase();
      filtered = filtered.filter((task: any) =>
        task.title?.toLowerCase().includes(searchTerm) ||
        task.id?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Status filter
    if (subtaskFilters.status && subtaskFilters.status !== 'all') {
      filtered = filtered.filter((task: any) => task.status === subtaskFilters.status);
    }
    
    // Label filter
    if (subtaskFilters.label && subtaskFilters.label !== 'all') {
      filtered = filtered.filter((task: any) => task.label === subtaskFilters.label);
    }
    
    // Assignee filter
    if (subtaskFilters.assignedTo && subtaskFilters.assignedTo.length > 0) {
      filtered = filtered.filter((task: any) => {
        if (subtaskFilters.assignedTo.includes('current')) {
          return task.assigneeId === user?.id;
        }
        return subtaskFilters.assignedTo.includes(task.assigneeId);
      });
    }
    
    return filtered;
  }, [fullTask?.subTasks, subtaskFilters, user?.id]);
  
  // Get unique values for subtask filter dropdowns
  const subtaskUniqueStatuses = useMemo(() => {
    if (!fullTask?.subTasks) return [];
    const statuses = new Set<string>();
    fullTask.subTasks.forEach((task: any) => {
      if (task.status) statuses.add(task.status);
    });
    return Array.from(statuses).sort();
  }, [fullTask?.subTasks]);
  
  const subtaskUniqueLabels = useMemo(() => {
    if (!fullTask?.subTasks) return [];
    const labels = new Set<string>();
    fullTask.subTasks.forEach((task: any) => {
      if (task.label) labels.add(task.label);
    });
    return Array.from(labels).sort();
  }, [fullTask?.subTasks]);
  
  const subtaskUniqueUsers = useMemo(() => {
    if (!fullTask?.subTasks) return [];
    const users = new Map<string, any>();
    fullTask.subTasks.forEach((task: any) => {
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
  }, [fullTask?.subTasks]);
  
  // Subtask filter handlers
  const handleSubtaskAssigneeFilterChange = useCallback((value: string | string[]) => {
    let assignedToValue: string | string[] | undefined;
    
    if (Array.isArray(value)) {
      const cleanedValue = value.filter(v => v && v.trim() !== '');
      assignedToValue = cleanedValue.length === 0 ? [] : cleanedValue;
      setLocalAssigneeSelection(cleanedValue);
    } else {
      if (value === 'all' || value === '' || !value) {
        assignedToValue = [];
        setLocalAssigneeSelection([]);
      } else {
        const currentValues = localAssigneeSelection.length > 0 
          ? localAssigneeSelection
          : (Array.isArray(subtaskFilters.assignedTo) 
              ? subtaskFilters.assignedTo 
              : (subtaskFilters.assignedTo ? [subtaskFilters.assignedTo] : []));
        
        if (currentValues.includes(value)) {
          const newValues = currentValues.filter(v => v !== value);
          assignedToValue = newValues;
          setLocalAssigneeSelection(newValues);
        } else {
          const newValues = [...currentValues, value];
          assignedToValue = newValues;
          setLocalAssigneeSelection(newValues);
        }
      }
    }
    
    setSubtaskFilters(prev => ({
      ...prev,
      assignedTo: assignedToValue
    }));
  }, [subtaskFilters.assignedTo, localAssigneeSelection]);
  
  // Check if any subtask filters are active
  const hasActiveSubtaskFilters = useMemo(() => {
    return !!(subtaskFilters.search ||
      (subtaskFilters.status && subtaskFilters.status !== 'all') ||
      (subtaskFilters.assignedTo && subtaskFilters.assignedTo.length > 0) ||
      (subtaskFilters.label && subtaskFilters.label !== 'all'));
  }, [subtaskFilters]);
  
  // Helper function to resolve user ID to display name
  const resolveUserDisplayName = useCallback((userId: string) => {
    if (userId === 'current') {
      return 'My Tasks';
    }
    
    log(`Resolving display name for user ID: ${userId}`);
    log(`Available members:`, availableMembers);
    log(`Subtask unique users:`, subtaskUniqueUsers);
    
    // First try to find in availableMembers (from API)
    const apiMember = availableMembers.find(u => u.id === userId);
    if (apiMember) {
      log(`Found in availableMembers: ${apiMember.name}`);
      return apiMember.name;
    }
    
    // Then try to find in subtaskUniqueUsers (from current subtasks)
    const subtaskUser = subtaskUniqueUsers.find(u => u.id === userId);
    if (subtaskUser) {
      log(`Found in subtaskUniqueUsers: ${subtaskUser.name}`);
      return subtaskUser.name;
    }
    
    // If not found, try to get from current user context
    if (user && userId === user.id) {
      const currentUserName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.email || 'Current User';
      log(`Found as current user: ${currentUserName}`);
      return currentUserName;
    }
    
    // Last resort: show a truncated version of the ID
    const fallbackName = `User (${userId.substring(0, 8)}...)`;
    log(`Using fallback name: ${fallbackName}`);
    return fallbackName;
  }, [availableMembers, subtaskUniqueUsers, user]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {isLightLoading ? (
                <Skeleton className="h-6 w-64" />
              ) : (
                currentTask?.title || 'Task Details'
              )}
            </DialogTitle>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {canDeleteTask() && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDeleteTask}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        {error ? (
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : isLightLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : currentTask ? (
          <div className="space-y-6">
            {/* Quick overview - always visible */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Overview</CardTitle>
                  {!showFullDetails && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadFullDetails}
                      disabled={isFullLoading}
                    >
                      {isFullLoading ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Status */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(currentTask.status)}>
                      {currentTask.status || 'Not set'}
                    </Badge>
                  </div>
                  
                  {/* Priority */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Priority</p>
                    <Badge className={getPriorityColor(currentTask.priority)}>
                      {currentTask.priority || 'Medium'}
                    </Badge>
                  </div>
                  
                  {/* Progress */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Progress</p>
                    <div className="flex items-center gap-2">
                      <Progress value={currentTask.percentProgress || 0} className="flex-1" />
                      <span className="text-sm text-muted-foreground">
                        {currentTask.percentProgress || 0}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Label */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Label</p>
                    {currentTask.label ? (
                      <Badge variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {currentTask.label}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">No label</span>
                    )}
                  </div>
                </div>
                
                {/* Dates and project */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due Date
                    </p>
                    <p className="text-sm">{formatDate(currentTask.dueDate)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Assignee
                    </p>
                    <p className="text-sm">
                      {currentTask.assignee 
                        ? `${currentTask.assignee.firstName || ''} ${currentTask.assignee.lastName || ''}`.trim() || currentTask.assignee.email
                        : 'Unassigned'
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Project</p>
                    <p className="text-sm">{currentTask.project?.name || 'No project'}</p>
                  </div>
                </div>
                
                {/* Subtask count if available */}
                {currentTask._count?.subTasks > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      This task has {currentTask._count.subTasks} subtask{currentTask._count.subTasks === 1 ? '' : 's'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Full details section - loaded progressively */}
            {showFullDetails && fullTask && (
              <>
                {/* Description */}
                {fullTask.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p>{fullTask.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Subtasks with enhanced filtering */}
                {fullTask.subTasks && fullTask.subTasks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Subtasks ({fullTask.subTasks.length})
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSubtaskFilters(!showSubtaskFilters)}
                          className="flex items-center gap-1"
                        >
                          <Filter className="h-4 w-4" />
                          Filters
                          {hasActiveSubtaskFilters && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Subtask Filters */}
                      {showSubtaskFilters && (
                        <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* Search */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Search</label>
                              <Input
                                placeholder="Search subtasks..."
                                value={subtaskFilters.search}
                                onChange={(e) => setSubtaskFilters(prev => ({ ...prev, search: e.target.value }))}
                              />
                            </div>
                            
                            {/* Status Filter */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Status</label>
                              <Select 
                                value={subtaskFilters.status} 
                                onValueChange={(value) => setSubtaskFilters(prev => ({ ...prev, status: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Statuses</SelectItem>
                                  {subtaskUniqueStatuses.map(status => (
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
                              <Select 
                                value={subtaskFilters.label} 
                                onValueChange={(value) => setSubtaskFilters(prev => ({ ...prev, label: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="All Labels" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Labels</SelectItem>
                                  {subtaskUniqueLabels.map(label => (
                                    <SelectItem key={label} value={label}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Assigned To Filter - Multi-select */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Assigned To</label>
                              <div className="relative">
                                <Popover open={assigneePopoverOpen} onOpenChange={setAssigneePopoverOpen}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className="w-full justify-between text-left font-normal"
                                    >
                                      {localAssigneeSelection.length === 0 ? (
                                        'All Members'
                                      ) : (
                                        <div className="flex flex-wrap gap-1 max-w-full">
                                          {localAssigneeSelection.slice(0, 2).map(userId => {
                                            const displayName = resolveUserDisplayName(userId);
                                            return (
                                              <span key={userId} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                                                {displayName}
                                                <button
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    const newValues = localAssigneeSelection.filter((id: string) => id !== userId);
                                                    handleSubtaskAssigneeFilterChange(newValues.length === 0 ? [] : newValues);
                                                  }}
                                                  className="ml-1 hover:text-blue-600"
                                                >
                                                  ×
                                                </button>
                                              </span>
                                            );
                                          })}
                                          {localAssigneeSelection.length > 2 && (
                                            <span className="text-xs text-muted-foreground">
                                              +{localAssigneeSelection.length - 2} more
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0" align="start">
                                    <div className="max-h-60 overflow-y-auto">
                                      <div className="p-2">
                                        <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               handleSubtaskAssigneeFilterChange([]);
                                             }}>
                                          <Checkbox
                                            checked={localAssigneeSelection.length === 0}
                                          />
                                          <span className="text-sm">All Members</span>
                                        </div>
                                        <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               if (localAssigneeSelection.includes('current')) {
                                                 const newValues = localAssigneeSelection.filter(id => id !== 'current');
                                                 handleSubtaskAssigneeFilterChange(newValues);
                                               } else {
                                                 handleSubtaskAssigneeFilterChange([...localAssigneeSelection, 'current']);
                                               }
                                             }}>
                                          <Checkbox
                                            checked={localAssigneeSelection.includes('current')}
                                          />
                                          <span className="text-sm">My Tasks</span>
                                        </div>
                                        {(availableMembers.length > 0 ? availableMembers : subtaskUniqueUsers).map(user => {
                                          const isSelected = localAssigneeSelection.includes(user.id);
                                          return (
                                            <div 
                                              key={user.id}
                                              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (isSelected) {
                                                  const newValues = localAssigneeSelection.filter(id => id !== user.id);
                                                  handleSubtaskAssigneeFilterChange(newValues.length === 0 ? [] : newValues);
                                                } else {
                                                  handleSubtaskAssigneeFilterChange([...localAssigneeSelection, user.id]);
                                                }
                                              }}
                                            >
                                              <Checkbox checked={isSelected} />
                                              <span className="text-sm">{user.name}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          </div>
                          
                          {/* View Mode Toggle */}
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Showing {filteredSubtasks.length} of {fullTask.subTasks.length} subtasks
                            </div>
                            <ToggleGroup type="single" value={subtaskViewMode} onValueChange={(value) => value && setSubtaskViewMode(value as 'list' | 'board')}>
                              <ToggleGroupItem value="list" aria-label="List view">
                                <List className="h-4 w-4" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="board" aria-label="Board view">
                                <LayoutGrid className="h-4 w-4" />
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      {filteredSubtasks.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          {hasActiveSubtaskFilters ? 'No subtasks match the current filters.' : 'No subtasks found.'}
                        </div>
                      ) : subtaskViewMode === 'list' ? (
                        <TasksTable
                          tasks={filteredSubtasks}
                          initialFilters={{}}
                          onOperationComplete={onTaskChange}
                          compact={true}
                          context="task"
                          hideFilterUI={true}
                          loading={false}
                        />
                      ) : (
                        <TasksBoard
                          tasks={filteredSubtasks}
                          initialFilters={{}}
                          onOperationComplete={onTaskChange}
                          compact={true}
                          context="task"
                        />
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Related Tasks */}
                {fullTask.relatedTasks && fullTask.relatedTasks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Link className="h-5 w-5" />
                        Related Tasks ({fullTask.relatedTasks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {fullTask.relatedTasks.map((relatedTask: any) => (
                          <div key={relatedTask.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(relatedTask.status)} variant="outline">
                                {relatedTask.status}
                              </Badge>
                              <span className="text-sm">{relatedTask.title}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {relatedTask.project?.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
            
            {/* Loading state for full details */}
            {isFullLoading && (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No task data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
