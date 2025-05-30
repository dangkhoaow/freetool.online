import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface UserFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  distinctStatuses: string[];
  isRefreshing: boolean;
  handleRefresh: () => void;
  filteredCount: number;
  totalCount: number;
}

/**
 * Component for filtering and searching users
 */
const UserFilterBar: React.FC<UserFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  distinctStatuses,
  isRefreshing,
  handleRefresh,
  filteredCount,
  totalCount
}) => {
  console.log("[PROJLY:USER_SETTINGS:FILTER_BAR] Rendering filter bar with:", {
    searchQuery,
    roleFilter,
    statusFilter,
    distinctStatuses,
    filteredCount,
    totalCount
  });

  return (
    <div className="flex flex-col py-4 space-y-4">
      {/* Mobile view: Stacked layout with filters on top */}
      <div className="md:hidden flex flex-col space-y-4">
        {/* Filter dropdowns at the top for mobile */}
        <div className="flex items-center gap-2 justify-end">
          <Select 
            value={roleFilter} 
            onValueChange={(value) => {
              console.log("[PROJLY:USER_SETTINGS:FILTER_BAR] Role filter changed:", value);
              setRoleFilter(value);
            }}
          >
            <SelectTrigger className="w-[150px]">
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
            onValueChange={(value) => {
              console.log("[PROJLY:USER_SETTINGS:FILTER_BAR] Status filter changed:", value);
              setStatusFilter(value);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {distinctStatuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
              {!distinctStatuses.includes('Deleted') && (
                <SelectItem value="Deleted">Deleted</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Search input below filters for mobile */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search users..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => {
              console.log("[PROJLY:USER_SETTINGS:FILTER_BAR] Search query changed:", e.target.value);
              setSearchQuery(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Desktop view: Side-by-side layout */}
      <div className="hidden md:flex items-center justify-between">
        {/* Search input aligned left for desktop */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search users..."
            className="pl-8 w-[300px]"
            value={searchQuery}
            onChange={(e) => {
              console.log("[PROJLY:USER_SETTINGS:FILTER_BAR] Search query changed:", e.target.value);
              setSearchQuery(e.target.value);
            }}
          />
        </div>

        {/* Filter dropdowns aligned right for desktop */}
        <div className="flex items-center gap-2">
          <Select 
            value={roleFilter} 
            onValueChange={(value) => {
              console.log("[PROJLY:USER_SETTINGS:FILTER_BAR] Role filter changed:", value);
              setRoleFilter(value);
            }}
          >
            <SelectTrigger className="w-[150px]">
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
            onValueChange={(value) => {
              console.log("[PROJLY:USER_SETTINGS:FILTER_BAR] Status filter changed:", value);
              setStatusFilter(value);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {distinctStatuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
              {!distinctStatuses.includes('Deleted') && (
                <SelectItem value="Deleted">Deleted</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* User count info */}
      <p className="text-sm text-gray-500  text-right">
        {filteredCount !== totalCount && (
          <span className="text-blue-500">
            Showing {filteredCount} of {totalCount} users
          </span>
        )}
      </p>
    </div>
  );
};

export default UserFilterBar;
