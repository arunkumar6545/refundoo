import type { EmailAccount } from '../types';

export type EmailProvider = 'gmail' | 'yahoo' | 'outlook' | 'icloud' | 'protonmail' | 'aol' | 'zoho' | 'imap' | 'pop3';

const EMAIL_ACCOUNTS_KEY = 'email_accounts_v1';

// OAuth Configuration for different providers
export const EMAIL_PROVIDERS: Record<EmailProvider, {
  name: string;
  icon: string;
  oauthUrl?: string;
  scopes: string[];
  imapConfig?: { host: string; port: number };
  pop3Config?: { host: string; port: number };
}> = {
  gmail: {
    name: 'Gmail',
    icon: '📧',
    oauthUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    imapConfig: { host: 'imap.gmail.com', port: 993 },
  },
  yahoo: {
    name: 'Yahoo Mail',
    icon: '📬',
    oauthUrl: 'https://api.login.yahoo.com/oauth2/request_auth',
    scopes: ['mail-r', 'mail-w'],
    imapConfig: { host: 'imap.mail.yahoo.com', port: 993 },
  },
  outlook: {
    name: 'Outlook / Hotmail',
    icon: '📮',
    oauthUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scopes: ['https://graph.microsoft.com/Mail.Read'],
    imapConfig: { host: 'outlook.office365.com', port: 993 },
  },
  icloud: {
    name: 'iCloud Mail',
    icon: '☁️',
    oauthUrl: 'https://appleid.apple.com/auth/authorize',
    scopes: ['mail'],
    imapConfig: { host: 'imap.mail.me.com', port: 993 },
  },
  protonmail: {
    name: 'ProtonMail',
    icon: '🔒',
    oauthUrl: 'https://mail.proton.me/oauth/authorize',
    scopes: ['mail'],
    imapConfig: { host: '127.0.0.1', port: 1143 }, // Requires ProtonMail Bridge
  },
  aol: {
    name: 'AOL Mail',
    icon: '📭',
    oauthUrl: 'https://api.login.aol.com/oauth2/request_auth',
    scopes: ['mail-r'],
    imapConfig: { host: 'imap.aol.com', port: 993 },
  },
  zoho: {
    name: 'Zoho Mail',
    icon: '📨',
    oauthUrl: 'https://accounts.zoho.com/oauth/v2/auth',
    scopes: ['ZohoMail.messages.READ'],
    imapConfig: { host: 'imap.zoho.com', port: 993 },
  },
  imap: {
    name: 'IMAP (Generic)',
    icon: '📥',
    scopes: [],
    imapConfig: { host: '', port: 993 },
  },
  pop3: {
    name: 'POP3 (Generic)',
    icon: '📨',
    scopes: [],
    pop3Config: { host: '', port: 995 },
  },
};

export function loadEmailAccounts(): EmailAccount[] {
  try {
    const raw = localStorage.getItem(EMAIL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error loading email accounts:', error);
    return [];
  }
}

export function saveEmailAccounts(accounts: EmailAccount[]): void {
  try {
    localStorage.setItem(EMAIL_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error('Error saving email accounts:', error);
    throw error;
  }
}

export function addEmailAccount(account: Omit<EmailAccount, 'id' | 'connectedAt'>): EmailAccount {
  const accounts = loadEmailAccounts();
  const newAccount: EmailAccount = {
    ...account,
    id: `email_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    connectedAt: new Date().toISOString(),
  };
  accounts.push(newAccount);
  saveEmailAccounts(accounts);
  return newAccount;
}

export function updateEmailAccount(id: string, updates: Partial<EmailAccount>): void {
  const accounts = loadEmailAccounts();
  const index = accounts.findIndex(a => a.id === id);
  if (index !== -1) {
    accounts[index] = { ...accounts[index], ...updates };
    saveEmailAccounts(accounts);
  }
}

export function removeEmailAccount(id: string): void {
  const accounts = loadEmailAccounts().filter(a => a.id !== id);
  saveEmailAccounts(accounts);
}

export function getActiveEmailAccounts(): EmailAccount[] {
  return loadEmailAccounts().filter(a => a.isActive);
}

// OAuth Flow Helpers
export function initiateOAuthFlow(provider: EmailProvider, clientId?: string): void {
  const providerConfig = EMAIL_PROVIDERS[provider];
  
  if (!providerConfig.oauthUrl) {
    throw new Error(`OAuth not supported for ${provider}`);
  }

  // Generate state for security
  const state = Math.random().toString(36).substring(7);
  sessionStorage.setItem('oauth_state', state);
  sessionStorage.setItem('oauth_provider', provider);

  // Build OAuth URL
  const redirectUri = `${window.location.origin}/oauth/callback`;
  const scope = providerConfig.scopes.join(' ');
  
  let authUrl = '';
  
  // Build OAuth URL based on provider
  const clientIdMap: Record<string, string> = {
    gmail: 'YOUR_GMAIL_CLIENT_ID',
    yahoo: 'YOUR_YAHOO_CLIENT_ID',
    outlook: 'YOUR_OUTLOOK_CLIENT_ID',
    icloud: 'YOUR_ICLOUD_CLIENT_ID',
    protonmail: 'YOUR_PROTONMAIL_CLIENT_ID',
    aol: 'YOUR_AOL_CLIENT_ID',
    zoho: 'YOUR_ZOHO_CLIENT_ID',
  };

  const defaultClientId = clientId || clientIdMap[provider] || 'YOUR_CLIENT_ID';

  if (provider === 'gmail') {
    authUrl = `${providerConfig.oauthUrl}?` +
      `client_id=${defaultClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${state}`;
  } else if (provider === 'yahoo' || provider === 'aol') {
    authUrl = `${providerConfig.oauthUrl}?` +
      `client_id=${defaultClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;
  } else if (provider === 'outlook') {
    authUrl = `${providerConfig.oauthUrl}?` +
      `client_id=${defaultClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;
  } else if (provider === 'icloud') {
    authUrl = `${providerConfig.oauthUrl}?` +
      `client_id=${defaultClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;
  } else if (provider === 'protonmail') {
    authUrl = `${providerConfig.oauthUrl}?` +
      `client_id=${defaultClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;
  } else if (provider === 'zoho') {
    authUrl = `${providerConfig.oauthUrl}?` +
      `client_id=${defaultClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;
  }

  // Open OAuth popup or redirect
  window.location.href = authUrl;
}

export function handleOAuthCallback(_code: string, state: string): Promise<EmailAccount> {
  const savedState = sessionStorage.getItem('oauth_state');
  const provider = sessionStorage.getItem('oauth_provider') as EmailProvider;

  if (state !== savedState) {
    throw new Error('Invalid OAuth state');
  }

  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_provider');

  // In a real app, you would exchange the code for tokens via your backend
  // For now, we'll create a mock account
  return new Promise((resolve) => {
    // Simulate token exchange
    setTimeout(() => {
      const emailMap: Record<string, string> = {
        gmail: 'gmail.com',
        yahoo: 'yahoo.com',
        outlook: 'outlook.com',
        icloud: 'icloud.com',
        protonmail: 'protonmail.com',
        aol: 'aol.com',
        zoho: 'zoho.com',
      };
      const domain = emailMap[provider] || 'example.com';
      
      const account = addEmailAccount({
        provider,
        email: `user@${domain}`,
        isActive: true,
        accessToken: `mock_token_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      });
      resolve(account);
    }, 500);
  });
}

// IMAP/POP3 Connection Helpers
export function testIMAPConnection(_config: {
  host: string;
  port: number;
  username: string;
  password: string;
}): Promise<boolean> {
  // In a real app, this would test the IMAP connection
  // For now, return a mock success
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
}

export function testPOP3Connection(_config: {
  host: string;
  port: number;
  username: string;
  password: string;
}): Promise<boolean> {
  // In a real app, this would test the POP3 connection
  // For now, return a mock success
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
}
