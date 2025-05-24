import { useState, useEffect } from "react";
import { useProjects } from "@/lib/services/projly/use-projects";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Spinner } from "../../components/ui/spinner";
import { useAuth } from "@/app/projly/contexts/AuthContextCustom";
import { TaskFilters as TaskFiltersType } from "@/lib/services/projly/types";

// Define constant log prefix for consistent logging
const LOG_PREFIX = "[PROJLY:TASK_FILTERS]";

interface TaskFiltersProps {
  filters: TaskFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<TaskFiltersType>>;
}

export function TaskFilters({ filters, setFilters }: TaskFiltersProps) {
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();
  const { user } = useAuth();
  
  console.log(`${LOG_PREFIX} Initialized with filters:`, filters);

  const handleClearFilters = () => {
    console.log(`${LOG_PREFIX} Clearing all filters`);
    setFilters({
      status: undefined,
      projectId: undefined,
      assignedTo: undefined,
      includeSubTasks: false,
      parentOnly: false,
    });
  };

  const updateFilter = (key: string, value: any) => {
    console.log(`${LOG_PREFIX} Updating filter for key: ${key}, new value:`, value);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div className="flex flex-col gap-2">
          <label htmlFor="status-filter" className="text-sm font-medium">
            Status
          </label>
          <Select
            value={filters.status || "all_statuses"}
            onValueChange={(value) => 
              updateFilter('status', value === "all_statuses" ? undefined : value)
            }
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_statuses">All statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Project Filter */}
        <div className="flex flex-col gap-2">
          <label htmlFor="project-filter" className="text-sm font-medium">
            Project
          </label>
          <Select
            value={filters.projectId || "all_projects"}
            onValueChange={(value) => 
              updateFilter('projectId', value === "all_projects" ? undefined : value)
            }
          >
            <SelectTrigger id="project-filter">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_projects">All projects</SelectItem>
              {isLoadingProjects ? (
                <div className="flex justify-center p-2">
                  <Spinner className="h-4 w-4" />
                </div>
              ) : (
                projectsData?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Assigned To Filter */}
        <div className="flex flex-col gap-2">
          <label htmlFor="assigned-filter" className="text-sm font-medium">
            Assigned To
          </label>
          <Select
            value={filters.assignedTo || "all_users"}
            onValueChange={(value) => 
              updateFilter('assignedTo', value === "all_users" ? undefined : value)
            }
          >
            <SelectTrigger id="assigned-filter">
              <SelectValue placeholder="Anyone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_users">Anyone</SelectItem>
              <SelectItem value="me">Me</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Additional Filters (Second Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Include Subtasks Toggle */}
        <div className="flex flex-col gap-2">
          <label htmlFor="subtasks-filter" className="text-sm font-medium">
            Subtasks
          </label>
          <Select
            value={filters.includeSubTasks ? "include" : "exclude"}
            onValueChange={(value) => 
              updateFilter('includeSubTasks', value === "include")
            }
          >
            <SelectTrigger id="subtasks-filter">
              <SelectValue placeholder="Exclude subtasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="include">Include subtasks</SelectItem>
              <SelectItem value="exclude">Exclude subtasks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Parent Tasks Toggle */}
        <div className="flex flex-col gap-2">
          <label htmlFor="parent-filter" className="text-sm font-medium">
            Task Type
          </label>
          <Select
            value={filters.parentOnly ? "parent_only" : "all_tasks"}
            onValueChange={(value) => 
              updateFilter('parentOnly', value === "parent_only")
            }
          >
            <SelectTrigger id="parent-filter">
              <SelectValue placeholder="All tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_tasks">All tasks</SelectItem>
              <SelectItem value="parent_only">Parent tasks only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
