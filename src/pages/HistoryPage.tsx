import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRefunds } from '../hooks/useRefunds';
import { BottomNavigation } from '../components/BottomNavigation';
import { RecentTransactions } from '../components/RecentTransactions';
import { TransactionFilters } from '../components/TransactionFilters';
import { TransactionActivityModal } from '../components/TransactionActivityModal';
import { Icons } from '../components/Icons';
import type { Refund, RefundFilters } from '../types';

export function HistoryPage() {
  const { refunds } = useRefunds();
  const [filters, setFilters] = useState<RefundFilters>({
    search: '',
    status: 'ALL',
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Refund | null>(null);

  // Get unique companies and currencies for filter dropdowns
  const companies = useMemo(() => {
    const unique = new Set(refunds.map(r => r.customerName).filter(Boolean));
    return Array.from(unique).sort();
  }, [refunds]);

  const currencies = useMemo(() => {
    const unique = new Set(refunds.map(r => r.currency).filter(Boolean));
    return Array.from(unique).sort();
  }, [refunds]);

  const handleClearFilters = () => {
    setFilters({ search: '', status: 'ALL' });
  };

  const handleTransactionClick = (refund: Refund) => {
    setSelectedTransaction(refund);
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
            Transaction History
          </motion.h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Transaction Filters */}
        <TransactionFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClear={handleClearFilters}
          companies={companies}
          currencies={currencies}
        />

        {/* Transactions List */}
        <RecentTransactions 
          refunds={refunds}
          filters={filters}
          onTransactionClick={handleTransactionClick}
        />

        {refunds.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-500 dark:text-gray-400"
          >
            <Icons.History />
            <p className="text-lg mt-4">No transaction history</p>
            <p className="text-sm mt-2">Your refund transactions will appear here</p>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Transaction Activity Modal */}
      <TransactionActivityModal
        refund={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
