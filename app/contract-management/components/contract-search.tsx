'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, FileText, Download, Eye } from "lucide-react";
import { contractManagementService, Contract, ContractSearchFilters } from '@/lib/services/contract-management';
import { useLanguage } from '../contexts/language-context';

export default function ContractSearch() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<ContractSearchFilters>({
    companyName: '',
    winningBidDecisionNumber: '',
    contractType: undefined,
    status: undefined
  });

  const contractTypes = [
    { value: 'Pharmaceuticals', label: t('contractTypes.pharmaceuticals') },
    { value: 'Medical Equipment', label: t('contractTypes.medicalEquipment') },
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
        { page: currentPage, limit: 10 }
      );

      if (response.success && response.data) {
        setContracts(response.data.contracts);
        setTotalCount(response.data.totalCount);
      } else {
        setContracts([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setContracts([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      companyName: '',
      winningBidDecisionNumber: '',
      contractType: undefined,
      status: undefined
    });
    setCurrentPage(1);
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
      if (filters.companyName || filters.winningBidDecisionNumber || filters.contractType || filters.status) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [filters, currentPage]);

  // Initial load
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t('contracts.searchTitle')}</h3>
          <p className="text-sm text-gray-600">{t('contracts.searchDescription')}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Advanced Filters</span>
        </Button>
      </div>

      {/* Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Searching...' : t('contracts.search')}
          </Button>
          
          <Button variant="outline" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-2" />
            {t('contracts.clear')}
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          {totalCount > 0 && `${totalCount} ${t('contracts.results')}`}
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
                    <TableHead>{t('contracts.companyName')}</TableHead>
                    <TableHead>{t('contracts.contractNumber')}</TableHead>
                    <TableHead>{t('contracts.contractType')}</TableHead>
                    <TableHead>{t('contracts.value')}</TableHead>
                    <TableHead>{t('contracts.bidDecisionNumber')}</TableHead>
                    <TableHead>{t('contracts.startDate')}</TableHead>
                    <TableHead>{t('contracts.endDate')}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.companyName}
                      </TableCell>
                      <TableCell>{contract.contractNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{contract.contractType}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(contract.contractValue)}
                      </TableCell>
                      <TableCell>{contract.winningBidDecisionNumber}</TableCell>
                      <TableCell>{formatDate(contract.contractStartDate)}</TableCell>
                      <TableCell>{formatDate(contract.contractEndDate)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(contract.status)}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          Unit {contract.storageUnitId.split('-')[1]} - Pos {contract.positionInUnit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          {contract.pdfFilePath && (
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
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
      {totalCount > 10 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {Math.ceil(totalCount / 10)}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalCount / 10)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 