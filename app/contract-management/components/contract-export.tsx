'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, FileText, Table2, AlertCircle, CheckCircle2 } from "lucide-react";
import { contractManagementExportService, ExportOptions } from '@/lib/services/contract-management';
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

  const contractTypes = [
    { value: 'Pharmaceuticals', label: t('contractTypes.pharmaceuticals') },
    { value: 'MedicalEquipment', label: t('contractTypes.medicalEquipment') },
    { value: 'Services', label: t('contractTypes.services') },
    { value: 'Consulting', label: t('contractTypes.consulting') },
    { value: 'Other', label: t('contractTypes.other') }
  ];

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
        filters: contractTypeFilter ? {
          contractType: contractTypeFilter as any
        } : undefined
      };

      const response = await contractManagementExportService.exportContracts(options);

      if (response.success && response.data) {
        setExportResult(response.data);
        
        // Auto-download the file
        if (response.data.downloadUrl) {
          const link = document.createElement('a');
          link.href = response.data.downloadUrl;
          link.download = response.data.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        setError(response.message || t('export.errorExporting'));
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
      {/* Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Export Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Export Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <SelectValue placeholder={t('export.allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('export.allTypes')}</SelectItem>
                  {contractTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  {contractTypeFilter || 'All Types'}
                </span>
              </div>
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
      </div>

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

      {/* Export Templates Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>CSV Template includes:</strong> Company Name, Contract Number, 
              Start Date, End Date, Duration, Value, Bid Decision Number, 
              Contract Type, Status, Storage Location, File Path (if included)
            </p>
            <p>
              <strong>JSON Template includes:</strong> Complete contract objects 
              with all metadata, timestamps, storage information, and file details
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 