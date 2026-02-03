import { motion } from 'framer-motion';
import type { RefundFilters, RefundStatus } from '../types';
import { Icons } from './Icons';

interface TransactionFiltersProps {
  filters: RefundFilters;
  onFiltersChange: (filters: RefundFilters) => void;
  onClear: () => void;
  companies: string[]; // List of unique company names
  currencies: string[]; // List of unique currencies
}

export function TransactionFilters({
  filters,
  onFiltersChange,
  onClear,
  companies,
  currencies,
}: TransactionFiltersProps) {
  const hasActiveFilters = 
    filters.search ||
    filters.status !== 'ALL' ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.amountMin ||
    filters.amountMax ||
    filters.company ||
    filters.currency;

  const updateFilter = (key: keyof RefundFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <div className="mb-4">
      {/* Filter Panel */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 mb-4 space-y-4"
      >
        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all text-xs font-medium flex items-center gap-1"
            >
              <Icons.X />
              Clear Filters
            </motion.button>
          </div>
        )}

        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by order ID, customer name..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => updateFilter('status', e.target.value as RefundStatus | 'ALL')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Processing</option>
            <option value="PAID">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Company */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Company
          </label>
          <select
            value={filters.company || ''}
            onChange={(e) => updateFilter('company', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Companies</option>
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Currency
          </label>
          <select
            value={filters.currency || ''}
            onChange={(e) => updateFilter('currency', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Currencies</option>
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Amount Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Min Amount
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.amountMin || ''}
              onChange={(e) => updateFilter('amountMin', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Max Amount
            </label>
            <input
              type="number"
              placeholder="No limit"
              value={filters.amountMax || ''}
              onChange={(e) => updateFilter('amountMax', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface FilterButtonProps {
  hasActiveFilters: boolean;
  onToggle: () => void;
}

export function FilterButton({ hasActiveFilters, onToggle }: FilterButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={`p-1.5 rounded-lg transition-all relative flex items-center justify-center ${
        hasActiveFilters
          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      }`}
      title="Filters"
    >
      <Icons.Search />
      {hasActiveFilters && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      )}
    </motion.button>
  );
}
