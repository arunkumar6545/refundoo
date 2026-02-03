import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { AppSettings } from '../types';
import { exportData, importData, getStorageInfo } from '../services/storage';
import { exportToJSON } from '../services/export';
import { requestBrowserNotificationPermission } from '../services/notifications';
import { seedRefunds } from '../services/seedData';

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageInfo = getStorageInfo();

  const handleRequestNotificationPermission = async () => {
    const granted = await requestBrowserNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
  };

  const handleExportBackup = () => {
    const data = exportData();
    exportToJSON(data.refunds);
  };

  const handleImportBackup = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          // If it's just an array of refunds
          importData({ refunds: data, settings });
        } else if (data.refunds && data.settings) {
          // If it's a full backup
          importData(data);
        } else {
          alert('Invalid backup file format');
        }
        alert('Backup restored successfully!');
        window.location.reload();
      } catch (error) {
        alert('Error reading backup file');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

      {/* Theme Settings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Theme
        </label>
        <select
          value={settings.theme}
          onChange={(e) => onSettingsChange({ theme: e.target.value as 'light' | 'dark' | 'gradient' | 'system' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="gradient">Gradient</option>
          <option value="system">System</option>
        </select>
      </div>

      {/* Notification Settings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notification Mode
        </label>
        <select
          value={settings.notificationMode}
          onChange={(e) => onSettingsChange({ notificationMode: e.target.value as 'in_app' | 'browser' | 'silent' })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="in_app">In-App Only</option>
          <option value="browser">Browser Notifications</option>
          <option value="silent">Silent</option>
        </select>
        {settings.notificationMode === 'browser' && notificationPermission !== 'granted' && (
          <button
            onClick={handleRequestNotificationPermission}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Request Browser Notification Permission
          </button>
        )}
        {notificationPermission === 'granted' && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">✓ Browser notifications enabled</p>
        )}
      </div>

      {/* Default Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Default Status Filter
        </label>
        <select
          value={settings.defaultStatusFilter}
          onChange={(e) => onSettingsChange({ defaultStatusFilter: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      {/* Storage Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storage Information</h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Total Records: <span className="font-medium text-gray-900 dark:text-white">{storageInfo.refundCount}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Storage Used: <span className="font-medium text-gray-900 dark:text-white">{storageInfo.totalSizeKB} KB</span>
          </p>
        </div>
      </div>

      {/* Sample Data */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sample Data</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Add sample refund data with known companies to test the application.
        </p>
        <button
          onClick={seedRefunds}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          📦 Load Sample Data (25 refunds)
        </button>
      </div>

      {/* Backup & Restore */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Backup & Restore</h3>
        <div className="flex gap-3">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Download Backup (JSON)
          </button>
          <button
            onClick={handleImportBackup}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Restore from Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </motion.div>
  );
}
