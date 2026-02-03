import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { differenceInDays } from 'date-fns';
import type { Refund, RefundFilters, SortField, SortDirection } from '../types';
import { Icons } from './Icons';

interface RecentTransactionsProps {
  refunds: Refund[];
  filters?: RefundFilters;
  onTransactionClick?: (refund: Refund) => void;
}

export function RecentTransactions({ refunds, filters, onTransactionClick }: RecentTransactionsProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filteredAndSortedRefunds = useMemo(() => {
    let filtered = [...refunds];

    // Apply filters
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.orderId.toLowerCase().includes(searchLower) ||
            r.customerName.toLowerCase().includes(searchLower) ||
            r.id.toLowerCase().includes(searchLower)
        );
      }

      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter((r) => r.status === filters.status);
      }

      if (filters.company) {
        filtered = filtered.filter((r) =>
          r.customerName.toLowerCase().includes(filters.company!.toLowerCase())
        );
      }

      if (filters.currency) {
        filtered = filtered.filter((r) => r.currency === filters.currency);
      }

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filtered = filtered.filter((r) => new Date(r.createdAt) >= fromDate);
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((r) => new Date(r.createdAt) <= toDate);
      }

      if (filters.amountMin !== undefined) {
        filtered = filtered.filter((r) => r.amount >= filters.amountMin!);
      }

      if (filters.amountMax !== undefined) {
        filtered = filtered.filter((r) => r.amount <= filters.amountMax!);
      }
    }

    // Apply sorting
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
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [refunds, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusInfo = (refund: Refund) => {
    const now = new Date();
    const created = new Date(refund.createdAt);
    const daysDiff = differenceInDays(now, created);

    switch (refund.status) {
      case 'PAID':
        return {
          text: 'DELIVERED',
          icon: '✅',
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-900/20',
        };
      case 'APPROVED':
        return {
          text: 'PROCESSING',
          icon: '⏳',
          color: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-orange-50 dark:bg-orange-900/20',
        };
      case 'PENDING':
        const dueDays = 7 - daysDiff;
        if (dueDays > 0) {
          return {
            text: `DUE IN ${dueDays} DAY${dueDays !== 1 ? 'S' : ''}`,
            icon: '⏰',
            color: 'text-yellow-600 dark:text-yellow-400',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          };
        } else {
          return {
            text: 'OVERDUE',
            icon: '⚠️',
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-900/20',
          };
        }
      default:
        return {
          text: refund.status,
          icon: '📋',
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-50 dark:bg-gray-900/20',
        };
    }
  };

  const getCompanyIcon = (refund: Refund) => {
    const name = refund.customerName.toLowerCase();
    if (name.includes('amazon')) return { icon: '🛒', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    if (name.includes('apple')) return { icon: '🍎', bg: 'bg-orange-100 dark:bg-orange-900/30' };
    if (name.includes('flipkart') || name.includes('filkjort')) return { icon: '🛍️', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    return { icon: '👤', bg: 'bg-gray-100 dark:bg-gray-800' };
  };

  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'INR': '₹',
    'EUR': '€',
    'GBP': '£',
  };

  if (filteredAndSortedRefunds.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">No transactions found</p>
        <p className="text-sm mt-2">
          {filters && Object.keys(filters).some(k => filters[k as keyof RefundFilters]) 
            ? 'Try adjusting your filters' 
            : 'Create your first refund to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {filteredAndSortedRefunds.length} transaction{filteredAndSortedRefunds.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSort('createdAt')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              sortField === 'createdAt'
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Icons.Calendar />
            Date
            {sortField === 'createdAt' && (
              <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSort('amount')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              sortField === 'amount'
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Icons.Dollar />
            Amount
            {sortField === 'amount' && (
              <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            )}
          </motion.button>
        </div>
      </div>

      {filteredAndSortedRefunds.map((refund, index) => {
        const statusInfo = getStatusInfo(refund);
        const companyIcon = getCompanyIcon(refund);
        const symbol = currencySymbols[refund.currency] || refund.currency;

        return (
          <motion.div
            key={refund.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onTransactionClick?.(refund)}
            className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
              document.documentElement.classList.contains('gradient-theme')
                ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700/50'
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              {/* Left: Icon and Info */}
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-12 h-12 rounded-full ${companyIcon.bg} flex items-center justify-center text-xl`}>
                  {companyIcon.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">
                    {refund.customerName || refund.orderId}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                    {refund.status === 'PAID' && (
                      <span className="text-xs text-green-600 dark:text-green-400">✅</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Amount and Status */}
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {symbol}{refund.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="flex items-center justify-end gap-1 mt-1">
                  {refund.status === 'PAID' ? (
                    <>
                      <span className="text-xs text-green-600 dark:text-green-400">✅</span>
                      <span className="text-xs text-green-600 dark:text-green-400">DELIVERED</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs">⏰</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{statusInfo.text}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
