'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, X, FileText, Download, Eye, MoreHorizontal, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { contractManagementService, Contract, ContractSearchFilters } from '@/lib/services/contract-management';
import { useLanguage } from '../contexts/language-context';
import ContractDetailDialog from './contract-detail-dialog';
import ContractEditDialog from './contract-edit-dialog';
import ContractDeleteDialog from './contract-delete-dialog';

export default function ContractSearch() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination and sorting states
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Contract>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Dialog states
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [filters, setFilters] = useState<ContractSearchFilters>({
    companyName: '',
    winningBidDecisionNumber: '',
    contractType: undefined,
    status: undefined
  });

  const contractTypes = [
    { value: 'Pharmaceuticals', label: t('contractTypes.pharmaceuticals') },
    { value: 'MedicalEquipment', label: t('contractTypes.medicalEquipment') },
    { value: 'Services', label: t('contractTypes.services') },
    { value: 'Consulting', label: t('contractTypes.consulting') },
    { value: 'Other', label: t('contractTypes.other') }
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Expired', label: 'Expired' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Draft', label: 'Draft' }
  ];

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await contractManagementService.searchContracts(
        filters,
        { field: 'createdAt', direction: 'desc' },
        { page: 1, limit: 100 } // load more for client-side sorting/paging
      );

      if (response.success && response.data) {
        setContracts(response.data.contracts);
        setTotalCount(response.data.totalCount);
      } else {
        setContracts([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error searching contracts:', error);
      setContracts([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDetailDialogOpen(true);
  };

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsEditDialogOpen(true);
  };

  const handleDeleteContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDeleteDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    // Refresh the contract list after successful operations
    handleSearch();
  };

  // Sorting functionality
  const handleSort = (field: keyof Contract) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (field: keyof Contract) => {
    if (field !== sortField) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Sort contracts based on current sort field and direction
  const sortedContracts = [...contracts].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    // Handle different data types
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (sortField.includes('Date') || sortField === 'createdAt' || sortField === 'updatedAt') {
      const aDate = new Date(aValue as string);
      const bDate = new Date(bValue as string);
      comparison = aDate.getTime() - bDate.getTime();
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContracts = sortedContracts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setFilters({
      companyName: '',
      winningBidDecisionNumber: '',
      contractType: undefined,
      status: undefined
    });
    setCurrentPage(1);
    // Trigger immediate search after clearing filters
    setTimeout(() => handleSearch(), 100);
  };

  const handleFilterChange = (field: keyof ContractSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === 'all' ? undefined : value || undefined
    }));
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      case 'Draft': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Auto-search when filters change
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [filters, currentPage]);

  // Initial load
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="space-y-6">

      {/* Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
        <div className="space-y-2">
          <Label>{t('contracts.companyName')}</Label>
          <Input
            placeholder="Search company name..."
            value={filters.companyName || ''}
            onChange={(e) => handleFilterChange('companyName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('contracts.bidDecisionNumber')}</Label>
          <Input
            placeholder="Search bid decision number..."
            value={filters.winningBidDecisionNumber || ''}
            onChange={(e) => handleFilterChange('winningBidDecisionNumber', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('contracts.contractType')}</Label>
          <Select
            value={filters.contractType || 'all'}
            onValueChange={(value) => handleFilterChange('contractType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {contractTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end items-end">
          <Button variant="outline" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-2" />
            {t('contracts.clear')}
          </Button>
        </div>
      </div>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">{t('contracts.noResults')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort('companyName')}
                      >
                        {t('contracts.companyName')}
                        {getSortIcon('companyName')}
                      </Button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort('contractNumber')}
                      >
                        {t('contracts.contractNumber')}
                        {getSortIcon('contractNumber')}
                      </Button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort('contractType')}
                      >
                        {t('contracts.contractType')}
                        {getSortIcon('contractType')}
                      </Button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort('contractValue')}
                      >
                        {t('contracts.value')}
                        {getSortIcon('contractValue')}
                      </Button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort('winningBidDecisionNumber')}
                      >
                        {t('contracts.bidDecisionNumber')}
                        {getSortIcon('winningBidDecisionNumber')}
                      </Button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort('contractStartDate')}
                      >
                        {t('contracts.startDate')}
                        {getSortIcon('contractStartDate')}
                      </Button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort('contractEndDate')}
                      >
                        {t('contracts.endDate')}
                        {getSortIcon('contractEndDate')}
                      </Button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {getSortIcon('status')}
                      </Button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Storage</TableHead>
                    <TableHead className="whitespace-nowrap max-w-[200px]">Notes</TableHead>
                    <TableHead className="whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {contract.companyName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{contract.contractNumber}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline">{contract.contractType}</Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {formatCurrency(contract.contractValue)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{contract.winningBidDecisionNumber}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(contract.contractStartDate)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(contract.contractEndDate)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge className={getStatusColor(contract.status)}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          Unit {contract.storageUnitId.split('-')[1]} - Pos {contract.positionInUnit}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate text-sm text-gray-600" title={contract.notes || ''}>
                          {contract.notes || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleViewContract(contract)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View contract detail
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEditContract(contract)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit contract
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteContract(contract)}
                              className="cursor-pointer text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete contract
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {contracts.length > itemsPerPage && (
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedContracts.length)} of {sortedContracts.length} contracts
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = Math.max(1, currentPage - 2) + i;
                if (page > totalPages) return null;
                
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-2">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    className="w-8 h-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ContractDetailDialog
        contractId={selectedContract?.id || null}
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
      />

      <ContractEditDialog
        contractId={selectedContract?.id || null}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={handleDialogSuccess}
      />

      <ContractDeleteDialog
        contract={selectedContract}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
} 