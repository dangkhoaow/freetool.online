import React, { useEffect } from "react";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const Projects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const refreshProjects = async () => {
    // Invalidate the queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  return (
    <div className="container mx-auto py-6">
      {/* Debug info and refresh buttons removed */}
      <ProjectsTable />
    </div>
  );
};

export default Projects;
