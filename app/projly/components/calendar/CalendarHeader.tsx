
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tables } from '@/types';

interface CalendarHeaderProps {
  currentViewTitle: string;
  projects: Tables.Project[] | null;
  selectedProject: string | null;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onProjectSelect: (projectId: string | null) => void;
}

export const CalendarHeader = ({
  currentViewTitle,
  projects,
  selectedProject,
  onPrev,
  onNext,
  onToday,
  onProjectSelect
}: CalendarHeaderProps) => {
  console.log('Rendering calendar header with projects:', projects?.length);
  
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <Button variant="outline" size="sm" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          {currentViewTitle}
        </h2>
      </div>

      <Select
        value={selectedProject || "all"}
        onValueChange={(value) => {
          onProjectSelect(value === "all" ? null : value);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by Project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          {projects?.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
