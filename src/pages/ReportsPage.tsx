import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRefunds } from '../hooks/useRefunds';
import { BottomNavigation } from '../components/BottomNavigation';
import { exportToCSV, exportToJSON } from '../services/export';
import { Icons } from '../components/Icons';
import { differenceInDays } from 'date-fns';

export function ReportsPage() {
  const { refunds } = useRefunds();

  const stats = useMemo(() => {
    const total = refunds.length;
    const totalAmount = refunds.reduce((sum, r) => sum + r.amount, 0);
    
    const byStatus = refunds.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCurrency = refunds.reduce((acc, r) => {
      acc[r.currency] = (acc[r.currency] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);

    const paidRefunds = refunds.filter(r => r.status === 'PAID');
    const pendingRefunds = refunds.filter(r => r.status === 'PENDING');
    const processingRefunds = refunds.filter(r => r.status === 'APPROVED');

    const avgProcessingTime = paidRefunds.length > 0
      ? paidRefunds.reduce((sum, r) => {
          const days = differenceInDays(new Date(r.updatedAt), new Date(r.createdAt));
          return sum + Math.max(0, days);
        }, 0) / paidRefunds.length
      : 0;

    const oldestPending = pendingRefunds.length > 0
      ? pendingRefunds.reduce((oldest, r) => {
          return new Date(r.createdAt) < new Date(oldest.createdAt) ? r : oldest;
        }, pendingRefunds[0])
      : null;

    return {
      total,
      totalAmount,
      byStatus,
      byCurrency,
      paidCount: paidRefunds.length,
      pendingCount: pendingRefunds.length,
      processingCount: processingRefunds.length,
      avgProcessingTime: Math.round(avgProcessingTime),
      oldestPending,
    };
  }, [refunds]);

  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'INR': '₹',
    'EUR': '€',
    'GBP': '£',
  };

  const handleExportCSV = () => {
    exportToCSV(refunds);
  };

  const handleExportJSON = () => {
    exportToJSON(refunds);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <motion.h1 
            className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Reports & Analytics
          </motion.h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
          >
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Refunds</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
          >
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Amount</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {Object.entries(stats.byCurrency).map(([currency, amount]) => (
                <div key={currency}>
                  {currencySymbols[currency] || currency}{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.paidCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Processing</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.processingCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.pendingCount}</span>
            </div>
          </div>
        </motion.div>

        {/* Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Processing Time</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.avgProcessingTime} days</span>
            </div>
            {stats.oldestPending && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Oldest Pending</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {differenceInDays(new Date(), new Date(stats.oldestPending.createdAt))} days ago
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Export Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Data</h3>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCSV}
              className="w-full px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Icons.Download />
              <span>Export as CSV</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportJSON}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Icons.Download />
              <span>Export as JSON</span>
            </motion.button>
          </div>
        </motion.div>

        {refunds.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-500 dark:text-gray-400"
          >
            <Icons.Reports />
            <p className="text-lg mt-4">No data available</p>
            <p className="text-sm mt-2">Create refunds to see reports and analytics</p>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
