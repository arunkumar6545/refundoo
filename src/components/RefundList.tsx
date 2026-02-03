import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { Refund, SortField, SortDirection } from '../types';
import { generateSMSText, generateEmailDraft, copyToClipboard, openEmailDraft } from '../services/notifications';
import { getCompanyIcon } from '../services/seedData';

interface RefundListProps {
  refunds: Refund[];
  onEdit: (refund: Refund) => void;
  onDelete: (id: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  DELETED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export function RefundList({ refunds, onEdit, onDelete, sortField, sortDirection, onSortChange }: RefundListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    onSortChange(field);
  };

  const handleSMS = async (refund: Refund) => {
    const text = generateSMSText(refund);
    await copyToClipboard(text);
    alert('SMS text copied to clipboard!');
  };

  const handleEmail = (refund: Refund) => {
    const { subject, body } = generateEmailDraft(refund);
    openEmailDraft(subject, body);
  };

  if (refunds.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="glass-card rounded-2xl p-16 text-center"
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          📋
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No refunds found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first refund to get started</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary"
        >
          + Create First Refund
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSort('createdAt')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            sortField === 'createdAt'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSort('amount')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            sortField === 'amount'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSort('status')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            sortField === 'status'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
        </motion.button>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {refunds.map((refund, index) => (
          <motion.div
            key={refund.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.05,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            whileHover={{ 
              y: -8,
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="glass-card rounded-2xl p-6 card-hover cursor-pointer"
            onClick={() => setExpandedId(expandedId === refund.id ? null : refund.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="text-4xl"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {getCompanyIcon(refund.customerName)}
                </motion.div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {refund.customerName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {refund.orderId}
                  </p>
                </div>
              </div>
              <motion.span
                className={`px-3 py-1 text-xs font-bold rounded-full ${statusColors[refund.status] || statusColors.PENDING}`}
                whileHover={{ scale: 1.1 }}
              >
                {refund.status}
              </motion.span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {refund.currency} {refund.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Date</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {format(new Date(refund.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(refund);
                }}
                className="flex-1 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all"
              >
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(refund.id);
                }}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded details */}
      {expandedId && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="glass-card rounded-2xl shadow-2xl p-8 mb-4"
        >
          {(() => {
            const refund = refunds.find(r => r.id === expandedId);
            if (!refund) return null;
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{getCompanyIcon(refund.customerName)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Refund Details</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{refund.customerName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Refund ID</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{refund.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{refund.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{refund.contactPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reason</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{refund.reason}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tags</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {refund.tags.length > 0 ? refund.tags.join(', ') : 'None'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(refund.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  {refund.notes && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{refund.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleSMS(refund)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Copy SMS Text
                  </button>
                  <button
                    onClick={() => handleEmail(refund)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    Open Email Draft
                  </button>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
