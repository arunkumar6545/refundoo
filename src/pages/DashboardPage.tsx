import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRefunds } from '../hooks/useRefunds';
import { useSettings } from '../hooks/useSettings';
import { RefundForm } from '../components/RefundForm';
import { TotalRefundsCard } from '../components/TotalRefundsCard';
import { StatusBars } from '../components/StatusBars';
import { TransactionList } from '../components/TransactionList';
import { TransactionFilters, FilterButton } from '../components/TransactionFilters';
import { BottomNavigation } from '../components/BottomNavigation';
import { TransactionActivityModal } from '../components/TransactionActivityModal';
import { Icons } from '../components/Icons';
import { seedRefunds } from '../services/seedData';
import type { Refund, RefundFilters, RefundStatus } from '../types';

export function DashboardPage() {
  const { refunds, createRefund, updateRefund } = useRefunds();
  const { settings, updateSettings } = useSettings();
  
  const [showForm, setShowForm] = useState(false);
  const [editingRefund, setEditingRefund] = useState<Refund | undefined>();
  const [selectedTransaction, setSelectedTransaction] = useState<Refund | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [filters, setFilters] = useState<RefundFilters>({
    search: '',
    status: 'ALL',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get unique companies and currencies for filter dropdowns
  const companies = useMemo(() => {
    const unique = new Set(refunds.map(r => r.customerName).filter(Boolean));
    return Array.from(unique).sort();
  }, [refunds]);

  const currencies = useMemo(() => {
    const unique = new Set(refunds.map(r => r.currency).filter(Boolean));
    return Array.from(unique).sort();
  }, [refunds]);

  const handleStatusClick = (status: 'PENDING' | 'APPROVED' | 'PAID' | 'ALL') => {
    if (status === 'ALL') {
      setFilters({ ...filters, status: 'ALL' });
    } else {
      const statusMap: Record<string, RefundStatus> = {
        'PENDING': 'PENDING',
        'APPROVED': 'APPROVED',
        'PAID': 'PAID',
      };
      setFilters({ ...filters, status: statusMap[status] || 'ALL' });
    }
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: 'ALL' });
  };

  useEffect(() => {
    // Check current theme
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (settings.theme === 'system') {
        checkTheme();
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [settings.theme]);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  useEffect(() => {
    const handleOpenForm = () => {
      setEditingRefund(undefined);
      setShowForm(true);
    };
    window.addEventListener('openRefundForm', handleOpenForm);
    return () => window.removeEventListener('openRefundForm', handleOpenForm);
  }, []);

  const handleCreate = (data: Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>) => {
    createRefund(data);
    setShowForm(false);
  };

  const handleUpdate = (data: Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingRefund) {
      updateRefund(editingRefund.id, data);
      setEditingRefund(undefined);
    }
  };


  const handleTransactionClick = (refund: Refund) => {
    setSelectedTransaction(refund);
  };

  const [isGradientTheme, setIsGradientTheme] = useState(false);

  useEffect(() => {
    const checkGradientTheme = () => {
      setIsGradientTheme(document.documentElement.classList.contains('gradient-theme'));
    };
    checkGradientTheme();
    const observer = new MutationObserver(checkGradientTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [settings.theme]);

  return (
    <div className={`min-h-screen pb-20 ${
      isGradientTheme 
        ? 'bg-gray-900' 
        : 'bg-gray-50 dark:bg-gray-900'
    }`}>
      {/* Header */}
      <div className={`border-b sticky top-0 z-40 ${
        isGradientTheme
          ? 'bg-gray-800/90 backdrop-blur-xl border-gray-700/50'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.h1 
              className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider flex-1 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Refundoo
            </motion.h1>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {isDark ? <Icons.Sun /> : <Icons.Moon />}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Total Refunds Card */}
        <TotalRefundsCard refunds={refunds} />

        {/* Status Bars */}
        <StatusBars 
          refunds={refunds} 
          onStatusClick={handleStatusClick}
        />

        {/* Transaction List with Filter Button */}
        <div className="mb-4">
          <TransactionList 
            refunds={refunds}
            filters={filters}
            onTransactionClick={handleTransactionClick}
            filterButton={
              <FilterButton
                hasActiveFilters={
                  !!(filters.search || filters.status !== 'ALL' || filters.company || filters.currency || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax)
                }
                onToggle={() => setShowFilters(!showFilters)}
              />
            }
          />
        </div>

        {/* Transaction Filters (Collapsible) */}
        {showFilters && (
          <TransactionFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClear={handleClearFilters}
            companies={companies}
            currencies={currencies}
          />
        )}

        {/* Load Sample Data Button (if no data) */}
        {refunds.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={seedRefunds}
              className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium shadow-md"
            >
              Load Sample Data
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Refund Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <RefundForm
              refund={editingRefund}
              onSubmit={editingRefund ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingRefund(undefined);
              }}
            />
          </motion.div>
        </div>
      )}

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
