import React, { useState, useEffect } from "react";
import { formatDateForDisplay } from "@/app/projly/utils/dateUtils";
import { extractApiData } from "@/app/projly/utils/apiUtils";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { projlyProjectsService, type Project } from "@/lib/services/projly";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Table, TableBody, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";

import { SearchBar } from "./SearchBar";
import { ProjectTableHeader } from "./ProjectTableHeader";
import { ProjectTableRow } from "./ProjectTableRow";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

export function ProjectsTable() {
  // State for search and sorting
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "createdAt",
    direction: "desc",
  });
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get data using React Query with our service layer
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projly-projects"],
    queryFn: async () => {
      console.log("[ProjectsTable] Fetching projects from service");
      return await projlyProjectsService.getProjects();
    }
  });

  // Delete project mutation
  const { mutate: deleteProject } = useMutation({
    mutationFn: (id: string) => projlyProjectsService.deleteProject(id),
    onSuccess: () => {
      console.log("[ProjectsTable] Project deleted successfully");
      // Invalidate the projects query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["projly-projects"] });
    }
  });

  // Using the Project type from our service layer
  
  // Use our utility function to safely extract data from the API response
  // Transform the data to ensure it matches our Project interface
  const projectsData = extractApiData<Project>(projects, "ProjectsTable").map(project => ({
    id: project.id,
    name: project.name || '',
    description: project.description || null,
    status: project.status || 'Unknown',
    createdAt: project.createdAt || undefined,
    updatedAt: project.updatedAt || undefined,
    ownerId: project.ownerId || undefined,
    teamId: project.teamId || undefined,
    startDate: project.startDate || undefined,
    endDate: project.endDate || undefined
  }));
  
  console.log("[ProjectsTable] Processed project data:", projectsData.length);
  
  // Filter projects based on search term with proper type safety
  const filteredProjects = projectsData.filter(project => 
    !search || 
    (project.name && project.name.toLowerCase().includes(search.toLowerCase())) ||
    (project.description && project.description.toLowerCase().includes(search.toLowerCase()))
  );
  
  // Log the filtered projects for debugging
  console.log("[ProjectsTable] Filtered projects:", filteredProjects.length);

  // Sort projects
  const sortedProjects = filteredProjects?.slice().sort((a, b) => {
    if (sortBy.field === "name") {
      return sortBy.direction === "asc"
        ? (a.name || '').localeCompare(b.name || '')
        : (b.name || '').localeCompare(a.name || '');
    } else if (sortBy.field === "status") {
      return sortBy.direction === "asc"
        ? (a.status || 'Unknown').localeCompare(b.status || 'Unknown')
        : (b.status || 'Unknown').localeCompare(a.status || 'Unknown');
    } else if (sortBy.field === "createdAt") {
      // Safely handle date comparison with null checks
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy.direction === "asc"
        ? dateA - dateB
        : dateB - dateA;
    }
    return 0;
  });

  // Toggle sort when clicking on a header
  const toggleSort = (field: string) => {
    if (sortBy.field === field) {
      setSortBy({
        field,
        direction: sortBy.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortBy({ field, direction: "asc" });
    }
  };

  // Handle delete project
  const confirmDelete = (id: string) => {
    deleteProject(id);
    setDeleteProjectId(null);
  };

  // Handle project click
  const handleProjectClick = (projectId: string) => {
    router.push(`/todo-list/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Projects</h1>
        <Button onClick={() => router.push("/todo-list/projects/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>
      
      <div className="bg-card rounded-md p-4 space-y-4">
        {/* Search */}
        <SearchBar search={search} setSearch={setSearch} />
        
        <Separator />
        
        {/* Projects table */}
        <Table>
          <TableCaption>
            {filteredProjects?.length === 0 
              ? "No projects found." 
              : `Showing ${sortedProjects?.length} projects`}
          </TableCaption>
          
          <ProjectTableHeader sortBy={sortBy} toggleSort={toggleSort} />
          
          <TableBody>
            {sortedProjects?.map((project) => (
              <ProjectTableRow 
                key={project.id}
                project={project}
                handleProjectClick={handleProjectClick}
                setDeleteProjectId={setDeleteProjectId}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete project confirmation */}
      <DeleteConfirmationDialog 
        deleteProjectId={deleteProjectId}
        setDeleteProjectId={setDeleteProjectId}
        confirmDelete={confirmDelete}
      />
    </div>
  );
}
