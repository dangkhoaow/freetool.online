'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Calendar, DollarSign, Building2, FileCheck, Hash, Clock } from "lucide-react";
import { Contract, contractManagementService } from '@/lib/services/contract-management';
import { useLanguage } from '../contexts/language-context';

interface ContractDetailDialogProps {
  contractId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContractDetailDialog({ contractId, isOpen, onClose }: ContractDetailDialogProps) {
  const { t } = useLanguage();
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractFiles, setContractFiles] = useState<any>(null);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

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
      } else {
        setError(response.error || 'Failed to load contract details');
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      setError('Failed to load contract details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    if (!contract) return;
    
    // Add fileId to downloading set to show loading indicator
    setDownloadingFiles(prev => new Set(prev).add(fileId));
    
    console.log('Download attempt - fileId:', fileId, 'fileName:', fileName);
    console.log('Contract files:', (contract as any).contractFiles);
    
    try {
      const response = await contractManagementService.downloadFile(fileId);
      console.log('Download response:', response);
      
      if (response.success && response.blob) {
        // Create download link with original filename from server
        const url = window.URL.createObjectURL(response.blob);
        const link = document.createElement('a');
        link.href = url;
        // Use server-provided filename which preserves original filename
        link.download = response.fileName || fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('File download completed successfully');
      } else {
        console.error('Download failed:', response.error);
        alert(`Download failed: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert(`Error downloading file: ${error}`);
    } finally {
      // Remove fileId from downloading set
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Draft': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] max-w-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Contract Details
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

        {contract && !isLoading && !error && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{contract.companyName}</h2>
                <p className="text-lg text-gray-600">{contract.contractNumber}</p>
              </div>
              <Badge className={getStatusColor(contract.status)}>
                {contract.status}
              </Badge>
            </div>

            <Separator />

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Contract Information</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contract Type:</span>
                      <span className="font-medium">{contract.contractType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Decision Number:</span>
                      <span className="font-medium">{contract.winningBidDecisionNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{contract.contractDurationMonths} months</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Financial Details</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contract Value:</span>
                      <span className="font-semibold text-green-700">
                        {formatCurrency(contract.contractValue)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Timeline</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{formatDate(contract.contractStartDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">{formatDate(contract.contractEndDate)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Storage Location & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold">Storage Location</h3>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">
                      Unit {contract.storageUnitId?.split('-')[1]} - Position {contract.positionInUnit}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {contract.notes && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <h3 className="font-semibold">Notes</h3>
                    </div>
                    <div className="text-sm text-gray-700">
                      {contract.notes}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>


            {/* Files Section */}
            {(contract as any).contractFiles && (contract as any).contractFiles.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Contract Files</h3>
                  </div>
                  <div className="space-y-2">
                    {(contract as any).contractFiles.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileCheck className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-sm">{file.originalFileName || file.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {file.fileSize && `${Math.round(parseInt(file.fileSize) / 1024)} KB`}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadFile(file.id || file.fileName, file.originalFileName || file.fileName)}
                          disabled={downloadingFiles.has(file.id || file.fileName)}
                        >
                          {downloadingFiles.has(file.id || file.fileName) ? (
                            <>
                              <div className="animate-spin h-3 w-3 mr-2 border border-gray-300 border-t-gray-600 rounded-full"></div>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="h-3 w-3 mr-2" />
                              Download
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {contract.notes && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold">Notes</h3>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Created Date */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Created: {formatDate(contract.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
