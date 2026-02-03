import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobilePermissions, type PermissionStatus } from '../services/mobilePermissions';
import { notificationService } from '../services/notifications';
import { SMSReader, type ParsedRefundData } from '../services/smsReader';
import { useRefunds } from '../hooks/useRefunds';

export function SMSPermissionManager() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({ 
    granted: false, 
    denied: false, 
    prompt: true 
  });
  const [loading, setLoading] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [foundRefunds, setFoundRefunds] = useState<ParsedRefundData[]>([]);
  const [selectedRefunds, setSelectedRefunds] = useState<Set<number>>(new Set());
  const { createRefund } = useRefunds();

  useEffect(() => {
    checkPlatformAndPermission();
  }, []);

  const checkPlatformAndPermission = async () => {
    setChecking(true);
    try {
      const native = await MobilePermissions.isNativePlatform();
      setIsNative(native);
      
      if (native) {
        const status = await MobilePermissions.checkSMSPermission();
        setPermissionStatus(status);
      }
    } catch (error) {
      console.error('Error checking permission:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      const result = await MobilePermissions.requestSMSPermission();
      setPermissionStatus(result);
      
      if (result.granted) {
        notificationService.show('SMS permission granted successfully!', 'success');
      } else if (result.denied) {
        notificationService.show('SMS permission was denied. Please enable it in settings.', 'error');
      }
    } catch (error: any) {
      console.error('Permission request error:', error);
      notificationService.show(error.message || 'Failed to request SMS permission', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSettings = async () => {
    try {
      await MobilePermissions.openAppSettings();
      notificationService.show('Please enable SMS permission in settings and return to the app', 'info');
    } catch (error: any) {
      notificationService.show('Failed to open settings', 'error');
    }
  };

  const handleScanSMS = async () => {
    setScanning(true);
    setFoundRefunds([]);
    setSelectedRefunds(new Set());

    try {
      const refunds = await SMSReader.scanAndImportRefunds();
      setFoundRefunds(refunds);
      setSelectedRefunds(new Set(refunds.map((_, index) => index)));

      if (refunds.length === 0) {
        notificationService.show('No refund data found in SMS messages', 'info');
      } else {
        notificationService.show(`Found ${refunds.length} potential refund(s)`, 'success');
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      notificationService.show(
        error.message || 'Failed to scan SMS messages. Please check permissions.',
        'error'
      );
    } finally {
      setScanning(false);
    }
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
          reason: refundData.reason || 'Auto-imported from SMS',
          status: refundData.status || 'PENDING',
          tags: ['auto-imported', 'sms'],
          notes: 'Imported from SMS',
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

  if (checking) {
    return (
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-2xl"
          >
            ⏳
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            📱 SMS Access
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Grant permission to scan SMS messages for automatic refund detection
          </p>
        </div>
      </div>

      {!isNative ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
        >
          <div className="flex items-start gap-4">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                SMS Reading - Mobile App Required
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                SMS reading is only available on mobile devices. The web version uses mock data for testing purposes.
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>📱 <strong>Mobile App:</strong> Full SMS reading with permissions</p>
                <p>🌐 <strong>Web Browser:</strong> Mock data for testing (no real SMS access)</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Permission Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-4 border-2 ${
              permissionStatus.granted
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : permissionStatus.denied
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {permissionStatus.granted ? '✅' : permissionStatus.denied ? '❌' : '⚠️'}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {permissionStatus.granted
                    ? 'SMS Permission Granted'
                    : permissionStatus.denied
                    ? 'SMS Permission Denied'
                    : 'SMS Permission Not Requested'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {permissionStatus.granted
                    ? 'Your app can now scan SMS messages for refund notifications'
                    : permissionStatus.denied
                    ? 'SMS access was denied. Enable it in your device settings to scan messages.'
                    : 'Request permission to automatically scan SMS messages for refunds'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!permissionStatus.granted && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRequestPermission}
                disabled={loading || permissionStatus.denied}
                className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="text-xl"
                    >
                      ⏳
                    </motion.span>
                    <span>Requesting...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">🔐</span>
                    <span>Request SMS Permission</span>
                  </>
                )}
              </motion.button>
            )}

            {permissionStatus.denied && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenSettings}
                className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg font-medium shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 flex items-center gap-2"
              >
                <span className="text-xl">⚙️</span>
                <span>Open Settings</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={checkPlatformAndPermission}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              <span className="text-xl">🔄</span>
              <span>Refresh Status</span>
            </motion.button>
          </div>

          {/* Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mt-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
              ℹ️ About SMS Permissions
            </h5>
            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <li>• SMS reading helps automatically detect refund notifications</li>
              <li>• Your messages are processed locally and never shared</li>
              <li>• You can revoke permission anytime in device settings</li>
              <li>• Only messages containing refund keywords are scanned</li>
            </ul>
          </div>

          {/* SMS Scanner Section */}
          {permissionStatus.granted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    📱 Scan SMS Messages
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scan your SMS messages to automatically extract refund information
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowScanner(!showScanner)}
                  className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {showScanner ? 'Hide Scanner' : 'Show Scanner'}
                </motion.button>
              </div>

              <AnimatePresence>
                {showScanner && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleScanSMS}
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
                          <span>Scanning SMS...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🔍</span>
                          <span>Scan SMS for Refunds</span>
                        </>
                      )}
                    </motion.button>

                    {foundRefunds.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            Found {foundRefunds.length} refund(s)
                          </h5>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleImportSelected}
                            disabled={selectedRefunds.size === 0}
                            className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            Import Selected ({selectedRefunds.size})
                          </motion.button>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {foundRefunds.map((refund, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedRefunds.has(index)
                                  ? 'border-gray-900 dark:border-gray-100 bg-gray-100 dark:bg-gray-800'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                              onClick={() => toggleSelection(index)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <input
                                      type="checkbox"
                                      checked={selectedRefunds.has(index)}
                                      onChange={() => toggleSelection(index)}
                                      className="rounded"
                                    />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {refund.orderId || 'Unknown Order'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {refund.customerName || 'Unknown Customer'}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                    {refund.currency || 'USD'} {refund.amount?.toFixed(2) || '0.00'}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
