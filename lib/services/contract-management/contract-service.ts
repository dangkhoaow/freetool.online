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
   * Create a new contract with automatic storage assignment
   */
  public async createContract(contractData: ContractFormData, userId: string): Promise<ApiResponse<Contract>> {
    try {
      // Simulate API delay
      await this.simulateDelay(800);

      // Find or create storage unit with available space
      const storageUnit = await this.findOrCreateAvailableStorageUnit();

      // Handle file upload if provided
      let fileUploadResult: FileUploadResult | null = null;
      if (contractData.pdfFile) {
        fileUploadResult = await this.uploadFile(contractData.pdfFile);
        if (!fileUploadResult.success) {
          return {
            success: false,
            error: 'Failed to upload PDF file'
          };
        }
      }

      // Create contract
      const contract: Contract = {
        id: `contract-${contractIdCounter}`,
        companyName: contractData.companyName,
        contractNumber: contractData.contractNumber,
        contractStartDate: contractData.contractStartDate,
        contractEndDate: contractData.contractEndDate,
        contractDurationMonths: contractData.contractDurationMonths,
        contractValue: contractData.contractValue,
        winningBidDecisionNumber: contractData.winningBidDecisionNumber,
        contractType: contractData.contractType,
        storageUnitId: storageUnit.id,
        positionInUnit: storageUnit.contractCount + 1,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
        notes: contractData.notes,
        ...(fileUploadResult && {
          pdfFilePath: fileUploadResult.filePath,
          pdfFileName: fileUploadResult.fileName,
          pdfFileSize: fileUploadResult.fileSize
        })
      };

      // Add to storage
      MOCK_CONTRACTS.push(contract);
      contractIdCounter++;

      // Update storage unit
      storageUnit.contracts.push(contract.id);
      storageUnit.contractCount++;
      storageUnit.isFull = storageUnit.contractCount >= 10;
      storageUnit.updatedAt = new Date().toISOString();

      return {
        success: true,
        data: contract,
        message: 'Contract created successfully'
      };

    } catch (error) {
      console.error('[ContractManagement] Create contract error:', error);
      return {
        success: false,
        error: 'Failed to create contract'
      };
    }
  }

  /**
   * Get contract by ID
   */
  public async getContract(id: string): Promise<ApiResponse<Contract>> {
    try {
      await this.simulateDelay(300);

      const contract = MOCK_CONTRACTS.find(c => c.id === id);
      
      if (!contract) {
        return {
          success: false,
          error: 'Contract not found'
        };
      }

      return {
        success: true,
        data: contract
      };

    } catch (error) {
      console.error('[ContractManagement] Get contract error:', error);
      return {
        success: false,
        error: 'Failed to fetch contract'
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
      await this.simulateDelay(500);

      let filteredContracts = [...MOCK_CONTRACTS];

      // Apply filters
      if (filters.companyName) {
        const searchTerm = filters.companyName.toLowerCase();
        filteredContracts = filteredContracts.filter(c => 
          c.companyName.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.winningBidDecisionNumber) {
        filteredContracts = filteredContracts.filter(c => 
          c.winningBidDecisionNumber.includes(filters.winningBidDecisionNumber!)
        );
      }

      if (filters.contractType) {
        filteredContracts = filteredContracts.filter(c => 
          c.contractType === filters.contractType
        );
      }

      if (filters.status) {
        filteredContracts = filteredContracts.filter(c => 
          c.status === filters.status
        );
      }

      if (filters.startDateFrom) {
        filteredContracts = filteredContracts.filter(c => 
          c.contractStartDate >= filters.startDateFrom!
        );
      }

      if (filters.startDateTo) {
        filteredContracts = filteredContracts.filter(c => 
          c.contractStartDate <= filters.startDateTo!
        );
      }

      if (filters.contractValueMin) {
        filteredContracts = filteredContracts.filter(c => 
          c.contractValue >= filters.contractValueMin!
        );
      }

      if (filters.contractValueMax) {
        filteredContracts = filteredContracts.filter(c => 
          c.contractValue <= filters.contractValueMax!
        );
      }

      // Apply sorting
      filteredContracts.sort((a, b) => {
        const aValue = a[sort.field] as any;
        const bValue = b[sort.field] as any;
        
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sort.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sort.direction === 'asc' ? -1 : 1;
        
        if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });

      // Apply pagination
      const totalCount = filteredContracts.length;
      const pageCount = Math.ceil(totalCount / pagination.limit);
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

      const result: ContractSearchResult = {
        contracts: paginatedContracts,
        totalCount,
        pageCount,
        currentPage: pagination.page,
        hasNextPage: pagination.page < pageCount,
        hasPreviousPage: pagination.page > 1
      };

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('[ContractManagement] Search contracts error:', error);
      return {
        success: false,
        error: 'Failed to search contracts'
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