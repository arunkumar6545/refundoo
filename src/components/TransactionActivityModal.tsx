import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './Icons';
import type { Refund, RefundStatus } from '../types';

interface TransactionActivityModalProps {
  refund: Refund | null;
  onClose: () => void;
}

interface Activity {
  id: string;
  type: 'created' | 'status_changed' | 'updated' | 'note_added';
  title: string;
  description: string;
  timestamp: string;
  status?: RefundStatus;
}

export function TransactionActivityModal({ refund, onClose }: TransactionActivityModalProps) {
  if (!refund) return null;

  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'INR': '₹',
    'EUR': '€',
    'GBP': '£',
  };
  const symbol = currencySymbols[refund.currency] || refund.currency;

  // Generate activity history
  const activities: Activity[] = [
    {
      id: '1',
      type: 'created',
      title: 'Refund Request Created',
      description: `Refund request for order ${refund.orderId} was created`,
      timestamp: refund.createdAt,
    },
  ];

  // Add status change activity if updated
  if (refund.updatedAt !== refund.createdAt) {
    activities.push({
      id: '2',
      type: 'status_changed',
      title: `Status Changed to ${refund.status}`,
      description: `Refund status was updated to ${refund.status}`,
      timestamp: refund.updatedAt,
      status: refund.status,
    });
  }

  // Add note activity if notes exist
  if (refund.notes) {
    activities.push({
      id: '3',
      type: 'note_added',
      title: 'Note Added',
      description: refund.notes,
      timestamp: refund.updatedAt,
    });
  }

  // Sort activities by timestamp (newest first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'created':
        return <Icons.CheckCircle />;
      case 'status_changed':
        return <Icons.Refresh />;
      case 'updated':
        return <Icons.Settings />;
      case 'note_added':
        return <Icons.Alert />;
      default:
        return <Icons.Check />;
    }
  };

  const getStatusColor = (status?: RefundStatus) => {
    if (!status) return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    switch (status) {
      case 'PAID':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'APPROVED':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'REJECTED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const isGradientTheme = typeof document !== 'undefined' && document.documentElement.classList.contains('gradient-theme');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-md max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${
            isGradientTheme
              ? 'bg-gray-800/95 backdrop-blur-xl border border-gray-700/50'
              : 'bg-white dark:bg-gray-800'
          }`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${
            isGradientTheme ? 'border-gray-700/50' : 'border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${
                isGradientTheme ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>
                Transaction Activity
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-2 rounded-lg transition-all ${
                  isGradientTheme
                    ? 'hover:bg-gray-700/50 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icons.X />
              </motion.button>
            </div>

            {/* Transaction Summary */}
            <div className={`p-4 rounded-lg ${
              isGradientTheme ? 'bg-gray-700/30' : 'bg-gray-50 dark:bg-gray-700/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className={`text-sm font-medium ${
                    isGradientTheme ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Order ID
                  </div>
                  <div className={`text-base font-semibold ${
                    isGradientTheme ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {refund.orderId}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    isGradientTheme ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Amount
                  </div>
                  <div className={`text-lg font-bold ${
                    isGradientTheme ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {symbol}{refund.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(refund.status)}`}>
                  {refund.status}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
            <div className="relative">
              {/* Timeline line */}
              <div className={`absolute left-5 top-0 bottom-0 w-0.5 ${
                isGradientTheme ? 'bg-gray-700/50' : 'bg-gray-200 dark:bg-gray-700'
              }`} />

              {/* Activities */}
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start gap-4"
                  >
                    {/* Icon */}
                    <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                      activity.type === 'created'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : activity.type === 'status_changed'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {getActivityIcon(activity.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className={`font-semibold mb-1 ${
                        isGradientTheme ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}>
                        {activity.title}
                      </div>
                      <div className={`text-sm mb-2 ${
                        isGradientTheme ? 'text-white/70' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {activity.description}
                      </div>
                      <div className={`text-xs ${
                        isGradientTheme ? 'text-white/50' : 'text-gray-500 dark:text-gray-500'
                      }`}>
                        {new Date(activity.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${
            isGradientTheme ? 'border-gray-700/50' : 'border-gray-200 dark:border-gray-700'
          }`}>
            <div className={`text-xs text-center ${
              isGradientTheme ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'
            }`}>
              Created: {new Date(refund.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
