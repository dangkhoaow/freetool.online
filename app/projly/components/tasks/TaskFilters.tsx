import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown } from 'lucide-react';

// Define UI filters interface matching currentFilters shape
export interface TaskFiltersUI {
  projectId?: string;
  status?: string;
  label?: string;
  assignedTo?: string | string[];
  taskHierarchy?: string;
  excludeStatuses?: string[];
  excludeChildStatuses?: string[];
}

interface TaskFiltersProps {
  // Current UI filters state
  filters: TaskFiltersUI;
  // Data for dropdowns
  projects: { id: string; name: string }[];
  uniqueStatuses: string[];
  uniqueLabels: string[];
  uniqueUsers: { id: string; name: string }[];
  // Handler callbacks for filter changes
  onProjectChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onLabelChange: (value: string) => void;
  onAssigneeChange: (value: string | string[]) => void;
  onTaskHierarchyChange: (value: string) => void;
  onExcludeStatusesChange: (statuses: string[]) => void;
  onExcludeChildStatusesChange: (statuses: string[]) => void;
}

export function TaskFilters({
  filters,
  projects,
  uniqueStatuses,
  uniqueLabels,
  uniqueUsers,
  onProjectChange,
  onStatusChange,
  onLabelChange,
  onAssigneeChange,
  onTaskHierarchyChange,
  onExcludeStatusesChange,
  onExcludeChildStatusesChange,
}: TaskFiltersProps) {
  
  // Debug: Log received filters
  console.log('[TASK_FILTERS] Received filters:', filters);
  console.log('[TASK_FILTERS] projectId:', filters.projectId);
  console.log('[TASK_FILTERS] taskHierarchy:', filters.taskHierarchy);
  console.log('[TASK_FILTERS] excludeStatuses:', filters.excludeStatuses);
  console.log('[TASK_FILTERS] excludeChildStatuses:', filters.excludeChildStatuses);
  // Local state for assignee popover to prevent uncontrollable behavior
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  const [localAssigneeSelection, setLocalAssigneeSelection] = useState<string[]>([]);
  
  // Initialize local assignee selection from filters
  useEffect(() => {
    const currentAssignees = Array.isArray(filters.assignedTo) 
      ? filters.assignedTo 
      : filters.assignedTo 
        ? [filters.assignedTo] 
        : [];
    console.log(`[TASK FILTERS] Received uniqueUsers:`, uniqueUsers);
    console.log(`[TASK FILTERS] Current assignee selection:`, currentAssignees);
    setLocalAssigneeSelection(currentAssignees);
  }, [filters.assignedTo, uniqueUsers]);
  
  // Handle assignee filter changes with multi-select support
  const handleAssigneeFilterChange = useCallback((value: string | string[]) => {
    let assignedToValue: string | string[] | undefined;
    
    if (Array.isArray(value)) {
      // Multi-select array - filter out empty values
      const cleanedValue = value.filter(v => v && v.trim() !== '');
      assignedToValue = cleanedValue.length === 0 ? undefined : cleanedValue;
      setLocalAssigneeSelection(cleanedValue);
    } else {
      // Single value from select
      if (value === 'all' || value === '' || !value) {
        assignedToValue = undefined;
        setLocalAssigneeSelection([]);
      } else {
        // Always work with arrays for multi-selection
        const currentValues = localAssigneeSelection.length > 0 
          ? localAssigneeSelection
          : (Array.isArray(filters.assignedTo) 
              ? filters.assignedTo 
              : (filters.assignedTo ? [filters.assignedTo] : []));
        
        if (currentValues.includes(value)) {
          // Remove from selection
          const newValues = currentValues.filter(v => v !== value);
          assignedToValue = newValues.length === 0 ? undefined : newValues;
          setLocalAssigneeSelection(newValues);
        } else {
          // Add to selection
          const newValues = [...currentValues, value];
          assignedToValue = newValues;
          setLocalAssigneeSelection(newValues);
        }
      }
    }
    
    // Call the parent handler with the new value
    onAssigneeChange(assignedToValue || 'all');
  }, [filters.assignedTo, localAssigneeSelection, onAssigneeChange]);
  return (
    <Card className="mt-4 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Project Filter */}
            <div className="flex flex-col gap-2">
              <label htmlFor="project-filter" className="text-sm font-medium">
                Project
              </label>
              <Select
                value={filters.projectId || 'all'}
                onValueChange={onProjectChange}
              >
                <SelectTrigger id="project-filter">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-2">
              <label htmlFor="status-filter" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={filters.status || 'all'}
                onValueChange={onStatusChange}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Label Filter */}
            <div className="flex flex-col gap-2">
              <label htmlFor="label-filter" className="text-sm font-medium">
                Label
              </label>
              <Select
                value={filters.label || 'all'}
                onValueChange={onLabelChange}
              >
                <SelectTrigger id="label-filter">
                  <SelectValue placeholder="All Labels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Labels</SelectItem>
                  {uniqueLabels.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assigned To Filter - Multi-select */}
            <div className="flex flex-col gap-2">
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
                            const user = uniqueUsers.find(u => u.id === userId);
                            const displayName = userId === 'current' ? 'My Tasks' : (user?.name || userId);
                            console.log(`[TASK FILTERS] Resolving user ${userId}: found user =`, user, `displayName = ${displayName}`);
                            return (
                              <span key={userId} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                                {displayName}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const newValues = localAssigneeSelection.filter((id: string) => id !== userId);
                                    handleAssigneeFilterChange(newValues.length === 0 ? [] : newValues);
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
                        <div className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded cursor-pointer"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleAssigneeFilterChange([]);
                             }}>
                          <Checkbox
                            checked={localAssigneeSelection.length === 0}
                          />
                          <span className="text-sm">All Members</span>
                        </div>
                        <div className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded cursor-pointer"
                             onClick={(e) => {
                               e.stopPropagation();
                               if (localAssigneeSelection.includes('current')) {
                                 const newValues = localAssigneeSelection.filter(id => id !== 'current');
                                 handleAssigneeFilterChange(newValues);
                               } else {
                                 handleAssigneeFilterChange([...localAssigneeSelection, 'current']);
                               }
                             }}>
                          <Checkbox
                            checked={localAssigneeSelection.includes('current')}
                          />
                          <span className="text-sm">My Tasks</span>
                        </div>
                        {uniqueUsers.map(user => {
                          const isSelected = localAssigneeSelection.includes(user.id);
                          return (
                            <div 
                              key={user.id}
                              className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isSelected) {
                                  const newValues = localAssigneeSelection.filter(id => id !== user.id);
                                  handleAssigneeFilterChange(newValues.length === 0 ? [] : newValues);
                                } else {
                                  handleAssigneeFilterChange([...localAssigneeSelection, user.id]);
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

            {/* Task Hierarchy Filter */}
            <div className="flex flex-col gap-2">
              <label htmlFor="hierarchy-filter" className="text-sm font-medium">
                Task Hierarchy
              </label>
              <Select
                value={filters.taskHierarchy || 'all'}
                onValueChange={onTaskHierarchyChange}
              >
                <SelectTrigger id="hierarchy-filter">
                  <SelectValue placeholder="All Tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="parent_only">Parent Tasks Only</SelectItem>
                  <SelectItem value="include_subtasks">
                    Include Subtasks
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Exclude Statuses Filter */}
          <div className="mt-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="exclude-statuses-filter" className="text-sm font-medium">
                Hide Parent Tasks by Status
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Hides parent tasks and all their subtasks when the parent has the selected status
              </p>
              <div className="flex flex-wrap gap-2">
                {uniqueStatuses.map((status) => (
                  <label key={status} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.excludeStatuses?.includes(status) || false}
                      onChange={(e) => {
                        const currentExcluded = filters.excludeStatuses || [];
                        const newExcluded = e.target.checked
                          ? [...currentExcluded, status]
                          : currentExcluded.filter(s => s !== status);
                        onExcludeStatusesChange(newExcluded);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Exclude Child Statuses Filter */}
          <div className="mt-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="exclude-child-statuses-filter" className="text-sm font-medium">
                Hide Child/Subtasks by Status
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Hides individual child/subtasks that have the selected status (parent tasks remain visible)
              </p>
              <div className="flex flex-wrap gap-2">
                {uniqueStatuses.map((status) => (
                  <label key={`child-${status}`} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.excludeChildStatuses?.includes(status) || false}
                      onChange={(e) => {
                        const currentExcluded = filters.excludeChildStatuses || [];
                        const newExcluded = e.target.checked
                          ? [...currentExcluded, status]
                          : currentExcluded.filter(s => s !== status);
                        onExcludeChildStatusesChange(newExcluded);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
