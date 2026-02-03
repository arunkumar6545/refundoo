import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Refund } from '../types';
import { differenceInDays } from 'date-fns';

interface RefundSummaryProps {
  refunds: Refund[];
}

export function RefundSummary({ refunds }: RefundSummaryProps) {
  const stats = useMemo(() => {
    const total = refunds.length;
    
    // Get most common currency or default to USD
    const currencyCounts = refunds.reduce((acc, r) => {
      acc[r.currency] = (acc[r.currency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const primaryCurrency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';
    
    // Currency symbols
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'INR': '₹',
      'EUR': '€',
      'GBP': '£',
    };
    const symbol = currencySymbols[primaryCurrency] || primaryCurrency;
    
    const totalAmount = refunds.reduce((sum, r) => sum + r.amount, 0);
    
    const byStatus = refunds.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);

    const paidRefunds = refunds.filter(r => r.status === 'PAID');
    const pendingToPaid = paidRefunds
      .map(r => {
        const pendingDate = new Date(r.createdAt);
        const paidDate = new Date(r.updatedAt);
        return differenceInDays(paidDate, pendingDate);
      })
      .filter(days => days >= 0);
    
    const avgTime = pendingToPaid.length > 0
      ? pendingToPaid.reduce((sum, days) => sum + days, 0) / pendingToPaid.length
      : 0;

    return {
      total,
      totalAmount,
      byStatus,
      avgTimeToPaid: Math.round(avgTime),
      currencySymbol: symbol,
    };
  }, [refunds]);

  const cards = [
    {
      title: 'Total Refunds',
      value: stats.total,
      icon: '📋',
    },
    {
      title: 'Total Amount',
      value: `${stats.currencySymbol}${stats.totalAmount.toFixed(2)}`,
      icon: '💰',
    },
    {
      title: 'Pending Amount',
      value: `${stats.currencySymbol}${(stats.byStatus.PENDING || 0).toFixed(2)}`,
      icon: '⏳',
    },
    {
      title: 'Avg Time to Paid',
      value: `${stats.avgTimeToPaid} days`,
      icon: '⏱️',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: index * 0.08,
            type: "spring",
            stiffness: 120,
            damping: 20,
            mass: 0.8
          }}
          whileHover={{ 
            y: -12,
            scale: 1.03,
            transition: { 
              type: "spring",
              stiffness: 400,
              damping: 25
            }
          }}
          className="glass-card rounded-xl p-6 relative overflow-hidden card-hover"
        >
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <motion.p 
                  className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 + 0.1 }}
                >
                  {card.title}
                </motion.p>
                <motion.p 
                  className="text-3xl font-bold text-gray-900 dark:text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: index * 0.08 + 0.2, 
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                >
                  {card.value}
                </motion.p>
              </div>
              <motion.div
                className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.08 + 0.3,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                whileHover={{ 
                  rotate: [0, -5, 5, -5, 0],
                  scale: 1.1,
                  transition: { duration: 0.5 }
                }}
              >
                <motion.span 
                  className="text-2xl"
                  animate={{ 
                    y: [0, -3, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                >
                  {card.icon}
                </motion.span>
              </motion.div>
            </div>
            <motion.div 
              className="h-0.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 mt-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.08 + 0.4, duration: 0.5 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
