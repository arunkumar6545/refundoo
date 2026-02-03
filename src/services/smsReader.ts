// Dynamic import for Capacitor
const getCapacitor = async () => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor;
  } catch {
    return { isNativePlatform: () => false, getPlatform: () => 'web' };
  }
};

export interface SMSMessage {
  address: string;
  body: string;
  date: number;
  dateSent?: number;
  read?: boolean;
  seen?: boolean;
}

export interface ParsedRefundData {
  orderId?: string;
  amount?: number;
  currency?: string;
  customerName?: string;
  reason?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  phone?: string;
  email?: string;
}

export class SMSReader {
  static async readSMS(filter?: { maxCount?: number; startDate?: number; endDate?: number }): Promise<SMSMessage[]> {
    const Capacitor = await getCapacitor();
    if (!Capacitor.isNativePlatform()) {
      // Web fallback - return mock data for testing
      return this.getMockSMS();
    }

    if (Capacitor.getPlatform() === 'android') {
      try {
        // @ts-ignore - Native plugin
        const { SMS } = window.cordova?.plugins || {};
        if (SMS) {
          return new Promise((resolve, reject) => {
            const options = {
              box: 'inbox',
              maxCount: filter?.maxCount || 100,
              ...filter,
            };

            SMS.listSMS(options, (messages: SMSMessage[]) => {
              resolve(messages);
            }, (error: Error) => {
              reject(error);
            });
          });
        }
      } catch (error) {
        console.error('SMS read error:', error);
        throw error;
      }
    }

    // iOS doesn't support direct SMS reading
    if (Capacitor.getPlatform() === 'ios') {
      throw new Error('SMS reading is not supported on iOS. Please use email or manual entry.');
    }

    return [];
  }

  static parseRefundFromSMS(sms: SMSMessage): ParsedRefundData | null {
    const text = sms.body.toLowerCase();
    const data: ParsedRefundData = {};

    // Extract order ID patterns: ORD-123456, Order #123456, OrderID: 123456
    const orderIdPatterns = [
      /(?:order|ord)[\s#:]*([a-z0-9-]+)/i,
      /ord-(\d+)/i,
      /#(\d{6,})/,
    ];

    for (const pattern of orderIdPatterns) {
      const match = sms.body.match(pattern);
      if (match) {
        data.orderId = match[1].toUpperCase();
        break;
      }
    }

    // Extract amount patterns: $100, ₹5000, 100 USD, 5000 INR
    const amountPatterns = [
      /(?:refund|amount|rs\.?|₹|\$|€|£)\s*([\d,]+\.?\d*)/i,
      /([\d,]+\.?\d*)\s*(?:usd|inr|eur|gbp|rs)/i,
    ];

    for (const pattern of amountPatterns) {
      const match = sms.body.match(pattern);
      if (match) {
        data.amount = parseFloat(match[1].replace(/,/g, ''));
        
        // Extract currency
        if (sms.body.includes('₹') || sms.body.toLowerCase().includes('inr') || sms.body.toLowerCase().includes('rs')) {
          data.currency = 'INR';
        } else if (sms.body.includes('$') || sms.body.toLowerCase().includes('usd')) {
          data.currency = 'USD';
        } else if (sms.body.includes('€') || sms.body.toLowerCase().includes('eur')) {
          data.currency = 'EUR';
        } else if (sms.body.includes('£') || sms.body.toLowerCase().includes('gbp')) {
          data.currency = 'GBP';
        } else {
          data.currency = 'USD'; // Default
        }
        break;
      }
    }

    // Extract status keywords
    if (text.includes('approved') || text.includes('approved')) {
      data.status = 'APPROVED';
    } else if (text.includes('rejected') || text.includes('denied')) {
      data.status = 'REJECTED';
    } else if (text.includes('paid') || text.includes('processed')) {
      data.status = 'PAID';
    } else if (text.includes('pending') || text.includes('processing')) {
      data.status = 'PENDING';
    }

    // Extract reason keywords
    const reasonKeywords = [
      'defect', 'damaged', 'wrong', 'missing', 'late', 'cancelled', 'quality',
      'size', 'color', 'not as described', 'changed mind',
    ];
    
    for (const keyword of reasonKeywords) {
      if (text.includes(keyword)) {
        data.reason = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        break;
      }
    }

    // Use sender as customer phone
    data.phone = sms.address;

    // Only return if we found at least order ID or amount
    if (data.orderId || data.amount) {
      return data;
    }

    return null;
  }

  static async scanAndImportRefunds(options?: { since?: number }): Promise<ParsedRefundData[]> {
    try {
      const filter: { maxCount?: number; startDate?: number } = { maxCount: 500 };
      
      if (options?.since) {
        filter.startDate = options.since;
      }

      const messages = await this.readSMS(filter);
      const refunds: ParsedRefundData[] = [];

      for (const message of messages) {
        // Filter by time if since is provided
        if (options?.since && message.date < options.since) {
          continue;
        }

        const parsed = this.parseRefundFromSMS(message);
        if (parsed) {
          refunds.push(parsed);
        }
      }

      return refunds;
    } catch (error) {
      console.error('Error scanning SMS for refunds:', error);
      throw error;
    }
  }

  // Mock data for web testing
  private static getMockSMS(): SMSMessage[] {
    return [
      {
        address: '+1234567890',
        body: 'Your refund for Order #ORD-123456 has been approved. Amount: $150.00 will be processed within 5-7 business days.',
        date: Date.now() - 86400000,
      },
      {
        address: '+1987654321',
        body: 'Refund request ORD-789012 for ₹5000 rejected due to policy violation. Contact support for details.',
        date: Date.now() - 172800000,
      },
      {
        address: '+1555555555',
        body: 'Refund of $75.50 for order #ORD-345678 has been paid to your account.',
        date: Date.now() - 259200000,
      },
    ];
  }
}
