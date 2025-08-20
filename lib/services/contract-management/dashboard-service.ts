import {
  DashboardStats,
  Contract,
  ContractType,
  ContractStatus,
  MonthlyTrend,
  StorageStats,
  ApiResponse
} from './types';
import { contractManagementService } from './contract-service';
import { CONTRACT_MANAGEMENT_CONFIG, handleAuthError } from './config';

class ContractManagementDashboardService {
  private static instance: ContractManagementDashboardService;

  private constructor() {
    // Constructor body intentionally empty - using centralized config
  }

  public static getInstance(): ContractManagementDashboardService {
    if (!ContractManagementDashboardService.instance) {
      ContractManagementDashboardService.instance = new ContractManagementDashboardService();
    }
    return ContractManagementDashboardService.instance;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('contractManagementToken');
    return CONTRACT_MANAGEMENT_CONFIG.getAuthHeaders(token || undefined);
  }

  /**
   * Get comprehensive dashboard statistics
   */
  public async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
            const dashboardUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.DASHBOARD.STATS);
      console.log('[ContractManagementDashboard] Getting dashboard stats via API:', dashboardUrl);
      
      const response = await fetch(dashboardUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      // Handle authentication errors
      if (response.status === 401) {
        handleAuthError(response);
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const data = await response.json();

      if (!response.ok) {
        console.error('[ContractManagementDashboard] Get stats failed:', data);
        return {
          success: false,
          error: data.message || 'Failed to fetch dashboard statistics'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.message || 'Failed to fetch dashboard statistics'
        };
      }

      return {
        success: true,
        data: data.data
      };

    } catch (error) {
      console.error('[ContractManagementDashboard] Get dashboard stats error:', error);
      return {
        success: false,
        error: 'Network error while fetching dashboard statistics'
      };
    }
  }

  /**
   * Get storage utilization statistics
   */
  public async getStorageStats(): Promise<ApiResponse<StorageStats>> {
    try {
      await this.simulateDelay(300);

      const storageUnitsResponse = await contractManagementService.getStorageUnits();
      
      if (!storageUnitsResponse.success) {
        return {
          success: false,
          error: 'Failed to fetch storage units'
        };
      }

      const storageUnits = storageUnitsResponse.data!;
      const totalUnits = storageUnits.length;
      const usedUnits = storageUnits.filter(unit => unit.contractCount > 0).length;
      const availableUnits = totalUnits - usedUnits;
      const utilizationPercentage = totalUnits > 0 ? (usedUnits / totalUnits) * 100 : 0;

      // Contracts per unit mapping
      const contractsPerUnit: Record<string, number> = {};
      storageUnits.forEach(unit => {
        contractsPerUnit[unit.id] = unit.contractCount;
      });

      const storageStats: StorageStats = {
        totalUnits,
        usedUnits,
        availableUnits,
        utilizationPercentage,
        contractsPerUnit
      };

      return {
        success: true,
        data: storageStats
      };

    } catch (error) {
      console.error('[ContractManagementDashboard] Get storage stats error:', error);
      return {
        success: false,
        error: 'Failed to get storage statistics'
      };
    }
  }

  /**
   * Get contracts expiring within specified days
   */
  public async getExpiringContracts(days: number = 30): Promise<ApiResponse<Contract[]>> {
    try {
      await this.simulateDelay(400);

      const contractsResponse = await contractManagementService.searchContracts(
        { status: 'Active' },
        { field: 'contractEndDate', direction: 'asc' },
        { page: 1, limit: 1000 }
      );

      if (!contractsResponse.success) {
        return {
          success: false,
          error: 'Failed to fetch contracts'
        };
      }

      const contracts = contractsResponse.data!.contracts;
      const expiringContracts = this.findUpcomingExpirations(contracts, days);

      return {
        success: true,
        data: expiringContracts
      };

    } catch (error) {
      console.error('[ContractManagementDashboard] Get expiring contracts error:', error);
      return {
        success: false,
        error: 'Failed to get expiring contracts'
      };
    }
  }

  /**
   * Get monthly contract statistics for a specific year
   */
  public async getMonthlyStats(year: number): Promise<ApiResponse<MonthlyTrend[]>> {
    try {
      await this.simulateDelay(500);

      const contractsResponse = await contractManagementService.searchContracts(
        {},
        { field: 'createdAt', direction: 'asc' },
        { page: 1, limit: 1000 }
      );

      if (!contractsResponse.success) {
        return {
          success: false,
          error: 'Failed to fetch contracts'
        };
      }

      const contracts = contractsResponse.data!.contracts;
      const yearlyTrend = this.calculateYearlyTrend(contracts, year);

      return {
        success: true,
        data: yearlyTrend
      };

    } catch (error) {
      console.error('[ContractManagementDashboard] Get monthly stats error:', error);
      return {
        success: false,
        error: 'Failed to get monthly statistics'
      };
    }
  }

  /**
   * Get contract value distribution by type
   */
  public async getValueDistribution(): Promise<ApiResponse<Record<ContractType, { count: number; totalValue: number; averageValue: number }>>> {
    try {
      await this.simulateDelay(400);

      const contractsResponse = await contractManagementService.searchContracts(
        {},
        { field: 'createdAt', direction: 'desc' },
        { page: 1, limit: 1000 }
      );

      if (!contractsResponse.success) {
        return {
          success: false,
          error: 'Failed to fetch contracts'
        };
      }

      const contracts = contractsResponse.data!.contracts;
      const distribution: Record<string, { count: number; totalValue: number; averageValue: number }> = {};

      // Initialize all contract types
      const contractTypes: ContractType[] = ['Pharmaceuticals', 'MedicalEquipment', 'Services', 'Consulting', 'Other'];
      
      contractTypes.forEach(type => {
        distribution[type] = { count: 0, totalValue: 0, averageValue: 0 };
      });

      // Calculate distribution
      contracts.forEach(contract => {
        const type = contract.contractType;
        distribution[type].count++;
        distribution[type].totalValue += contract.contractValue;
      });

      // Calculate averages
      Object.keys(distribution).forEach(type => {
        if (distribution[type].count > 0) {
          distribution[type].averageValue = distribution[type].totalValue / distribution[type].count;
        }
      });

      return {
        success: true,
        data: distribution as Record<ContractType, { count: number; totalValue: number; averageValue: number }>
      };

    } catch (error) {
      console.error('[ContractManagementDashboard] Get value distribution error:', error);
      return {
        success: false,
        error: 'Failed to get value distribution'
      };
    }
  }

  // Private helper methods

  private calculateContractsByType(contracts: Contract[]): Record<ContractType, number> {
    const contractTypes: ContractType[] = ['Pharmaceuticals', 'MedicalEquipment', 'Services', 'Consulting', 'Other'];
    const result: Record<string, number> = {};

    // Initialize all types with 0
    contractTypes.forEach(type => {
      result[type] = 0;
    });

    // Count contracts by type
    contracts.forEach(contract => {
      result[contract.contractType]++;
    });

    return result as Record<ContractType, number>;
  }

  private calculateContractsByStatus(contracts: Contract[]): Record<ContractStatus, number> {
    const contractStatuses: ContractStatus[] = ['Active', 'Expired', 'Pending', 'Cancelled', 'Draft'];
    const result: Record<string, number> = {};

    // Initialize all statuses with 0
    contractStatuses.forEach(status => {
      result[status] = 0;
    });

    // Count contracts by status
    contracts.forEach(contract => {
      result[contract.status]++;
    });

    return result as Record<ContractStatus, number>;
  }

  private calculateMonthlyTrend(contracts: Contract[], months: number = 12): MonthlyTrend[] {
    const trend: MonthlyTrend[] = [];
    const now = new Date();

    // Generate last N months
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toISOString().slice(0, 7); // YYYY-MM format

      const monthContracts = contracts.filter(contract => {
        const contractMonth = contract.createdAt.slice(0, 7);
        return contractMonth === month;
      });

      const count = monthContracts.length;
      const value = monthContracts.reduce((sum, c) => sum + c.contractValue, 0);

      trend.push({ month, count, value });
    }

    return trend;
  }

  private calculateYearlyTrend(contracts: Contract[], year: number): MonthlyTrend[] {
    const trend: MonthlyTrend[] = [];

    // Generate all 12 months for the specified year
    for (let month = 1; month <= 12; month++) {
      const monthStr = `${year}-${month.toString().padStart(2, '0')}`;

      const monthContracts = contracts.filter(contract => {
        const contractMonth = contract.createdAt.slice(0, 7);
        return contractMonth === monthStr;
      });

      const count = monthContracts.length;
      const value = monthContracts.reduce((sum, c) => sum + c.contractValue, 0);

      trend.push({ month: monthStr, count, value });
    }

    return trend;
  }

  private findUpcomingExpirations(contracts: Contract[], days: number): Contract[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return contracts
      .filter(contract => {
        const endDate = new Date(contract.contractEndDate);
        return endDate >= now && endDate <= futureDate && contract.status === 'Active';
      })
      .sort((a, b) => new Date(a.contractEndDate).getTime() - new Date(b.contractEndDate).getTime());
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const contractManagementDashboardService = ContractManagementDashboardService.getInstance(); 