import React, { useState, useEffect, useMemo } from "react";
import { useUserRoles } from "@/lib/services/projly/use-user-roles";
import { useAuth } from "@/app/projly/contexts/AuthContextCustom";
import { UserRole, UserWithSettings } from "@/lib/services/projly/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Shield, ShieldCheck, ShieldAlert, Activity, Lock, RefreshCw, Search, UserPlus, Filter, MoreHorizontal, PencilIcon, ShieldIcon, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import apiClient from "@/lib/api-client";

// Define the form schema for adding a new user
const addUserFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.string({ required_error: "Please select a role" }),
  activationStatus: z.enum(["active", "unverified", "inactive"], { 
    required_error: "Please select an activation status" 
  })
});

type AddUserFormValues = z.infer<typeof addUserFormSchema>;

export default function UserSettings() {
  console.log("Rendering UserSettings component");
  const { users, updateRole, currentUserRole, updateActivationStatus, resetPassword } = useUserRoles();
  const { user } = useAuth();
  
  // Define all state hooks at the top level
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Properly handle the currentUserRole and ensure proper typing
  const isSiteOwner = currentUserRole.data === 'site_owner';
  
  if (isSiteOwner && currentUserRole) {
    console.log("Current user is site owner");
  }

  // Form handling for adding a new user
  const addUserForm = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: "regular_user" as UserRole,
      activationStatus: "active"
    }
  });
  
  const openAddUserDialog = () => {
    addUserForm.reset();
    setAddUserDialogOpen(true);
  };
  
  // Ensure we have an array of users to work with
  const usersList = useMemo(() => {
    return Array.isArray(users.data) ? users.data : [];
  }, [users.data]);
  
  // Filter users based on search query and filters
  const filteredUsers = useMemo(() => {
    return usersList.filter(user => {
      // Search by name or email
      const searchMatch = !searchQuery || 
        (user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         false);
      
      // Get user role from the direct role field added by the backend
      const userRole = user.role || 'regular_user';
      console.log(`[PROJLY:USER_SETTINGS] User ${user.firstName} ${user.lastName} has role: ${userRole}`);
      
      // Filter by role
      const roleMatch = roleFilter === 'all' || userRole === roleFilter;
      
      // Determine activation status based on profile existence
      const activationStatus = user.profile ? 'active' : 'unverified';
      
      // Filter by status
      const statusMatch = statusFilter === 'all' || activationStatus === statusFilter;
      
      return searchMatch && roleMatch && statusMatch;
    });
  }, [usersList, searchQuery, roleFilter, statusFilter]);
  
  // Debug logging
  useEffect(() => {
    console.log("Current user role:", currentUserRole.data);
    console.log("Users data:", users.data);
    
    if (users.data && Array.isArray(users.data) && users.data.length > 0) {
      console.log("UserSettings: Detailed user data structure:", JSON.stringify(users.data[0], null, 2));
    }
    
    if (usersList.length > 0) {
      console.log(`UserSettings: Filtered ${filteredUsers.length} users from ${usersList.length} total`);
    }
  }, [currentUserRole.data, users.data, filteredUsers.length, usersList.length]);
  
  const handleRoleChange = async (userId: string, role: UserRole) => {
    if (!isSiteOwner) {
      toast({
        title: "Permission denied",
        description: "Only Site Owners can update user roles.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdating(userId);
    try {
      await updateRole.mutateAsync({ userId, role });
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error updating role",
        description: "There was a problem updating the user role.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleActivationStatusChange = async (userId: string, status: 'active' | 'unverified' | 'inactive') => {
    if (!isSiteOwner) {
      toast({
        title: "Permission denied",
        description: "Only Site Owners can update activation status.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdating(userId);
    try {
      await updateActivationStatus.mutateAsync({ userId, status });
      toast({
        title: "Status updated",
        description: "User activation status has been updated successfully.",
        variant: "default"
      });
      // Force refresh the data after a short delay to ensure we get the updated data
      setTimeout(() => {
        users.refetch();
      }, 1000);
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "There was a problem updating the activation status.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  };
  
  const handlePasswordReset = async (userId: string) => {
    if (!isSiteOwner) {
      toast({
        title: "Permission denied",
        description: "Only Site Owners can reset passwords.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdating(userId);
    try {
      await resetPassword.mutateAsync({ userId, password: newPassword });
      setNewPassword("");
      setPasswordDialogOpen(false);
      toast({
        title: "Password reset",
        description: "User password has been reset successfully.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error resetting password",
        description: "There was a problem resetting the password.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  };
  
  // Handle adding a new user
  const handleAddUser = async (data: AddUserFormValues) => {
    console.log("Adding new user:", data);
    if (!isSiteOwner) {
      toast({
        title: "Permission denied",
        description: "Only Site Owners can add new users.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAddingUser(true);
    try {
      // Call the API to create a new user
      const response = await apiClient.post('users', data);
      
      if (response.error) {
        // Handle both Error objects and string errors
        const errorMessage = typeof response.error === 'object' && response.error !== null && 'message' in response.error
          ? (response.error as { message: string }).message
          : typeof response.error === 'string'
            ? response.error
            : 'Failed to create user';
        console.log('[PROJLY:USER_SETTINGS] Error type:', typeof response.error);
        console.log('[PROJLY:USER_SETTINGS] Error creating user:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Close the dialog and show success message
      setAddUserDialogOpen(false);
      toast({
        title: "User created",
        description: `${data.firstName} ${data.lastName} has been added successfully.`,
        variant: "default"
      });
      
      // Refresh the user list
      users.refetch();
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error.message || "There was a problem creating the user.",
        variant: "destructive"
      });
    } finally {
      setIsAddingUser(false);
    }
  };
  
  const openPasswordDialog = (userId: string) => {
    setSelectedUserId(userId);
    setNewPassword("");
    setPasswordDialogOpen(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    users.refetch().finally(() => {
      setIsRefreshing(false);
      toast({
        title: "Data refreshed",
        description: "User data has been refreshed.",
        variant: "default"
      });
    });
  };
  
  const getRoleBadge = (role: UserRole | string) => {
    switch (role) {
      case 'site_owner':
        return <Badge className="bg-purple-600"><ShieldCheck className="mr-1 h-3 w-3" /> Site Owner</Badge>;
      case 'admin':
        return <Badge className="bg-blue-600"><ShieldAlert className="mr-1 h-3 w-3" /> Admin</Badge>;
      default:
        return <Badge className="bg-gray-500"><Shield className="mr-1 h-3 w-3" /> Regular User</Badge>;
    }
  };

  const getActivationBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600"><Activity className="mr-1 h-3 w-3" /> Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-600"><Activity className="mr-1 h-3 w-3" /> Inactive</Badge>;
      default:
        return <Badge className="bg-amber-500"><Activity className="mr-1 h-3 w-3" /> Unverified</Badge>;
    }
  };
  
  // In case the user data is empty, try to refetch once
  useEffect(() => {
    if (users.data?.length === 0 && !users.isLoading && !users.isFetching) {
      console.log("No users found, refetching...");
      users.refetch();
    }
  }, [users.data, users.isLoading, users.isFetching]);
  
  if (users.isLoading || currentUserRole.isLoading) {
    return <div className="flex justify-center p-8"><Spinner size="lg" /></div>;
  }
  
  // Helper functions for UI display will be defined once
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Settings</CardTitle>
          <CardDescription>Manage users, their roles, and access permissions</CardDescription>
        </div>
        <div className="flex gap-2">
          {isSiteOwner && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={openAddUserDialog}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? <Spinner size="sm" className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-4">
            <p className="text-sm text-gray-500">
              Manage user roles and activation status in the system. 
              {filteredUsers.length !== usersList.length && (
                <span className="ml-2 text-blue-500">
                  Showing {filteredUsers.length} of {usersList.length} users
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  className="pl-8 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select 
                value={roleFilter} 
                onValueChange={setRoleFilter}
              >
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="site_owner">Site Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="regular_user">Regular User</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[130px]">
                  <Activity className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-md bg-purple-50 border border-purple-100">
              <div className="flex items-center mb-2">
                <ShieldCheck className="mr-2 h-5 w-5 text-purple-600" />
                <h3 className="font-medium">Site Owner</h3>
              </div>
              <p className="text-sm text-gray-600">
                Highest permission level. Can fully manage users, and roles.
              </p>
            </div>
            <div className="p-4 rounded-md bg-blue-50 border border-blue-100">
              <div className="flex items-center mb-2">
                <ShieldAlert className="mr-2 h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Admin</h3>
              </div>
              <p className="text-sm text-gray-600">
                Can see/edit users such as password reset, change user status.
              </p>
            </div>
            <div className="p-4 rounded-md bg-gray-50 border border-gray-100">
              <div className="flex items-center mb-2">
                <Shield className="mr-2 h-5 w-5 text-gray-600" />
                <h3 className="font-medium">Regular User</h3>
              </div>
              <p className="text-sm text-gray-600">
                Can access specific pages, projects, tasks, and resources if assigned.
              </p>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((userRole: any) => {
                    console.log("[PROJLY:USER_SETTINGS] User data structure:", userRole);
                    // Handle the new API response structure
                    const firstName = userRole.firstName || '';
                    const lastName = userRole.lastName || '';
                    const userName = (firstName || lastName) 
                      ? `${firstName} ${lastName}`.trim() 
                      : "Unknown User";
                    const userEmail = userRole.email || '';
                    const isCurrentUser = user?.id === userRole.id;
                    const isFixedUser = userEmail.includes('freetoolonline.com') || userEmail === user?.email;
                    
                    // Log detailed user info for debugging
                    console.log(`[PROJLY:USER_SETTINGS] Processing user: ${userName}, email: ${userEmail}, id: ${userRole.id}`);
                    
                    return (
                      <TableRow key={userRole.id}>
                        <TableCell>
                          {userName}
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2">You</Badge>
                          )}
                        </TableCell>
                        <TableCell>{userEmail}</TableCell>
                        <TableCell>
                          {getRoleBadge(userRole.role || 'regular_user')}
                        </TableCell>
                        <TableCell>
                          {getActivationBadge(userRole.profile ? 'active' : 'unverified')}
                        </TableCell>
                        <TableCell className="text-right">
                          {isUpdating === userRole.id ? (
                            <Spinner size="sm" />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {
                                  /* Regular User can be promoted to Admin */
                                  userRole.role === 'regular_user' && (
                                      <DropdownMenuItem 
                                        onClick={() => handleRoleChange(userRole.id, 'admin')} 
                                        disabled={isFixedUser}
                                      >
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Promote to Admin
                                      </DropdownMenuItem>
                                  )
                                }
                                
                                {
                                  /* Admin can be promoted to Site Owner or demoted to Regular User */
                                  userRole.role === 'admin' && (
                                      <>
                                        <DropdownMenuItem 
                                          onClick={() => handleRoleChange(userRole.id, 'site_owner')} 
                                          disabled={isFixedUser}
                                        >
                                          <ShieldIcon className="mr-2 h-4 w-4" />
                                          Promote to Site Owner
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuItem 
                                          onClick={() => handleRoleChange(userRole.id, 'regular_user')} 
                                          disabled={isFixedUser}
                                        >
                                          <Shield className="mr-2 h-4 w-4" />
                                          Demote to Regular User
                                        </DropdownMenuItem>
                                      </>
                                  )
                                }
                                
                                {
                                  /* Site Owner can be demoted to Admin */
                                  userRole.role === 'site_owner' && (
                                    <DropdownMenuItem 
                                      onClick={() => handleRoleChange(userRole.id, 'admin')} 
                                      disabled={isFixedUser}
                                    >
                                      <ShieldCheck className="mr-2 h-4 w-4" />
                                      Demote to Admin
                                    </DropdownMenuItem>
                                  )
                                }
                                
                                <DropdownMenuItem 
                                  onClick={() => handleActivationStatusChange(
                                    userRole.id, 
                                    userRole.activationStatus === 'active' ? 'inactive' : 'active'
                                  )}
                                  disabled={isFixedUser}
                                >
                                  <Activity className="mr-2 h-4 w-4" />
                                  {userRole.activationStatus === 'active' ? 'Deactivate User' : 'Activate User'}
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={() => openPasswordDialog(userRole.id)} disabled={isFixedUser}>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      {users.isFetching ? (
                        <div className="flex justify-center items-center">
                          <Spinner size="md" className="mr-2" /> Loading users...
                        </div>
                      ) : searchQuery || roleFilter !== 'all' || statusFilter !== 'all' ? (
                        <div className="space-y-2">
                          <p>No users match your search criteria.</p>
                          <p className="text-sm">Try adjusting your filters or search query.</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSearchQuery('');
                              setRoleFilter('all');
                              setStatusFilter('all');
                            }}
                          >
                            Clear Filters
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p>No users found in the system.</p>
                          <p className="text-sm">Try refreshing the data or check the API connection.</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      
      {/* Password Reset Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>
              Enter a new password for this user. They will need to use this password for their next login.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={() => selectedUserId && handlePasswordReset(selectedUserId)}
              disabled={resetPassword.isPending || !newPassword || newPassword.length < 6}
            >
              {resetPassword.isPending ? (
                <><Spinner size="sm" className="mr-2" /> Processing...</>
              ) : (
                'Reset Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. The user will be able to log in with these credentials.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addUserForm}>
            <form onSubmit={addUserForm.handleSubmit(handleAddUser)} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addUserForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addUserForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 6 characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addUserForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="site_owner">Site Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="regular_user">Regular User</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addUserForm.control}
                  name="activationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="unverified">Unverified</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isAddingUser}>
                  {isAddingUser ? (
                    <><Spinner size="sm" className="mr-2" /> Creating...</>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
