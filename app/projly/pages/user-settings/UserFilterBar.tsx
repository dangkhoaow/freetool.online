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
    <div className="flex items-center justify-between py-4">
      <p className="text-sm text-gray-500">
        {filteredCount !== totalCount && (
          <span className="ml-2 text-blue-500">
            Showing {filteredCount} of {totalCount} users
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
            onChange={(e) => {
              console.log("[PROJLY:USER_SETTINGS:FILTER_BAR] Search query changed:", e.target.value);
              setSearchQuery(e.target.value);
            }}
          />
        </div>
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
            {/* Dynamically generate status options from distinct statuses */}
            {distinctStatuses.map(status => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
            {/* Add Deleted option if not already in the list */}
            {!distinctStatuses.includes('Deleted') && (
              <SelectItem value="Deleted">Deleted</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default UserFilterBar;
