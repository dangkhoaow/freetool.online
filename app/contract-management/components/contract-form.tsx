'use client';

import { useState } from 'react';
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
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState<ContractFormData>({
    companyName: '',
    contractNumber: '',
    contractStartDate: '',
    contractEndDate: '',
    contractDurationMonths: 0,
    contractValue: 0,
    winningBidDecisionNumber: '',
    contractType: 'Pharmaceuticals',
    notes: ''
  });

  const contractTypes = [
    { value: 'Pharmaceuticals', label: t('contractTypes.pharmaceuticals') },
    { value: 'MedicalEquipment', label: t('contractTypes.medicalEquipment') },
    { value: 'Services', label: t('contractTypes.services') },
    { value: 'Consulting', label: t('contractTypes.consulting') },
    { value: 'Other', label: t('contractTypes.other') }
  ];

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
        newErrors.contractEndDate = 'End date must be after start date';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDuration = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.ceil(diffDays / 30); // Approximate months
  };

  const handleInputChange = (field: keyof ContractFormData, value: any) => {
    const updatedData = { ...formData, [field]: value };
    
    // Auto-calculate duration when dates change
    if (field === 'contractStartDate' || field === 'contractEndDate') {
      updatedData.contractDurationMonths = calculateDuration(
        updatedData.contractStartDate,
        updatedData.contractEndDate
      );
    }
    
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
          files: `File type "${file.type}" is not supported for file "${file.name}"` 
        }));
        return;
      }
      
      // Validate file size (max 25MB per file)
      if (file.size > 25 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          files: `File "${file.name}" exceeds 25MB limit` 
        }));
        return;
      }
    }

    // Check total file count (max 10 files)
    if (files.length > 10) {
      setErrors(prev => ({ 
        ...prev, 
        files: 'Maximum 10 files can be uploaded at once' 
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
        setErrors({ general: 'Authentication required. Please log in again.' });
        return;
      }

      // Include the files in the form data
      const submitData = {
        ...formData,
        files: selectedFiles.length > 0 ? selectedFiles : undefined
      };
      
      const response = await contractManagementService.createContract(submitData, currentUser.id);
      
      if (response.success) {
        setSuccessMessage(t('contracts.contractSaved'));
        
        // Reset form
        setFormData({
          companyName: '',
          contractNumber: '',
          contractStartDate: '',
          contractEndDate: '',
          contractDurationMonths: 0,
          contractValue: 0,
          winningBidDecisionNumber: '',
          contractType: 'Pharmaceuticals',
          notes: ''
        });
        setSelectedFiles([]);
        
        // Clear file input
        const fileInput = document.getElementById('pdfFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
      } else {
        setErrors({ general: response.message || t('contracts.errorSaving') });
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      setErrors({ general: t('contracts.errorSaving') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      companyName: '',
      contractNumber: '',
      contractStartDate: '',
      contractEndDate: '',
      contractDurationMonths: 0,
      contractValue: 0,
      winningBidDecisionNumber: '',
      contractType: 'Pharmaceuticals',
      notes: ''
    });
    setSelectedFiles([]);
    setErrors({});
    setSuccessMessage('');
    
    // Clear file input
    const fileInput = document.getElementById('pdfFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* General Error */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName">
            {t('contracts.companyName')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            placeholder="Enter company name"
            className={errors.companyName ? 'border-red-500' : ''}
          />
          {errors.companyName && (
            <p className="text-sm text-red-500">{errors.companyName}</p>
          )}
        </div>

        {/* Contract Number */}
        <div className="space-y-2">
          <Label htmlFor="contractNumber">
            {t('contracts.contractNumber')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contractNumber"
            value={formData.contractNumber}
            onChange={(e) => handleInputChange('contractNumber', e.target.value)}
            placeholder="Enter contract/addendum number"
            className={errors.contractNumber ? 'border-red-500' : ''}
          />
          {errors.contractNumber && (
            <p className="text-sm text-red-500">{errors.contractNumber}</p>
          )}
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="startDate">
            {t('contracts.startDate')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            value={formData.contractStartDate}
            onChange={(e) => handleInputChange('contractStartDate', e.target.value)}
            className={errors.contractStartDate ? 'border-red-500' : ''}
          />
          {errors.contractStartDate && (
            <p className="text-sm text-red-500">{errors.contractStartDate}</p>
          )}
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="endDate">
            {t('contracts.endDate')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="endDate"
            type="date"
            value={formData.contractEndDate}
            onChange={(e) => handleInputChange('contractEndDate', e.target.value)}
            className={errors.contractEndDate ? 'border-red-500' : ''}
          />
          {errors.contractEndDate && (
            <p className="text-sm text-red-500">{errors.contractEndDate}</p>
          )}
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration">
            {t('contracts.duration')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={formData.contractDurationMonths}
            onChange={(e) => handleInputChange('contractDurationMonths', parseInt(e.target.value) || 0)}
            className={errors.contractDurationMonths ? 'border-red-500' : ''}
          />
          {errors.contractDurationMonths && (
            <p className="text-sm text-red-500">{errors.contractDurationMonths}</p>
          )}
        </div>

        {/* Contract Value */}
        <div className="space-y-2">
          <Label htmlFor="value">
            {t('contracts.value')} (VND) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="value"
            type="number"
            min="0"
            value={formData.contractValue}
            onChange={(e) => handleInputChange('contractValue', parseFloat(e.target.value) || 0)}
            placeholder="Enter contract value"
            className={errors.contractValue ? 'border-red-500' : ''}
          />
          {errors.contractValue && (
            <p className="text-sm text-red-500">{errors.contractValue}</p>
          )}
        </div>

        {/* Bid Decision Number */}
        <div className="space-y-2">
          <Label htmlFor="bidDecision">
            {t('contracts.bidDecisionNumber')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="bidDecision"
            value={formData.winningBidDecisionNumber}
            onChange={(e) => handleInputChange('winningBidDecisionNumber', e.target.value)}
            placeholder="Enter winning bid decision number"
            className={errors.winningBidDecisionNumber ? 'border-red-500' : ''}
          />
          {errors.winningBidDecisionNumber && (
            <p className="text-sm text-red-500">{errors.winningBidDecisionNumber}</p>
          )}
        </div>

        {/* Contract Type */}
        <div className="space-y-2">
          <Label htmlFor="contractType">
            {t('contracts.contractType')} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.contractType}
            onValueChange={(value) => handleInputChange('contractType', value)}
          >
            <SelectTrigger className={errors.contractType ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select contract type" />
            </SelectTrigger>
            <SelectContent>
              {contractTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contractType && (
            <p className="text-sm text-red-500">{errors.contractType}</p>
          )}
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label htmlFor="files">
          Upload Files (Optional)
        </Label>
        <div className="space-y-3">
          <Input
            id="files"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
            onChange={handleFileChange}
            multiple
            className="flex-1"
          />
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Selected files ({selectedFiles.length}):</p>
              <div className="space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                    <FileText className="h-4 w-4" />
                    <span className="flex-1">{file.name}</span>
                    <span className="text-xs text-gray-500">
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
                      className="text-red-500 hover:text-red-700"
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
          <p className="text-sm text-red-500">{errors.files}</p>
        )}
        {selectedFiles.length === 0 && (
          <div className="text-sm text-gray-500 space-y-1">
            <p>No files selected. Supported formats:</p>
            <p className="text-xs">PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), Text (.txt, .csv), Images (.jpg, .png, .gif, .bmp, .webp, .svg)</p>
            <p className="text-xs">Max 10 files, 25MB per file</p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes or comments"
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          {t('contracts.cancel')}
        </Button>
        
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Saving...' : t('contracts.save')}
        </Button>
      </div>
    </form>
  );
} 