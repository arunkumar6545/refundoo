import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Refund } from '../types';

interface TotalRefundsCardProps {
  refunds: Refund[];
}

export function TotalRefundsCard({ refunds }: TotalRefundsCardProps) {
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
    const totalAmount = refunds.reduce((sum, r) => sum + r.amount, 0);

    // Calculate month-to-date percentage (mock calculation)
    // In real app, compare with previous month
    const mtdPercentage = 12; // Mock value

    // Generate graph data points (mock trend)
    const graphPoints = [20, 35, 50, 65, 80, 100];

    return {
      symbol,
      totalAmount,
      mtdPercentage,
      graphPoints,
    };
  }, [refunds]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 mb-6 text-white shadow-xl"
    >
      <div className="text-sm font-medium text-white/90 mb-2">TOTAL REFUNDS</div>
      <div className="text-4xl font-bold mb-2">
        {stats.symbol}{stats.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/80">
          +{stats.mtdPercentage}% MTD
        </div>
        {/* Mini Line Graph */}
        <div className="flex items-end gap-1 h-12">
          {stats.graphPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${point}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="w-2 bg-white/80 rounded-t"
            />
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="ml-1 text-white"
          >
            ↗
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
