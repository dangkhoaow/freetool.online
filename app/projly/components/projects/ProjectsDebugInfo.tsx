
import React, { useEffect, useState } from "react";
import { useSession } from "@/hooks/jwt-auth-adapter";
import { projectService } from "@/services/prisma/projects";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function ProjectsDebugInfo() {
  const { data: session } = useSession();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);
  
  useEffect(() => {
    const checkProjectInfo = async () => {
      if (!session?.user) return;
      
      console.log("DEBUG: Checking project info for user:", session.user.email);
      
      const results: any = {};
      
      try {
        // Get all projects for the user
        const { data: projectsData, error: projectsError } = await projectService.getAll(session.user.id);
          
        if (projectsError) {
          console.error("DEBUG: Error checking projects:", projectsError);
          results.projectsError = projectsError;
        } else {
          console.log("DEBUG: User projects:", projectsData);
          results.projects = projectsData;
          
          // If we found any projects, get members for the first one
          if (projectsData && projectsData.length > 0) {
            const firstProjectId = projectsData[0].id;
            
            // Get members for this project
            const { data: membersData, error: membersError } = await projectService.getMembers(firstProjectId, session.user.id);
            
            if (membersError) {
              console.error("DEBUG: Error getting project members:", membersError);
              results.membersError = membersError;
            } else {
              console.log("DEBUG: Project members:", membersData);
              results.members = membersData;
            }
          }
        }
        
        // Try to get a specific project by ID if we have one
        if (results.projects && results.projects.length > 0) {
          const someProjectId = results.projects[0].id;
          const { data: projectDetail, error: detailError } = await projectService.getById(someProjectId, session.user.id);
          
          if (detailError) {
            console.error("DEBUG: Error getting project details:", detailError);
            results.detailError = detailError;
          } else {
            console.log("DEBUG: Project details:", projectDetail);
            results.projectDetail = projectDetail;
          }
        }
        
        setDebugInfo(results);
      } catch (error) {
        console.error("DEBUG: Unexpected error:", error);
        setDebugInfo({ error });
      }
    };

    // Run the check when session changes
    if (session?.user) {
      checkProjectInfo();
    }
  }, [session]);

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
      >
        {showDebug ? "Hide" : "Show"} Debug Info
      </button>

      {showDebug && (
        <Alert className="mt-2">
          <AlertTitle>Debug Information</AlertTitle>
          <AlertDescription>
            <div className="text-xs font-mono whitespace-pre-wrap overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
