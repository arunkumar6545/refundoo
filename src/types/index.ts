export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' | 'DELETED';

export interface Refund {
  id: string;              // UUID
  orderId: string;
  customerName: string;
  contactPhone: string;
  email: string;
  amount: number;
  currency: string;        // 'INR', 'USD', etc.
  reason: string;
  status: RefundStatus;
  tags: string[];          // e.g., ['aligners', 'consultation']
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
  notes?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'gradient' | 'system';
  defaultStatusFilter: RefundStatus | 'ALL';
  notificationMode: 'in_app' | 'browser' | 'silent';
  // Scanning settings
  autoScanEnabled: boolean;
  scanInterval: number; // in minutes
  smsScanEnabled: boolean;
  emailScanEnabled: boolean;
  scanKeywords: string[]; // Keywords to look for in messages
  autoImportEnabled: boolean; // Automatically import found refunds
  lastScanTime?: string; // ISO timestamp
}

export interface RefundFilters {
  search: string;
  status: RefundStatus | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  company?: string; // Filter by company/customer name
  currency?: string; // Filter by currency
}

export type SortField = 'createdAt' | 'amount' | 'status';
export type SortDirection = 'asc' | 'desc';

export type EmailProvider = 'gmail' | 'yahoo' | 'outlook' | 'icloud' | 'protonmail' | 'aol' | 'zoho' | 'imap' | 'pop3';

export interface EmailAccount {
  id: string;
  provider: EmailProvider;
  email: string;
  displayName?: string;
  connectedAt: string;
  lastSyncAt?: string;
  isActive: boolean;
  // OAuth tokens (encrypted in production)
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  // IMAP/POP3 credentials (encrypted in production)
  imapHost?: string;
  imapPort?: number;
  pop3Host?: string;
  pop3Port?: number;
  username?: string;
  password?: string; // Should be encrypted
}
