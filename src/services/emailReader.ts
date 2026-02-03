// Dynamic import for Capacitor
const getCapacitor = async () => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor;
  } catch {
    return { isNativePlatform: () => false, getPlatform: () => 'web' };
  }
};

import type { ParsedRefundData } from './smsReader';
import { getActiveEmailAccounts } from './emailAuth';
import type { EmailAccount } from '../types';

export interface EmailMessage {
  subject: string;
  body: string;
  from: string;
  date: number;
  to?: string;
}

export class EmailReader {
  static async readEmails(_filter?: { maxCount?: number; startDate?: number; endDate?: number }): Promise<EmailMessage[]> {
    await getCapacitor();
    
    // Check for connected email accounts
    const connectedAccounts = getActiveEmailAccounts();
    
    if (connectedAccounts.length === 0) {
      // No accounts connected - return mock data for testing
      return this.getMockEmails();
    }

    // Try to read from connected accounts
    const allEmails: EmailMessage[] = [];
    
    for (const account of connectedAccounts) {
      try {
        const emails = await this.readFromAccount(account, _filter);
        allEmails.push(...emails);
      } catch (error) {
        console.error(`Error reading from ${account.email}:`, error);
        // Continue with other accounts
      }
    }

    // If no emails found from connected accounts, return mock data
    if (allEmails.length === 0) {
      return this.getMockEmails();
    }

    return allEmails;
  }

  static async readFromAccount(account: EmailAccount, _filter?: { maxCount?: number; startDate?: number; endDate?: number }): Promise<EmailMessage[]> {
    // In a real implementation, this would:
    // 1. For OAuth accounts (Gmail, Yahoo, Outlook): Use their APIs
    // 2. For IMAP/POP3: Connect and fetch emails
    
    if (account.provider === 'gmail' && account.accessToken) {
      // Use Gmail API
      return this.readFromGmail(account, _filter);
    } else if (account.provider === 'yahoo' && account.accessToken) {
      // Use Yahoo API
      return this.readFromYahoo(account, _filter);
    } else if (account.provider === 'outlook' && account.accessToken) {
      // Use Microsoft Graph API
      return this.readFromOutlook(account, _filter);
    } else if (['icloud', 'protonmail', 'aol', 'zoho'].includes(account.provider) && account.accessToken) {
      // Use provider-specific APIs (similar to Gmail/Yahoo/Outlook)
      return this.readFromGmail(account, _filter); // Placeholder - use appropriate API
    } else if (account.provider === 'imap' && account.imapHost) {
      // Use IMAP connection
      return this.readFromIMAP(account, _filter);
    } else if (account.provider === 'pop3' && account.pop3Host) {
      // Use POP3 connection
      return this.readFromPOP3(account, _filter);
    }

    // Fallback to mock data
    return this.getMockEmails();
  }

  // Placeholder methods for different email providers
  private static async readFromGmail(_account: EmailAccount, _filter?: { maxCount?: number }): Promise<EmailMessage[]> {
    // In production, use Gmail API:
    // const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=refund&maxResults=${filter?.maxCount || 50}`, {
    //   headers: { Authorization: `Bearer ${account.accessToken}` }
    // });
    // For now, return mock data
    return this.getMockEmails();
  }

  private static async readFromYahoo(_account: EmailAccount, _filter?: { maxCount?: number }): Promise<EmailMessage[]> {
    // In production, use Yahoo Mail API
    return this.getMockEmails();
  }

  private static async readFromOutlook(_account: EmailAccount, _filter?: { maxCount?: number }): Promise<EmailMessage[]> {
    // In production, use Microsoft Graph API:
    // const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages?$filter=subject contains 'refund'&$top=${filter?.maxCount || 50}`, {
    //   headers: { Authorization: `Bearer ${account.accessToken}` }
    // });
    return this.getMockEmails();
  }

  private static async readFromIMAP(_account: EmailAccount, _filter?: { maxCount?: number }): Promise<EmailMessage[]> {
    // In production, use an IMAP library to connect and fetch emails
    // For now, return mock data
    return this.getMockEmails();
  }

  private static async readFromPOP3(_account: EmailAccount, _filter?: { maxCount?: number }): Promise<EmailMessage[]> {
    // In production, use a POP3 library to connect and fetch emails
    // For now, return mock data
    return this.getMockEmails();
  }

  static parseRefundFromEmail(email: EmailMessage): ParsedRefundData | null {
    const text = (email.subject + ' ' + email.body).toLowerCase();
    const data: ParsedRefundData = {};

    // Extract order ID
    const orderIdPatterns = [
      /(?:order|ord)[\s#:]*([a-z0-9-]+)/i,
      /ord-(\d+)/i,
      /#(\d{6,})/,
      /order\s+number[:\s]+([a-z0-9-]+)/i,
    ];

    for (const pattern of orderIdPatterns) {
      const match = (email.subject + ' ' + email.body).match(pattern);
      if (match) {
        data.orderId = match[1].toUpperCase();
        break;
      }
    }

    // Extract amount
    const amountPatterns = [
      /(?:refund|amount|rs\.?|₹|\$|€|£)\s*([\d,]+\.?\d*)/i,
      /([\d,]+\.?\d*)\s*(?:usd|inr|eur|gbp|rs)/i,
    ];

    for (const pattern of amountPatterns) {
      const match = (email.subject + ' ' + email.body).match(pattern);
      if (match) {
        data.amount = parseFloat(match[1].replace(/,/g, ''));
        
        // Extract currency
        const fullText = email.subject + ' ' + email.body;
        if (fullText.includes('₹') || fullText.toLowerCase().includes('inr') || fullText.toLowerCase().includes('rs')) {
          data.currency = 'INR';
        } else if (fullText.includes('$') || fullText.toLowerCase().includes('usd')) {
          data.currency = 'USD';
        } else if (fullText.includes('€') || fullText.toLowerCase().includes('eur')) {
          data.currency = 'EUR';
        } else if (fullText.includes('£') || fullText.toLowerCase().includes('gbp')) {
          data.currency = 'GBP';
        } else {
          data.currency = 'USD';
        }
        break;
      }
    }

    // Extract status
    if (text.includes('approved')) {
      data.status = 'APPROVED';
    } else if (text.includes('rejected') || text.includes('denied')) {
      data.status = 'REJECTED';
    } else if (text.includes('paid') || text.includes('processed') || text.includes('completed')) {
      data.status = 'PAID';
    } else if (text.includes('pending') || text.includes('processing') || text.includes('under review')) {
      data.status = 'PENDING';
    }

    // Extract customer name from email
    const nameMatch = email.from.match(/([^<]+)/);
    if (nameMatch) {
      data.customerName = nameMatch[1].trim();
    }

    // Extract email
    const emailMatch = email.from.match(/<(.+)>/);
    if (emailMatch) {
      data.email = emailMatch[1];
    } else if (email.from.includes('@')) {
      data.email = email.from;
    }

    // Extract reason
    const reasonKeywords = [
      'defect', 'damaged', 'wrong', 'missing', 'late', 'cancelled', 'quality',
      'size', 'color', 'not as described', 'changed mind', 'return',
    ];
    
    for (const keyword of reasonKeywords) {
      if (text.includes(keyword)) {
        data.reason = keyword.charAt(0).toUpperCase() + keyword.slice(1).replace(/\b\w/g, (l) => l.toUpperCase());
        break;
      }
    }

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

      const emails = await this.readEmails(filter);
      const refunds: ParsedRefundData[] = [];

      for (const email of emails) {
        // Filter by time if since is provided
        if (options?.since && email.date < options.since) {
          continue;
        }

        const parsed = this.parseRefundFromEmail(email);
        if (parsed) {
          refunds.push(parsed);
        }
      }

      return refunds;
    } catch (error) {
      console.error('Error scanning emails for refunds:', error);
      throw error;
    }
  }

  // Mock data for web testing
  private static getMockEmails(): EmailMessage[] {
    return [
      {
        subject: 'Refund Approved - Order ORD-123456',
        body: 'Dear Customer, Your refund request for Order #ORD-123456 has been approved. Amount: $150.00 will be processed within 5-7 business days. Thank you for your patience.',
        from: 'support@example.com',
        date: Date.now() - 86400000,
      },
      {
        subject: 'Refund Update - Order ORD-789012',
        body: 'We regret to inform you that your refund request for ₹5000 has been rejected due to policy violation. Please contact our support team for more details.',
        from: 'refunds@example.com',
        date: Date.now() - 172800000,
      },
    ];
  }
}
