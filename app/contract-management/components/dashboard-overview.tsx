'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  FileText, 
  TrendingUp, 
  Database, 
  Calendar, 
  DollarSign,
  Package,
  AlertTriangle,
  Users,
  Clock,
  TrendingDown,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { contractManagementDashboardService, contractManagementService, DashboardStats, Contract } from '@/lib/services/contract-management';
import { useLanguage } from '../contexts/language-context';
import ContractDetailDialog from './contract-detail-dialog';
import ContractEditDialog from './contract-edit-dialog';
import ContractDeleteDialog from './contract-delete-dialog';
import ContractTable from './contract-table';

export default function DashboardOverview() {
  const { t, currentLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);
  
  // Pagination and sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Contract>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Dialog states
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Contract action handlers
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
    // Refresh contract list after successful operations
    loadContracts();
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

  const loadContracts = async () => {
    try {
      setIsLoadingContracts(true);
      const response = await contractManagementService.searchContracts(
        {}, // empty filters to get all contracts
        { field: 'createdAt', direction: 'desc' },
        { page: 1, limit: 100 } // load more contracts for client-side sorting/paging
      );

      if (response.success && response.data) {
        setContracts(response.data.contracts);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setIsLoadingContracts(false);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await contractManagementDashboardService.getDashboardStats();
        
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
    loadContracts();
  }, []);

  const formatCurrency = (value: number): string => {
    const locale = currentLanguage === 'vi' ? 'vi-VN' : 'en-US';
    const currency = currentLanguage === 'vi' ? 'VND' : 'USD';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      notation: value >= 1000000000 ? 'compact' : 'standard',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    const locale = currentLanguage === 'vi' ? 'vi-VN' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('dashboard.unableToLoad')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Contracts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalContracts')}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContracts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeContracts || 0} {t('dashboard.active')}
            </p>
          </CardContent>
        </Card>

        {/* Total Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalValue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.average')}: {formatCurrency(stats.averageValue || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Storage Utilization */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.storageUtilization')}
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.storageUtilization || 0).toFixed(1)}%
            </div>
            <div className="mt-2 space-y-1">
              <Progress value={stats.storageUtilization || 0} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {stats.storageUnitsUsed || 0} {t('dashboard.of')} {stats.totalStorageUnits || 0} {t('dashboard.units')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Expirations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.upcomingExpirations')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.upcomingExpirations?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.next30Days')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>{t('dashboard.contractsByType')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.contractsByType || {}).map(([type, count]) => {
                const percentage = ((count / (stats.totalContracts || 1)) * 100).toFixed(1);
                const translatedType = t(`contractTypes.${type.toLowerCase()}` as any) || type;
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{translatedType}</span>
                      <div className="flex items-center space-x-2">
                        <span>{count}</span>
                        <Badge variant="outline">{percentage}%</Badge>
                      </div>
                    </div>
                    <Progress value={parseFloat(percentage)} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Contract Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>{t('dashboard.contractsByStatus')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.contractsByStatus || {}).map(([status, count]) => {
                const percentage = ((count / (stats.totalContracts || 1)) * 100).toFixed(1);
                const statusColor = getStatusColor(status);
                const translatedStatus = t(`contractStatus.${status.toLowerCase()}` as any) || status;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
                      <span className="text-sm font-medium">{translatedStatus}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{count}</span>
                      <Badge variant="outline">{percentage}%</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend and Upcoming Expirations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{t('dashboard.monthlyTrend')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats.monthlyContractTrend || []).slice(-6).map((trend) => {
                const maxValue = Math.max(...(stats.monthlyContractTrend || []).map(t => t.count));
                const percentage = (trend.count / maxValue) * 100;
                const monthName = new Date(trend.month + '-01').toLocaleDateString(currentLanguage === 'vi' ? 'vi-VN' : 'en-US', { 
                  year: 'numeric', 
                  month: 'short' 
                });
                
                return (
                  <div key={trend.month} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{monthName}</span>
                      <div className="flex items-center space-x-2">
                        <span>{trend.count} {t('dashboard.contractsLabel')}</span>
                        <span className="text-xs text-gray-500">
                          {formatCurrency(trend.value)}
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Expirations Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>{t('dashboard.expiringContracts')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(stats.upcomingExpirations?.length || 0) === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('dashboard.noExpiringNext30Days')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(stats.upcomingExpirations || []).slice(0, 5).map((contract) => {
                  const daysToExpiry = Math.ceil(
                    (new Date(contract.contractEndDate).getTime() - new Date().getTime()) / 
                    (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div key={contract.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{contract.companyName}</p>
                        <p className="text-xs text-gray-600">{contract.contractNumber}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={daysToExpiry <= 7 ? 'destructive' : 'secondary'}>
                          {daysToExpiry} {t('common.days')}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatDate(contract.contractEndDate)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {(stats.upcomingExpirations?.length || 0) > 5 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-500">
                      +{(stats.upcomingExpirations?.length || 0) - 5} {t('dashboard.moreExpiring')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Recent Contracts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{t('dashboard.recentContracts')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingContracts ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">{t('contracts.noResults')}</p>
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
                companyName: true,
                contractNumber: true,
                contractDurationMonths: true,
                contractValue: true,
                winningBidDecisionNumber: true,
                contractType: true,
                storage: true,
                notes: true
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {contracts.length > itemsPerPage && (
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-sm text-gray-700">
            {t('common.showing')} {startIndex + 1} {t('common.to')} {Math.min(endIndex, sortedContracts.length)} {t('common.of')} {sortedContracts.length} {t('contracts.items')}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
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

function getStatusColor(status: string): string {
  switch (status) {
    case 'Active': return 'bg-green-500';
    case 'Expired': return 'bg-red-500';
    case 'Pending': return 'bg-yellow-500';
    case 'Cancelled': return 'bg-gray-500';
    case 'Draft': return 'bg-blue-500';
    default: return 'bg-gray-400';
  }
} 