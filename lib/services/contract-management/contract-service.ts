import {
  Contract,
  ContractFormData,
  ContractSearchFilters,
  ContractSearchResult,
  StorageUnit,
  ContractType,
  ContractStatus,
  ApiResponse,
  PaginatedResponse,
  SortConfig,
  PaginationConfig,
  FileUploadResult
} from './types';
import { CONTRACT_MANAGEMENT_CONFIG } from './config';

// Mock storage for contracts and storage units
let MOCK_CONTRACTS: Contract[] = [];
let MOCK_STORAGE_UNITS: StorageUnit[] = [];
let contractIdCounter = 1;
let storageUnitCounter = 1;

// Initialize with some sample data
const initializeMockData = () => {
  if (MOCK_CONTRACTS.length === 0) {
    // Create first storage unit
    MOCK_STORAGE_UNITS.push({
      id: 'unit-1',
      unitNumber: 1,
      contractCount: 3,
      contracts: ['contract-1', 'contract-2', 'contract-3'],
      isFull: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Sample contracts
    MOCK_CONTRACTS = [
      {
        id: 'contract-1',
        companyName: 'Công ty TNHH Dược phẩm ABC',
        contractNumber: 'CT-2024-001',
        contractStartDate: '2024-01-15',
        contractEndDate: '2024-12-31',
        contractDurationMonths: 11,
        contractValue: 5000000000, // 5 billion VND
        winningBidDecisionNumber: 'QD-001-2024',
        contractType: 'Pharmaceuticals',
        storageUnitId: 'unit-1',
        positionInUnit: 1,
        status: 'Active',
        createdAt: '2024-01-10T08:00:00.000Z',
        updatedAt: '2024-01-10T08:00:00.000Z',
        createdBy: 'admin-1',
        notes: 'Hợp đồng cung cấp thuốc kháng sinh cho hệ thống y tế'
      },
      {
        id: 'contract-2',
        companyName: 'Medical Equipment Solutions Ltd',
        contractNumber: 'CT-2024-002',
        contractStartDate: '2024-02-01',
        contractEndDate: '2025-01-31',
        contractDurationMonths: 12,
        contractValue: 8500000000, // 8.5 billion VND
        winningBidDecisionNumber: 'QD-002-2024',
        contractType: 'Medical Equipment',
        storageUnitId: 'unit-1',
        positionInUnit: 2,
        status: 'Active',
        createdAt: '2024-01-25T10:30:00.000Z',
        updatedAt: '2024-01-25T10:30:00.000Z',
        createdBy: 'manager-1',
        notes: 'Contract for MRI and CT scan equipment maintenance'
      },
      {
        id: 'contract-3',
        companyName: 'Công ty Dịch vụ Y tế Chuyên nghiệp',
        contractNumber: 'CT-2024-003',
        contractStartDate: '2024-03-01',
        contractEndDate: '2024-08-31',
        contractDurationMonths: 6,
        contractValue: 2800000000, // 2.8 billion VND
        winningBidDecisionNumber: 'QD-003-2024',
        contractType: 'Services',
        storageUnitId: 'unit-1',
        positionInUnit: 3,
        status: 'Active',
        createdAt: '2024-02-20T14:15:00.000Z',
        updatedAt: '2024-02-20T14:15:00.000Z',
        createdBy: 'user-1',
        notes: 'Hợp đồng dịch vụ bảo trì và vệ sinh thiết bị y tế'
      }
    ];

    contractIdCounter = 4;
    storageUnitCounter = 2;
  }
};

class ContractManagementService {
  private static instance: ContractManagementService;

  private constructor() {
    initializeMockData();
  }

  public static getInstance(): ContractManagementService {
    if (!ContractManagementService.instance) {
      ContractManagementService.instance = new ContractManagementService();
    }
    return ContractManagementService.instance;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('contractManagementToken');
    return CONTRACT_MANAGEMENT_CONFIG.getAuthHeaders(token || undefined);
  }

  /**
   * Create a new contract with automatic storage assignment
   */
  public async createContract(contractData: ContractFormData, userId: string): Promise<ApiResponse<Contract>> {
    try {
      // Prepare contract data for API
      const apiData = {
        companyName: contractData.companyName,
        contractNumber: contractData.contractNumber,
        contractStartDate: contractData.contractStartDate,
        contractEndDate: contractData.contractEndDate,
        contractDurationMonths: contractData.contractDurationMonths,
        contractValue: contractData.contractValue,
        winningBidDecisionNumber: contractData.winningBidDecisionNumber,
        contractType: contractData.contractType,
        notes: contractData.notes,
        status: 'Active'
      };

            const createUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.CONTRACTS.BASE);
      console.log('[ContractManagement] Creating contract via API:', createUrl);
      
      const response = await fetch(createUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(apiData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ContractManagement] Create contract failed:', data);
        return {
          success: false,
          error: data.message || 'Failed to create contract'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.message || 'Failed to create contract'
        };
      }

      // Handle file upload if provided (TODO: implement file upload endpoint)
      if (contractData.pdfFile) {
        try {
          // TODO: Upload file to contract files endpoint
          console.log('[ContractManagement] File upload not yet implemented');
        } catch (fileError) {
          console.warn('[ContractManagement] File upload failed:', fileError);
          // Continue even if file upload fails
        }
      }

      console.log('[ContractManagement] Contract created successfully');

      return {
        success: true,
        data: data.data,
        message: data.message || 'Contract created successfully'
      };

    } catch (error) {
      console.error('[ContractManagement] Create contract error:', error);
      return {
        success: false,
        error: 'Network error while creating contract'
      };
    }
  }

  /**
   * Get contract by ID
   */
  public async getContract(id: string): Promise<ApiResponse<Contract>> {
    try {
            const getUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.CONTRACTS.BY_ID(id));
      console.log('[ContractManagement] Getting contract via API:', getUrl);
      
      const response = await fetch(getUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ContractManagement] Get contract failed:', data);
        return {
          success: false,
          error: data.message || 'Failed to fetch contract'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.message || 'Failed to fetch contract'
        };
      }

      return {
        success: true,
        data: data.data
      };

    } catch (error) {
      console.error('[ContractManagement] Get contract error:', error);
      return {
        success: false,
        error: 'Network error while fetching contract'
      };
    }
  }

  /**
   * Update contract
   */
  public async updateContract(id: string, updates: Partial<ContractFormData>, userId: string): Promise<ApiResponse<Contract>> {
    try {
      await this.simulateDelay(600);

      const contractIndex = MOCK_CONTRACTS.findIndex(c => c.id === id);
      
      if (contractIndex === -1) {
        return {
          success: false,
          error: 'Contract not found'
        };
      }

      const contract = MOCK_CONTRACTS[contractIndex];

      // Handle file upload if new file provided
      let fileUploadResult: FileUploadResult | null = null;
      if (updates.pdfFile) {
        fileUploadResult = await this.uploadFile(updates.pdfFile);
        if (!fileUploadResult.success) {
          return {
            success: false,
            error: 'Failed to upload PDF file'
          };
        }
      }

      // Update contract
      const updatedContract: Contract = {
        ...contract,
        ...updates,
        updatedAt: new Date().toISOString(),
        ...(fileUploadResult && {
          pdfFilePath: fileUploadResult.filePath,
          pdfFileName: fileUploadResult.fileName,
          pdfFileSize: fileUploadResult.fileSize
        })
      };

      // Remove pdfFile from updates as it's not part of Contract interface
      delete (updatedContract as any).pdfFile;

      MOCK_CONTRACTS[contractIndex] = updatedContract;

      return {
        success: true,
        data: updatedContract,
        message: 'Contract updated successfully'
      };

    } catch (error) {
      console.error('[ContractManagement] Update contract error:', error);
      return {
        success: false,
        error: 'Failed to update contract'
      };
    }
  }

  /**
   * Delete contract
   */
  public async deleteContract(id: string): Promise<ApiResponse<void>> {
    try {
      await this.simulateDelay(400);

      const contractIndex = MOCK_CONTRACTS.findIndex(c => c.id === id);
      
      if (contractIndex === -1) {
        return {
          success: false,
          error: 'Contract not found'
        };
      }

      const contract = MOCK_CONTRACTS[contractIndex];
      
      // Remove from contracts array
      MOCK_CONTRACTS.splice(contractIndex, 1);

      // Update storage unit
      const storageUnit = MOCK_STORAGE_UNITS.find(unit => unit.id === contract.storageUnitId);
      if (storageUnit) {
        storageUnit.contracts = storageUnit.contracts.filter(cId => cId !== id);
        storageUnit.contractCount--;
        storageUnit.isFull = false;
        storageUnit.updatedAt = new Date().toISOString();
      }

      return {
        success: true,
        message: 'Contract deleted successfully'
      };

    } catch (error) {
      console.error('[ContractManagement] Delete contract error:', error);
      return {
        success: false,
        error: 'Failed to delete contract'
      };
    }
  }

  /**
   * Search contracts with filters and pagination
   */
  public async searchContracts(
    filters: ContractSearchFilters = {},
    sort: SortConfig = { field: 'createdAt', direction: 'desc' },
    pagination: PaginationConfig = { page: 1, limit: 10 }
  ): Promise<ApiResponse<ContractSearchResult>> {
    try {
      // Build query parameters
      const searchParams = new URLSearchParams();
      
      // Add pagination
      searchParams.append('page', pagination.page.toString());
      searchParams.append('limit', pagination.limit.toString());
      searchParams.append('sortBy', sort.field);
      searchParams.append('sortOrder', sort.direction);

      // Add filters
      if (filters.companyName) {
        searchParams.append('companyName', filters.companyName);
      }
      if (filters.winningBidDecisionNumber) {
        searchParams.append('winningBidDecisionNumber', filters.winningBidDecisionNumber);
      }
      if (filters.contractType) {
        searchParams.append('contractType', filters.contractType);
      }
      if (filters.status) {
        searchParams.append('status', filters.status);
      }
      if (filters.startDateFrom) {
        searchParams.append('contractStartDateFrom', filters.startDateFrom);
      }
      if (filters.startDateTo) {
        searchParams.append('contractStartDateTo', filters.startDateTo);
      }
      if (filters.endDateFrom) {
        searchParams.append('contractEndDateFrom', filters.endDateFrom);
      }
      if (filters.endDateTo) {
        searchParams.append('contractEndDateTo', filters.endDateTo);
      }
      if (filters.contractValueMin) {
        searchParams.append('contractValueMin', filters.contractValueMin.toString());
      }
      if (filters.contractValueMax) {
        searchParams.append('contractValueMax', filters.contractValueMax.toString());
      }
      if (filters.storageUnitId) {
        searchParams.append('storageUnitId', filters.storageUnitId);
      }

      const baseUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.CONTRACTS.BASE);
      const url = `${baseUrl}?${searchParams.toString()}`;
      console.log('[ContractManagement] Searching contracts via API:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ContractManagement] Search contracts failed:', data);
        return {
          success: false,
          error: data.message || 'Failed to search contracts'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.message || 'Failed to search contracts'
        };
      }

      // Transform API response to match expected format
      const result: ContractSearchResult = {
        contracts: data.data.data,
        totalCount: data.data.pagination.total,
        pageCount: data.data.pagination.totalPages,
        currentPage: data.data.pagination.page,
        hasNextPage: data.data.pagination.hasNext,
        hasPreviousPage: data.data.pagination.hasPrev
      };

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('[ContractManagement] Search contracts error:', error);
      return {
        success: false,
        error: 'Network error while searching contracts'
      };
    }
  }

  /**
   * Get all storage units
   */
  public async getStorageUnits(): Promise<ApiResponse<StorageUnit[]>> {
    try {
      await this.simulateDelay(300);

      return {
        success: true,
        data: MOCK_STORAGE_UNITS
      };

    } catch (error) {
      console.error('[ContractManagement] Get storage units error:', error);
      return {
        success: false,
        error: 'Failed to fetch storage units'
      };
    }
  }

  /**
   * Get contracts by storage unit
   */
  public async getContractsByStorageUnit(unitId: string): Promise<ApiResponse<Contract[]>> {
    try {
      await this.simulateDelay(400);

      const contracts = MOCK_CONTRACTS.filter(c => c.storageUnitId === unitId);

      return {
        success: true,
        data: contracts
      };

    } catch (error) {
      console.error('[ContractManagement] Get contracts by storage unit error:', error);
      return {
        success: false,
        error: 'Failed to fetch contracts for storage unit'
      };
    }
  }

  // Private helper methods

  private async findOrCreateAvailableStorageUnit(): Promise<StorageUnit> {
    // Find an existing unit with space
    let availableUnit = MOCK_STORAGE_UNITS.find(unit => !unit.isFull);

    if (!availableUnit) {
      // Create new storage unit
      availableUnit = {
        id: `unit-${storageUnitCounter}`,
        unitNumber: storageUnitCounter,
        contractCount: 0,
        contracts: [],
        isFull: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      MOCK_STORAGE_UNITS.push(availableUnit);
      storageUnitCounter++;
    }

    return availableUnit;
  }

  private async uploadFile(file: File): Promise<FileUploadResult> {
    try {
      // Simulate file upload delay
      await this.simulateDelay(1000);

      // In real implementation, this would upload to a storage service
      // For now, we'll simulate a successful upload
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `/uploads/contracts/${fileName}`;

      return {
        success: true,
        filePath,
        fileName,
        fileSize: file.size
      };

    } catch (error) {
      console.error('[ContractManagement] File upload error:', error);
      return {
        success: false,
        error: 'File upload failed'
      };
    }
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const contractManagementService = ContractManagementService.getInstance(); 