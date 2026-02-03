import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../hooks/useSettings';
import { BottomNavigation } from '../components/BottomNavigation';
import { SettingsPanel } from '../components/SettingsPanel';
import { ThemeSelector } from '../components/ThemeSelector';
import { SMSPermissionManager } from '../components/SMSPermissionManager';
import { EmailAccountManager } from '../components/EmailAccountManager';
import { ScanningSettings } from '../components/ScanningSettings';
import { Icons } from '../components/Icons';

export function ProfilePage() {
  const { settings, updateSettings } = useSettings();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, [settings.theme]);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.h1 
              className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Profile & Settings
            </motion.h1>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {isDark ? <Icons.Sun /> : <Icons.Moon />}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl">
              <Icons.Profile />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Profile</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account settings</p>
            </div>
          </div>
        </motion.div>

        {/* Theme Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ThemeSelector />
        </motion.div>

        {/* SMS Permission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <SMSPermissionManager />
        </motion.div>

        {/* Email Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <EmailAccountManager />
        </motion.div>

        {/* Background Scanning Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <ScanningSettings />
        </motion.div>

        {/* Settings Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SettingsPanel settings={settings} onSettingsChange={updateSettings} />
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
