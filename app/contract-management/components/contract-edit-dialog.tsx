'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
        setFormData({
          companyName: response.data.companyName,
          contractNumber: response.data.contractNumber,
          contractStartDate: response.data.contractStartDate,
          contractEndDate: response.data.contractEndDate,
          contractDurationMonths: response.data.contractDurationMonths,
          contractValue: response.data.contractValue,
          winningBidDecisionNumber: response.data.winningBidDecisionNumber,
          contractType: response.data.contractType,
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
      const response = await contractManagementService.updateContract(contractId, formData);
      
      if (response.success) {
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

  const handleClose = () => {
    setContract(null);
    setFormData({});
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Contract
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contractNumber">Contract Number</Label>
                <Input
                  id="contractNumber"
                  value={formData.contractNumber || ''}
                  onChange={(e) => handleInputChange('contractNumber', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contractStartDate">Start Date</Label>
                <Input
                  id="contractStartDate"
                  type="date"
                  value={formData.contractStartDate || ''}
                  onChange={(e) => handleInputChange('contractStartDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contractEndDate">End Date</Label>
                <Input
                  id="contractEndDate"
                  type="date"
                  value={formData.contractEndDate || ''}
                  onChange={(e) => handleInputChange('contractEndDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contractDurationMonths">Duration (Months)</Label>
                <Input
                  id="contractDurationMonths"
                  type="number"
                  value={formData.contractDurationMonths || ''}
                  onChange={(e) => handleInputChange('contractDurationMonths', parseInt(e.target.value))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contractValue">Contract Value</Label>
                <Input
                  id="contractValue"
                  type="number"
                  value={formData.contractValue || ''}
                  onChange={(e) => handleInputChange('contractValue', parseFloat(e.target.value))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="winningBidDecisionNumber">Decision Number</Label>
                <Input
                  id="winningBidDecisionNumber"
                  value={formData.winningBidDecisionNumber || ''}
                  onChange={(e) => handleInputChange('winningBidDecisionNumber', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contractType">Contract Type</Label>
                <Select
                  value={formData.contractType || ''}
                  onValueChange={(value) => handleInputChange('contractType', value)}
                >
                  <SelectTrigger>
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
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                placeholder="Enter additional notes..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Update Contract"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
