
'use client';

import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { projlyProjectsService } from '@/lib/services/projly';

export const ProjectActivityTracker: React.FC = () => {
  const pathname = usePathname();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:ACTIVITY_TRACKER] ${message}`, data);
    } else {
      console.log(`[PROJLY:ACTIVITY_TRACKER] ${message}`);
    }
  };
  
  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await projlyProjectsService.getProjects();
        log('Projects loaded:', projectsData.length);
        setProjects(projectsData || []);
      } catch (error) {
        console.error('[PROJLY:ACTIVITY_TRACKER] Error loading projects:', error);
      }
    };
    
    loadProjects();
  }, []);
  
  // Determine if we're on the projects page
  const isProjectsPage = pathname === '/projly/projects';
  
  const refreshProjectData = async () => {
    log('Refreshing project data');
    setIsRefreshing(true);
    
    try {
      // Reload projects data
      const refreshedProjects = await projlyProjectsService.getProjects();
      log('Projects reloaded:', refreshedProjects.length);
      setProjects(refreshedProjects || []);
      
      toast({
        title: 'Projects refreshed',
        description: 'Project data has been refreshed successfully.',
      });
    } catch (error) {
      console.error('[PROJLY:ACTIVITY_TRACKER] Error refreshing projects:', error);
      toast({
        title: 'Refresh failed',
        description: 'Failed to refresh project data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Log project count whenever it changes
  useEffect(() => {
    if (projects) {
      log(`Currently tracking ${projects.length} projects`);
    }
  }, [projects]);
  
  // Don't render on non-project pages
  if (!isProjectsPage) {
    return null;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative" 
            onClick={refreshProjectData}
            disabled={isRefreshing}
          >
            <Activity className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {projects && projects.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {projects.length}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Refresh Project Data</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
