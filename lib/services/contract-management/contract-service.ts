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
import { CONTRACT_MANAGEMENT_CONFIG, handleAuthError } from './config';

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
        contractType: 'MedicalEquipment',
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
        contractNumberAppendix: contractData.contractNumberAppendix,
        phisicalStorageUnit: contractData.phisicalStorageUnit,
        contractStartDate: contractData.contractStartDate,
        contractEndDate: contractData.contractEndDate,
        contractDurationMonths: contractData.contractDurationMonths,
        contractValue: contractData.contractValue,
        winningBidDecisionNumber: contractData.winningBidDecisionNumber,
        contractType: contractData.contractType,
        notes: contractData.notes,
        status: contractData.status
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

      // Handle file upload if provided
      if (contractData.files && contractData.files.length > 0) {
        try {
          const fileUploadResult = await this.uploadFiles(contractData.files, data.data.id);
          if (!fileUploadResult.success) {
            console.warn('[ContractManagement] File upload failed:', fileUploadResult.error);
            // Continue with contract creation even if file upload fails
          } else {
            console.log('[ContractManagement] Files uploaded successfully for contract:', data.data.id);
            if (fileUploadResult.errors && fileUploadResult.errors.length > 0) {
              console.warn('[ContractManagement] Some files failed to upload:', fileUploadResult.errors);
            }
          }
        } catch (fileError) {
          console.warn('[ContractManagement] File upload failed:', fileError);
          // Continue with contract creation even if file upload fails
        }
      } else if (contractData.pdfFile) {
        // Legacy single file support
        try {
          const fileUploadResult = await this.uploadFile(contractData.pdfFile, data.data.id);
          if (!fileUploadResult.success) {
            console.warn('[ContractManagement] File upload failed:', fileUploadResult.error);
            // Continue with contract creation even if file upload fails
          } else {
            console.log('[ContractManagement] File uploaded successfully for contract:', data.data.id);
          }
        } catch (fileError) {
          console.warn('[ContractManagement] File upload failed:', fileError);
          // Continue with contract creation even if file upload fails
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
        error: 'Error creating contract'
      };
    }
  }


  /**
   * Delete contract
   */
  public async deleteContract(id: string): Promise<ApiResponse<void>> {
    try {
      const deleteUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.CONTRACTS.BY_ID(id));
      console.log('[ContractManagement] Deleting contract via API:', deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ContractManagement] Delete contract failed:', data);
        return {
          success: false,
          error: data.message || 'Failed to delete contract'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.message || 'Failed to delete contract'
        };
      }

      console.log('[ContractManagement] Contract deleted successfully');

      return {
        success: true,
        message: data.message || 'Contract deleted successfully'
      };

    } catch (error) {
      console.error('[ContractManagement] Delete contract error:', error);
      return {
        success: false,
        error: 'Error deleting contract'
      };
    }
  }

  /**
   * Get unique company names for autocomplete
   */
  async getCompanyNames(): Promise<ApiResponse<string[]>> {
    try {
      const companiesUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.CONTRACTS.COMPANIES);
      console.log('[ContractManagement] Getting companies via API:', companiesUrl);
      
      const response = await fetch(companiesUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('[ContractManagement] Failed to fetch companies:', data);
        return { success: false, error: data.message || 'Failed to fetch company names' };
      }

      console.log('[ContractManagement] Companies fetched successfully:', data.data?.length || 0);
      return { success: true, data: data.data || [] };
    } catch (error: any) {
      console.error('[ContractManagement] Error fetching company names:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Get contract by ID
   */
  public async getContract(contractId: string): Promise<ApiResponse<Contract>> {
    try {
            const getUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.CONTRACTS.BY_ID(contractId));
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
      // Prepare contract update data for API
      const apiData: any = {};
      
      if (updates.companyName) apiData.companyName = updates.companyName;
      if (updates.contractNumber) apiData.contractNumber = updates.contractNumber;
      if (updates.contractNumberAppendix !== undefined) apiData.contractNumberAppendix = updates.contractNumberAppendix;
      if (updates.phisicalStorageUnit !== undefined) apiData.phisicalStorageUnit = updates.phisicalStorageUnit;
      if (updates.contractStartDate) apiData.contractStartDate = updates.contractStartDate;
      if (updates.contractEndDate) apiData.contractEndDate = updates.contractEndDate;
      if (updates.contractDurationMonths) apiData.contractDurationMonths = updates.contractDurationMonths;
      if (updates.contractValue) apiData.contractValue = updates.contractValue;
      if (updates.winningBidDecisionNumber) apiData.winningBidDecisionNumber = updates.winningBidDecisionNumber;
      if (updates.contractType) apiData.contractType = updates.contractType;
      if (updates.notes) apiData.notes = updates.notes;

      const updateUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.CONTRACTS.BY_ID(id));
      console.log('[ContractManagement] Updating contract via API:', updateUrl);
      
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(apiData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ContractManagement] Update contract failed:', data);
        return {
          success: false,
          error: data.message || 'Failed to update contract'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.message || 'Failed to update contract'
        };
      }

      // Handle file upload if provided
      if (updates.pdfFile) {
        try {
          const fileUploadResult = await this.uploadFile(updates.pdfFile, id);
          if (!fileUploadResult.success) {
            console.warn('[ContractManagement] File upload failed:', fileUploadResult.error);
            // Continue with contract update even if file upload fails
          } else {
            console.log('[ContractManagement] File uploaded successfully for contract:', id);
          }
        } catch (fileError) {
          console.warn('[ContractManagement] File upload failed:', fileError);
          // Continue with contract update even if file upload fails
        }
      }

      console.log('[ContractManagement] Contract updated successfully');

      return {
        success: true,
        data: data.data,
        message: data.message || 'Contract updated successfully'
      };

    } catch (error) {
      console.error('[ContractManagement] Update contract error:', error);
      return {
        success: false,
        error: 'Network error while updating contract'
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
      if (filters.contractNumber) {
        searchParams.append('contractNumber', filters.contractNumber);
      }
      if (filters.contractNumberAppendix) {
        searchParams.append('contractNumberAppendix', filters.contractNumberAppendix);
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
      const storageUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.STORAGE.UNITS);
      console.log('[ContractManagement] Getting storage units via API:', storageUrl);
      
      const response = await fetch(storageUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ContractManagement] Get storage units failed:', data);
        return {
          success: false,
          error: data.message || 'Failed to fetch storage units'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.message || 'Failed to fetch storage units'
        };
      }

      return {
        success: true,
        data: data.data
      };

    } catch (error) {
      console.error('[ContractManagement] Get storage units error:', error);
      return {
        success: false,
        error: 'Network error while fetching storage units'
      };
    }
  }

  /**
   * Get contracts by storage unit
   */
  public async getContractsByStorageUnit(unitId: string): Promise<ApiResponse<Contract[]>> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('storageUnitId', unitId);
      
      const baseUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.CONTRACTS.BASE);
      const url = `${baseUrl}?${searchParams.toString()}`;
      console.log('[ContractManagement] Getting contracts by storage unit via API:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ContractManagement] Get contracts by storage unit failed:', data);
        return {
          success: false,
          error: data.message || 'Failed to fetch contracts for storage unit'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.message || 'Failed to fetch contracts for storage unit'
        };
      }

      return {
        success: true,
        data: data.data.data || []
      };

    } catch (error) {
      console.error('[ContractManagement] Get contracts by storage unit error:', error);
      return {
        success: false,
        error: 'Network error while fetching contracts for storage unit'
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

  /**
   * Upload multiple files for contract
   */
  public async uploadFiles(files: File[], contractId: string): Promise<{
    success: boolean;
    results?: Array<{
      id: string;
      fileName: string;
      fileSize: string;
      fileType: string;
      uploadedAt: string;
    }>;
    errors?: string[];
    error?: string;
  }> {
    try {
      // Supported file types
      const supportedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'image/svg+xml'
      ];

      // Validate files
      for (const file of files) {
        if (file.size > 25 * 1024 * 1024) { // 25MB limit per file
          return {
            success: false,
            error: `File "${file.name}" exceeds 25MB limit`
          };
        }

        if (!supportedTypes.includes(file.type)) {
          return {
            success: false,
            error: `File type "${file.type}" is not supported for file "${file.name}"`
          };
        }
      }

      if (files.length > 10) {
        return {
          success: false,
          error: 'Maximum 10 files can be uploaded at once'
        };
      }

      // Prepare form data
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file`, file); // Use same key for multiple files
      });
      formData.append('contractId', contractId);

      const uploadUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.FILES.UPLOAD);
      console.log('[ContractManagement] Uploading files via API:', uploadUrl);

      // Get auth headers but exclude Content-Type for file uploads
      const authHeaders = this.getAuthHeaders() as Record<string, string>;
      const uploadHeaders: Record<string, string> = {};
      
      // Only include Authorization header, exclude Content-Type
      if (authHeaders.Authorization) {
        uploadHeaders.Authorization = authHeaders.Authorization;
      }

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: uploadHeaders, // Don't set Content-Type - browser will set multipart/form-data with boundary
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ContractManagement] File upload failed:', data);
        return {
          success: false,
          error: data.message || 'Failed to upload files'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.message || 'Failed to upload files',
          errors: data.errors
        };
      }

      console.log('[ContractManagement] Files uploaded successfully');

      return {
        success: true,
        results: data.data?.uploadResults || [],
        errors: data.data?.uploadErrors || []
      };

    } catch (error) {
      console.error('[ContractManagement] File upload error:', error);
      return {
        success: false,
        error: 'Network error while uploading files'
      };
    }
  }

  /**
   * Upload single file for contract (legacy support)
   */
  public async uploadFile(file: File, contractId: string): Promise<FileUploadResult> {
    const result = await this.uploadFiles([file], contractId);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to upload file'
      };
    }

    const uploadedFile = result.results?.[0];
    if (!uploadedFile) {
      return {
        success: false,
        error: 'No file was uploaded'
      };
    }

    return {
      success: true,
      fileName: uploadedFile.fileName,
      filePath: uploadedFile.fileName, // Use fileName as filePath for compatibility
      fileSize: parseInt(uploadedFile.fileSize)
    };
  }


  /**
   * Download a contract file by ID
   */
  async downloadFile(fileId: string): Promise<{ success: boolean; error?: string; blob?: Blob; fileName?: string }> {
    try {
      const token = localStorage.getItem('contractManagementToken');
      if (!token) {
        console.error('No authentication token found');
        return { success: false, error: 'Authentication required' };
      }

      const downloadUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(`/api/contract-management/files/${fileId}`);
      console.log('Attempting to download from URL:', downloadUrl);
      console.log('Using fileId:', fileId);
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Cookie': `ctr-mgmt-token=${token}`,
        },
        credentials: 'include',
      });

      console.log('Download response status:', response.status);
      console.log('Download response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.message || `Download failed with status ${response.status}` 
        };
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      console.log('Content-Disposition header:', contentDisposition);
      let fileName = 'download';
      
      if (contentDisposition) {
        console.log('Parsing filename from Content-Disposition:', contentDisposition);
        const matches = contentDisposition.match(/filename="(.+)"/);
        console.log('Regex matches:', matches);
        if (matches && matches[1]) {
          fileName = matches[1];
          console.log('Extracted filename:', fileName);
        } else {
          console.log('No filename match found in Content-Disposition header');
        }
      } else {
        console.log('No Content-Disposition header found');
      }

      return {
        success: true,
        blob,
        fileName
      };
    } catch (error) {
      console.error('Download file error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to download file' 
      };
    }
  }

  /**
   * Delete a contract file
   */
  async deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = localStorage.getItem('contractManagementToken');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const deleteUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(`/api/contract-management/files/${fileId}`);
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Cookie': `ctr-mgmt-token=${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.message || `Delete failed with status ${response.status}` 
        };
      }

      const result = await response.json();
      return {
        success: true
      };
    } catch (error) {
      console.error('Delete file error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete file' 
      };
    }
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const contractManagementService = ContractManagementService.getInstance(); 