import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ShieldCheck, Shield, Activity, Lock, Trash } from "lucide-react";
import { UserRole } from "@/lib/services/projly/types";
import { getRoleBadge, getActivationBadge } from "./UserRoleUtils";

interface UserListTableProps {
  displayedUsers: any[];
  usersList: any[];
  isFetching: boolean;
  isUpdating: string | null;
  currentUser: any;
  isSiteOwner: boolean;
  isAdmin: boolean;
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  handleRoleChange: (userId: string, role: UserRole) => void;
  handleActivationStatusChange: (userId: string, status: 'Active' | 'Inactive' | 'Deleted') => void;
  openDeleteDialog: (userId: string, userName: string) => void;
  openPasswordDialog: (userId: string) => void;
  clearFilters: () => void;
}

/**
 * Component for displaying the user list table
 */
const UserListTable: React.FC<UserListTableProps> = ({
  displayedUsers,
  usersList,
  isFetching,
  isUpdating,
  currentUser,
  isSiteOwner,
  isAdmin,
  searchQuery,
  roleFilter,
  statusFilter,
  handleRoleChange,
  handleActivationStatusChange,
  openDeleteDialog,
  openPasswordDialog,
  clearFilters
}) => {
  console.log("[PROJLY:USER_SETTINGS:LIST_TABLE] Rendering user list table with:", {
    displayedUsersCount: displayedUsers.length,
    totalUsersCount: usersList.length,
    isFetching,
    isUpdating,
    searchQuery,
    roleFilter,
    statusFilter
  });

  return (
    <div style={{ marginTop: 0 }} className="rounded-md border">
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
          {displayedUsers.length > 0 ? (
            displayedUsers.map((userRole: any) => {
              console.log("[PROJLY:USER_SETTINGS:LIST_TABLE] User data structure:", userRole);
              
              // Handle the new API response structure
              const firstName = userRole.firstName || '';
              const lastName = userRole.lastName || '';
              const userName = (firstName || lastName) 
                ? `${firstName} ${lastName}`.trim() 
                : "Unknown User";
              const userEmail = userRole.email || '';
              const isCurrentUser = currentUser?.id === userRole.id;
              const isFixedUser = userEmail === 'info@freetoolonline.com' || userEmail === currentUser?.email;
              
              // Log explicit role data for debugging
              console.log(`[PROJLY:USER_SETTINGS:LIST_TABLE] User role data for ${userName}:`, {
                role: userRole.role,
                userRoleObject: userRole.userRole,
                completeUserObject: userRole
              });
              
              // Log profile information for debugging
              if (userRole.profile) {
                console.log(`[PROJLY:USER_SETTINGS:LIST_TABLE] User profile data:`, {
                  id: userRole.profile.id,
                  userId: userRole.profile.userId,
                  bio: userRole.profile.bio,
                  avatarUrl: userRole.profile.avatarUrl,
                  jobTitle: userRole.profile.jobTitle,
                  department: userRole.profile.department
                });
              }
              
              // Log detailed user info for debugging
              console.log(`[PROJLY:USER_SETTINGS:LIST_TABLE] Processing user: ${userName}, email: ${userEmail}, id: ${userRole.id}`);
              
              return (
                <TableRow key={userRole.id}>
                  <TableCell className="whitespace-nowrap">
                    {userName}
                    {isCurrentUser && (
                      <Badge variant="outline" className="ml-2">You</Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{userEmail}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {(() => {
                      // Get the role directly from the user object, ensuring it's not null/undefined
                      const roleValue = userRole.role || 'regular_user';
                      // Log detailed role info for debugging
                      console.log(`[PROJLY:USER_SETTINGS:LIST_TABLE] Rendering role badge for ${userEmail}:`, {
                        displayedRole: roleValue,
                        originalRole: userRole.role,
                        userObject: userRole
                      });
                      
                      // Force render as string to ensure correct handling
                      return getRoleBadge(String(roleValue));
                    })()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {getActivationBadge(userRole.status || 'Unverified')}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
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
                                    <ShieldCheck className="mr-2 h-4 w-4" />
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
                          
                          {/* Status management options */}
                          <DropdownMenuItem 
                            onClick={() => handleActivationStatusChange(
                              userRole.id, 
                              userRole.status === 'Active' ? 'Inactive' : 'Active'
                            )}
                            disabled={isFixedUser || !isSiteOwner && userRole.role === 'site_owner'}
                          >
                            <Activity className="mr-2 h-4 w-4" />
                            {userRole.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                          </DropdownMenuItem>
                          
                          {/* Separate Delete option */}
                          {(isSiteOwner || isAdmin) && (
                            <DropdownMenuItem 
                              onClick={() => {
                                const userName = `${userRole.firstName || ''} ${userRole.lastName || ''}`.trim() || userRole.email;
                                openDeleteDialog(userRole.id, userName);
                              }}
                              disabled={isFixedUser || userRole.role === 'site_owner'}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          )}
                          
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
                {isFetching ? (
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
                      onClick={clearFilters}
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
  );
};

export default UserListTable;
