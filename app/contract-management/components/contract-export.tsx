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
    contractNumberAppendix: '',
    winningBidDecisionNumber: '',
    contractValueMin: '',
    contractValueMax: '',
    phisicalStorageUnit: ''
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
  
  // Delete all states
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deleteAllResult, setDeleteAllResult] = useState<any>(null);
  const [deleteAllError, setDeleteAllError] = useState('');

  const contractTypes = [
    { value: 'Pharmaceuticals', label: t('contractTypes.pharmaceuticals') },
    { value: 'OrientalMedicine', label: t('contractTypes.orientalMedicine') },
    { value: 'MedicalEquipment', label: t('contractTypes.medicalEquipment') },
    { value: 'Vaccines', label: t('contractTypes.vaccines') },
    { value: 'Biological', label: t('contractTypes.biological') },
    { value: 'Lao', label: t('contractTypes.lao') },
    { value: 'ARV', label: t('contractTypes.arv') },
    { value: 'Chemical', label: t('contractTypes.chemical') },
    { value: 'Services', label: t('contractTypes.services') },
    { value: 'Construction', label: t('contractTypes.construction') },
    { value: 'Consulting', label: t('contractTypes.consulting') },
    { value: 'Maintenance', label: t('contractTypes.maintenance') },
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

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all your contracts? This action cannot be undone.')) {
      return;
    }

    setIsDeletingAll(true);
    setDeleteAllError('');
    setDeleteAllResult(null);

    try {
      console.log('[ContractDeleteAll] Starting delete all contracts...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/contract-management/contracts`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('contractManagementToken')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();
      console.log('[ContractDeleteAll] Delete all response:', result);

      if (response.ok && result.success) {
        setDeleteAllResult(result.data);
        // Clear any previous import results since we've deleted everything
        setImportResult(null);
      } else {
        setDeleteAllError(result.message || 'Failed to delete all contracts');
      }
    } catch (error) {
      console.error('[ContractDeleteAll] Delete all error:', error);
      setDeleteAllError('Error occurred while deleting contracts');
    } finally {
      setIsDeletingAll(false);
    }
  };

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
          ...(filters.contractNumberAppendix && { contractNumberAppendix: filters.contractNumberAppendix }),
          ...(filters.winningBidDecisionNumber && { winningBidDecisionNumber: filters.winningBidDecisionNumber }),
          ...(filters.contractValueMin && { contractValueMin: parseFloat(filters.contractValueMin) }),
          ...(filters.contractValueMax && { contractValueMax: parseFloat(filters.contractValueMax) }),
          ...(filters.phisicalStorageUnit && { phisicalStorageUnit: filters.phisicalStorageUnit })
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
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-semibold dark:text-gray-100">{t('export.tabExport')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
            {/* 4-Column Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Format Selection */}
              <div className="space-y-2">
                <Label className="dark:text-gray-200">{t('export.format')}</Label>
                <Select
                  value={exportOptions.format}
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value as 'csv' | 'json' }))}
                >
                  <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="csv" className="dark:hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <Table2 className="h-4 w-4" />
                        <span>{t('export.csv')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="json" className="dark:hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>{t('export.json')}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contract Type Filter */}
              <div className="space-y-2">
                <Label className="dark:text-gray-200">{t('export.contractType_')}</Label>
                <Select
                  value={contractTypeFilter || 'all'}
                  onValueChange={(value) => setContractTypeFilter(value === 'all' ? '' : value)}
                >
                  <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectValue placeholder={t('contracts.allTypes')} />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="all" className="dark:hover:bg-gray-700">{t('export.allTypes')}</SelectItem>
                    {contractTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="dark:hover:bg-gray-700">{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Company Name Filter */}
              <div className="space-y-2">
                <Label className="dark:text-gray-200">{t('contracts.companyName')}</Label>
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
                    className="dark:bg-gray-800 dark:border-gray-600"
                  />
                  {showCompanyDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {(() => {
                        const filteredCompanies = filters.companyName.trim() === '' 
                          ? companyNames.slice(0, 5)
                          : companyNames
                              .filter(company => 
                                company.toLowerCase().includes(filters.companyName.toLowerCase())
                              )
                              .slice(0, 5);
                        
                        return (
                          <>
                            {filteredCompanies.length > 0 && (
                              <div className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                                {filters.companyName.trim() === '' ? t('contracts.allCompanies') : t('contracts.selectCompany')}
                              </div>
                            )}
                            
                            {filteredCompanies.map((company, index) => (
                              <div
                                key={index}
                                className="flex items-center px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer text-sm group"
                                onClick={() => {
                                  setFilters(prev => ({ ...prev, companyName: company }));
                                  setShowCompanyDropdown(false);
                                }}
                              >
                                <span className="text-gray-700 dark:text-gray-300">{company}</span>
                              </div>
                            ))}
                            
                            {filteredCompanies.length === 0 && (
                              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
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
                <Label className="dark:text-gray-200">{t('contracts.contractNumber')}</Label>
                <Input
                  placeholder={t('contracts.enterContractNumber')}
                  value={filters.contractNumber}
                  onChange={(e) => setFilters(prev => ({ ...prev, contractNumber: e.target.value }))}
                  className="dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
            </div>

            {/* First Row - 4 Fields matching create form order */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Contract Number Appendix Filter */}
              <div className="space-y-2">
                <Label className="dark:text-gray-200">
                  {currentLanguage === 'vi' ? 'Số Phụ lục hợp đồng' : 'Contract Number Appendix'}
                </Label>
                <Input
                  placeholder={currentLanguage === 'vi' ? 'Nhập số Phụ lục hợp đồng' : 'Enter contract number appendix'}
                  value={filters.contractNumberAppendix}
                  onChange={(e) => setFilters(prev => ({ ...prev, contractNumberAppendix: e.target.value }))}
                  className="dark:bg-gray-800 dark:border-gray-600"
                />
              </div>

              {/* Contract Value Min */}
              <div className="space-y-2">
                <Label className="dark:text-gray-200">{t('contracts.minValue')} ({currentLanguage === 'vi' ? 'VND' : 'USD'})</Label>
                <Input
                  type="number"
                  placeholder={t('contracts.minValue')}
                  value={filters.contractValueMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, contractValueMin: e.target.value }))}
                  className="dark:bg-gray-800 dark:border-gray-600"
                />
              </div>

              {/* Contract Value Max */}
              <div className="space-y-2">
                <Label className="dark:text-gray-200">{t('contracts.maxValue')} ({currentLanguage === 'vi' ? 'VND' : 'USD'})</Label>
                <Input
                  type="number"
                  placeholder={t('contracts.maxValue')}
                  value={filters.contractValueMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, contractValueMax: e.target.value }))}
                  className="dark:bg-gray-800 dark:border-gray-600"
                />
              </div>

              {/* Winning Bid Decision Number Filter */}
              <div className="space-y-2">
                <Label className="dark:text-gray-200">{t('contracts.bidDecisionNumber')}</Label>
                <Input
                  placeholder={t('contracts.enterBidDecision')}
                  value={filters.winningBidDecisionNumber}
                  onChange={(e) => setFilters(prev => ({ ...prev, winningBidDecisionNumber: e.target.value }))}
                  className="dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Second Row - 4 Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Physical Storage Unit Filter */}
              <div className="space-y-2">
                <Label className="dark:text-gray-200">
                  {currentLanguage === 'vi' ? 'Đơn vị lưu trữ vật lý' : 'Physical Storage Unit'}
                </Label>
                <Input
                  placeholder={currentLanguage === 'vi' ? 'Nhập đơn vị lưu trữ vật lý' : 'Enter physical storage unit'}
                  value={filters.phisicalStorageUnit}
                  onChange={(e) => setFilters(prev => ({ ...prev, phisicalStorageUnit: e.target.value }))}
                  className="dark:bg-gray-800 dark:border-gray-600"
                />
              </div>

              {/* Empty placeholder for future fields */}
              <div></div>
              <div></div>
              <div></div>
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {/* Date Range Filter */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dateRange"
                    checked={dateRange.enabled}
                    onCheckedChange={handleDateRangeToggle}
                    className="dark:border-gray-600"
                  />
                  <Label htmlFor="dateRange" className="text-sm dark:text-gray-200">
                    {t('export.customRange')}
                  </Label>
                </div>

                {dateRange.enabled && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs dark:text-gray-200">{t('export.from')}</Label>
                      <Input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        className="dark:bg-gray-800 dark:border-gray-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs dark:text-gray-200">{t('export.to')}</Label>
                      <Input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        className="dark:bg-gray-800 dark:border-gray-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Filters Button */}
              <Button
                variant="outline"
                onClick={() => {
                  setContractTypeFilter('');
                  setFilters({
                    companyName: '',
                    contractNumber: '',
                    contractNumberAppendix: '',
                    winningBidDecisionNumber: '',
                    contractValueMin: '',
                    contractValueMax: '',
                    phisicalStorageUnit: ''
                  });
                }}
                className="dark:border-gray-600 dark:hover:bg-gray-700"
              >
                {t('contracts.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Export Info */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 dark:text-gray-100">
              <Download className="h-5 w-5" />
              <span>{t('export.info')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('export.format')}:</span>
                <span className="font-medium uppercase dark:text-gray-200">{exportOptions.format}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('export.includeFiles')}:</span>
                <span className="font-medium dark:text-gray-200">
                  {exportOptions.includeFiles ? t('common.yes') : t('common.no')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('export.dateRange')}:</span>
                <span className="font-medium dark:text-gray-200">
                  {dateRange.enabled ? t('export.customRange') : t('export.allData')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('export.contractType_')}:</span>
                <span className="font-medium dark:text-gray-200">
                  {contractTypeFilter 
                    ? (contractTypes.find(ct => ct.value === contractTypeFilter)?.label || contractTypeFilter)
                    : t('export.allTypes')}
                </span>
              </div>
              
              {/* Active Filters Summary */}
              {(filters.companyName || filters.contractNumber || filters.contractNumberAppendix || filters.winningBidDecisionNumber || 
                filters.contractValueMin || filters.contractValueMax || filters.phisicalStorageUnit) && (
                <div className="border-t dark:border-gray-600 pt-3 mt-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('export.activeFilters')}</div>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {filters.companyName && (
                      <div>• {t('contracts.companyName')}: {filters.companyName}</div>
                    )}
                    {filters.contractNumber && (
                      <div>• {t('contracts.contractNumber')}: {filters.contractNumber}</div>
                    )}
                    {filters.contractNumberAppendix && (
                      <div>• {currentLanguage === 'vi' ? 'Số Phụ lục hợp đồng' : 'Contract Number Appendix'}: {filters.contractNumberAppendix}</div>
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
                    {filters.phisicalStorageUnit && (
                      <div>• {currentLanguage === 'vi' ? 'Đơn vị lưu trữ vật lý' : 'Physical Storage Unit'}: {filters.phisicalStorageUnit}</div>
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
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
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
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-semibold dark:text-gray-100">{t('import.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Import Format Selection */}
              <div className="space-y-2">
                <Label className="dark:text-gray-200">{t('import.formatLabel')}</Label>
                <Select
                  value={importFormat}
                  onValueChange={(value) => setImportFormat(value as 'csv' | 'json')}
                >
                  <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="csv" className="dark:hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>{t('export.csv')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="json" className="dark:hover:bg-gray-700">
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
                <Label htmlFor="import-file-input" className="dark:text-gray-200">{t('import.selectFile')}</Label>
                <Input
                  id="import-file-input"
                  type="file"
                  accept={importFormat === 'csv' ? '.csv,text/csv' : '.json,application/json'}
                  onChange={handleFileSelect}
                  className="cursor-pointer dark:bg-gray-800 dark:border-gray-600"
                />
                {selectedFile && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {t('import.selected')} {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Delete All Button */}
                <Button
                  onClick={handleDeleteAll}
                  disabled={isDeletingAll}
                  variant="destructive"
                  className="w-full"
                >
                  {isDeletingAll ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting All Contracts...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Delete All Contracts</span>
                    </div>
                  )}
                </Button>

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
              </div>

              {/* Import Guidelines */}
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2 mt-4">
                <p className="font-semibold dark:text-gray-300">{t('import.guidelines')}</p>
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

          {/* Delete All Status Messages */}
          {deleteAllError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{deleteAllError}</AlertDescription>
            </Alert>
          )}

          {deleteAllResult && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-medium">All Contracts Deleted Successfully</p>
                  <div className="text-sm">
                    <div>Deleted {deleteAllResult.deletedCount} contract(s)</div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

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