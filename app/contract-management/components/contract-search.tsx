'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X, FileText, Download, Eye, MoreHorizontal, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Settings, ChevronRight as ChevronRightIcon } from "lucide-react";
import { Contract, ContractSearchFilters, ContractType, ContractStatus } from '@/lib/services/contract-management/types';
import { contractManagementService } from '@/lib/services/contract-management/contract-service';
import { useLanguage } from '../contexts/language-context';
import ContractDetailDialog from './contract-detail-dialog';
import ContractEditDialog from './contract-edit-dialog';
import ContractDeleteDialog from './contract-delete-dialog';
import ContractTable from './contract-table';

export default function ContractSearch() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const hasInitiallyLoadedRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSearchingRef = useRef(false);
  const lastFiltersRef = useRef<string>('');
  
  // Pagination and sorting states
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Contract>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Column visibility states with localStorage persistence
  const [visibleColumns, setVisibleColumns] = useState(() => {
    // Default column visibility
    const defaultColumns = {
      companyName: true,
      contractNumber: true,
      contractDurationMonths: true,
      contractValue: true,
      winningBidDecisionNumber: true,
      contractType: true,
      storage: true,
      notes: true,
      actions: true
    };

    // Try to load from localStorage
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('contract-search-column-visibility');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Merge with defaults to handle new columns that might be added
          return { ...defaultColumns, ...parsed };
        }
      }
    } catch (error) {
      console.warn('Failed to load column visibility from localStorage:', error);
    }

    return defaultColumns;
  });

  // Dialog states
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [filterValues, setFilterValues] = useState({
    companyName: '',
    winningBidDecisionNumber: '',
    contractType: undefined as string | undefined,
    status: undefined as string | undefined
  });

  // Memoize filters object to prevent recreations
  const filters = useMemo(() => ({
    companyName: filterValues.companyName,
    winningBidDecisionNumber: filterValues.winningBidDecisionNumber,
    contractType: filterValues.contractType as ContractType | undefined,
    status: filterValues.status as ContractStatus | undefined
  }), [filterValues.companyName, filterValues.winningBidDecisionNumber, filterValues.contractType, filterValues.status]);

  const contractTypes = [
    { value: 'Pharmaceuticals', label: t('contractTypes.pharmaceuticals') },
    { value: 'MedicalEquipment', label: t('contractTypes.medicalEquipment') },
    { value: 'Services', label: t('contractTypes.services') },
    { value: 'Consulting', label: t('contractTypes.consulting') },
    { value: 'Other', label: t('contractTypes.other') }
  ];

  const statusOptions = [
    { value: 'Active', label: t('contractStatus.active') },
    { value: 'Expired', label: t('contractStatus.expired') },
    { value: 'Pending', label: t('contractStatus.pending') },
    { value: 'Cancelled', label: t('contractStatus.cancelled') },
    { value: 'Draft', label: t('contractStatus.draft') }
  ];

  const handleSearch = async () => {
    // Prevent concurrent API calls with ref-based check
    if (isSearchingRef.current) {
      console.log('[ContractSearch] Skipping search - already searching');
      return;
    }
    
    isSearchingRef.current = true;
    console.log('[ContractSearch] Starting search with filters:', filters);
    setIsLoading(true);
    
    try {
      const response = await contractManagementService.searchContracts(
        filters as ContractSearchFilters,
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
      isSearchingRef.current = false;
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

  // Column visibility functions
  const toggleColumn = (columnKey: keyof typeof visibleColumns) => {
    setVisibleColumns((prev: typeof visibleColumns) => {
      const newVisibility = {
        ...prev,
        [columnKey]: !prev[columnKey]
      };
      
      // Save to localStorage
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('contract-search-column-visibility', JSON.stringify(newVisibility));
        }
      } catch (error) {
        console.warn('Failed to save column visibility to localStorage:', error);
      }
      
      return newVisibility;
    });
  };

  const columnLabels = {
    companyName: t('contracts.companyName'),
    contractNumber: t('contracts.contractNumber'),
    contractDurationMonths: t('contracts.duration'),
    contractValue: t('contracts.value'),
    winningBidDecisionNumber: t('contracts.bidDecisionNumber'),
    contractType: t('contracts.contractType'),
    storage: t('common.storage'),
    notes: t('common.notes'),
    actions: t('common.actions')
  };

  const handleClearFilters = () => {
    setFilterValues({
      companyName: '',
      winningBidDecisionNumber: '',
      contractType: undefined,
      status: undefined
    });
    setCurrentPage(1);
    // Note: useEffect will trigger search when filters change
  };

  const handleFilterChange = (field: keyof ContractSearchFilters, value: any) => {
    setFilterValues((prev: typeof filterValues) => ({
      ...prev,
      [field]: value === 'all' ? undefined : value || undefined
    }));
    setCurrentPage(1); // Reset to first page when filtering
    // Note: useEffect will trigger search when filters change
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

  // Trigger search function that can be called manually
  const triggerSearch = (immediate = false) => {
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    // Prevent concurrent searches
    if (isSearchingRef.current) {
      console.log('[ContractSearch] Search blocked - already searching');
      return;
    }

    if (immediate) {
      console.log('[ContractSearch] Immediate search triggered');
      handleSearch();
    } else {
      console.log('[ContractSearch] Delayed search scheduled');
      searchTimeoutRef.current = setTimeout(() => {
        if (!isSearchingRef.current) {
          handleSearch();
        }
      }, 300);
    }
  };

  // Single useEffect ONLY for initial load
  useEffect(() => {
    if (!hasInitiallyLoadedRef.current) {
      hasInitiallyLoadedRef.current = true;
      console.log('[ContractSearch] Component mounted - initial search');
      triggerSearch(true);
    }
  }, []); // Empty dependency array - only runs once on mount

  // useEffect to trigger search when filters change
  useEffect(() => {
    if (hasInitiallyLoadedRef.current) {
      console.log('[ContractSearch] Filters changed - triggering search:', filters);
      triggerSearch(false); // Use delayed search for filter changes
    }
  }, [filters]); // Re-run when memoized filters object changes

  return (
    <div className="space-y-6">

      {/* Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
        <div className="space-y-2">
          <Label className="dark:text-gray-200">{t('contracts.companyName')}</Label>
          <Input
            placeholder={t('contracts.searchCompanyPlaceholder')}
            value={filterValues.companyName || ''}
            onChange={(e) => handleFilterChange('companyName', e.target.value)}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Label className="dark:text-gray-200">{t('contracts.bidDecisionNumber')}</Label>
          <Input
            placeholder={t('contracts.searchBidNumberPlaceholder')}
            value={filterValues.winningBidDecisionNumber || ''}
            onChange={(e) => handleFilterChange('winningBidDecisionNumber', e.target.value)}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Label className="dark:text-gray-200">{t('contracts.contractType')}</Label>
          <Select
            value={filterValues.contractType || 'all'}
            onValueChange={(value) => handleFilterChange('contractType', value)}
          >
            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              <SelectValue placeholder={t('contracts.allTypes')} className="dark:text-gray-400" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              <SelectItem value="all" className="dark:text-gray-200 dark:hover:bg-gray-700">{t('contracts.allTypes')}</SelectItem>
              {contractTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="dark:text-gray-200 dark:hover:bg-gray-700">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="dark:text-gray-200">{t('common.status')}</Label>
          <Select
            value={filterValues.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              <SelectValue placeholder={t('contracts.allStatuses')} className="dark:text-gray-400" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              <SelectItem value="all" className="dark:text-gray-200 dark:hover:bg-gray-700">{t('contracts.allStatuses')}</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value} className="dark:text-gray-200 dark:hover:bg-gray-700">
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end items-end">
          <Button variant="outline" onClick={handleClearFilters} className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
            <X className="h-4 w-4 mr-2" />
            {t('contracts.clear')}
          </Button>
        </div>
      </div>

      {/* Results Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold dark:text-gray-100">{t('contracts.searchResults')}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('contracts.columns')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 dark:bg-gray-800 dark:border-gray-600">
                <div className="px-3 py-2 text-sm font-medium dark:text-gray-200">{t('contracts.showHideColumns')}</div>
                <DropdownMenuSeparator className="dark:border-gray-600" />
                {Object.entries(columnLabels).map(([key, label]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={visibleColumns[key as keyof typeof visibleColumns]}
                    onCheckedChange={() => toggleColumn(key as keyof typeof visibleColumns)}
                    className="dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('contracts.noResults')}</p>
            </div>
          ) : (
            <ContractTable
              contracts={currentContracts}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              onViewContract={handleViewContract}
              onEditContract={handleEditContract}
              onDeleteContract={handleDeleteContract}
              visibleColumns={{
                companyName: visibleColumns.companyName,
                contractNumber: visibleColumns.contractNumber,
                contractDurationMonths: visibleColumns.contractDurationMonths,
                contractValue: visibleColumns.contractValue,
                winningBidDecisionNumber: visibleColumns.winningBidDecisionNumber,
                contractType: visibleColumns.contractType,
                storage: visibleColumns.storage,
                notes: visibleColumns.notes,
                actions: visibleColumns.actions
              }}
              showColumnControls={false}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Pagination */}
      {contracts.length > itemsPerPage && (
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {t('common.showing')} {startIndex + 1} {t('common.to')} {Math.min(endIndex, sortedContracts.length)} {t('common.of')} {sortedContracts.length} {t('contracts.items')}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('common.previous')}
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
                    className={`w-8 h-8 p-0 ${currentPage === page ? 'dark:bg-blue-600 dark:hover:bg-blue-700' : 'dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    {page}
                  </Button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-2 dark:text-gray-400">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    className="w-8 h-8 p-0 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
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
              className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {t('common.next')}
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