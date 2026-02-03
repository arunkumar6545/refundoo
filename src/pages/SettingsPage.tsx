import { motion } from 'framer-motion';
import { useSettings } from '../hooks/useSettings';
import { SettingsPanel } from '../components/SettingsPanel';
import { EmailAccountManager } from '../components/EmailAccountManager';
import { SMSPermissionManager } from '../components/SMSPermissionManager';
import { ScanningSettings } from '../components/ScanningSettings';
import { BottomNavigation } from '../components/BottomNavigation';

export function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <motion.h1 
            className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Settings
          </motion.h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* SMS Permission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SMSPermissionManager />
        </motion.div>

        {/* Email Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <EmailAccountManager />
        </motion.div>

        {/* Background Scanning Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ScanningSettings />
        </motion.div>

        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <SettingsPanel settings={settings} onSettingsChange={updateSettings} />
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
