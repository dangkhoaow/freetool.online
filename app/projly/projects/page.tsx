'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/projly/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, PlusCircle, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { projlyAuthService, projlyProjectsService } from '@/lib/services/projly';

export default function Projects() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({ 
    field: 'createdAt', 
    direction: 'desc' 
  });
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:PROJECTS] ${message}`, data);
    } else {
      console.log(`[PROJLY:PROJECTS] ${message}`);
    }
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
  
  // Navigate to project detail
  const handleProjectClick = (projectId: string) => {
    log('Navigating to project details:', projectId);
    router.push(`/projly/projects/${projectId}`);
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">Manage your projects and their tasks</p>
          </div>
          <Button onClick={() => router.push('/projly/projects/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Projects</CardTitle>
            <div className="w-[200px]">
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
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
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {project.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {project.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {project.createdAt 
                        ? format(new Date(project.createdAt), 'MMM d, yyyy') 
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/projly/projects/${project.id}`);
                          }}
                        >
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/projly/projects/${project.id}/edit`);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
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
