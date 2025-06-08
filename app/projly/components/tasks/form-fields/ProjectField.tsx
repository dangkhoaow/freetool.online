import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Project {
  id: string;
  name: string;
}

interface ProjectFieldProps {
  value: string;
  projects: Project[];
  onChange: (value: string) => void;
}

export function ProjectField({ value, projects, onChange }: ProjectFieldProps) {
  console.log('[PROJLY:TASK_FORM] Rendering ProjectField component with', projects.length, 'projects');
  
  return (
    <div>
      <Label htmlFor="projectId">Project *</Label>
      <Select
        value={value}
        onValueChange={(value) => onChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
