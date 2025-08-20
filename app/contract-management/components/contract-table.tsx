'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Contract } from '@/lib/services/contract-management/types';
import { useLanguage } from '../contexts/language-context';

interface ContractTableProps {
  contracts: Contract[];
  onSort?: (field: keyof Contract) => void;
  sortField?: keyof Contract;
  sortDirection?: 'asc' | 'desc';
  onViewContract?: (contract: Contract) => void;
  onEditContract?: (contract: Contract) => void;
  onDeleteContract?: (contract: Contract) => void;
  visibleColumns?: {
    companyName?: boolean;
    contractNumber?: boolean;
    contractNumberAppendix?: boolean;
    phisicalStorageUnit?: boolean;
    contractStartDate?: boolean;
    contractEndDate?: boolean;
    contractDurationMonths?: boolean;
    contractValue?: boolean;
    winningBidDecisionNumber?: boolean;
    contractType?: boolean;
    status?: boolean;
    notes?: boolean;
    createdAt?: boolean;
    actions?: boolean;
  };
  showColumnControls?: boolean;
}

export default function ContractTable({
  contracts,
  onSort,
  sortField,
  sortDirection,
  onViewContract,
  onEditContract,
  onDeleteContract,
  visibleColumns = {
    companyName: true,
    contractNumber: true,
    contractNumberAppendix: true,
    phisicalStorageUnit: true,
    contractStartDate: true,
    contractEndDate: true,
    contractDurationMonths: true,
    contractValue: true,
    winningBidDecisionNumber: true,
    contractType: true,
    status: true,
    notes: true,
    createdAt: true,
    actions: true
  },
  showColumnControls = false
}: ContractTableProps) {

  const { currentLanguage } = useLanguage();

  const handleSort = (field: keyof Contract) => {
    if (onSort) {
      onSort(field);
    }
  };

  const getSortIcon = (field: keyof Contract) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const formatCurrency = (value: number): string => {
    const locale = currentLanguage === 'vi' ? 'vi-VN' : 'en-US';
    const currency = currentLanguage === 'vi' ? 'VND' : 'USD';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="dark:border-gray-700">
            {visibleColumns.companyName && (
              <TableHead className="whitespace-nowrap dark:text-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0 font-semibold hover:bg-transparent dark:text-gray-200 dark:hover:text-gray-100"
                  onClick={() => handleSort('companyName')}
                >
                  Tên Công Ty
                  {getSortIcon('companyName')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.contractNumber && (
              <TableHead className="whitespace-nowrap dark:text-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0 font-semibold hover:bg-transparent dark:text-gray-200 dark:hover:text-gray-100"
                  onClick={() => handleSort('contractNumber')}
                >
                  Số Hợp Đồng
                  {getSortIcon('contractNumber')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.contractNumberAppendix && (
              <TableHead className="whitespace-nowrap dark:text-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0 font-semibold hover:bg-transparent dark:text-gray-200 dark:hover:text-gray-100"
                  onClick={() => handleSort('contractNumberAppendix')}
                >
                  Số Phụ lục Hợp Đồng
                  {getSortIcon('contractNumberAppendix')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.phisicalStorageUnit && (
              <TableHead className="whitespace-nowrap dark:text-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0 font-semibold hover:bg-transparent dark:text-gray-200 dark:hover:text-gray-100"
                  onClick={() => handleSort('phisicalStorageUnit')}
                >
                  Vị trí lưu trữ
                  {getSortIcon('phisicalStorageUnit')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.contractStartDate && (
              <TableHead className="whitespace-nowrap dark:text-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0 font-semibold hover:bg-transparent dark:text-gray-200 dark:hover:text-gray-100"
                  onClick={() => handleSort('contractStartDate')}
                >
                  Ngày Bắt Đầu
                  {getSortIcon('contractStartDate')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.contractEndDate && (
              <TableHead className="whitespace-nowrap dark:text-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0 font-semibold hover:bg-transparent dark:text-gray-200 dark:hover:text-gray-100"
                  onClick={() => handleSort('contractEndDate')}
                >
                  Ngày Kết Thúc
                  {getSortIcon('contractEndDate')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.contractDurationMonths && (
              <TableHead className="whitespace-nowrap dark:text-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0 font-semibold hover:bg-transparent dark:text-gray-200 dark:hover:text-gray-100"
                  onClick={() => handleSort('contractDurationMonths')}
                >
                  Thời Hạn (Tháng)
                  {getSortIcon('contractDurationMonths')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.contractValue && (
              <TableHead className="whitespace-nowrap text-right dark:text-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0 font-semibold hover:bg-transparent dark:text-gray-200 dark:hover:text-gray-100"
                  onClick={() => handleSort('contractValue')}
                >
                  Giá Trị
                  {getSortIcon('contractValue')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.winningBidDecisionNumber && (
              <TableHead className="whitespace-nowrap dark:text-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0 font-semibold hover:bg-transparent dark:text-gray-200 dark:hover:text-gray-100"
                  onClick={() => handleSort('winningBidDecisionNumber')}
                >
                  Số QĐ Trúng Thầu
                  {getSortIcon('winningBidDecisionNumber')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.contractType && (
              <TableHead className="whitespace-nowrap dark:text-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0 font-semibold hover:bg-transparent dark:text-gray-200 dark:hover:text-gray-100"
                  onClick={() => handleSort('contractType')}
                >
                  Loại Hợp Đồng
                  {getSortIcon('contractType')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.status && (
              <TableHead className="whitespace-nowrap dark:text-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0 font-semibold hover:bg-transparent dark:text-gray-200 dark:hover:text-gray-100"
                  onClick={() => handleSort('status')}
                >
                  Trạng Thái
                  {getSortIcon('status')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.notes && (
              <TableHead className="whitespace-nowrap max-w-[200px] dark:text-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0 font-semibold hover:bg-transparent dark:text-gray-200 dark:hover:text-gray-100"
                  onClick={() => handleSort('notes')}
                >
                  Ghi Chú
                  {getSortIcon('notes')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.createdAt && (
              <TableHead className="whitespace-nowrap dark:text-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 p-0 font-semibold hover:bg-transparent dark:text-gray-200 dark:hover:text-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  Ngày Tạo
                  {getSortIcon('createdAt')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.actions && (
              <TableHead className="whitespace-nowrap dark:text-gray-200">Thao Tác</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow 
              key={contract.id}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              onDoubleClick={() => onEditContract && onEditContract(contract)}
            >
              {visibleColumns.companyName && (
                <TableCell className="font-medium whitespace-nowrap dark:text-gray-100">
                  {contract.companyName}
                </TableCell>
              )}
              {visibleColumns.contractNumber && (
                <TableCell className="whitespace-nowrap dark:text-gray-200">{contract.contractNumber}</TableCell>
              )}
              {visibleColumns.contractNumberAppendix && (
                <TableCell className="whitespace-nowrap dark:text-gray-200">{contract.contractNumberAppendix || '-'}</TableCell>
              )}
              {visibleColumns.phisicalStorageUnit && (
                <TableCell className="whitespace-nowrap dark:text-gray-200">{contract.phisicalStorageUnit || '-'}</TableCell>
              )}
              {visibleColumns.contractStartDate && (
                <TableCell className="whitespace-nowrap dark:text-gray-200">{formatDate(contract.contractStartDate)}</TableCell>
              )}
              {visibleColumns.contractEndDate && (
                <TableCell className="whitespace-nowrap dark:text-gray-200">{formatDate(contract.contractEndDate)}</TableCell>
              )}
              {visibleColumns.contractDurationMonths && (
                <TableCell className="whitespace-nowrap">
                  <div className="text-sm font-medium dark:text-gray-100">{contract.contractDurationMonths} tháng</div>
                </TableCell>
              )}
              {visibleColumns.contractValue && (
                <TableCell className="text-right whitespace-nowrap dark:text-gray-200">
                  {formatCurrency(contract.contractValue)}
                </TableCell>
              )}
              {visibleColumns.winningBidDecisionNumber && (
                <TableCell className="whitespace-nowrap dark:text-gray-200">{contract.winningBidDecisionNumber}</TableCell>
              )}
              {visibleColumns.contractType && (
                <TableCell className="whitespace-nowrap">
                  <Badge 
                    variant="outline" 
                    className={contract.contractType === 'Pharmaceuticals' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700' : 
                             contract.contractType === 'MedicalEquipment' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700' : 
                             'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'}
                  >
                    {contract.contractType === 'Pharmaceuticals' ? 'Dược Phẩm' :
                     contract.contractType === 'MedicalEquipment' ? 'Thiết Bị Y Tế' :
                     contract.contractType === 'Services' ? 'Dịch Vụ' :
                     contract.contractType === 'Consulting' ? 'Tư Vấn' : 
                     contract.contractType}
                  </Badge>
                </TableCell>
              )}
              {visibleColumns.status && (
                <TableCell className="whitespace-nowrap">
                  <Badge 
                    variant="outline" 
                    className={contract.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700' : 
                             contract.status === 'Expired' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700' : 
                             contract.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700' : 
                             'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'}
                  >
                    {contract.status === 'Active' ? 'Hoạt Động' :
                     contract.status === 'Expired' ? 'Hết Hạn' :
                     contract.status === 'Pending' ? 'Chờ Duyệt' :
                     contract.status === 'Cancelled' ? 'Đã Hủy' :
                     contract.status === 'Draft' ? 'Bản Nháp' :
                     contract.status}
                  </Badge>
                </TableCell>
              )}
              {visibleColumns.notes && (
                <TableCell className="max-w-[200px]">
                  <div className="truncate text-sm text-gray-600 dark:text-gray-300" title={contract.notes || ''}>
                    {contract.notes || '-'}
                  </div>
                </TableCell>
              )}
              {visibleColumns.createdAt && (
                <TableCell className="whitespace-nowrap dark:text-gray-200">{formatDate(contract.createdAt)}</TableCell>
              )}
              {visibleColumns.actions && (
                <TableCell className="whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 dark:text-gray-200 dark:hover:bg-gray-700">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                      {onViewContract && (
                        <DropdownMenuItem 
                          onClick={() => onViewContract(contract)}
                          className="cursor-pointer dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem Chi Tiết
                        </DropdownMenuItem>
                      )}
                      {onEditContract && (
                        <DropdownMenuItem 
                          onClick={() => onEditContract(contract)}
                          className="cursor-pointer dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh Sửa
                        </DropdownMenuItem>
                      )}
                      {onDeleteContract && (
                        <DropdownMenuItem 
                          onClick={() => onDeleteContract(contract)}
                          className="cursor-pointer text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa Hợp Đồng
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
