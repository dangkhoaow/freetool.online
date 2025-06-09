import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// Define UI filters interface matching currentFilters shape
export interface TaskFiltersUI {
  projectId?: string;
  status?: string;
  label?: string;
  assignedTo?: string;
  taskHierarchy?: string;
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
  onAssigneeChange: (value: string) => void;
  onTaskHierarchyChange: (value: string) => void;
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
}: TaskFiltersProps) {
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

            {/* Assigned To Filter */}
            <div className="flex flex-col gap-2">
              <label htmlFor="assigned-filter" className="text-sm font-medium">
                Assigned To
              </label>
              <Select
                value={filters.assignedTo || 'all'}
                onValueChange={onAssigneeChange}
              >
                <SelectTrigger id="assigned-filter">
                  <SelectValue placeholder="All Members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="current">My Tasks</SelectItem>
                  {uniqueUsers.length > 0 && (
                    <>
                      <SelectItem value="divider" disabled>
                        <Separator className="my-1" />
                      </SelectItem>
                      {uniqueUsers.map((assignee) => (
                        <SelectItem key={assignee.id} value={assignee.id}>
                          {assignee.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
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
        </div>
      </CardContent>
    </Card>
  );
}
