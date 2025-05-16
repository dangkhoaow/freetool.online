
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

interface ProjectTableHeaderProps {
  sortBy: SortConfig;
  toggleSort: (field: string) => void;
}

export function ProjectTableHeader({ sortBy, toggleSort }: ProjectTableHeaderProps) {
  // Render sort indicator
  const renderSortIndicator = (field: string) => {
    if (sortBy.field !== field) return null;
    return sortBy.direction === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead 
          className="cursor-pointer w-[300px]"
          onClick={() => toggleSort("name")}
        >
          <div className="flex items-center">
            Name
            {renderSortIndicator("name")}
          </div>
        </TableHead>
        <TableHead className="w-[300px]">Description</TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => toggleSort("status")}
        >
          <div className="flex items-center">
            Status
            {renderSortIndicator("status")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => toggleSort("createdAt")}
        >
          <div className="flex items-center">
            Created
            {renderSortIndicator("createdAt")}
          </div>
        </TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
