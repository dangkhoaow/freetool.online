import { useState } from "react";
import { useResources } from "@/lib/services/projly/use-resources";
import { Resource } from "@/lib/services/projly/types";
import { formatDateForDisplay } from "@/lib/utils/dateUtils";
import { extractApiData } from "@/lib/utils/apiUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { EditResourceDialog } from "./EditResourceDialog";
import { DeleteResourceDialog } from "./DeleteResourceDialog";
import { Spinner } from "../../components/ui/spinner";
import { PageLoading } from "@/app/projly/components/ui/PageLoading";
import { ArrowDown, ArrowUp, Edit, Trash2 } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../components/ui/pagination";

type SortField = "name" | "fileType" | "quantity" | "createdAt";
type SortOrder = "asc" | "desc";

interface ResourcesTableProps {
  filters: {
    name: string;
    fileType: string;
    projectId: string;
  };
}

export function ResourcesTable({ filters }: ResourcesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const itemsPerPage = 10;

  // Fetch resources data from Supabase
  const { data: resourcesData, isLoading, isError, refetch } = useResources();

  if (isLoading) {
    console.log('[PROJLY:RESOURCES:TABLE] Loading resources data');
    return <PageLoading standalone={true} logContext="PROJLY:RESOURCES:TABLE" height="20vh" />;
  }

  if (isError || !resourcesData) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Failed to load resources. Please try again.</p>
        <Button onClick={() => refetch()} className="mt-2">Retry</Button>
      </div>
    );
  }

  // Use our utility function to safely extract data from the API response
  let resources = extractApiData<Resource>(resourcesData, "ResourcesTable");
  console.log("[ResourcesTable] Extracted resources:", resources.length);
  
  // Apply filters
  let filteredResources = [...resources];
  
  // Filter by name
  if (filters.name) {
    filteredResources = filteredResources.filter(resource => 
      resource.name.toLowerCase().includes(filters.name.toLowerCase())
    );
    console.log(`[ResourcesTable] After name filter, resources count: ${filteredResources.length}`);
  }
  
  // Filter by fileType (skip if set to 'all_types')
  if (filters.fileType && filters.fileType !== 'all_types') {
    console.log(`[ResourcesTable] Filtering by fileType: ${filters.fileType}`);
    filteredResources = filteredResources.filter(resource => 
      resource.fileType?.toLowerCase().includes(filters.fileType.toLowerCase()) || false
    );
    console.log(`[ResourcesTable] After fileType filter, resources count: ${filteredResources.length}`);
  } else {
    console.log(`[ResourcesTable] Skipping fileType filter (set to "${filters.fileType}")`);
  }
  
  // Filter by project (skip if set to 'all_projects')
  if (filters.projectId && filters.projectId !== 'all_projects') {
    console.log(`[ResourcesTable] Filtering by projectId: ${filters.projectId}`);
    filteredResources = filteredResources.filter(resource => 
      resource.projectId === filters.projectId
    );
    console.log(`[ResourcesTable] After project filter, resources count: ${filteredResources.length}`);
  } else {
    console.log(`[ResourcesTable] Skipping projectId filter (set to "${filters.projectId}")`);
  }

  // Apply sorting with logging
  const sortedResources = [...filteredResources].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    console.log(`[ResourcesTable] Sorting by field: ${sortField}, order: ${sortOrder}, comparing a.${sortField}: ${aValue}, b.${sortField}: ${bValue}`);
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    } else {
      console.log(`[ResourcesTable] Sort error: Incompatible types for field ${sortField}`);
      return 0; // Default to no change if types don't match
    }
  });
  console.log(`[ResourcesTable] After sorting, first resource:`, sortedResources[0]);

  // Handle pagination
  const totalPages = Math.ceil(sortedResources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResources = sortedResources.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    return sortOrder === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />;
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="w-[300px] cursor-pointer"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center">
                Name {getSortIcon("name")}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort("fileType")}
            >
              <div className="flex items-center">
                File Type {getSortIcon("fileType")}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort("quantity")}
            >
              <div className="flex items-center">
                Quantity {getSortIcon("quantity")}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort("createdAt")}
            >
              <div className="flex items-center">
                Created At {getSortIcon("createdAt")}
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedResources.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No resources found. Try clearing filters or create a new resource.
              </TableCell>
            </TableRow>
          ) : (
            paginatedResources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell title={resource.name || ""} className="font-medium whitespace-nowrap">{resource.name}</TableCell>
                <TableCell title={resource.fileType || ""} className="whitespace-nowrap">{resource.fileType}</TableCell>
                <TableCell title={resource.quantity || ""} className="whitespace-nowrap">{resource.quantity}</TableCell>
                <TableCell title={formatDateForDisplay(resource.createdAt) || ""} className="whitespace-nowrap">{formatDateForDisplay(resource.createdAt)}</TableCell>
                <TableCell title="Actions" className="text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setResourceToEdit(resource)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setResourceToDelete(resource)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {sortedResources.length > itemsPerPage && (
        <div className="py-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                let pageNumber: number;
                
                // Simple pagination for <= 5 pages
                if (totalPages <= 5) {
                  pageNumber = index + 1;
                }
                // Complex pagination for > 5 pages
                else {
                  if (currentPage <= 3) {
                    pageNumber = index + 1;
                    if (index === 4) pageNumber = totalPages;
                  } else if (currentPage >= totalPages - 2) {
                    if (index === 0) pageNumber = 1;
                    else pageNumber = totalPages - (4 - index);
                  } else {
                    pageNumber = currentPage - 2 + index;
                  }
                }

                return (
                  <PaginationItem key={index}>
                    {(index === 4 && pageNumber !== 5 && currentPage <= 3) || 
                     (index === 0 && pageNumber !== totalPages - 4 && currentPage >= totalPages - 2) ? (
                      <span className="px-4 py-2">...</span>
                    ) : (
                      <PaginationLink
                        isActive={pageNumber === currentPage}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {resourceToEdit && (
        <EditResourceDialog
          resource={resourceToEdit}
          onClose={() => setResourceToEdit(null)}
          onSuccess={() => {
            refetch();
            setResourceToEdit(null);
          }}
        />
      )}

      {resourceToDelete && (
        <DeleteResourceDialog
          resource={resourceToDelete}
          onClose={() => setResourceToDelete(null)}
          onSuccess={() => {
            refetch();
            setResourceToDelete(null);
          }}
        />
      )}
    </div>
  );
}
