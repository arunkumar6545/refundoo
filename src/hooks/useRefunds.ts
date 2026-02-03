import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Refund, RefundFilters, SortField, SortDirection } from '../types';
import { loadRefunds, saveRefunds } from '../services/storage';
import { notificationService } from '../services/notifications';

export function useRefunds() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRefunds(loadRefunds());
    setLoading(false);
  }, []);

  const persist = useCallback((newRefunds: Refund[]) => {
    setRefunds(newRefunds);
    saveRefunds(newRefunds);
  }, []);

  const createRefund = useCallback((data: Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRefund: Refund = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    const updated = [...refunds, newRefund];
    persist(updated);
    notificationService.show('Refund created successfully', 'success');
    return newRefund;
  }, [refunds, persist]);

  const updateRefund = useCallback((id: string, updates: Partial<Omit<Refund, 'id' | 'createdAt'>>) => {
    const updated = refunds.map(refund => {
      if (refund.id === id) {
        const oldStatus = refund.status;
        const newRefund = {
          ...refund,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        
        if (oldStatus !== newRefund.status) {
          notificationService.show(`Refund status changed to ${newRefund.status}`, 'info');
        }
        
        return newRefund;
      }
      return refund;
    });
    
    persist(updated);
    notificationService.show('Refund updated successfully', 'success');
  }, [refunds, persist]);

  const deleteRefund = useCallback((id: string, hardDelete = false) => {
    if (hardDelete) {
      const updated = refunds.filter(r => r.id !== id);
      persist(updated);
      notificationService.show('Refund deleted permanently', 'info');
    } else {
      updateRefund(id, { status: 'DELETED' });
    }
  }, [refunds, persist, updateRefund]);

  const filterAndSort = useCallback((
    filters: RefundFilters,
    sortField: SortField = 'createdAt',
    sortDirection: SortDirection = 'desc'
  ): Refund[] => {
    let filtered = [...refunds].filter(refund => {
      if (filters.status !== 'ALL' && refund.status !== filters.status) {
        return false;
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          refund.id.toLowerCase().includes(searchLower) ||
          refund.orderId.toLowerCase().includes(searchLower) ||
          refund.customerName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.dateFrom) {
        if (new Date(refund.createdAt) < new Date(filters.dateFrom)) {
          return false;
        }
      }

      if (filters.dateTo) {
        if (new Date(refund.createdAt) > new Date(filters.dateTo)) {
          return false;
        }
      }

      if (filters.amountMin !== undefined && refund.amount < filters.amountMin) {
        return false;
      }

      if (filters.amountMax !== undefined && refund.amount > filters.amountMax) {
        return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'amount':
          aVal = a.amount;
          bVal = b.amount;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [refunds]);

  return {
    refunds,
    loading,
    createRefund,
    updateRefund,
    deleteRefund,
    filterAndSort,
  };
}
