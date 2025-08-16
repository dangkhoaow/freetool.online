'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Contract, contractManagementService } from '@/lib/services/contract-management';
import { useLanguage } from '../contexts/language-context';

interface ContractDeleteDialogProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContractDeleteDialog({ contract, isOpen, onClose, onSuccess }: ContractDeleteDialogProps) {
  const { t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!contract) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await contractManagementService.deleteContract(contract.id);
      
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.error || 'Failed to delete contract');
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      setError('Failed to delete contract');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Contract
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this contract?
          </DialogDescription>
        </DialogHeader>

        {contract && (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action cannot be undone. This will permanently delete the contract and all associated files.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Contract Details:</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <div><strong>Company:</strong> {contract.companyName}</div>
                <div><strong>Contract Number:</strong> {contract.contractNumber}</div>
                <div><strong>Type:</strong> {contract.contractType}</div>
                <div><strong>Value:</strong> {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(contract.contractValue)}</div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Contract
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
