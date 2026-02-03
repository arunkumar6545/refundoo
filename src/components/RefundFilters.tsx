import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RefundFilters as RefundFiltersType, RefundStatus } from '../types';

interface RefundFiltersProps {
  filters: RefundFiltersType;
  onFiltersChange: (filters: RefundFiltersType) => void;
}

export function RefundFilters({ filters, onFiltersChange }: RefundFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const updateFilter = (key: keyof RefundFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 mb-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span 
              className="text-xl"
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🔍
            </motion.span>
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Filters</h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setExpanded(!expanded)}
          className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium shadow-md"
        >
          {expanded ? '▲ Collapse' : '▼ Expand'}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🔎 Search
          </label>
          <input
            type="text"
            placeholder="Search by ID, Order ID, or Customer Name"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-gray-100 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            📊 Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value as RefundStatus | 'ALL')}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-gray-100 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition-all duration-300"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                📅 Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-gray-100 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                📅 Date To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-gray-100 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                💵 Min Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={filters.amountMin || ''}
                onChange={(e) => updateFilter('amountMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-gray-100 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                💵 Max Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={filters.amountMax || ''}
                onChange={(e) => updateFilter('amountMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-gray-100 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition-all duration-300"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFiltersChange({
            search: '',
            status: 'ALL',
            dateFrom: undefined,
            dateTo: undefined,
            amountMin: undefined,
            amountMax: undefined,
          })}
          className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
        >
          🗑️ Clear Filters
        </motion.button>
    </motion.div>
  );
}
