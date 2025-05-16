'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/projly/components/layout/DashboardLayout";
import { Loader2, PlusCircle, Search, MoreHorizontal, UserPlus } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  projects?: number;
  tasks?: number;
}

export default function TeamPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'Member'
  });
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:TEAM] ${message}`, data);
    } else {
      console.log(`[PROJLY:TEAM] ${message}`);
    }
  };
  
  // Check authentication and load team members on page load
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        log('Checking authentication');
        const isAuthenticated = await projlyAuthService.isAuthenticated();
        
        if (!isAuthenticated) {
          log('User not authenticated, redirecting to login');
          router.push('/projly/login');
          return;
        }
        
        log('Fetching team members');
        // In a real app, this would come from a team service
        // For demonstration, we'll create mock data
        
        // First get the current user
        const currentUser = await projlyAuthService.getCurrentUser();
        
        // Mock team data including the current user
        const mockTeamData: TeamMember[] = [
          {
            id: currentUser?.id || '1',
            firstName: currentUser?.firstName || 'John',
            lastName: currentUser?.lastName || 'Doe',
            email: currentUser?.email || 'john.doe@example.com',
            role: 'Admin',
            status: 'Active',
            avatar: '', // Use empty string as fallback
            projects: 5,
            tasks: 12
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            role: 'Member',
            status: 'Active',
            projects: 3,
            tasks: 8
          },
          {
            id: '3',
            firstName: 'Robert',
            lastName: 'Johnson',
            email: 'robert.johnson@example.com',
            role: 'Manager',
            status: 'Active',
            projects: 4,
            tasks: 5
          },
          {
            id: '4',
            firstName: 'Emily',
            lastName: 'Williams',
            email: 'emily.williams@example.com',
            role: 'Member',
            status: 'Inactive',
            projects: 0,
            tasks: 0
          }
        ];
        
        setTeamMembers(mockTeamData);
        log('Team members loaded:', mockTeamData.length);
        
      } catch (error) {
        console.error('[PROJLY:TEAM] Error loading team members:', error);
        toast({
          title: 'Error',
          description: 'Failed to load team members. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
        log('Team page initialization completed');
      }
    };
    
    loadTeamMembers();
  }, [router, toast]);
  
  // Filter team members based on search query
  const filteredTeamMembers = teamMembers.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const email = member.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });
  
  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    log('Searching for:', e.target.value);
  };
  
  // Handle invite form input changes
  const handleInviteChange = (field: string, value: string) => {
    log(`Updating invite field: ${field} with value:`, value);
    setInviteForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle invite form submission
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      log('Validating invite submission');
      if (!inviteForm.email.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Email is required',
          variant: 'destructive'
        });
        return;
      }
      
      // Basic email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(inviteForm.email)) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid email address',
          variant: 'destructive'
        });
        return;
      }
      
      setIsInviting(true);
      log('Sending invite to:', inviteForm.email);
      
      // In a real app, this would call an API
      // For demonstration, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the new team member to the list (in a real app, this would happen after they accept)
      const newMember: TeamMember = {
        id: `temp-${Date.now()}`,
        firstName: 'New',
        lastName: 'Member',
        email: inviteForm.email,
        role: inviteForm.role,
        status: 'Pending',
        projects: 0,
        tasks: 0
      };
      
      setTeamMembers(prev => [...prev, newMember]);
      
      log('Invite sent successfully');
      toast({
        title: 'Success',
        description: `Invitation sent to ${inviteForm.email}`
      });
      
      // Reset form and close dialog
      setInviteForm({
        email: '',
        role: 'Member'
      });
      setIsInviteDialogOpen(false);
      
    } catch (error) {
      console.error('[PROJLY:TEAM] Error sending invite:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsInviting(false);
    }
  };
  
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
            <h1 className="text-3xl font-bold tracking-tight">Team</h1>
            <p className="text-muted-foreground">Manage your team members and their roles</p>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation email to add someone to your team.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInviteSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={inviteForm.email}
                      onChange={(e) => handleInviteChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={inviteForm.role}
                      onValueChange={(value) => handleInviteChange('role', value)}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isInviting}>
                    {isInviting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Invitation'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle>Team Members</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <CardDescription>
              {filteredTeamMembers.length} members in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeamMembers.map((member) => (
                  <TableRow key={member.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/projly/team/${member.id}`)}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={member.avatar} alt={`${member.firstName} ${member.lastName}`} />
                          <AvatarFallback>{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{member.firstName} {member.lastName}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{renderRoleBadge(member.role)}</TableCell>
                    <TableCell>{renderStatusBadge(member.status)}</TableCell>
                    <TableCell>{member.projects}</TableCell>
                    <TableCell>{member.tasks}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/projly/team/${member.id}`);
                          }}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/projly/team/${member.id}/edit`);
                          }}>
                            Edit Member
                          </DropdownMenuItem>
                          {member.status === 'Active' && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              log(`Deactivating member: ${member.id}`);
                              // Handle deactivation
                              toast({
                                title: 'Not Implemented',
                                description: 'This feature is not implemented yet'
                              });
                            }}>
                              Deactivate
                            </DropdownMenuItem>
                          )}
                          {member.status === 'Inactive' && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              log(`Activating member: ${member.id}`);
                              // Handle activation
                              toast({
                                title: 'Not Implemented',
                                description: 'This feature is not implemented yet'
                              });
                            }}>
                              Activate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredTeamMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p className="mb-2">No team members found</p>
                        {searchQuery ? (
                          <Button variant="outline" onClick={() => setSearchQuery('')}>
                            Clear Search
                          </Button>
                        ) : (
                          <Button onClick={() => setIsInviteDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Member
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
