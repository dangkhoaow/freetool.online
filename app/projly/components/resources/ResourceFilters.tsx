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

interface ResourceFiltersProps {
  filters: {
    name: string;
    fileType: string;
    projectId: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      name: string;
      fileType: string;
      projectId: string;
    }>
  >;
}

export function ResourceFilters({ filters, setFilters }: ResourceFiltersProps) {
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();
  
  console.log(`[FILTERS] Initialized with filters: ${JSON.stringify(filters)}`);

  const handleClearFilters = () => {
    setFilters({
      name: "",
      fileType: "",
      projectId: "",
    });
  };

  const updateFilter = (key: string, value: string) => {
    console.log(`[FILTERS] Updating filter for key: ${key}, new value: ${value}`);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="name-filter" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="name-filter"
            placeholder="Filter by name"
            value={filters.name}
            onChange={(e) => updateFilter('name', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="fileType-filter" className="text-sm font-medium">
            File Type
          </label>
          <Select
            value={filters.fileType}
            onValueChange={(value) => updateFilter('fileType', value)}
          >
            <SelectTrigger id="fileType-filter">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="Material">Material</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Software">Software</SelectItem>
              <SelectItem value="License">License</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="project-filter" className="text-sm font-medium">
            Project
          </label>
          <Select
            value={filters.projectId}
            onValueChange={(value) => updateFilter('projectId', value)}
          >
            <SelectTrigger id="project-filter">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All projects</SelectItem>
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
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
