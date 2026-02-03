import type { Refund, AppSettings } from '../types';

const REFUNDS_KEY = 'refunds_v1';
const SETTINGS_KEY = 'settings_v1';

// Refunds storage
export function loadRefunds(): Refund[] {
  try {
    const raw = localStorage.getItem(REFUNDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error loading refunds:', error);
    return [];
  }
}

export function saveRefunds(refunds: Refund[]): void {
  try {
    localStorage.setItem(REFUNDS_KEY, JSON.stringify(refunds));
  } catch (error) {
    console.error('Error saving refunds:', error);
    throw error;
  }
}

// Settings storage
export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  
  // Default settings
  return {
    theme: 'system' as 'light' | 'dark' | 'gradient' | 'system',
    defaultStatusFilter: 'ALL',
    notificationMode: 'in_app',
    autoScanEnabled: false,
    scanInterval: 15, // 15 minutes
    smsScanEnabled: false,
    emailScanEnabled: false,
    scanKeywords: ['refund', 'return', 'reimbursement', 'money back'],
    autoImportEnabled: false,
  };
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

// Storage info
export function getStorageInfo() {
  const refunds = loadRefunds();
  const refundsSize = new Blob([JSON.stringify(refunds)]).size;
  const settingsSize = new Blob([JSON.stringify(loadSettings())]).size;
  const totalSize = refundsSize + settingsSize;
  
  return {
    refundCount: refunds.length,
    totalSizeBytes: totalSize,
    totalSizeKB: (totalSize / 1024).toFixed(2),
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
  };
}

// Backup/Restore
export function exportData(): { refunds: Refund[]; settings: AppSettings } {
  return {
    refunds: loadRefunds(),
    settings: loadSettings(),
  };
}

export function importData(data: { refunds: Refund[]; settings: AppSettings }): void {
  saveRefunds(data.refunds);
  saveSettings(data.settings);
}
