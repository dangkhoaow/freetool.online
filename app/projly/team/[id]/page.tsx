'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { Loader2, ArrowLeft, Edit, Mail, Calendar, Briefcase, Clock, Phone, MapPin } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { projlyAuthService } from '@/lib/services/projly';
import { useToast } from "@/components/ui/use-toast";

// Interface for team member type
interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  joinedDate?: string;
  lastActive?: string;
  projects?: any[];
  tasks?: any[];
  bio?: string;
  department?: string;
  location?: string;
  phoneNumber?: string;
}

interface TeamMemberDetailsPageProps {
  params: {
    id: string;
  }
}

export default function TeamMemberDetailsPage({ params }: TeamMemberDetailsPageProps) {
  const memberId = params.id;
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [member, setMember] = useState<TeamMember | null>(null);
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:TEAM_MEMBER:${memberId}] ${message}`, data);
    } else {
      console.log(`[PROJLY:TEAM_MEMBER:${memberId}] ${message}`);
    }
  };
  
  // Check authentication and load team member data
  useEffect(() => {
    const loadMemberData = async () => {
      try {
        log('Checking authentication');
        const isAuthenticated = await projlyAuthService.isAuthenticated();
        
        if (!isAuthenticated) {
          log('User not authenticated, redirecting to login');
          router.push('/projly/login');
          return;
        }
        
        log('Fetching team member data for ID:', memberId);
        // In a real app, this would come from a team service
        // For demonstration, we'll create mock data
        
        // For testing purpose, we'll pretend the current user is one of the team members
        const currentUser = await projlyAuthService.getCurrentUser();
        
        if (memberId === currentUser?.id || memberId === '1') {
          // Current user's profile
          const userData: TeamMember = {
            id: currentUser?.id || '1',
            firstName: currentUser?.firstName || 'John',
            lastName: currentUser?.lastName || 'Doe',
            email: currentUser?.email || 'john.doe@example.com',
            role: 'Admin',
            status: 'Active',
            avatar: '',  // Use empty string as fallback
            joinedDate: '2022-01-15',
            lastActive: new Date().toISOString(),
            bio: 'Product manager with 5+ years of experience in SaaS products.',
            department: 'Product',
            location: 'San Francisco, CA',
            phoneNumber: '+1 (555) 123-4567',
            projects: [
              { id: '1', name: 'Website Redesign', role: 'Owner' },
              { id: '2', name: 'Mobile App Launch', role: 'Owner' },
              { id: '3', name: 'Marketing Campaign', role: 'Member' },
            ],
            tasks: [
              { id: '101', title: 'Design Review', status: 'In Progress', dueDate: '2025-05-20' },
              { id: '102', title: 'Feature Specification', status: 'Completed', dueDate: '2025-05-10' },
              { id: '103', title: 'Stakeholder Meeting', status: 'Not Started', dueDate: '2025-05-25' },
            ]
          };
          setMember(userData);
        } else if (memberId === '2') {
          // Jane Smith's profile
          const userData: TeamMember = {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            role: 'Member',
            status: 'Active',
            joinedDate: '2022-03-10',
            lastActive: '2025-05-14T08:30:00',
            bio: 'Software engineer specialized in frontend development.',
            department: 'Engineering',
            location: 'New York, NY',
            phoneNumber: '+1 (555) 987-6543',
            projects: [
              { id: '1', name: 'Website Redesign', role: 'Member' },
              { id: '3', name: 'Marketing Campaign', role: 'Member' },
            ],
            tasks: [
              { id: '104', title: 'Homepage Implementation', status: 'In Progress', dueDate: '2025-05-22' },
              { id: '105', title: 'Bug Fixes', status: 'Not Started', dueDate: '2025-05-30' },
            ]
          };
          setMember(userData);
        } else if (memberId === '3') {
          // Robert Johnson's profile
          const userData: TeamMember = {
            id: '3',
            firstName: 'Robert',
            lastName: 'Johnson',
            email: 'robert.johnson@example.com',
            role: 'Manager',
            status: 'Active',
            joinedDate: '2022-02-20',
            lastActive: '2025-05-14T15:45:00',
            bio: 'Technical project manager with background in backend systems.',
            department: 'Engineering',
            location: 'Austin, TX',
            phoneNumber: '+1 (555) 456-7890',
            projects: [
              { id: '2', name: 'Mobile App Launch', role: 'Manager' },
              { id: '4', name: 'API Integration', role: 'Manager' },
            ],
            tasks: [
              { id: '106', title: 'Sprint Planning', status: 'Completed', dueDate: '2025-05-12' },
              { id: '107', title: 'Architecture Review', status: 'In Progress', dueDate: '2025-05-18' },
            ]
          };
          setMember(userData);
        } else if (memberId === '4') {
          // Emily Williams's profile
          const userData: TeamMember = {
            id: '4',
            firstName: 'Emily',
            lastName: 'Williams',
            email: 'emily.williams@example.com',
            role: 'Member',
            status: 'Inactive',
            joinedDate: '2022-04-05',
            lastActive: '2025-04-30T10:15:00',
            bio: 'UI/UX designer with focus on user research and testing.',
            department: 'Design',
            location: 'Chicago, IL',
            phoneNumber: '+1 (555) 789-0123',
            projects: [],
            tasks: []
          };
          setMember(userData);
        } else {
          // Member not found
          log('Team member not found');
          toast({
            title: 'Not Found',
            description: 'The team member you are looking for does not exist',
            variant: 'destructive'
          });
          router.push('/projly/team');
          return;
        }
        
        log('Team member data loaded successfully');
        
      } catch (error) {
        console.error(`[PROJLY:TEAM_MEMBER:${memberId}] Error loading team member:`, error);
        toast({
          title: 'Error',
          description: 'Failed to load team member data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
        log('Page initialization completed');
      }
    };
    
    loadMemberData();
  }, [memberId, router, toast]);
  
  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case 'Inactive':
        return <Badge variant="secondary">{status}</Badge>;
      case 'Pending':
        return <Badge variant="outline">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Render role badge with appropriate color
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Badge variant="default">{role}</Badge>;
      case 'Manager':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">{role}</Badge>;
      case 'Member':
        return <Badge variant="outline">{role}</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
  
  // Show not found state if member doesn't exist
  if (!member) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <div className="flex flex-col items-center justify-center py-12">
            <h1 className="text-2xl font-bold mb-4">Team Member Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The team member you are looking for could not be found.
            </p>
            <Button onClick={() => router.push('/projly/team')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Team
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/projly/team')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{member.firstName} {member.lastName}</h1>
            <div className="flex items-center mt-1">
              {renderRoleBadge(member.role)}
              <span className="mx-2 text-muted-foreground">•</span>
              {renderStatusBadge(member.status)}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/projly/team/${member.id}/edit`)}
            className="mr-2"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar with basic info */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={member.avatar} alt={`${member.firstName} ${member.lastName}`} />
                    <AvatarFallback className="text-lg">{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold mb-1">{member.firstName} {member.lastName}</h2>
                  <p className="text-muted-foreground mb-4">{member.department || 'No Department'}</p>
                  
                  <div className="w-full space-y-3 mt-4">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{member.email}</span>
                    </div>
                    {member.phoneNumber && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{member.phoneNumber}</span>
                      </div>
                    )}
                    {member.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{member.location}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Joined {formatDate(member.joinedDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Last active {formatDate(member.lastActive)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content area */}
          <div className="md:col-span-3">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Overview</CardTitle>
                    <CardDescription>
                      Basic information about {member.firstName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {member.bio && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Bio</h3>
                        <p className="text-muted-foreground">{member.bio}</p>
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Workload Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm text-muted-foreground">Active Projects</div>
                          <div className="text-2xl font-bold mt-1">{member.projects?.length || 0}</div>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm text-muted-foreground">Assigned Tasks</div>
                          <div className="text-2xl font-bold mt-1">{member.tasks?.length || 0}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
                      <div className="space-y-4">
                        {/* This would be populated from an activity log API */}
                        <div className="flex items-start gap-2 border-b pb-4">
                          <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Updated project status</p>
                            <p className="text-sm text-muted-foreground">Today at 10:30 AM</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Completed a task</p>
                            <p className="text-sm text-muted-foreground">Yesterday at 2:15 PM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>
                      Projects that {member.firstName} is involved in
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {member.projects && member.projects.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Project Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {member.projects.map((project) => (
                            <TableRow key={project.id}>
                              <TableCell className="font-medium">{project.name}</TableCell>
                              <TableCell>{project.role}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => router.push(`/projly/projects/${project.id}`)}>
                                  View Project
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          {member.firstName} is not assigned to any projects.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tasks">
                <Card>
                  <CardHeader>
                    <CardTitle>Tasks</CardTitle>
                    <CardDescription>
                      Tasks assigned to {member.firstName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {member.tasks && member.tasks.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {member.tasks.map((task) => (
                            <TableRow key={task.id}>
                              <TableCell className="font-medium">{task.title}</TableCell>
                              <TableCell>
                                <Badge 
                                  className={task.status === 'Completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                                  variant={task.status === 'In Progress' ? 'default' : 'outline'}
                                >
                                  {task.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(task.dueDate)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => router.push(`/projly/tasks/${task.id}`)}>
                                  View Task
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          {member.firstName} doesn't have any assigned tasks.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>
                      Recent actions performed by {member.firstName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* This would be populated from an activity log API */}
                      <div className="flex items-start gap-2 border-b pb-4">
                        <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Updated status of "Mobile App Launch" project</p>
                          <p className="text-sm text-muted-foreground">Today at 10:30 AM</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 border-b pb-4">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Completed task "Feature Specification"</p>
                          <p className="text-sm text-muted-foreground">Yesterday at 2:15 PM</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 border-b pb-4">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Created new task "Design Review"</p>
                          <p className="text-sm text-muted-foreground">May 14, 2025 at 9:45 AM</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
