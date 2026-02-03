import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Refund, RefundFilters, SortField, SortDirection } from '../types';
import { Icons } from './Icons';

interface TransactionListProps {
  refunds: Refund[];
  filters?: RefundFilters;
  onTransactionClick?: (refund: Refund) => void;
  filterButton?: React.ReactNode;
}

export function TransactionList({ refunds, filters, onTransactionClick, filterButton }: TransactionListProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [groupByCompany, setGroupByCompany] = useState(false);

  const filteredRefunds = useMemo(() => {
    let filtered = [...refunds];

    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.orderId.toLowerCase().includes(searchLower) ||
            r.customerName.toLowerCase().includes(searchLower)
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

    return filtered.slice(0, 10); // Show top 10
  }, [refunds, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getCompanyInfo = (refund: Refund) => {
    const name = refund.customerName.toLowerCase();
    if (name.includes('amazon')) {
      return { 
        name: 'Amazon', 
        icon: <Icons.ShoppingCart />, 
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        percentage: 28 
      };
    }
    if (name.includes('apple')) {
      return { 
        name: 'Apple', 
        icon: <Icons.Package />, 
        bg: 'bg-gray-100 dark:bg-gray-800',
        percentage: 15 
      };
    }
    if (name.includes('flipkart') || name.includes('filkjort')) {
      return { 
        name: 'Flipkart', 
        icon: <Icons.Download />, 
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        percentage: 22 
      };
    }
    return { 
      name: refund.customerName || 'Unknown', 
      icon: <Icons.User />, 
      bg: 'bg-gray-100 dark:bg-gray-800',
      percentage: 10 
    };
  };

  // Group refunds by company
  const groupedRefunds = useMemo(() => {
    if (!groupByCompany) return null;

    const groups: Record<string, typeof filteredRefunds> = {};
    filteredRefunds.forEach(refund => {
      const companyInfo = getCompanyInfo(refund);
      const companyName = companyInfo.name;
      if (!groups[companyName]) {
        groups[companyName] = [];
      }
      groups[companyName].push(refund);
    });

    // Sort groups by total amount (descending)
    return Object.entries(groups).sort((a, b) => {
      const totalA = a[1].reduce((sum, r) => sum + r.amount, 0);
      const totalB = b[1].reduce((sum, r) => sum + r.amount, 0);
      return totalB - totalA;
    });
  }, [filteredRefunds, groupByCompany]);

  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'INR': '₹',
    'EUR': '€',
    'GBP': '£',
  };

  const isGradientTheme = typeof document !== 'undefined' && document.documentElement.classList.contains('gradient-theme');

  if (filteredRefunds.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-sm">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Section Label with Sort and Filter */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Recent Transactions
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setGroupByCompany(!groupByCompany)}
            className={`p-1.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1 ${
              groupByCompany
                ? 'bg-gray-600 dark:bg-gray-300 text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            title="Group by Company"
          >
            <Icons.Group />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSort('createdAt')}
            className={`p-1.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1 ${
              sortField === 'createdAt'
                ? 'bg-gray-600 dark:bg-gray-300 text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            title="Sort by Date"
          >
            <Icons.Calendar />
            {sortField === 'createdAt' && (
              <span className="text-xs leading-none">{sortDirection === 'desc' ? '↓' : '↑'}</span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSort('amount')}
            className={`p-1.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1 ${
              sortField === 'amount'
                ? 'bg-gray-600 dark:bg-gray-300 text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            title="Sort by Amount"
          >
            <Icons.Dollar />
            {sortField === 'amount' && (
              <span className="text-xs leading-none">{sortDirection === 'desc' ? '↓' : '↑'}</span>
            )}
          </motion.button>
          {filterButton}
        </div>
      </div>
      {groupByCompany && groupedRefunds ? (
        // Grouped view
        groupedRefunds.map(([companyName, companyRefunds], groupIndex) => {
          const firstRefund = companyRefunds[0];
          const companyInfo = getCompanyInfo(firstRefund);
          const symbol = currencySymbols[firstRefund.currency] || firstRefund.currency;
          const totalAmount = companyRefunds.reduce((sum, r) => sum + r.amount, 0);

          return (
            <motion.div
              key={companyName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.05 }}
              className={`mb-4 rounded-xl overflow-hidden ${
                isGradientTheme
                  ? 'bg-gray-800/60 backdrop-blur-sm border border-gray-700/50'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Company Header */}
              <div className={`p-3 border-b ${
                isGradientTheme ? 'border-gray-700/50' : 'border-gray-200 dark:border-gray-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${companyInfo.bg} flex items-center justify-center flex-shrink-0`}>
                      {companyInfo.icon}
                    </div>
                    <div>
                      <div className={`font-semibold ${
                        isGradientTheme ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}>
                        {companyName}
                      </div>
                      <div className={`text-xs ${
                        isGradientTheme ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {companyRefunds.length} transaction{companyRefunds.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    isGradientTheme ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {symbol}{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>

              {/* Company Transactions */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {companyRefunds.map((refund, index) => {
                  return (
                    <motion.div
                      key={refund.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (groupIndex * 0.05) + (index * 0.02) }}
                      onClick={() => onTransactionClick?.(refund)}
                      className={`p-3 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        isGradientTheme ? 'hover:bg-gray-800/80' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${
                            isGradientTheme ? 'text-white' : 'text-gray-900 dark:text-white'
                          }`}>
                            {refund.orderId}
                          </div>
                          <div className={`text-xs ${
                            isGradientTheme ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {new Date(refund.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`text-sm font-bold ${
                            isGradientTheme ? 'text-white' : 'text-gray-900 dark:text-white'
                          }`}>
                            {symbol}{refund.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${
                            refund.status === 'PAID' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            refund.status === 'APPROVED' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                            refund.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {refund.status}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })
      ) : (
        // Normal list view
        filteredRefunds.map((refund, index) => {
          const companyInfo = getCompanyInfo(refund);
          const symbol = currencySymbols[refund.currency] || refund.currency;
          const statusCount = filteredRefunds.filter(r => r.status === refund.status).length;

          return (
            <motion.div
              key={refund.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onTransactionClick?.(refund)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                isGradientTheme
                  ? 'bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800/80'
                  : 'bg-white dark:bg-gray-800 hover:shadow-md'
              }`}
            >
              {/* Left: Company Icon and Name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg ${companyInfo.bg} flex items-center justify-center text-lg flex-shrink-0`}>
                  {companyInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${
                    isGradientTheme ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {companyInfo.name}
                  </div>
                  <div className={`text-xs mt-0.5 ${
                    isGradientTheme ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {new Date(refund.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Percentage, Amount, and Badge */}
              <div className="flex items-center gap-3">
                <div className={`text-sm font-semibold ${
                  isGradientTheme ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {companyInfo.percentage}%
                </div>
                <div className={`text-base font-bold ${
                  isGradientTheme ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  {symbol}{refund.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isGradientTheme
                    ? 'bg-purple-500 text-white'
                    : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                }`}>
                  {statusCount}
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
