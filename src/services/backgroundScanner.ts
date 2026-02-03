import { SMSReader, type ParsedRefundData } from './smsReader';
import { EmailReader } from './emailReader';
import { loadSettings, saveSettings } from './storage';
import { notificationService } from './notifications';
import type { AppSettings } from '../types';

class BackgroundScanner {
  private scanIntervalId: number | null = null;
  private isScanning = false;
  private lastSMSScanTime: number = 0;
  private lastEmailScanTime: number = 0;

  /**
   * Start background scanning based on settings
   */
  start() {
    this.stop(); // Stop any existing interval
    
    const settings = loadSettings();
    
    if (!settings.autoScanEnabled) {
      return;
    }

    const intervalMs = settings.scanInterval * 60 * 1000; // Convert minutes to milliseconds

    // Initial scan after a short delay
    setTimeout(() => {
      this.performScan();
    }, 5000);

    // Set up interval for periodic scanning
    this.scanIntervalId = window.setInterval(() => {
      this.performScan();
    }, intervalMs);
  }

  /**
   * Stop background scanning
   */
  stop() {
    if (this.scanIntervalId !== null) {
      clearInterval(this.scanIntervalId);
      this.scanIntervalId = null;
    }
  }

  /**
   * Perform a scan based on current settings
   */
  async performScan() {
    if (this.isScanning) {
      return; // Prevent concurrent scans
    }

    this.isScanning = true;
    const settings = loadSettings();

    try {
      const foundRefunds: ParsedRefundData[] = [];

      // Scan SMS if enabled
      if (settings.smsScanEnabled) {
        try {
          const smsRefunds = await SMSReader.scanAndImportRefunds({
            since: this.lastSMSScanTime,
          });
          foundRefunds.push(...smsRefunds);
          this.lastSMSScanTime = Date.now();
        } catch (error) {
          console.error('SMS scan error:', error);
          // Don't show error notifications for background scans to avoid spam
        }
      }

      // Scan Email if enabled
      if (settings.emailScanEnabled) {
        try {
          const emailRefunds = await EmailReader.scanAndImportRefunds({
            since: this.lastEmailScanTime,
          });
          foundRefunds.push(...emailRefunds);
          this.lastEmailScanTime = Date.now();
        } catch (error) {
          console.error('Email scan error:', error);
          // Don't show error notifications for background scans to avoid spam
        }
      }

      // Update last scan time
      const updatedSettings: AppSettings = {
        ...settings,
        lastScanTime: new Date().toISOString(),
      };
      saveSettings(updatedSettings);

      // Auto-import if enabled
      if (settings.autoImportEnabled && foundRefunds.length > 0) {
        await this.autoImportRefunds(foundRefunds);
      } else if (foundRefunds.length > 0) {
        // Notify user about found refunds (if not auto-importing)
        notificationService.show(
          `Found ${foundRefunds.length} new refund(s). Check Settings to import.`,
          'info'
        );
      }
    } catch (error) {
      console.error('Background scan error:', error);
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Automatically import found refunds
   */
  private async autoImportRefunds(refunds: ParsedRefundData[]) {
    // We need to get the createRefund function, but we can't use hooks here
    // So we'll use the storage directly
    const { loadRefunds, saveRefunds } = await import('./storage');
    const { v4: uuidv4 } = await import('uuid');
    const refundsList = loadRefunds();

    let imported = 0;
    for (const refundData of refunds) {
      try {
        // Check if refund already exists (by orderId)
        const exists = refundsList.some(
          (r) => r.orderId === refundData.orderId && refundData.orderId
        );

        if (!exists) {
          const newRefund = {
            id: uuidv4(),
            orderId: refundData.orderId || `AUTO-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            customerName: refundData.customerName || 'Unknown',
            contactPhone: refundData.phone || '',
            email: refundData.email || '',
            amount: refundData.amount || 0,
            currency: refundData.currency || 'USD',
            reason: refundData.reason || 'Auto-imported',
            status: refundData.status || 'PENDING',
            tags: ['auto-imported', 'background-scan'],
            notes: 'Automatically imported from background scan',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          refundsList.push(newRefund);
          imported++;
        }
      } catch (error) {
        console.error('Auto-import error:', error);
      }
    }

    if (imported > 0) {
      saveRefunds(refundsList);
      notificationService.show(
        `Automatically imported ${imported} new refund(s)`,
        'success'
      );
    }
  }

  /**
   * Check if background scanning is active
   */
  isActive(): boolean {
    return this.scanIntervalId !== null;
  }
}

export const backgroundScanner = new BackgroundScanner();
