import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../hooks/useSettings';
import { backgroundScanner } from '../services/backgroundScanner';
import { notificationService } from '../services/notifications';
import type { AppSettings } from '../types';

export function ScanningSettings() {
  const { settings, updateSettings } = useSettings();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(backgroundScanner.isActive());
    
    // Check if background scanning should be active
    if (settings.autoScanEnabled && (settings.smsScanEnabled || settings.emailScanEnabled)) {
      backgroundScanner.start();
    } else {
      backgroundScanner.stop();
    }

    return () => {
      // Cleanup on unmount
    };
  }, [settings.autoScanEnabled, settings.smsScanEnabled, settings.emailScanEnabled, settings.scanInterval]);

  const handleToggle = (key: keyof AppSettings, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleKeywordChange = (keywords: string) => {
    const keywordArray = keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    updateSettings({ scanKeywords: keywordArray });
  };

  const handleTestScan = async () => {
    notificationService.show('Running test scan...', 'info');
    try {
      await backgroundScanner.performScan();
      notificationService.show('Test scan completed. Check for new refunds.', 'success');
    } catch (error: any) {
      notificationService.show(error.message || 'Test scan failed', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Background Scanning
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Automatically scan SMS and Email for refund notifications
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isActive && settings.autoScanEnabled
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}>
          {isActive && settings.autoScanEnabled ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="space-y-6">
        {/* Enable Auto-Scan */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-900 dark:text-white mb-1 block">
              Enable Background Scanning
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Automatically scan for new refunds in the background
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToggle('autoScanEnabled', !settings.autoScanEnabled)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              settings.autoScanEnabled
                ? 'bg-gray-900 dark:bg-gray-100'
                : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <motion.div
              className="absolute top-1 left-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-md"
              animate={{
                x: settings.autoScanEnabled ? 24 : 0,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        {/* SMS Scanning */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-900 dark:text-white mb-1 block">
              Scan SMS Messages
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Scan SMS messages for refund notifications (Android only)
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToggle('smsScanEnabled', !settings.smsScanEnabled)}
            disabled={!settings.autoScanEnabled}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              settings.smsScanEnabled && settings.autoScanEnabled
                ? 'bg-gray-900 dark:bg-gray-100'
                : 'bg-gray-300 dark:bg-gray-700'
            } ${!settings.autoScanEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <motion.div
              className="absolute top-1 left-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-md"
              animate={{
                x: settings.smsScanEnabled && settings.autoScanEnabled ? 24 : 0,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        {/* Email Scanning */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-900 dark:text-white mb-1 block">
              Scan Email Messages
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Scan connected email accounts for refund notifications
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToggle('emailScanEnabled', !settings.emailScanEnabled)}
            disabled={!settings.autoScanEnabled}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              settings.emailScanEnabled && settings.autoScanEnabled
                ? 'bg-gray-900 dark:bg-gray-100'
                : 'bg-gray-300 dark:bg-gray-700'
            } ${!settings.autoScanEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <motion.div
              className="absolute top-1 left-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-md"
              animate={{
                x: settings.emailScanEnabled && settings.autoScanEnabled ? 24 : 0,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        {/* Scan Interval */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
            Scan Interval (minutes)
          </label>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            How often to scan for new refunds
          </p>
          <select
            value={settings.scanInterval}
            onChange={(e) => handleToggle('scanInterval', parseInt(e.target.value))}
            disabled={!settings.autoScanEnabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="5">Every 5 minutes</option>
            <option value="15">Every 15 minutes</option>
            <option value="30">Every 30 minutes</option>
            <option value="60">Every hour</option>
            <option value="120">Every 2 hours</option>
            <option value="240">Every 4 hours</option>
          </select>
        </div>

        {/* Auto-Import */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-900 dark:text-white mb-1 block">
              Auto-Import Found Refunds
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Automatically import refunds found during scanning
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToggle('autoImportEnabled', !settings.autoImportEnabled)}
            disabled={!settings.autoScanEnabled}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              settings.autoImportEnabled && settings.autoScanEnabled
                ? 'bg-gray-900 dark:bg-gray-100'
                : 'bg-gray-300 dark:bg-gray-700'
            } ${!settings.autoScanEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <motion.div
              className="absolute top-1 left-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-md"
              animate={{
                x: settings.autoImportEnabled && settings.autoScanEnabled ? 24 : 0,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        {/* Keywords */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
            Scan Keywords
          </label>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Comma-separated keywords to look for in messages
          </p>
          <input
            type="text"
            value={settings.scanKeywords.join(', ')}
            onChange={(e) => handleKeywordChange(e.target.value)}
            placeholder="refund, return, reimbursement"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Last Scan Time */}
        {settings.lastScanTime && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Last Scan</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(settings.lastScanTime).toLocaleString()}
            </p>
          </div>
        )}

        {/* Test Scan Button */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTestScan}
          className="w-full px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
        >
          Run Test Scan Now
        </motion.button>
      </div>
    </motion.div>
  );
}
