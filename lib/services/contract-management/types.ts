// Contract Management System Types and Interfaces

export interface Contract {
  id: string;
  companyName: string;
  contractNumber: string;
  contractStartDate: string; // ISO date string
  contractEndDate: string; // ISO date string
  contractDurationMonths: number;
  contractValue: number;
  winningBidDecisionNumber: string;
  contractType: ContractType;
  pdfFilePath?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  storageUnitId: string;
  positionInUnit: number; // 1-10
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  createdBy: string;
  status: ContractStatus;
  notes?: string;
}

export type ContractType = 'Pharmaceuticals' | 'Medical Equipment' | 'Services' | 'Consulting' | 'Other';

export type ContractStatus = 'Active' | 'Expired' | 'Pending' | 'Cancelled' | 'Draft';

export interface StorageUnit {
  id: string;
  unitNumber: number;
  contractCount: number; // Current number of contracts (max 10)
  contracts: string[]; // Array of contract IDs
  isFull: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContractFormData {
  companyName: string;
  contractNumber: string;
  contractStartDate: string;
  contractEndDate: string;
  contractDurationMonths: number;
  contractValue: number;
  winningBidDecisionNumber: string;
  contractType: ContractType;
  pdfFile?: File;
  notes?: string;
}

export interface ContractSearchFilters {
  companyName?: string;
  winningBidDecisionNumber?: string;
  contractType?: ContractType;
  status?: ContractStatus;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  contractValueMin?: number;
  contractValueMax?: number;
  storageUnitId?: string;
}

export interface ContractSearchResult {
  contracts: Contract[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DashboardStats {
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  totalValue: number;
  averageValue: number;
  storageUnitsUsed: number;
  totalStorageUnits: number;
  storageUtilization: number; // percentage
  contractsByType: Record<ContractType, number>;
  contractsByStatus: Record<ContractStatus, number>;
  monthlyContractTrend: MonthlyTrend[];
  upcomingExpirations: Contract[];
}

export interface MonthlyTrend {
  month: string; // YYYY-MM format
  count: number;
  value: number;
}

export interface ExportOptions {
  format: 'csv' | 'json';
  includeFiles: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  filters?: ContractSearchFilters;
}

export interface ExportResult {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  recordCount: number;
  exportedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  lastLogin?: string;
  isActive: boolean;
}

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';

export type Permission = 
  | 'contracts.create'
  | 'contracts.read'
  | 'contracts.update'
  | 'contracts.delete'
  | 'contracts.export'
  | 'storage.manage'
  | 'users.manage'
  | 'dashboard.view';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  message?: string;
  expiresAt?: string;
}

// Language Support Types
export interface Translation {
  [key: string]: string | Translation;
}

export interface LanguageConfig {
  code: string;
  name: string;
  flag: string;
  isDefault?: boolean;
}

// File Upload Types
export interface FileUploadResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Storage Management Types
export interface StorageStats {
  totalUnits: number;
  usedUnits: number;
  availableUnits: number;
  utilizationPercentage: number;
  contractsPerUnit: Record<string, number>;
}

// Sort and Pagination Types
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: keyof Contract;
  direction: SortDirection;
}

export interface PaginationConfig {
  page: number;
  limit: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
} 