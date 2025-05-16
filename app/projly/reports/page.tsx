'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { Loader2, BarChart2, FileText, Download, Printer, FileDown, Calendar, Filter } from "lucide-react";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/app/projly/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { projlyAuthService, projlyProjectsService, projlyTasksService } from '@/lib/services/projly';
import { useToast } from "@/components/ui/use-toast";

// Report types
interface ReportFilter {
  startDate: Date | null;
  endDate: Date | null;
  projectId: string;
  status: string;
  includeCompleted: boolean;
}

export default function ReportsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  const [reportGenerated, setReportGenerated] = useState(false);
  
  // Report data states
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projectReport, setProjectReport] = useState<any[]>([]);
  const [taskReport, setTaskReport] = useState<any[]>([]);
  
  // Filter states
  const [filter, setFilter] = useState<ReportFilter>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    endDate: new Date(),
    projectId: "",
    status: "",
    includeCompleted: true
  });
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:REPORTS] ${message}`, data);
    } else {
      console.log(`[PROJLY:REPORTS] ${message}`);
    }
  };
  
  // Check authentication and load data on page load
  useEffect(() => {
    const loadData = async () => {
      try {
        log('Checking authentication');
        const isAuthenticated = await projlyAuthService.isAuthenticated();
        
        if (!isAuthenticated) {
          log('User not authenticated, redirecting to login');
          router.push('/projly/login');
          return;
        }
        
        log('Loading projects and tasks data');
        
        // Load projects
        const projectsData = await projlyProjectsService.getProjects();
        log('Projects loaded:', projectsData.length);
        setProjects(projectsData);
        
        // Load tasks
        const tasksData = await projlyTasksService.getMyTasks();
        log('Tasks loaded:', tasksData.length);
        setTasks(tasksData);
        
      } catch (error) {
        console.error('[PROJLY:REPORTS] Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load report data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
        log('Reports page initialization completed');
      }
    };
    
    loadData();
  }, [router, toast]);
  
  // Handle filter changes
  const handleFilterChange = (key: keyof ReportFilter, value: any) => {
    log(`Updating filter ${key}:`, value);
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Reset report generation state
    setReportGenerated(false);
  };
  
  // Format date for display
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  // Generate project report
  const generateProjectReport = () => {
    log('Generating project report with filters:', filter);
    setIsGenerating(true);
    
    try {
      // Apply filters to projects
      const filteredProjects = projects.filter(project => {
        // Filter by date (using dueDate or createdAt)
        if (filter.startDate && project.createdAt) {
          const projectDate = new Date(project.createdAt);
          if (projectDate < filter.startDate) return false;
        }
        
        if (filter.endDate && project.createdAt) {
          const projectDate = new Date(project.createdAt);
          if (projectDate > filter.endDate) return false;
        }
        
        // Filter by status
        if (filter.status && project.status !== filter.status) {
          return false;
        }
        
        // Filter by completion
        if (!filter.includeCompleted && project.status === 'Completed') {
          return false;
        }
        
        return true;
      });
      
      log('Filtered projects for report:', filteredProjects.length);
      
      // Enhance projects with task metrics
      const projectsWithMetrics = filteredProjects.map(project => {
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        const completedTasks = projectTasks.filter(task => task.status === 'Completed').length;
        const progress = projectTasks.length > 0 
          ? Math.round((completedTasks / projectTasks.length) * 100) 
          : 0;
          
        return {
          ...project,
          tasksTotal: projectTasks.length,
          tasksCompleted: completedTasks,
          progress
        };
      });
      
      log('Projects report generated with metrics');
      setProjectReport(projectsWithMetrics);
      setReportGenerated(true);
      
    } catch (error) {
      console.error('[PROJLY:REPORTS] Error generating project report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate project report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Generate task report
  const generateTaskReport = () => {
    log('Generating task report with filters:', filter);
    setIsGenerating(true);
    
    try {
      // Apply filters to tasks
      const filteredTasks = tasks.filter(task => {
        // Filter by project
        if (filter.projectId && task.projectId !== filter.projectId) {
          return false;
        }
        
        // Filter by date (using dueDate or startDate)
        if (filter.startDate && task.startDate) {
          const taskDate = new Date(task.startDate);
          if (taskDate < filter.startDate) return false;
        }
        
        if (filter.endDate && task.dueDate) {
          const taskDate = new Date(task.dueDate);
          if (taskDate > filter.endDate) return false;
        }
        
        // Filter by status
        if (filter.status && task.status !== filter.status) {
          return false;
        }
        
        // Filter by completion
        if (!filter.includeCompleted && task.status === 'Completed') {
          return false;
        }
        
        return true;
      });
      
      log('Filtered tasks for report:', filteredTasks.length);
      
      // Enhance tasks with project data
      const tasksWithProjectData = filteredTasks.map(task => {
        const project = projects.find(p => p.id === task.projectId);
        return {
          ...task,
          projectName: project ? project.name : 'Unknown Project'
        };
      });
      
      log('Tasks report generated with project data');
      setTaskReport(tasksWithProjectData);
      setReportGenerated(true);
      
    } catch (error) {
      console.error('[PROJLY:REPORTS] Error generating task report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate task report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Generate report based on active tab
  const generateReport = () => {
    if (activeTab === 'projects') {
      generateProjectReport();
    } else {
      generateTaskReport();
    }
  };
  
  // Export report as CSV
  const exportCSV = () => {
    log('Exporting report as CSV');
    
    try {
      const reportData = activeTab === 'projects' ? projectReport : taskReport;
      let csvContent = '';
      
      if (activeTab === 'projects') {
        // Headers for project report
        csvContent = 'Project Name,Status,Progress,Total Tasks,Completed Tasks,Due Date\n';
        
        // Data rows
        reportData.forEach((project: any) => {
          csvContent += `"${project.name}",`;
          csvContent += `"${project.status}",`;
          csvContent += `${project.progress}%,`;
          csvContent += `${project.tasksTotal},`;
          csvContent += `${project.tasksCompleted},`;
          csvContent += `"${project.dueDate ? formatDate(project.dueDate) : '-'}"\n`;
        });
      } else {
        // Headers for task report
        csvContent = 'Task Title,Project,Status,Due Date\n';
        
        // Data rows
        reportData.forEach((task: any) => {
          csvContent += `"${task.title}",`;
          csvContent += `"${task.projectName}",`;
          csvContent += `"${task.status}",`;
          csvContent += `"${task.dueDate ? formatDate(task.dueDate) : '-'}"\n`;
        });
      }
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${activeTab}-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      log('CSV export completed');
      toast({
        title: 'Export Successful',
        description: 'Report exported as CSV'
      });
      
    } catch (error) {
      console.error('[PROJLY:REPORTS] Error exporting CSV:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export report as CSV',
        variant: 'destructive'
      });
    }
  };
  
  // Print report
  const printReport = () => {
    log('Printing report');
    window.print();
  };
  
  // Show loading state
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">Generate and export project and task reports</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:block">
          {/* Filters Panel */}
          <div className="md:col-span-1 print:hidden">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Report Filters
                </CardTitle>
                <CardDescription>
                  Filter report data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <DatePicker
                        date={filter.startDate}
                        setDate={(date) => handleFilterChange('startDate', date)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">End Date</Label>
                      <DatePicker
                        date={filter.endDate}
                        setDate={(date) => handleFilterChange('endDate', date)}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select
                    value={filter.projectId}
                    onValueChange={(value) => handleFilterChange('projectId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Projects</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filter.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCompleted"
                    checked={filter.includeCompleted}
                    onCheckedChange={(checked) => 
                      handleFilterChange('includeCompleted', checked === true)
                    }
                  />
                  <Label htmlFor="includeCompleted">
                    Include completed items
                  </Label>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={generateReport}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BarChart2 className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Report Content */}
          <div className="md:col-span-3">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 print:hidden">
                <TabsTrigger value="projects">Projects Report</TabsTrigger>
                <TabsTrigger value="tasks">Tasks Report</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center justify-between mb-4 print:hidden">
                <h2 className="text-xl font-semibold">
                  {activeTab === 'projects' ? 'Projects Report' : 'Tasks Report'}
                </h2>
                {reportGenerated && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportCSV}
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={printReport}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  </div>
                )}
              </div>
              
              <TabsContent value="projects" className="mt-0">
                {reportGenerated ? (
                  projectReport.length > 0 ? (
                    <Card>
                      <CardHeader className="print:pb-2">
                        <div className="print:flex print:justify-between print:items-center">
                          <div>
                            <CardTitle className="print:text-2xl">Projects Report</CardTitle>
                            <CardDescription className="print:mb-0">
                              Generated on {format(new Date(), 'MMMM d, yyyy')}
                            </CardDescription>
                          </div>
                          <div className="hidden print:block">
                            <p className="text-sm text-muted-foreground">
                              Date Range: {formatDate(filter.startDate)} - {formatDate(filter.endDate)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Project Name</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Progress</TableHead>
                              <TableHead>Tasks</TableHead>
                              <TableHead>Due Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {projectReport.map((project) => (
                              <TableRow key={project.id}>
                                <TableCell className="font-medium">{project.name}</TableCell>
                                <TableCell>
                                  <Badge 
                                    className={
                                      project.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                      project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''
                                    }
                                    variant={project.status === 'In Progress' ? 'default' : 'outline'}
                                  >
                                    {project.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={project.progress} className="h-2 w-[60px]" />
                                    <span>{project.progress}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>{project.tasksCompleted}/{project.tasksTotal}</TableCell>
                                <TableCell>{formatDate(project.dueDate)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-10">
                        <div className="text-center">
                          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Results Found</h3>
                          <p className="text-muted-foreground">
                            Try adjusting your filters to see more results
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <Card>
                    <CardContent className="py-10">
                      <div className="text-center">
                        <BarChart2 className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Generate a Report</h3>
                        <p className="text-muted-foreground mb-4">
                          Set your filters and click 'Generate Report' to see results
                        </p>
                        <Button onClick={generateReport}>
                          Generate Projects Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-0">
                {reportGenerated ? (
                  taskReport.length > 0 ? (
                    <Card>
                      <CardHeader className="print:pb-2">
                        <div className="print:flex print:justify-between print:items-center">
                          <div>
                            <CardTitle className="print:text-2xl">Tasks Report</CardTitle>
                            <CardDescription className="print:mb-0">
                              Generated on {format(new Date(), 'MMMM d, yyyy')}
                            </CardDescription>
                          </div>
                          <div className="hidden print:block">
                            <p className="text-sm text-muted-foreground">
                              Date Range: {formatDate(filter.startDate)} - {formatDate(filter.endDate)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Task Title</TableHead>
                              <TableHead>Project</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Due Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {taskReport.map((task) => (
                              <TableRow key={task.id}>
                                <TableCell className="font-medium">{task.title}</TableCell>
                                <TableCell>{task.projectName}</TableCell>
                                <TableCell>
                                  <Badge 
                                    className={
                                      task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''
                                    }
                                    variant={task.status === 'In Progress' ? 'default' : 'outline'}
                                  >
                                    {task.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatDate(task.dueDate)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-10">
                        <div className="text-center">
                          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Results Found</h3>
                          <p className="text-muted-foreground">
                            Try adjusting your filters to see more results
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <Card>
                    <CardContent className="py-10">
                      <div className="text-center">
                        <BarChart2 className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Generate a Report</h3>
                        <p className="text-muted-foreground mb-4">
                          Set your filters and click 'Generate Report' to see results
                        </p>
                        <Button onClick={generateReport}>
                          Generate Tasks Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
