'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/projly/contexts/AuthContextCustom';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/projly/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, PlusCircle, FolderOpen, MoreHorizontal, Archive, Edit, Eye, Trash2, Loader2 } from 'lucide-react';
import { PageLoading } from '@/app/projly/components/ui/PageLoading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { projlyAuthService, projlyProjectsService } from '@/lib/services/projly';
import { useArchiveProject } from '@/lib/services/projly/use-projects';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

export default function Projects() {
  const router = useRouter();
  const { user } = useAuth(); // Get current user from AuthContext
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({ 
    field: 'createdAt', 
    direction: 'desc' 
  });
  const [archivingId, setArchivingId] = useState<string | null>(null);
  
  // Initialize the archive project mutation
  const archiveProjectMutation = useArchiveProject();
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:PROJECTS] ${message}`, data);
    } else {
      console.log(`[PROJLY:PROJECTS] ${message}`);
    }
  };

  // Function to check if current user is the owner of a project
  const isProjectOwner = (project: any): boolean => {
    if (!user || !project) return false;
    log(`Checking if user ${user.id} is owner of project ${project.id} (owner: ${project.ownerId})`);
    return user.id === project.ownerId;
  };
  
  useEffect(() => {
    log('Projects page loaded');
    
    const fetchProjects = async () => {
      try {
        log('Checking authentication');
        const isAuthenticated = await projlyAuthService.isAuthenticated();
        
        if (!isAuthenticated) {
          log('User not authenticated, redirecting to login');
          router.push('/projly/login');
          return;
        }
        
        log('Fetching projects');
        const projectsData = await projlyProjectsService.getProjects();
        log('Projects loaded:', projectsData.length);
        setProjects(projectsData);
      } catch (error) {
        console.error('[PROJLY:PROJECTS] Error fetching projects:', error);
      } finally {
        setIsLoading(false);
        log('Projects loading completed');
      }
    };
    
    fetchProjects();
  }, [router]);
  
  // Filter projects based on search
  const filteredProjects = search.trim() 
    ? projects.filter(project => 
        (project.name && project.name.toLowerCase().includes(search.toLowerCase())) ||
        (project.description && project.description.toLowerCase().includes(search.toLowerCase()))
      )
    : projects;
    
  log('Filtered projects:', filteredProjects.length);
    
  // Sort projects based on current sort settings
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy.field === 'name') {
      return sortBy.direction === 'asc'
        ? (a.name || '').localeCompare(b.name || '')
        : (b.name || '').localeCompare(a.name || '');
    } else if (sortBy.field === 'status') {
      return sortBy.direction === 'asc'
        ? (a.status || 'Unknown').localeCompare(b.status || 'Unknown')
        : (b.status || 'Unknown').localeCompare(a.status || 'Unknown');
    } else if (sortBy.field === 'createdAt') {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });
  
  // Handle sort toggle
  const toggleSort = (field: string) => {
    log('Toggling sort field:', field);
    setSortBy(prevSort => ({
      field,
      direction: prevSort.field === field && prevSort.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  // Handle archiving a project
  const handleArchiveProject = async (projectId: string, e?: React.MouseEvent) => {
    // Prevent event propagation if called from dropdown
    if (e) {
      e.stopPropagation();
    }
    
    log('Archiving project:', projectId);
    setArchivingId(projectId);
    
    try {
      await archiveProjectMutation.mutateAsync(projectId);
      log('Project archived successfully');
      
      // Refresh the projects list
      const projectsData = await projlyProjectsService.getProjects();
      setProjects(projectsData);
      
      toast({
        title: 'Project archived',
        description: 'The project has been archived successfully.'
      });
    } catch (error) {
      console.error('[PROJLY:PROJECTS] Error archiving project:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to archive project',
        variant: 'destructive'
      });
    } finally {
      setArchivingId(null);
    }
  };
  
  // Navigate to project detail
  const handleProjectClick = (projectId: string) => {
    log('Navigating to project details:', projectId);
    router.push(`/projly/projects/${projectId}`);
  };
  
  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let customClass = "";
    
    log(`Rendering badge for status: ${status}`);
    
    switch (status) {
      case "Active":
      case "In Progress":
        variant = "secondary";
        customClass = "bg-blue-600 text-white hover:bg-blue-700 border-blue-600";
        break;
      case "Completed":
        variant = "default";
        customClass = "bg-green-600 text-white hover:bg-green-700 border-green-600";
        break;
      case "On Hold":
        variant = "outline";
        customClass = "bg-orange-500 text-white hover:bg-orange-600 border-orange-500";
        break;
      case "Canceled":
        variant = "destructive";
        customClass = "bg-red-500 text-white hover:bg-red-600 border-red-500";
        break;
      case "Planned":
        variant = "outline";
        customClass = "bg-purple-500 text-white hover:bg-purple-600 border-purple-500";
        break;
      case "Archived":
        variant = "outline";
        customClass = "bg-gray-500 text-white hover:bg-gray-600 border-gray-500";
        break;
      default:
        variant = "outline";
        customClass = "bg-gray-400 text-white hover:bg-gray-500 border-gray-400";
    }
    
    return <Badge variant={variant} className={customClass}>{status || 'Unknown'}</Badge>;
  };
  
  if (isLoading) {
    log('Showing projects loading spinner');
    return <PageLoading logContext="PROJLY:PROJECTS" />;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">Manage your projects and their tasks</p>
          </div>
        </div>
        <div className="flex justify-end items-center gap-2 mb-4">
          <Button onClick={() => router.push('/projly/projects/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-[200px]">
                <Input
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => toggleSort('name')}
                  >
                    Project Name
                    {sortBy.field === 'name' && (
                      <span className="ml-1">
                        {sortBy.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => toggleSort('status')}
                  >
                    Status
                    {sortBy.field === 'status' && (
                      <span className="ml-1">
                        {sortBy.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => toggleSort('createdAt')}
                  >
                    Created
                    {sortBy.field === 'createdAt' && (
                      <span className="ml-1">
                        {sortBy.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProjects.length > 0 ? sortedProjects.map((project) => (
                  <TableRow 
                    key={project.id} 
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <TableCell className="font-medium whitespace-nowrap">{project.name}</TableCell>
                    <TableCell className="max-w-[200px] whitespace-nowrap truncate">
                      {project.description || '-'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {renderStatusBadge(project.status || 'Unknown')}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {project.createdAt 
                        ? format(new Date(project.createdAt), 'MMM d, yyyy') 
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {archivingId === project.id ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/projly/projects/${project.id}`);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Project
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/projly/projects/${project.id}/edit`);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Project
                            </DropdownMenuItem>
                            
                            {/* Only show Archive Project option if user is the project owner */}
                            {isProjectOwner(project) && (
                              <DropdownMenuItem 
                                onClick={(e) => handleArchiveProject(project.id, e)}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive Project
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FolderOpen className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          {search ? 'No projects match your search' : 'No projects found'}
                        </p>
                        {!search && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push('/projly/projects/new')}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Create your first project
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
