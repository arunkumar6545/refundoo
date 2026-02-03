import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MobilePermissions, type PermissionStatus } from '../services/mobilePermissions';

interface PermissionRequestProps {
  onGranted: () => void;
  type: 'sms' | 'email';
}

export function PermissionRequest({ onGranted, type }: PermissionRequestProps) {
  const [status, setStatus] = useState<PermissionStatus>({ granted: false, denied: false, prompt: true });
  const [loading, setLoading] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    MobilePermissions.isNativePlatform().then(setIsNative);
    if (type === 'sms') {
      MobilePermissions.checkSMSPermission().then(setStatus);
    }
  }, [type]);

  const handleRequest = async () => {
    setLoading(true);
    try {
      let result: PermissionStatus;
      if (type === 'sms') {
        result = await MobilePermissions.requestSMSPermission();
      } else {
        result = await MobilePermissions.requestEmailPermission();
      }
      setStatus(result);
      if (result.granted) {
        onGranted();
      }
    } catch (error) {
      console.error('Permission request error:', error);
      alert('Failed to request permission. Please enable it manually in settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSettings = async () => {
    await MobilePermissions.openAppSettings();
  };

  if (!isNative) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-4"
      >
        <div className="flex items-start gap-4">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {type === 'sms' ? 'SMS Reading' : 'Email Reading'} - Mobile App Required
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              {type === 'sms' 
                ? 'To scan SMS messages for refunds, you need to use the mobile app. The web version can use mock data for testing, or you can manually enter refund information.'
                : 'To scan emails for refunds, you need to use the mobile app. The web version can use mock data for testing, or you can manually enter refund information.'}
            </p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>📱 <strong>Mobile App:</strong> Full SMS/Email reading with permissions</p>
              <p>🌐 <strong>Web Browser:</strong> Mock data for testing (no real message access)</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (status.granted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4"
      >
        <p className="text-sm text-green-800 dark:text-green-200">
          ✅ {type.toUpperCase()} permission granted! You can now scan for refunds.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-4"
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">
          {type === 'sms' ? '📱' : '📧'}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {type === 'sms' ? 'SMS Access Required' : 'Email Access Required'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {type === 'sms'
              ? 'To automatically scan your SMS for refund notifications, we need permission to read your messages. Your data stays on your device and is never shared.'
              : 'To automatically scan your emails for refund notifications, we need permission to access your email. Your data stays on your device and is never shared.'}
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRequest}
              disabled={loading || status.denied}
              className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Requesting...' : status.denied ? 'Permission Denied' : 'Grant Permission'}
            </motion.button>
            {status.denied && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenSettings}
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg font-medium shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300"
              >
                Open Settings
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
