'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Upload, FileText, Save, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { contractManagementService, contractManagementAuthService, ContractFormData } from '@/lib/services/contract-management';
import { useLanguage } from '../contexts/language-context';

export default function ContractForm() {
  const { t, currentLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [companyNames, setCompanyNames] = useState<string[]>([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  const [formData, setFormData] = useState<ContractFormData>({
    companyName: '',
    contractNumber: '',
    contractNumberAppendix: '',
    phisicalStorageUnit: '',
    contractStartDate: '',
    contractEndDate: '',
    contractDurationMonths: 0,
    contractValue: 0,
    winningBidDecisionNumber: '',
    contractType: 'Pharmaceuticals',
    status: 'Active',
    notes: ''
  });

  const contractTypes = [
    { value: 'Pharmaceuticals', label: t('contractTypes.pharmaceuticals') },
    { value: 'MedicalEquipment', label: t('contractTypes.medicalEquipment') },
    { value: 'Services', label: t('contractTypes.services') },
    { value: 'Consulting', label: t('contractTypes.consulting') },
    { value: 'Other', label: t('contractTypes.other') }
  ];

  const contractStatuses = [
    { value: 'Draft', label: t('contractStatus.draft') },
    { value: 'Active', label: t('contractStatus.active') },
    { value: 'Pending', label: t('contractStatus.pending') },
    { value: 'Expired', label: t('contractStatus.expired') },
    { value: 'Cancelled', label: t('contractStatus.cancelled') }
  ];

  // Load company names on component mount
  useEffect(() => {
    const loadCompanyNames = async () => {
      try {
        const response = await contractManagementService.getCompanyNames();
        if (response.success && response.data) {
          setCompanyNames(response.data);
        }
      } catch (error) {
        console.error('Error loading company names:', error);
      }
    };

    loadCompanyNames();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = t('contracts.required');
    }

    if (!formData.contractNumber.trim()) {
      newErrors.contractNumber = t('contracts.required');
    }

    if (!formData.contractStartDate) {
      newErrors.contractStartDate = t('contracts.required');
    }

    if (!formData.contractEndDate) {
      newErrors.contractEndDate = t('contracts.required');
    }

    if (formData.contractStartDate && formData.contractEndDate) {
      const startDate = new Date(formData.contractStartDate);
      const endDate = new Date(formData.contractEndDate);
      if (endDate <= startDate) {
        newErrors.contractEndDate = t('contracts.endDateAfterStart');
      }
    }

    if (formData.contractDurationMonths <= 0) {
      newErrors.contractDurationMonths = t('contracts.required');
    }

    if (formData.contractValue <= 0) {
      newErrors.contractValue = t('contracts.required');
    }

    if (!formData.winningBidDecisionNumber.trim()) {
      newErrors.winningBidDecisionNumber = t('contracts.required');
    }

    if (!formData.phisicalStorageUnit?.trim()) {
      newErrors.phisicalStorageUnit = t('contracts.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDuration = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) return 0;
    
    // Calculate months more accurately
    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months -= start.getMonth();
    months += end.getMonth();
    
    // Adjust for partial months
    if (end.getDate() < start.getDate()) {
      months--;
    }
    
    return Math.max(1, months); // Minimum 1 month
  };

  const getAutoStatus = (endDate: string): 'Active' | 'Expired' | 'Draft' => {
    if (!endDate) return 'Draft';
    
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    end.setHours(0, 0, 0, 0);
    
    if (end < today) {
      return 'Expired';
    } else {
      return 'Active';
    }
  };

  const handleInputChange = (field: keyof ContractFormData, value: any) => {
    const updatedData = { ...formData, [field]: value };
    
    // Auto-calculate duration and status when dates change
    if (field === 'contractStartDate' || field === 'contractEndDate') {
      updatedData.contractDurationMonths = calculateDuration(
        updatedData.contractStartDate,
        updatedData.contractEndDate
      );
      
      // Auto-update status based on end date
      if (field === 'contractEndDate' && updatedData.contractEndDate) {
        updatedData.status = getAutoStatus(updatedData.contractEndDate);
      }
    }
    
    console.log(`Updating ${field} to:`, value);
    console.log('Updated form data:', updatedData);
    
    setFormData(updatedData);
    
    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

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
      if (!supportedTypes.includes(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          files: t('contracts.invalidFileType')
        }));
        return;
      }
      
      // Validate file size (max 25MB per file)
      if (file.size > 25 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          files: t('contracts.fileTooLarge')
        }));
        return;
      }
    }

    // Check total file count (max 10 files)
    if (files.length > 10) {
      setErrors(prev => ({ 
        ...prev, 
        files: t('contracts.maxFiles')
      }));
      return;
    }
    
    setSelectedFiles(files);
    setErrors(prev => ({ ...prev, files: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      // Get current user
      const currentUser = contractManagementAuthService.getCurrentUser();
      if (!currentUser) {
        setErrors({ general: t('auth.loginRequired') });
        return;
      }

      // Include the files in the form data
      const submitData: ContractFormData = {
        ...formData,
        files: selectedFiles.length > 0 ? selectedFiles : undefined
      };
      
      console.log('Final submit data before API call:', submitData);
      
      const response = await contractManagementService.createContract(submitData, currentUser.id);
      
      if (response.success) {
        setSuccessMessage(t('contracts.contractSaved'));
        
        // Reset form
        setFormData({
          companyName: '',
          contractNumber: '',
          contractNumberAppendix: '',
          phisicalStorageUnit: '',
          contractStartDate: '',
          contractEndDate: '',
          contractDurationMonths: 0,
          contractValue: 0,
          winningBidDecisionNumber: '',
          contractType: 'Pharmaceuticals',
          status: 'Active',
          notes: ''
        });
        setSelectedFiles([]);
        
        // Clear file input
        const fileInput = document.getElementById('pdfFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
      } else {
        // Show the actual API error message
        const errorMessage = response.message || response.error || t('contracts.errorSaving');
        setErrors({ general: errorMessage });
        console.error('API Error:', response);
      }
    } catch (error: any) {
      console.error('Error saving contract:', error);
      // Try to extract error message from different possible structures
      let errorMessage = t('contracts.errorSaving');
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      companyName: '',
      contractNumber: '',
      contractNumberAppendix: '',
      phisicalStorageUnit: '',
      contractStartDate: '',
      contractEndDate: '',
      contractDurationMonths: 0,
      contractValue: 0,
      winningBidDecisionNumber: '',
      contractType: 'Pharmaceuticals',
      status: 'Active',
      notes: ''
    });
    setSelectedFiles([]);
    setErrors({});
    setSuccessMessage('');
    
    // Clear file input
    const fileInput = document.getElementById('files') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-300">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* General Error */}
      {errors.general && (
        <Alert variant="destructive" className="dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 dark:text-red-400" />
          <AlertDescription className="dark:text-red-300">{errors.general}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Company Name with Autocomplete */}
        <div className="space-y-2 relative">
          <Label htmlFor="companyName" className="dark:text-gray-200">
            {t('contracts.companyName')} <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => {
                handleInputChange('companyName', e.target.value);
                setShowCompanyDropdown(true);
              }}
              onFocus={() => setShowCompanyDropdown(true)}
              onBlur={() => setTimeout(() => setShowCompanyDropdown(false), 200)}
              placeholder={t('contracts.enterOrSelectCompany')}
              className={`${errors.companyName ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400`}
              autoComplete="off"
            />
            {showCompanyDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {(() => {
                  const filteredCompanies = companyNames
                    .filter(company => 
                      company.toLowerCase().includes(formData.companyName.toLowerCase())
                    )
                    .slice(0, 5);
                  
                  const hasExactMatch = filteredCompanies.some(company => 
                    company.toLowerCase() === formData.companyName.toLowerCase()
                  );
                  
                  return (
                    <>
                      {formData.companyName.length > 0 && (
                        <div className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                          {t('contracts.selectOptionOrCreate')}
                        </div>
                      )}
                      
                      {/* Existing companies */}
                      {filteredCompanies.map((company, index) => (
                        <div
                          key={index}
                          className="flex items-center px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer text-sm group"
                          onClick={() => {
                            handleInputChange('companyName', company);
                            setShowCompanyDropdown(false);
                          }}
                        >
                          <span className="text-gray-700 dark:text-gray-200">{company}</span>
                        </div>
                      ))}
                      
                      {/* Create new option */}
                      {formData.companyName.length > 0 && !hasExactMatch && (
                        <div
                          className="flex items-center px-3 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer text-sm border-t border-gray-100 dark:border-gray-600 group"
                          onClick={() => {
                            setShowCompanyDropdown(false);
                          }}
                        >
                          <div className="flex items-center mr-3">
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">{t('common.create')}</span>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded text-xs font-medium">
                            {formData.companyName}
                          </span>
                        </div>
                      )}
                      
                      {/* No results message */}
                      {formData.companyName.length > 0 && filteredCompanies.length === 0 && hasExactMatch && (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {t('contracts.noOtherCompanies')}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
          {errors.companyName && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.companyName}</p>
          )}
        </div>

        {/* Contract Number */}
        <div className="space-y-2">
          <Label htmlFor="contractNumber" className="dark:text-gray-200">
            {t('contracts.contractNumber')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contractNumber"
            value={formData.contractNumber}
            onChange={(e) => handleInputChange('contractNumber', e.target.value)}
            placeholder={t('contracts.enterContractAddendumNumber')}
            className={`${errors.contractNumber ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400`}
          />
          {errors.contractNumber && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.contractNumber}</p>
          )}
        </div>

        {/* Contract Number Appendix */}
        <div className="space-y-2">
          <Label htmlFor="contractNumberAppendix" className="dark:text-gray-200">
            {t('contracts.contractNumberAppendix')}
          </Label>
          <Input
            id="contractNumberAppendix"
            value={formData.contractNumberAppendix || ''}
            onChange={(e) => handleInputChange('contractNumberAppendix', e.target.value)}
            placeholder={t('contracts.enterContractNumberAppendix')}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="startDate" className="dark:text-gray-200">
            {t('contracts.startDate')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            value={formData.contractStartDate}
            onChange={(e) => handleInputChange('contractStartDate', e.target.value)}
            className={`${errors.contractStartDate ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
          />
          {errors.contractStartDate && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.contractStartDate}</p>
          )}
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="endDate" className="dark:text-gray-200">
            {t('contracts.endDate')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="endDate"
            type="date"
            value={formData.contractEndDate}
            onChange={(e) => handleInputChange('contractEndDate', e.target.value)}
            className={`${errors.contractEndDate ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
          />
          {errors.contractEndDate && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.contractEndDate}</p>
          )}
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration" className="dark:text-gray-200">
            {t('contracts.duration')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={formData.contractDurationMonths}
            onChange={(e) => handleInputChange('contractDurationMonths', parseInt(e.target.value) || 0)}
            className={`${errors.contractDurationMonths ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
          />
          {errors.contractDurationMonths && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.contractDurationMonths}</p>
          )}
        </div>

        {/* Contract Value */}
        <div className="space-y-2">
          <Label htmlFor="value" className="dark:text-gray-200">
            {t('contracts.value')} ({currentLanguage === 'vi' ? 'VND' : 'USD'}) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="value"
            type="number"
            min="0"
            value={formData.contractValue}
            onChange={(e) => handleInputChange('contractValue', parseFloat(e.target.value) || 0)}
            placeholder="Enter contract value"
            className={`${errors.contractValue ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400`}
          />
          {errors.contractValue && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.contractValue}</p>
          )}
        </div>

        {/* Bid Decision Number */}
        <div className="space-y-2">
          <Label htmlFor="bidDecision" className="dark:text-gray-200">
            {t('contracts.bidDecisionNumber')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="bidDecision"
            value={formData.winningBidDecisionNumber}
            onChange={(e) => handleInputChange('winningBidDecisionNumber', e.target.value)}
            placeholder={t('contracts.enterWinningBidDecisionNumber')}
            className={`${errors.winningBidDecisionNumber ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400`}
          />
          {errors.winningBidDecisionNumber && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.winningBidDecisionNumber}</p>
          )}
        </div>

        {/* Contract Type */}
        <div className="space-y-2">
          <Label htmlFor="contractType" className="dark:text-gray-200">
            {t('contracts.contractType')} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.contractType}
            onValueChange={(value) => handleInputChange('contractType', value)}
          >
            <SelectTrigger className={`${errors.contractType ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}>
              <SelectValue placeholder={t('contracts.selectContractType')} className="dark:text-gray-400" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              {contractTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="dark:text-gray-200 dark:hover:bg-gray-700">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contractType && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.contractType}</p>
          )}
        </div>

        {/* Contract Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="dark:text-gray-200">
            {t('common.status')} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger className={`${errors.status ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}>
              <SelectValue placeholder={t('contracts.selectContractStatus')} className="dark:text-gray-400" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              {contractStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value} className="dark:text-gray-200 dark:hover:bg-gray-700">
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.status}</p>
          )}
        </div>

        {/* Physical Storage Unit */}
        <div className="space-y-2">
          <Label htmlFor="phisicalStorageUnit" className="dark:text-gray-200">
            {t('contracts.phisicalStorageUnit')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phisicalStorageUnit"
            value={formData.phisicalStorageUnit || ''}
            onChange={(e) => handleInputChange('phisicalStorageUnit', e.target.value)}
            placeholder={t('contracts.enterPhisicalStorageUnit')}
            className={`dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 ${
              errors.phisicalStorageUnit ? 'border-red-500 dark:border-red-500' : ''
            }`}
          />
          {errors.phisicalStorageUnit && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.phisicalStorageUnit}</p>
          )}
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label htmlFor="files" className="dark:text-gray-200">
          {t('contracts.uploadFilesOptional')}
        </Label>
        <div className="space-y-3">
          <Input
            id="files"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
            onChange={handleFileChange}
            multiple
            className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('common.selectedFiles')} ({selectedFiles.length}):</p>
              <div className="space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <FileText className="h-4 w-4" />
                    <span className="flex-1">{file.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = selectedFiles.filter((_, i) => i !== index);
                        setSelectedFiles(newFiles);
                        // Update file input
                        const fileInput = document.getElementById('files') as HTMLInputElement;
                        if (fileInput && newFiles.length === 0) {
                          fileInput.value = '';
                        }
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {errors.files && (
          <p className="text-sm text-red-500 dark:text-red-400">{errors.files}</p>
        )}
        {selectedFiles.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>{t('contracts.noFilesSelectedInfo')}</p>
            <p className="text-xs">{t('contracts.supportedFormatsList')}</p>
            <p className="text-xs">{t('contracts.fileLimits')}</p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="dark:text-gray-200">{t('contracts.notesOptional')}</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder={t('contracts.enterNotes')}
          rows={3}
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isLoading}
          className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4 mr-2" />
          {t('contracts.cancel')}
        </Button>
        
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[120px] dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isLoading ? t('common.saving') : t('contracts.save')}
        </Button>
      </div>
    </form>
  );
} 