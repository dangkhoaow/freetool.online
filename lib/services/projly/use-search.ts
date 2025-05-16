
import { useState, useEffect } from 'react';
// Using relative imports for local services instead of external @/hooks path
import { useProjects } from './use-projects';
import { useTasks } from './use-tasks';

// Add detailed logging for easier debugging
console.log('[SEARCH] Loading search hook');

// Define interfaces for projects and tasks to avoid 'any' types
interface Project {
  id: string;
  name: string;
  description?: string | null;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
}

interface SearchResult {
  type: 'project' | 'task';
  id: string;
  title: string;
  description?: string | null;
  path: string;
}

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTasks();
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    const query = searchQuery.toLowerCase();
    
    // Search in projects
    const projectResults: SearchResult[] = projects
      .filter(
        (project: Project) => 
          project.name.toLowerCase().includes(query) || 
          (project.description && project.description.toLowerCase().includes(query))
      )
      .map((project: Project) => ({
        type: 'project',
        id: project.id,
        title: project.name,
        description: project.description,
        path: `/projects/${project.id}`
      }));
      
    // Search in tasks
    const taskResults: SearchResult[] = tasks
      .filter(
        (task: Task) => 
          task.title.toLowerCase().includes(query) || 
          (task.description && task.description.toLowerCase().includes(query))
      )
      .map((task: Task) => ({
        type: 'task',
        id: task.id,
        title: task.title,
        description: task.description,
        path: `/tasks/${task.id}`
      }));
      
    // Combine results
    setResults([...projectResults, ...taskResults]);
    setIsSearching(false);
    
  }, [searchQuery, projects, tasks]);
  
  return {
    searchQuery,
    setSearchQuery,
    results,
    isSearching
  };
}
