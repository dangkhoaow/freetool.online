'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  TrendingUp, 
  Database, 
  Calendar, 
  DollarSign,
  Package,
  AlertTriangle,
  Users,
  Clock
} from "lucide-react";
import { contractManagementDashboardService, DashboardStats } from '@/lib/services/contract-management';
import { useLanguage } from '../contexts/language-context';

export default function DashboardOverview() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

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
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: value >= 1000000000 ? 'compact' : 'standard',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN');
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
        <p className="text-gray-500">Unable to load dashboard data</p>
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
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{type}</span>
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
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
                      <span className="text-sm font-medium">{status}</span>
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
              <span>Monthly Contract Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats.monthlyContractTrend || []).slice(-6).map((trend) => {
                const maxValue = Math.max(...(stats.monthlyContractTrend || []).map(t => t.count));
                const percentage = (trend.count / maxValue) * 100;
                const monthName = new Date(trend.month + '-01').toLocaleDateString('vi-VN', { 
                  year: 'numeric', 
                  month: 'short' 
                });
                
                return (
                  <div key={trend.month} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{monthName}</span>
                      <div className="flex items-center space-x-2">
                        <span>{trend.count} contracts</span>
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
                <p>No contracts expiring in the next 30 days</p>
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
                          {daysToExpiry} days
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
                      +{(stats.upcomingExpirations?.length || 0) - 5} more contracts expiring soon
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Storage System Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalStorageUnits || 0}</div>
              <p className="text-sm text-blue-700">Total Units</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.storageUnitsUsed || 0}</div>
              <p className="text-sm text-green-700">Units in Use</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {(stats.totalStorageUnits || 0) - (stats.storageUnitsUsed || 0)}
              </div>
              <p className="text-sm text-gray-700">Available Units</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.ceil((stats.totalContracts || 0) / 10)}
              </div>
              <p className="text-sm text-purple-700">Required Units</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Storage Efficiency</span>
              <span>{(stats.storageUtilization || 0).toFixed(1)}% utilized</span>
            </div>
            <Progress value={stats.storageUtilization || 0} className="h-3" />
            <p className="text-xs text-gray-600 mt-1">
              Sequential storage system maintains organization with up to 10 contracts per unit
            </p>
          </div>
        </CardContent>
      </Card>
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