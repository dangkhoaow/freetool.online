
import { Tables } from "@/types";

export interface CalendarResource {
  id: string;
  title: string;
  start?: string;
  end?: string;
  extendedProps?: {
    description?: string;
    status?: string;
  }
}

/**
 * Transform projects data into FullCalendar resources format
 */
export const transformProjectsToResources = (projects: Tables.Project[] | null): CalendarResource[] => {
  if (!projects || projects.length === 0) return [];
  
  console.log('Transforming projects to resources:', projects);
  
  return projects.map(project => ({
    id: project.id,
    title: project.name,
    start: project.startDate ? project.startDate.toString() : undefined,
    end: project.endDate ? project.endDate.toString() : undefined,
    extendedProps: {
      description: project.description,
      status: project.status
    }
  }));
};
