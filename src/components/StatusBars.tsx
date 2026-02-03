import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Refund } from '../types';

interface StatusBarsProps {
  refunds: Refund[];
  onStatusClick?: (status: 'PENDING' | 'APPROVED' | 'PAID' | 'ALL') => void;
}

export function StatusBars({ refunds, onStatusClick }: StatusBarsProps) {
  const stats = useMemo(() => {
    const currencyCounts = refunds.reduce((acc, r) => {
      acc[r.currency] = (acc[r.currency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const primaryCurrency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'INR';
    
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'INR': '₹',
      'EUR': '€',
      'GBP': '£',
    };
    const symbol = currencySymbols[primaryCurrency] || primaryCurrency;

    const pending = refunds.filter(r => r.status === 'PENDING');
    const completed = refunds.filter(r => r.status === 'PAID');

    const pendingAmount = pending.reduce((sum, r) => sum + r.amount, 0);
    const completedAmount = completed.reduce((sum, r) => sum + r.amount, 0);
    const totalAmount = refunds.reduce((sum, r) => sum + r.amount, 0);

    const pendingPercentage = totalAmount > 0 ? (pendingAmount / totalAmount) * 100 : 0;
    const completedPercentage = totalAmount > 0 ? (completedAmount / totalAmount) * 100 : 0;

    return {
      symbol,
      pending: { count: pending.length, amount: pendingAmount, percentage: pendingPercentage },
      completed: { count: completed.length, amount: completedAmount, percentage: completedPercentage },
    };
  }, [refunds]);

  const isGradientTheme = typeof document !== 'undefined' && document.documentElement.classList.contains('gradient-theme');

  return (
    <div className="space-y-4 mb-6">
      {/* PENDING Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => onStatusClick?.('PENDING')}
        className="cursor-pointer"
      >
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
          PENDING
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.pending.percentage}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`h-full ${
                isGradientTheme
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600'
                  : 'bg-orange-500'
              }`}
            />
          </div>
          <div className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            {stats.symbol}{stats.pending.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </motion.div>

      {/* COMPLETED Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => onStatusClick?.('PAID')}
        className="cursor-pointer"
      >
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
          COMPLETED
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.completed.percentage}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`h-full ${
                isGradientTheme
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600'
                  : 'bg-purple-500'
              }`}
            />
          </div>
          <div className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            {stats.symbol}{stats.completed.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
