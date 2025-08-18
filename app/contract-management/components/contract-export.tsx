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
  const { t, currentLanguage } = useLanguage();
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
      setImportError(t('import.selectFileRequired'));
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
        setImportError(result.message || t('import.failed'));
      }
    } catch (error) {
      console.error('[ContractImport] Import error:', error);
      setImportError(t('import.errorImporting'));
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
        setImportError(t('import.invalidFileType'));
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setImportError(t('import.fileTooLarge'));
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
    const locale = currentLanguage === 'vi' ? 'vi-VN' : 'en-US';
    return new Date(dateString).toLocaleString(locale);
  };

  const numberLocale = currentLanguage === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <div className="space-y-6">
      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('export.tabExport')}
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {t('export.tabImport')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{t('export.tabExport')}</CardTitle>
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
              <Label>{t('export.contractType_')}</Label>
              <Select
                value={contractTypeFilter || 'all'}
                onValueChange={(value) => setContractTypeFilter(value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('contracts.allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('export.allTypes')}</SelectItem>
                  {contractTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company Name Filter */}
            <div className="space-y-2">
              <Label>{t('contracts.companyName')}</Label>
              <div className="relative">
                <Input
                  placeholder={t('contracts.enterCompanyFilter')}
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
                              {filters.companyName.trim() === '' ? t('contracts.allCompanies') : t('contracts.selectCompany')}
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
                              {t('contracts.noResults')}
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
              <Label>{t('contracts.contractNumber')}</Label>
              <Input
                placeholder={t('contracts.enterContractNumber')}
                value={filters.contractNumber}
                onChange={(e) => setFilters(prev => ({ ...prev, contractNumber: e.target.value }))}
              />
            </div>

            {/* Winning Bid Decision Number Filter */}
            <div className="space-y-2">
              <Label>{t('contracts.bidDecisionNumber')}</Label>
              <Input
                placeholder={t('contracts.enterBidDecision')}
                value={filters.winningBidDecisionNumber}
                onChange={(e) => setFilters(prev => ({ ...prev, winningBidDecisionNumber: e.target.value }))}
              />
            </div>

            {/* Contract Value Range Filter */}
            <div className="space-y-2">
              <Label>{t('contracts.value')} ({currentLanguage === 'vi' ? 'VND' : 'USD'})</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder={t('contracts.minValue')}
                  value={filters.contractValueMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, contractValueMin: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder={t('contracts.maxValue')}
                  value={filters.contractValueMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, contractValueMax: e.target.value }))}
                />
              </div>
            </div>

            {/* Storage Unit Filter */}
            <div className="space-y-2">
              <Label>{t('common.storage')}</Label>
              <Input
                placeholder={t('contracts.enterStorageUnit')}
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
              {t('contracts.clear')}
            </Button>
          </CardContent>
        </Card>

        {/* Right Column - Export Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>{t('export.info')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('export.format')}:</span>
                <span className="font-medium uppercase">{exportOptions.format}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">{t('export.includeFiles')}:</span>
                <span className="font-medium">
                  {exportOptions.includeFiles ? t('common.yes') : t('common.no')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">{t('export.dateRange')}:</span>
                <span className="font-medium">
                  {dateRange.enabled ? t('export.customRange') : t('export.allData')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">{t('export.contractType_')}:</span>
                <span className="font-medium">
                  {contractTypeFilter 
                    ? (contractTypes.find(ct => ct.value === contractTypeFilter)?.label || contractTypeFilter)
                    : t('export.allTypes')}
                </span>
              </div>
              
              {/* Active Filters Summary */}
              {(filters.companyName || filters.contractNumber || filters.winningBidDecisionNumber || 
                filters.contractValueMin || filters.contractValueMax || filters.storageUnitId) && (
                <div className="border-t pt-3 mt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">{t('export.activeFilters')}</div>
                  <div className="space-y-1 text-xs text-gray-600">
                    {filters.companyName && (
                      <div>• {t('contracts.companyName')}: {filters.companyName}</div>
                    )}
                    {filters.contractNumber && (
                      <div>• {t('contracts.contractNumber')}: {filters.contractNumber}</div>
                    )}
                    {filters.winningBidDecisionNumber && (
                      <div>• {t('contracts.bidDecisionNumber')}: {filters.winningBidDecisionNumber}</div>
                    )}
                    {(filters.contractValueMin || filters.contractValueMax) && (
                      <div>• {t('contracts.value')}: {filters.contractValueMin && filters.contractValueMax
                        ? `${parseInt(filters.contractValueMin).toLocaleString(numberLocale)} - ${parseInt(filters.contractValueMax).toLocaleString(numberLocale)} VND`
                        : filters.contractValueMin
                          ? `≥${parseInt(filters.contractValueMin).toLocaleString(numberLocale)} VND`
                          : `≤${parseInt(filters.contractValueMax as string).toLocaleString(numberLocale)} VND`}</div>
                    )}
                    {filters.storageUnitId && (
                      <div>• {t('common.storage')}: {filters.storageUnitId}</div>
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
                  <p>{t('export.formatInfoCsv1')}</p>
                  <p>{t('export.formatInfoCsv2')}</p>
                  <p>{t('export.formatInfoCsv3')}</p>
                </>
              ) : (
                <>
                  <p>{t('export.formatInfoJson1')}</p>
                  <p>{t('export.formatInfoJson2')}</p>
                  <p>{t('export.formatInfoJson3')}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{t('import.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Import Format Selection */}
              <div className="space-y-2">
                <Label>{t('import.formatLabel')}</Label>
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

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="import-file-input">{t('import.selectFile')}</Label>
                <Input
                  id="import-file-input"
                  type="file"
                  accept={importFormat === 'csv' ? '.csv,text/csv' : '.json,application/json'}
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <div className="text-sm text-gray-600 mt-2">
                    {t('import.selected')} {selectedFile.name} ({formatFileSize(selectedFile.size)})
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
                    <span>{t('import.importing')}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>{t('import.cta')}</span>
                  </div>
                )}
              </Button>

              {/* Import Guidelines */}
              <div className="text-xs text-gray-500 space-y-2 mt-4">
                <p className="font-semibold">{t('import.guidelines')}</p>
                {importFormat === 'csv' ? (
                  <div className="space-y-1">
                    <p>{t('import.guidelinesCsv1')}</p>
                    <p>{t('import.guidelinesCsv2')}</p>
                    <p>{t('import.guidelinesCsv3')}</p>
                    <p>{t('import.guidelinesCsv4')}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p>{t('import.guidelinesJson1')}</p>
                    <p>{t('import.guidelinesJson2')}</p>
                    <p>{t('import.guidelinesJson3')}</p>
                    <p>{t('import.guidelinesJson4')}</p>
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
                  <p className="font-medium">{t('import.successTitle')}</p>
                  <div className="text-sm space-y-1">
                    <div>{t('import.totalRecords')} {importResult.totalRecords}</div>
                    <div>{t('import.successCount')} {importResult.successCount}</div>
                    <div>{t('import.failureCount')} {importResult.failureCount}</div>
                    {importResult.duplicates > 0 && (
                      <div>{t('import.duplicates')} {importResult.duplicates}</div>
                    )}
                  </div>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium text-sm">{t('import.errorsTitle')}</p>
                      <div className="max-h-32 overflow-y-auto bg-red-50 p-2 rounded text-xs">
                        {importResult.errors.map((error: any, index: number) => (
                          <div key={index} className="mb-1">
                            {t('import.row')} {error.row}: {error.message}
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
                <div>{t('export.fileLabel')} {exportResult.fileName}</div>
                <div>{t('export.sizeLabel')} {formatFileSize(exportResult.fileSize)}</div>
                <div>{t('export.recordsLabel')} {exportResult.recordCount}</div>
                <div>{t('export.exportedAtLabel')} {formatDate(exportResult.exportedAt)}</div>
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
                  {t('export.downloadAgain')}
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 