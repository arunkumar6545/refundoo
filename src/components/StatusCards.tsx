import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Refund } from '../types';
import { Icons } from './Icons';

interface StatusCardsProps {
  refunds: Refund[];
  onStatusClick?: (status: 'PENDING' | 'APPROVED' | 'PAID' | 'ALL') => void;
  activeStatus?: 'PENDING' | 'APPROVED' | 'PAID' | 'ALL';
}

export function StatusCards({ refunds, onStatusClick, activeStatus }: StatusCardsProps) {
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
    const processing = refunds.filter(r => r.status === 'APPROVED');
    const completed = refunds.filter(r => r.status === 'PAID');

    const pendingAmount = pending.reduce((sum, r) => sum + r.amount, 0);
    const processingAmount = processing.reduce((sum, r) => sum + r.amount, 0);
    const completedAmount = completed.reduce((sum, r) => sum + r.amount, 0);

    const totalCount = refunds.length || 1; // Avoid division by zero
    
    return {
      symbol,
      pending: { count: pending.length, amount: pendingAmount },
      processing: { count: processing.length, amount: processingAmount },
      completed: { count: completed.length, amount: completedAmount },
      totalCount,
    };
  }, [refunds]);

  const cards = [
    {
      status: 'PENDING',
      label: 'PENDING',
      amount: stats.pending.amount,
      Icon: Icons.Calendar,
      color: 'green',
      progress: stats.pending.count > 0 ? Math.min((stats.pending.count / stats.totalCount) * 100, 100) : 0,
    },
    {
      status: 'PROCESSING',
      label: 'PROCESSING',
      amount: stats.processing.amount,
      Icon: Icons.Package,
      color: 'orange',
      progress: stats.processing.count > 0 ? Math.min((stats.processing.count / stats.totalCount) * 100, 100) : 0,
    },
    {
      status: 'COMPLETED',
      label: 'COMPLETED',
      amount: stats.completed.amount,
      Icon: Icons.CheckCircle,
      color: 'purple',
      progress: 100, // Always full for completed
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-600 dark:text-green-400',
          border: 'border-green-200 dark:border-green-800',
          progress: 'text-green-600 dark:text-green-400',
          fill: 'fill-green-600 dark:fill-green-400',
        };
      case 'orange':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          text: 'text-orange-600 dark:text-orange-400',
          border: 'border-orange-200 dark:border-orange-800',
          progress: 'text-orange-600 dark:text-orange-400',
          fill: 'fill-orange-600 dark:fill-orange-400',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          text: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-200 dark:border-purple-800',
          progress: 'text-purple-600 dark:text-purple-400',
          fill: 'fill-purple-600 dark:fill-purple-400',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          text: 'text-gray-600 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-800',
          progress: 'text-gray-600 dark:text-gray-400',
          fill: 'fill-gray-600 dark:fill-gray-400',
        };
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {cards.map((card, index) => {
        const colors = getColorClasses(card.color);
        const circumference = 2 * Math.PI * 30; // radius = 30
        const offset = circumference - (card.progress / 100) * circumference;

        const statusMap: Record<string, 'PENDING' | 'APPROVED' | 'PAID' | 'ALL'> = {
          'PENDING': 'PENDING',
          'PROCESSING': 'APPROVED',
          'COMPLETED': 'PAID',
        };
        const mappedStatus = statusMap[card.status] || 'ALL';
        const isActive = activeStatus === mappedStatus;

        const isGradientTheme = document.documentElement.classList.contains('gradient-theme');
        const gradientBg = isGradientTheme ? {
          green: 'bg-gradient-to-br from-green-500 to-emerald-600',
          orange: 'bg-gradient-to-br from-orange-500 to-amber-600',
          purple: 'bg-gradient-to-br from-purple-500 to-pink-600',
        }[card.color] : colors.bg;

        return (
          <motion.div
            key={card.status}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: isActive ? 1.05 : 1,
              borderWidth: isActive ? 3 : 1,
            }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
            onClick={() => onStatusClick?.(mappedStatus)}
            className={`${isGradientTheme ? gradientBg : colors.bg} ${colors.border} border rounded-2xl p-4 relative overflow-hidden cursor-pointer hover:shadow-lg transition-all ${
              isActive ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100' : ''
            } ${isGradientTheme ? 'text-white' : ''}`}
          >
            <div className="flex flex-col items-center">
              {/* Icon */}
              <div className="text-2xl mb-2 flex items-center justify-center">
                <card.Icon />
              </div>
              
              {/* Status Label */}
              <div className={`text-xs font-semibold ${isGradientTheme ? 'text-white' : colors.text} mb-2 uppercase tracking-wide`}>
                {card.label}
              </div>

              {/* Circular Progress */}
              <div className="relative w-20 h-20 mb-3">
                <svg className="transform -rotate-90 w-20 h-20">
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className={isGradientTheme ? 'text-white/30' : 'text-gray-200 dark:text-gray-700'}
                  />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={isGradientTheme ? 'text-white' : colors.progress}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${isGradientTheme ? 'text-white' : colors.text}`}>
                    {Math.round(card.progress)}%
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className={`text-lg font-bold ${isGradientTheme ? 'text-white' : colors.text}`}>
                {stats.symbol}{card.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
