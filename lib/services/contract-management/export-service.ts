import {
  Contract,
  ExportOptions,
  ExportResult,
  ContractSearchFilters,
  ApiResponse
} from './types';
import { contractManagementService } from './contract-service';

class ContractManagementExportService {
  private static instance: ContractManagementExportService;

  private constructor() {}

  public static getInstance(): ContractManagementExportService {
    if (!ContractManagementExportService.instance) {
      ContractManagementExportService.instance = new ContractManagementExportService();
    }
    return ContractManagementExportService.instance;
  }

  /**
   * Export contracts to CSV or JSON format
   */
  public async exportContracts(options: ExportOptions): Promise<ApiResponse<ExportResult>> {
    try {
      // Simulate API delay
      await this.simulateDelay(1000);

      // Fetch contracts based on filters
      const filters: ContractSearchFilters = options.filters || {};
      
      // Apply date range filter if specified
      if (options.dateRange) {
        filters.startDateFrom = options.dateRange.from;
        filters.startDateTo = options.dateRange.to;
      }

      const contractsResponse = await contractManagementService.searchContracts(
        filters,
        { field: 'createdAt', direction: 'desc' },
        { page: 1, limit: 10000 } // Export all matching contracts
      );

      if (!contractsResponse.success) {
        return {
          success: false,
          error: 'Failed to fetch contracts for export'
        };
      }

      const contracts = contractsResponse.data!.contracts;

      if (contracts.length === 0) {
        return {
          success: false,
          error: 'No contracts found matching the specified criteria'
        };
      }

      // Generate export based on format
      let exportData: string;
      let fileName: string;
      let mimeType: string;

      if (options.format === 'csv') {
        exportData = this.generateCSV(contracts, options.includeFiles);
        fileName = `contracts_export_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        exportData = this.generateJSON(contracts, options.includeFiles);
        fileName = `contracts_export_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      // Create blob and generate download URL
      const blob = new Blob([exportData], { type: mimeType });
      const downloadUrl = URL.createObjectURL(blob);

      const result: ExportResult = {
        downloadUrl,
        fileName,
        fileSize: blob.size,
        recordCount: contracts.length,
        exportedAt: new Date().toISOString()
      };

      return {
        success: true,
        data: result,
        message: `Successfully exported ${contracts.length} contracts`
      };

    } catch (error) {
      console.error('[ContractManagementExport] Export contracts error:', error);
      return {
        success: false,
        error: 'Failed to export contracts'
      };
    }
  }

  /**
   * Export contracts using predefined template
   */
  public async exportWithTemplate(
    templateName: string, 
    filters: ContractSearchFilters = {}
  ): Promise<ApiResponse<ExportResult>> {
    try {
      const template = this.getExportTemplate(templateName);
      
      if (!template) {
        return {
          success: false,
          error: `Export template '${templateName}' not found`
        };
      }

      return await this.exportContracts({
        format: template.format,
        includeFiles: template.includeFiles,
        filters: { ...filters, ...template.filters }
      });

    } catch (error) {
      console.error('[ContractManagementExport] Export with template error:', error);
      return {
        success: false,
        error: 'Failed to export using template'
      };
    }
  }

  /**
   * Get available export templates
   */
  public getExportTemplates(): Array<{
    name: string;
    description: string;
    format: 'csv' | 'json';
    includeFiles: boolean;
    filters?: ContractSearchFilters;
  }> {
    return [
      {
        name: 'all_contracts',
        description: 'All contracts with complete information',
        format: 'csv',
        includeFiles: true
      },
      {
        name: 'active_contracts',
        description: 'Only active contracts',
        format: 'csv',
        includeFiles: false,
        filters: { status: 'Active' }
      },
      {
        name: 'pharmaceuticals_only',
        description: 'Pharmaceutical contracts only',
        format: 'csv',
        includeFiles: true,
        filters: { contractType: 'Pharmaceuticals' }
      },
      {
        name: 'medical_equipment_only',
        description: 'Medical equipment contracts only',
        format: 'csv',
        includeFiles: true,
        filters: { contractType: 'MedicalEquipment' }
      },
      {
        name: 'contracts_json',
        description: 'All contracts in JSON format for data processing',
        format: 'json',
        includeFiles: false
      },
      {
        name: 'high_value_contracts',
        description: 'Contracts with value over 5 billion VND',
        format: 'csv',
        includeFiles: true,
        filters: { contractValueMin: 5000000000 }
      }
    ];
  }

  /**
   * Preview export data (first 10 records)
   */
  public async previewExport(options: ExportOptions): Promise<ApiResponse<{ preview: string; totalRecords: number }>> {
    try {
      await this.simulateDelay(500);

      // Fetch limited records for preview
      const contractsResponse = await contractManagementService.searchContracts(
        options.filters || {},
        { field: 'createdAt', direction: 'desc' },
        { page: 1, limit: 10 }
      );

      if (!contractsResponse.success) {
        return {
          success: false,
          error: 'Failed to fetch contracts for preview'
        };
      }

      const contracts = contractsResponse.data!.contracts;
      const totalRecords = contractsResponse.data!.totalCount;

      let preview: string;
      if (options.format === 'csv') {
        preview = this.generateCSV(contracts, options.includeFiles);
      } else {
        preview = this.generateJSON(contracts, options.includeFiles);
      }

      return {
        success: true,
        data: { preview, totalRecords }
      };

    } catch (error) {
      console.error('[ContractManagementExport] Preview export error:', error);
      return {
        success: false,
        error: 'Failed to generate preview'
      };
    }
  }

  // Private helper methods

  private generateCSV(contracts: Contract[], includeFiles: boolean): string {
    // Define CSV headers
    const headers = [
      'ID',
      'Company Name',
      'Contract Number',
      'Start Date',
      'End Date',
      'Duration (Months)',
      'Contract Value',
      'Winning Bid Decision Number',
      'Contract Type',
      'Status',
      'Storage Unit ID',
      'Position in Unit',
      'Created At',
      'Updated At',
      'Created By',
      'Notes'
    ];

    if (includeFiles) {
      headers.push('PDF File Path', 'PDF File Name', 'PDF File Size');
    }

    // Create CSV rows
    const rows = contracts.map(contract => {
      const row = [
        this.escapeCSV(contract.id),
        this.escapeCSV(contract.companyName),
        this.escapeCSV(contract.contractNumber),
        contract.contractStartDate,
        contract.contractEndDate,
        contract.contractDurationMonths.toString(),
        contract.contractValue.toString(),
        this.escapeCSV(contract.winningBidDecisionNumber),
        this.escapeCSV(contract.contractType),
        this.escapeCSV(contract.status),
        this.escapeCSV(contract.storageUnitId),
        contract.positionInUnit.toString(),
        contract.createdAt,
        contract.updatedAt,
        this.escapeCSV(contract.createdBy),
        this.escapeCSV(contract.notes || '')
      ];

      if (includeFiles) {
        row.push(
          this.escapeCSV(contract.pdfFilePath || ''),
          this.escapeCSV(contract.pdfFileName || ''),
          (contract.pdfFileSize || 0).toString()
        );
      }

      return row;
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csvContent;
  }

  private generateJSON(contracts: Contract[], includeFiles: boolean): string {
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        totalRecords: contracts.length,
        includeFiles,
        format: 'json'
      },
      contracts: contracts.map(contract => {
        const exportedContract: any = { ...contract };
        
        if (!includeFiles) {
          delete exportedContract.pdfFilePath;
          delete exportedContract.pdfFileName;
          delete exportedContract.pdfFileSize;
        }

        return exportedContract;
      })
    };

    return JSON.stringify(exportData, null, 2);
  }

  private escapeCSV(value: string): string {
    if (!value) return '';
    
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    
    return value;
  }

  private getExportTemplate(templateName: string) {
    const templates = this.getExportTemplates();
    return templates.find(template => template.name === templateName);
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const contractManagementExportService = ContractManagementExportService.getInstance(); 