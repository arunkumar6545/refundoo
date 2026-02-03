import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PermissionRequest } from './PermissionRequest';
import { SMSReader, type ParsedRefundData } from '../services/smsReader';
import { EmailReader } from '../services/emailReader';
import { notificationService } from '../services/notifications';
import { useRefunds } from '../hooks/useRefunds';
import { getActiveEmailAccounts } from '../services/emailAuth';
import type { EmailAccount } from '../types';

interface SMSEmailScannerProps {
  onClose?: () => void;
  defaultTab?: 'sms' | 'email';
}

export function SMSEmailScanner({ onClose, defaultTab = 'sms' }: SMSEmailScannerProps = {}) {
  const [activeTab, setActiveTab] = useState<'sms' | 'email'>(defaultTab);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [foundRefunds, setFoundRefunds] = useState<ParsedRefundData[]>([]);
  const [selectedRefunds, setSelectedRefunds] = useState<Set<number>>(new Set());
  const [connectedAccounts, setConnectedAccounts] = useState<EmailAccount[]>([]);
  const { createRefund } = useRefunds();

  useEffect(() => {
    if (activeTab === 'email') {
      setConnectedAccounts(getActiveEmailAccounts());
    }
  }, [activeTab]);

  const handleScan = async () => {
    setScanning(true);
    setFoundRefunds([]);
    setSelectedRefunds(new Set());

    try {
      let refunds: ParsedRefundData[];
      
      if (activeTab === 'sms') {
        refunds = await SMSReader.scanAndImportRefunds();
      } else {
        refunds = await EmailReader.scanAndImportRefunds();
      }

      setFoundRefunds(refunds);
      // Auto-select all found refunds
      setSelectedRefunds(new Set(refunds.map((_, index) => index)));

      if (refunds.length === 0) {
        notificationService.show('No refund data found in messages', 'info');
      } else {
        notificationService.show(`Found ${refunds.length} potential refund(s)`, 'success');
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      notificationService.show(
        error.message || 'Failed to scan messages. Please check permissions.',
        'error'
      );
    } finally {
      setScanning(false);
    }
  };

  const handleImportSelected = () => {
    const toImport = foundRefunds.filter((_, index) => selectedRefunds.has(index));
    
    let imported = 0;
    for (const refundData of toImport) {
      try {
        createRefund({
          orderId: refundData.orderId || `AUTO-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          customerName: refundData.customerName || 'Unknown',
          contactPhone: refundData.phone || '',
          email: refundData.email || '',
          amount: refundData.amount || 0,
          currency: refundData.currency || 'USD',
          reason: refundData.reason || 'Auto-imported from message',
          status: refundData.status || 'PENDING',
          tags: ['auto-imported', activeTab],
          notes: `Imported from ${activeTab.toUpperCase()}`,
        });
        imported++;
      } catch (error) {
        console.error('Import error:', error);
      }
    }

    notificationService.show(`Imported ${imported} refund(s) successfully`, 'success');
    setFoundRefunds([]);
    setSelectedRefunds(new Set());
  };

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedRefunds);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRefunds(newSelected);
  };

  return (
    <div className="glass-card rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Scan Messages for Refunds
        </h2>
        {onClose && (
          <button
            onClick={() => {
              setFoundRefunds([]);
              setSelectedRefunds(new Set());
              setPermissionGranted(false);
              onClose();
            }}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
            aria-label="Close scanner"
          >
            ×
          </button>
        )}
      </div>

      {/* Tabs - Only show if SMS is available (not from dashboard) */}
      {defaultTab !== 'email' && (
        <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setActiveTab('sms');
              setPermissionGranted(false);
              setFoundRefunds([]);
            }}
            className={`px-4 py-2 font-medium transition-colors rounded-t-lg ${
              activeTab === 'sms'
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            📱 SMS
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setActiveTab('email');
              setPermissionGranted(false);
              setFoundRefunds([]);
              setConnectedAccounts(getActiveEmailAccounts());
            }}
            className={`px-4 py-2 font-medium transition-colors rounded-t-lg ${
              activeTab === 'email'
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            📧 Email
          </motion.button>
        </div>
      )}

      {/* Email Accounts Info */}
      {activeTab === 'email' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          {connectedAccounts.length > 0 ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {connectedAccounts.length} Email Account{connectedAccounts.length > 1 ? 's' : ''} Connected
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {connectedAccounts.map((account) => (
                      <span
                        key={account.id}
                        className="px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs font-medium"
                      >
                        {account.email}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    No Email Accounts Connected
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Connect your Gmail, Yahoo, Outlook, or other email accounts to scan for refunds automatically.
                  </p>
                  <Link to="/settings">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 text-sm"
                    >
                      + Connect Email Account
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Permission Request */}
      <PermissionRequest
        type={activeTab}
        onGranted={() => setPermissionGranted(true)}
      />

      {/* Scan Button - Always visible, works with mock data on web */}
      <div className="mb-4">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleScan}
          disabled={scanning}
          className="w-full px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {scanning ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-xl"
              >
                ⏳
              </motion.span>
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <span className="text-xl">🔍</span>
              <span>Scan {activeTab.toUpperCase()} for Refunds</span>
            </>
          )}
        </motion.button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          {activeTab === 'email' && connectedAccounts.length === 0 && 'Connect email accounts in Settings to scan real emails. Currently using mock data.'}
          {activeTab === 'sms' && !permissionGranted && 'Using mock data for testing. Grant permissions on mobile for real message scanning.'}
        </p>
      </div>

      {/* Found Refunds */}
      <AnimatePresence>
        {foundRefunds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Found {foundRefunds.length} refund(s)
              </h3>
              <button
                onClick={handleImportSelected}
                disabled={selectedRefunds.size === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Selected ({selectedRefunds.size})
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {foundRefunds.map((refund, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRefunds.has(index)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => toggleSelection(index)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedRefunds.has(index)}
                      onChange={() => toggleSelection(index)}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {refund.orderId && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium">
                            {refund.orderId}
                          </span>
                        )}
                        {refund.status && (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            refund.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            refund.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            refund.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {refund.status}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {refund.amount && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Amount: </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {refund.currency} {refund.amount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {refund.customerName && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Customer: </span>
                            <span className="font-medium text-gray-900 dark:text-white">{refund.customerName}</span>
                          </div>
                        )}
                        {refund.reason && (
                          <div className="col-span-2">
                            <span className="text-gray-500 dark:text-gray-400">Reason: </span>
                            <span className="font-medium text-gray-900 dark:text-white">{refund.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
