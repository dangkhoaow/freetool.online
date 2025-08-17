'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Table2, AlertCircle, CheckCircle2, Upload, FileSpreadsheet } from "lucide-react";
import { contractManagementExportService, contractManagementService, ExportOptions } from '@/lib/services/contract-management';
import { useLanguage } from '../contexts/language-context';

export default function ContractExport() {
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);
  const [error, setError] = useState('');

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeFiles: false,
    dateRange: undefined,
    filters: undefined
  });

  const [dateRange, setDateRange] = useState({
    enabled: false,
    from: '',
    to: ''
  });

  const [contractTypeFilter, setContractTypeFilter] = useState('');
  
  // Additional filter states
  const [filters, setFilters] = useState({
    companyName: '',
    contractNumber: '',
    winningBidDecisionNumber: '',
    contractValueMin: '',
    contractValueMax: '',
    storageUnitId: ''
  });

  // Company autocomplete states
  const [companyNames, setCompanyNames] = useState<string[]>([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  // Import states
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');

  const contractTypes = [
    { value: 'Pharmaceuticals', label: t('contractTypes.pharmaceuticals') },
    { value: 'MedicalEquipment', label: t('contractTypes.medicalEquipment') },
    { value: 'Services', label: t('contractTypes.services') },
    { value: 'Consulting', label: t('contractTypes.consulting') },
    { value: 'Other', label: t('contractTypes.other') }
  ];

  // Load company names on component mount
  useEffect(() => {
    const loadCompanyNames = async () => {
      try {
        console.log('[ContractExport] Loading company names...');
        const response = await contractManagementService.getCompanyNames();
        console.log('[ContractExport] Company names response:', response);
        if (response.success && response.data) {
          console.log('[ContractExport] Setting company names:', response.data);
          setCompanyNames(response.data);
        } else {
          console.error('[ContractExport] Failed to load company names:', response.error);
        }
      } catch (error) {
        console.error('[ContractExport] Error loading company names:', error);
      }
    };

    loadCompanyNames();
  }, []);

  const handleImport = async () => {
    if (!selectedFile) {
      setImportError('Vui lòng chọn file để import');
      return;
    }

    setIsImporting(true);
    setImportError('');
    setImportResult(null);

    try {
      console.log('[ContractImport] Starting import with file:', selectedFile.name);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('format', importFormat);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/contract-management/imports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('contractManagementToken')}`
        },
        credentials: 'include',
        body: formData
      });

      const result = await response.json();
      console.log('[ContractImport] Import response:', result);

      if (response.ok && result.success) {
        setImportResult(result.data);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('import-file-input') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        setImportError(result.message || 'Import thất bại');
      }
    } catch (error) {
      console.error('[ContractImport] Import error:', error);
      setImportError('Lỗi khi import dữ liệu');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = importFormat === 'csv' ? ['.csv', 'text/csv'] : ['.json', 'application/json'];
      const isValidType = allowedTypes.some(type => 
        file.type === type || file.name.toLowerCase().endsWith(type.replace('text/', '').replace('application/', ''))
      );

      if (!isValidType) {
        setImportError(`File phải có định dạng ${importFormat.toUpperCase()}`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setImportError('File không được vượt quá 10MB');
        return;
      }

      setSelectedFile(file);
      setImportError('');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError('');
    setExportResult(null);

    try {
      // Prepare export options
      const options: ExportOptions = {
        format: exportOptions.format,
        includeFiles: exportOptions.includeFiles,
        dateRange: dateRange.enabled ? {
          from: dateRange.from,
          to: dateRange.to
        } : undefined,
        filters: {
          ...(contractTypeFilter && { contractType: contractTypeFilter as any }),
          ...(filters.companyName && { companyName: filters.companyName }),
          ...(filters.contractNumber && { contractNumber: filters.contractNumber }),
          ...(filters.winningBidDecisionNumber && { winningBidDecisionNumber: filters.winningBidDecisionNumber }),
          ...(filters.contractValueMin && { contractValueMin: parseFloat(filters.contractValueMin) }),
          ...(filters.contractValueMax && { contractValueMax: parseFloat(filters.contractValueMax) }),
          ...(filters.storageUnitId && { storageUnitId: filters.storageUnitId })
        }
      };

      console.log('[ContractExport] Exporting with options:', options);
      const response = await contractManagementExportService.exportContracts(options);
      console.log('[ContractExport] Export response:', response);

      if (response.success && response.data) {
        console.log('[ContractExport] Export successful, setting result:', response.data);
        setExportResult(response.data);
        
        // Auto-download the file
        if (response.data.downloadUrl) {
          console.log('[ContractExport] Auto-downloading file:', response.data.fileName);
          const link = document.createElement('a');
          link.href = response.data.downloadUrl;
          link.download = response.data.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          console.warn('[ContractExport] No download URL provided in response');
        }
      } else {
        console.error('[ContractExport] Export failed:', response.error || response.message);
        setError(response.error || response.message || t('export.errorExporting'));
      }
    } catch (error) {
      console.error('Export error:', error);
      setError(t('export.errorExporting'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDateRangeToggle = (enabled: boolean) => {
    setDateRange(prev => ({ ...prev, enabled }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Contracts
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import Contracts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Export Contracts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>{t('export.format')}</Label>
              <Select
                value={exportOptions.format}
                onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value as 'csv' | 'json' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center space-x-2">
                      <Table2 className="h-4 w-4" />
                      <span>{t('export.csv')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>{t('export.json')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Include Files Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeFiles"
                checked={exportOptions.includeFiles}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeFiles: !!checked }))
                }
              />
              <Label htmlFor="includeFiles" className="text-sm">
                {t('export.includeFiles')}
              </Label>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dateRange"
                  checked={dateRange.enabled}
                  onCheckedChange={handleDateRangeToggle}
                />
                <Label htmlFor="dateRange" className="text-sm">
                  {t('export.customRange')}
                </Label>
              </div>

              {dateRange.enabled && (
                <div className="grid grid-cols-2 gap-2 ml-6">
                  <div className="space-y-1">
                    <Label className="text-xs">{t('export.from')}</Label>
                    <Input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('export.to')}</Label>
                    <Input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contract Type Filter */}
            <div className="space-y-2">
              <Label>Loại Hợp Đồng</Label>
              <Select
                value={contractTypeFilter || 'all'}
                onValueChange={(value) => setContractTypeFilter(value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="Pharmaceuticals">Dược Phẩm</SelectItem>
                  <SelectItem value="MedicalEquipment">Thiết Bị Y Tế</SelectItem>
                  <SelectItem value="Services">Dịch Vụ</SelectItem>
                  <SelectItem value="Consulting">Tư Vấn</SelectItem>
                  <SelectItem value="Other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company Name Filter */}
            <div className="space-y-2">
              <Label>Tên Công Ty</Label>
              <div className="relative">
                <Input
                  placeholder="Nhập tên công ty để lọc..."
                  value={filters.companyName}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, companyName: e.target.value }));
                    setShowCompanyDropdown(true);
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCompanyDropdown(false), 200)}
                  autoComplete="off"
                />
                {showCompanyDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {(() => {
                      const filteredCompanies = filters.companyName.trim() === '' 
                        ? companyNames.slice(0, 5)  // Show first 5 companies when input is empty
                        : companyNames
                            .filter(company => 
                              company.toLowerCase().includes(filters.companyName.toLowerCase())
                            )
                            .slice(0, 5);
                      
                      return (
                        <>
                          {filteredCompanies.length > 0 && (
                            <div className="px-3 py-1.5 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                              {filters.companyName.trim() === '' ? 'Tất cả công ty' : 'Chọn công ty'}
                            </div>
                          )}
                          
                          {/* Existing companies */}
                          {filteredCompanies.map((company, index) => (
                            <div
                              key={index}
                              className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm group"
                              onClick={() => {
                                setFilters(prev => ({ ...prev, companyName: company }));
                                setShowCompanyDropdown(false);
                              }}
                            >
                              <span className="text-gray-700">{company}</span>
                            </div>
                          ))}
                          
                          {/* No results message */}
                          {filteredCompanies.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              Không tìm thấy công ty nào
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Contract Number Filter */}
            <div className="space-y-2">
              <Label>Số Hợp Đồng</Label>
              <Input
                placeholder="Nhập số hợp đồng để lọc..."
                value={filters.contractNumber}
                onChange={(e) => setFilters(prev => ({ ...prev, contractNumber: e.target.value }))}
              />
            </div>

            {/* Winning Bid Decision Number Filter */}
            <div className="space-y-2">
              <Label>Số Quyết Định Trúng Thầu</Label>
              <Input
                placeholder="Nhập số quyết định để lọc..."
                value={filters.winningBidDecisionNumber}
                onChange={(e) => setFilters(prev => ({ ...prev, winningBidDecisionNumber: e.target.value }))}
              />
            </div>

            {/* Contract Value Range Filter */}
            <div className="space-y-2">
              <Label>Khoảng Giá Trị Hợp Đồng (VND)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Giá trị tối thiểu"
                  value={filters.contractValueMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, contractValueMin: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Giá trị tối đa"
                  value={filters.contractValueMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, contractValueMax: e.target.value }))}
                />
              </div>
            </div>

            {/* Storage Unit Filter */}
            <div className="space-y-2">
              <Label>Đơn Vị Lưu Trữ</Label>
              <Input
                placeholder="Nhập mã đơn vị lưu trữ..."
                value={filters.storageUnitId}
                onChange={(e) => setFilters(prev => ({ ...prev, storageUnitId: e.target.value }))}
              />
            </div>

            {/* Clear Filters Button */}
            <Button
              variant="outline"
              onClick={() => {
                setContractTypeFilter('');
                setFilters({
                  companyName: '',
                  contractNumber: '',
                  winningBidDecisionNumber: '',
                  contractValueMin: '',
                  contractValueMax: '',
                  storageUnitId: ''
                });
              }}
              className="w-full"
            >
              Xóa Tất Cả Bộ Lọc
            </Button>
          </CardContent>
        </Card>

        {/* Right Column - Export Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Format:</span>
                <span className="font-medium uppercase">{exportOptions.format}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Include Files:</span>
                <span className="font-medium">
                  {exportOptions.includeFiles ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date Filter:</span>
                <span className="font-medium">
                  {dateRange.enabled ? 'Custom Range' : 'All Data'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Type Filter:</span>
                <span className="font-medium">
                  {contractTypeFilter ? (contractTypeFilter === 'Pharmaceuticals' ? 'Dược Phẩm' :
                   contractTypeFilter === 'MedicalEquipment' ? 'Thiết Bị Y Tế' :
                   contractTypeFilter === 'Services' ? 'Dịch Vụ' :
                   contractTypeFilter === 'Consulting' ? 'Tư Vấn' : contractTypeFilter) : 'Tất cả loại'}
                </span>
              </div>
              
              {/* Active Filters Summary */}
              {(filters.companyName || filters.contractNumber || filters.winningBidDecisionNumber || 
                filters.contractValueMin || filters.contractValueMax || filters.storageUnitId) && (
                <div className="border-t pt-3 mt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Bộ lọc đang áp dụng:</div>
                  <div className="space-y-1 text-xs text-gray-600">
                    {filters.companyName && (
                      <div>• Tên công ty: {filters.companyName}</div>
                    )}
                    {filters.contractNumber && (
                      <div>• Số hợp đồng: {filters.contractNumber}</div>
                    )}
                    {filters.winningBidDecisionNumber && (
                      <div>• Số QĐ trúng thầu: {filters.winningBidDecisionNumber}</div>
                    )}
                    {(filters.contractValueMin || filters.contractValueMax) && (
                      <div>• Giá trị: {filters.contractValueMin ? `≥${parseInt(filters.contractValueMin).toLocaleString('vi-VN')}` : ''}{filters.contractValueMin && filters.contractValueMax ? ' và ' : ''}{filters.contractValueMax ? `≤${parseInt(filters.contractValueMax).toLocaleString('vi-VN')}` : ''} VND</div>
                    )}
                    {filters.storageUnitId && (
                      <div>• Đơn vị lưu trữ: {filters.storageUnitId}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Export Button */}
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full"
              size="lg"
            >
              {isExporting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t('export.exporting')}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>{t('export.exportData')}</span>
                </div>
              )}
            </Button>

            {/* Format Info */}
            <div className="text-xs text-gray-500 space-y-1">
              {exportOptions.format === 'csv' ? (
                <>
                  <p>• CSV files can be opened in Excel</p>
                  <p>• Compatible with spreadsheet applications</p>
                  <p>• Best for data analysis and reporting</p>
                </>
              ) : (
                <>
                  <p>• JSON format for programmatic access</p>
                  <p>• Includes complete data structure</p>
                  <p>• Best for API integrations</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Import Contracts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Import Format Selection */}
              <div className="space-y-2">
                <Label>Import Format</Label>
                <Select
                  value={importFormat}
                  onValueChange={(value) => setImportFormat(value as 'csv' | 'json')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>CSV File</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>JSON File</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="import-file-input">Select File</Label>
                <Input
                  id="import-file-input"
                  type="file"
                  accept={importFormat === 'csv' ? '.csv,text/csv' : '.json,application/json'}
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <div className="text-sm text-gray-600 mt-2">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </div>
                )}
              </div>

              {/* Import Button */}
              <Button
                onClick={handleImport}
                disabled={isImporting || !selectedFile}
                className="w-full"
              >
                {isImporting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Importing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Import Contracts</span>
                  </div>
                )}
              </Button>

              {/* Import Guidelines */}
              <div className="text-xs text-gray-500 space-y-2 mt-4">
                <p className="font-semibold">Import Guidelines:</p>
                {importFormat === 'csv' ? (
                  <div className="space-y-1">
                    <p>• CSV file should have headers: companyName, contractNumber, contractStartDate, contractEndDate, contractValue, etc.</p>
                    <p>• Date format: YYYY-MM-DD or DD/MM/YYYY</p>
                    <p>• Contract values should be numbers without currency symbols</p>
                    <p>• Maximum file size: 10MB</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p>• JSON file should contain an array of contract objects</p>
                    <p>• Each contract should have required fields: companyName, contractNumber, etc.</p>
                    <p>• Date format: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)</p>
                    <p>• Maximum file size: 10MB</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Import Status Messages */}
          {importError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}

          {importResult && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-medium">Import Completed Successfully!</p>
                  <div className="text-sm space-y-1">
                    <div>Total records processed: {importResult.totalRecords}</div>
                    <div>Successfully imported: {importResult.successCount}</div>
                    <div>Failed records: {importResult.failureCount}</div>
                    {importResult.duplicates > 0 && (
                      <div>Duplicates skipped: {importResult.duplicates}</div>
                    )}
                  </div>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium text-sm">Import Errors:</p>
                      <div className="max-h-32 overflow-y-auto bg-red-50 p-2 rounded text-xs">
                        {importResult.errors.map((error: any, index: number) => (
                          <div key={index} className="mb-1">
                            Row {error.row}: {error.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {exportResult && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">{t('export.exported')}</p>
              <div className="text-sm space-y-1">
                <div>File: {exportResult.fileName}</div>
                <div>Size: {formatFileSize(exportResult.fileSize)}</div>
                <div>Records: {exportResult.recordCount}</div>
                <div>Exported: {formatDate(exportResult.exportedAt)}</div>
              </div>
              {exportResult.downloadUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = exportResult.downloadUrl;
                    link.download = exportResult.fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="mt-2"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download Again
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 