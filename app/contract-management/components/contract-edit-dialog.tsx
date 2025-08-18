'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Trash2, Download, X } from "lucide-react";
import { Contract, ContractFormData, contractManagementService } from '@/lib/services/contract-management';
import { useLanguage } from '../contexts/language-context';

interface ContractEditDialogProps {
  contractId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContractEditDialog({ contractId, isOpen, onClose, onSuccess }: ContractEditDialogProps) {
  const { t } = useLanguage();
  const [contract, setContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<Partial<ContractFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // File management states
  const [contractFiles, setContractFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());
  const [filesToDelete, setFilesToDelete] = useState<Set<string>>(new Set());

  const contractTypes = [
    { value: 'Pharmaceuticals', label: t('contractTypes.pharmaceuticals') },
    { value: 'MedicalEquipment', label: t('contractTypes.medicalEquipment') },
    { value: 'Services', label: t('contractTypes.services') },
    { value: 'Consulting', label: t('contractTypes.consulting') },
    { value: 'Other', label: t('contractTypes.other') }
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Expired', label: 'Expired' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Draft', label: 'Draft' }
  ];

  useEffect(() => {
    if (contractId && isOpen) {
      fetchContract();
    }
  }, [contractId, isOpen]);

  const fetchContract = async () => {
    if (!contractId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await contractManagementService.getContract(contractId);
      if (response.success && response.data) {
        setContract(response.data);
        setContractFiles((response.data as any).contractFiles || []);
        
        // Format dates for HTML date inputs (YYYY-MM-DD)
        setFormData({
          companyName: response.data.companyName || '',
          contractNumber: response.data.contractNumber || '',
          contractStartDate: response.data.contractStartDate ? response.data.contractStartDate.split('T')[0] : '',
          contractEndDate: response.data.contractEndDate ? response.data.contractEndDate.split('T')[0] : '',
          contractDurationMonths: response.data.contractDurationMonths || 0,
          contractValue: response.data.contractValue || 0,
          winningBidDecisionNumber: response.data.winningBidDecisionNumber || '',
          contractType: response.data.contractType || 'Pharmaceuticals',
          status: response.data.status || 'Draft',
          notes: response.data.notes || ''
        });
      } else {
        setError(response.error || 'Failed to load contract');
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      setError('Failed to load contract');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContractFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contractId) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Step 1: Delete files marked for deletion
      if (filesToDelete.size > 0) {
        console.log('Deleting files:', Array.from(filesToDelete));
        for (const fileId of filesToDelete) {
          try {
            const deleteResponse = await contractManagementService.deleteFile(fileId);
            if (!deleteResponse.success) {
              console.error(`Failed to delete file ${fileId}:`, deleteResponse.error);
              // Continue with other deletions even if one fails
            }
          } catch (deleteError) {
            console.error(`Error deleting file ${fileId}:`, deleteError);
            // Continue with other operations
          }
        }
      }

      // Step 2: Upload new files if any are selected
      if (selectedFiles && selectedFiles.length > 0) {
        console.log('Uploading files:', selectedFiles.length);
        try {
          const uploadResponse = await contractManagementService.uploadFiles(selectedFiles, contractId);
          
          if (!uploadResponse.success) {
            console.error('Failed to upload files:', uploadResponse.error);
            setError(uploadResponse.error || 'Failed to upload files');
            return; // Don't proceed with contract update if file upload fails
          }
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError);
          setError('Failed to upload files');
          return; // Don't proceed with contract update if file upload fails
        }
      }

      // Step 3: Update contract data
      const response = await contractManagementService.updateContract(contractId, formData, 'current-user');
      
      if (response.success) {
        // Clear file operation states on success
        setFilesToDelete(new Set());
        setSelectedFiles([]);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        onSuccess();
        onClose();
      } else {
        setError(response.error || 'Failed to update contract');
      }
    } catch (error) {
      console.error('Error updating contract:', error);
      setError('Failed to update contract');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || !contractId) return;
    
    setIsUploading(true);
    try {
      const filesArray = Array.from(selectedFiles);
      const response = await contractManagementService.uploadFiles(filesArray, contractId);
      
      if (response.success && response.results) {
        setContractFiles(prev => [...prev, ...response.results!]);
        setSelectedFiles([]);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(response.error || 'Failed to upload files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    // Mark file for deletion instead of deleting immediately
    setFilesToDelete(prev => new Set(prev).add(fileId));
    // Remove file from UI immediately to show it will be deleted
    setContractFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleFileDownload = async (fileId: string, fileName: string) => {
    setDownloadingFiles(prev => new Set(prev).add(fileId));
    
    try {
      const response = await contractManagementService.downloadFile(fileId);
      
      if (response.success && response.blob) {
        const url = window.URL.createObjectURL(response.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.fileName || fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setError(response.error || t('contracts.errorDownloadingFile'));
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      setError(t('contracts.errorDownloadingFile'));
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleClose = () => {
    setContract(null);
    setFormData({});
    setError(null);
    setContractFiles([]);
    setSelectedFiles([]);
    setFilesToDelete(new Set());
    setDownloadingFiles(new Set());
    setDeletingFiles(new Set());
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[80vw] max-w-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t('contracts.editContract')}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {contract && !isLoading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="companyName">{t('contracts.companyName')}</Label>
                <Input
                  id="companyName"
                  value={formData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contractNumber">{t('contracts.contractNumber')}</Label>
                <Input
                  id="contractNumber"
                  value={formData.contractNumber || ''}
                  onChange={(e) => handleInputChange('contractNumber', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contractStartDate">{t('contracts.startDate')}</Label>
                <Input
                  id="contractStartDate"
                  type="date"
                  value={formData.contractStartDate || ''}
                  onChange={(e) => handleInputChange('contractStartDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contractEndDate">{t('contracts.endDate')}</Label>
                <Input
                  id="contractEndDate"
                  type="date"
                  value={formData.contractEndDate || ''}
                  onChange={(e) => handleInputChange('contractEndDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contractDurationMonths">{t('contracts.duration')}</Label>
                <Input
                  id="contractDurationMonths"
                  type="number"
                  value={formData.contractDurationMonths || ''}
                  onChange={(e) => handleInputChange('contractDurationMonths', parseInt(e.target.value))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contractValue">{t('contracts.value')}</Label>
                <Input
                  id="contractValue"
                  type="number"
                  value={formData.contractValue || ''}
                  onChange={(e) => handleInputChange('contractValue', parseFloat(e.target.value))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="winningBidDecisionNumber">{t('contracts.bidDecisionNumber')}</Label>
                <Input
                  id="winningBidDecisionNumber"
                  value={formData.winningBidDecisionNumber || ''}
                  onChange={(e) => handleInputChange('winningBidDecisionNumber', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractType">{t('contracts.contractType')} <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.contractType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contractType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('contracts.selectContractType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pharmaceuticals">{t('contractTypes.pharmaceuticals')}</SelectItem>
                    <SelectItem value="MedicalEquipment">{t('contractTypes.medicalEquipment')}</SelectItem>
                    <SelectItem value="Services">{t('contractTypes.services')}</SelectItem>
                    <SelectItem value="Consulting">{t('contractTypes.consulting')}</SelectItem>
                    <SelectItem value="Other">{t('contractTypes.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t('common.status')} <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('contracts.selectContractStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">{t('contractStatus.draft')}</SelectItem>
                    <SelectItem value="Active">{t('contractStatus.active')}</SelectItem>
                    <SelectItem value="Pending">{t('contractStatus.pending')}</SelectItem>
                    <SelectItem value="Expired">{t('contractStatus.expired')}</SelectItem>
                    <SelectItem value="Cancelled">{t('contractStatus.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">{t('common.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                placeholder={t('contracts.enterNotes')}
              />
            </div>

            {/* File Management Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('common.files')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* File Upload */}
                <div className="mb-4">
                  <Label htmlFor="file-upload">Upload New Files</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                      onChange={(e) => setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleFileUpload}
                      disabled={selectedFiles.length === 0 || isUploading}
                      variant="outline"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border border-gray-300 border-t-gray-600 rounded-full"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2 mb-4">
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
                              const fileInput = document.getElementById('file-upload') as HTMLInputElement;
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

                {/* Existing Files List */}
                <div className="space-y-2">
                  <Label>Current Files</Label>
                  {contractFiles.length === 0 ? (
                    <p className="text-sm text-gray-500">No files uploaded yet</p>
                  ) : (
                    contractFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-sm">{file.originalFileName || file.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {file.fileSize && `${Math.round(parseInt(file.fileSize) / 1024)} ${t('common.kb')}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="button"
                            size="sm" 
                            variant="outline"
                            onClick={() => handleFileDownload(file.id || file.fileName, file.originalFileName || file.fileName)}
                            disabled={downloadingFiles.has(file.id || file.fileName)}
                          >
                            {downloadingFiles.has(file.id || file.fileName) ? (
                              <>
                                <div className="animate-spin h-3 w-3 mr-2 border border-gray-300 border-t-gray-600 rounded-full"></div>
                                {t('common.downloading')}
                              </>
                            ) : (
                              <>
                                <Download className="h-3 w-3 mr-2" />
                                {t('common.download')}
                              </>
                            )}
                          </Button>
                          <Button 
                            type="button"
                            size="sm" 
                            variant="outline"
                            onClick={() => handleFileDelete(file.id || file.fileName)}
                            disabled={deletingFiles.has(file.id || file.fileName)}
                            className="text-red-600 hover:text-red-700"
                          >
                            {deletingFiles.has(file.id || file.fileName) ? (
                              <>
                                <div className="animate-spin h-3 w-3 mr-2 border border-gray-300 border-t-gray-600 rounded-full"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('common.loading')}
                  </>
                ) : (
                  t('contracts.updateContract')
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
