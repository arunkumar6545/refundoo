import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  loadEmailAccounts, 
  addEmailAccount, 
  removeEmailAccount, 
  updateEmailAccount,
  initiateOAuthFlow,
  EMAIL_PROVIDERS,
  type EmailProvider,
  testIMAPConnection,
  testPOP3Connection,
} from '../services/emailAuth';
import type { EmailAccount } from '../types';
import { notificationService } from '../services/notifications';
import { SMSEmailScanner } from './SMSEmailScanner';

export function EmailAccountManager() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [connectionType, setConnectionType] = useState<'oauth' | 'imap' | 'pop3'>('oauth');
  const [testing, setTesting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    host: '',
    port: 993,
    displayName: '',
  });

  useEffect(() => {
    setAccounts(loadEmailAccounts());
  }, []);

  const handleOAuthConnect = (provider: EmailProvider) => {
    try {
      initiateOAuthFlow(provider);
      notificationService.show(`Redirecting to ${EMAIL_PROVIDERS[provider].name} for authentication...`, 'info');
    } catch (error: any) {
      notificationService.show(error.message || 'Failed to initiate OAuth flow', 'error');
    }
  };

  const handleIMAPConnect = async () => {
    if (!formData.host || !formData.email || !formData.password) {
      notificationService.show('Please fill in all required fields', 'error');
      return;
    }

    setTesting(true);
    try {
      const isValid = await testIMAPConnection({
        host: formData.host,
        port: formData.port,
        username: formData.email,
        password: formData.password,
      });

      if (isValid) {
        const account = addEmailAccount({
          provider: 'imap',
          email: formData.email,
          displayName: formData.displayName || formData.email,
          isActive: true,
          imapHost: formData.host,
          imapPort: formData.port,
          username: formData.email,
          password: formData.password, // In production, encrypt this
        });
        setAccounts([...accounts, account]);
        setShowAddForm(false);
        setFormData({ email: '', password: '', host: '', port: 993, displayName: '' });
        notificationService.show('Email account connected successfully!', 'success');
      } else {
        notificationService.show('Connection failed. Please check your credentials.', 'error');
      }
    } catch (error: any) {
      notificationService.show(error.message || 'Connection failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handlePOP3Connect = async () => {
    if (!formData.host || !formData.email || !formData.password) {
      notificationService.show('Please fill in all required fields', 'error');
      return;
    }

    setTesting(true);
    try {
      const isValid = await testPOP3Connection({
        host: formData.host,
        port: formData.port,
        username: formData.email,
        password: formData.password,
      });

      if (isValid) {
        const account = addEmailAccount({
          provider: 'pop3',
          email: formData.email,
          displayName: formData.displayName || formData.email,
          isActive: true,
          pop3Host: formData.host,
          pop3Port: formData.port,
          username: formData.email,
          password: formData.password, // In production, encrypt this
        });
        setAccounts([...accounts, account]);
        setShowAddForm(false);
        setFormData({ email: '', password: '', host: '', port: 995, displayName: '' });
        notificationService.show('Email account connected successfully!', 'success');
      } else {
        notificationService.show('Connection failed. Please check your credentials.', 'error');
      }
    } catch (error: any) {
      notificationService.show(error.message || 'Connection failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = (id: string) => {
    if (window.confirm('Are you sure you want to disconnect this email account?')) {
      removeEmailAccount(id);
      setAccounts(accounts.filter(a => a.id !== id));
      notificationService.show('Email account disconnected', 'info');
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateEmailAccount(id, { isActive: !isActive });
    setAccounts(accounts.map(a => a.id === id ? { ...a, isActive: !isActive } : a));
  };

  const getProviderConfig = (provider: EmailProvider) => EMAIL_PROVIDERS[provider];

  return (
    <div className="glass-card rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            📧 Email Accounts
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connect your email accounts to automatically scan for refund notifications
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium shadow-md"
        >
          {showAddForm ? 'Cancel' : '+ Add Account'}
        </motion.button>
      </div>

      {/* Add Account Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Connect Email Account
            </h4>

            {/* Provider Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Provider
              </label>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Note:</strong> OAuth requires Client IDs to be configured. See <code className="bg-white dark:bg-gray-800 px-1 rounded">EMAIL_SETUP.md</code> for setup instructions.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(['gmail', 'yahoo', 'outlook', 'icloud', 'protonmail', 'aol', 'zoho'] as EmailProvider[]).map((provider) => {
                  const config = getProviderConfig(provider);
                  return (
                    <motion.button
                      key={provider}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setConnectionType('oauth');
                        handleOAuthConnect(provider);
                      }}
                      className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-900 dark:hover:border-gray-100 transition-all text-center"
                    >
                      <div className="text-2xl mb-2">{config.icon}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {config.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        OAuth
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Connection Type Toggle */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Connection Type
              </label>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConnectionType('imap')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    connectionType === 'imap'
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  IMAP
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConnectionType('pop3')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    connectionType === 'pop3'
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  POP3
                </motion.button>
              </div>
            </div>

            {/* IMAP/POP3 Form */}
            {(connectionType === 'imap' || connectionType === 'pop3') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-gray-100 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition-all duration-300"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-gray-100 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition-all duration-300"
                    placeholder="Your email password"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {connectionType === 'imap' ? 'IMAP Host' : 'POP3 Host'} *
                    </label>
                    <input
                      type="text"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-gray-100 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition-all duration-300"
                      placeholder={connectionType === 'imap' ? 'imap.example.com' : 'pop3.example.com'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Port *
                    </label>
                    <input
                      type="number"
                      value={formData.port}
                      onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || (connectionType === 'imap' ? 993 : 995) })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-gray-100 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition-all duration-300"
                      placeholder={connectionType === 'imap' ? '993' : '995'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-gray-100 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition-all duration-300"
                    placeholder="My Work Email"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={connectionType === 'imap' ? handleIMAPConnect : handlePOP3Connect}
                  disabled={testing}
                  className="w-full px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {testing ? 'Testing Connection...' : `Connect ${connectionType.toUpperCase()}`}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connected Accounts List */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Connected Accounts ({accounts.length})
        </h4>

        {accounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">No email accounts connected</p>
            <p className="text-sm">Add an account to start scanning emails for refunds</p>
          </div>
        ) : (
          <AnimatePresence>
            {accounts.map((account, index) => {
              const config = getProviderConfig(account.provider);
              return (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">{config.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {account.displayName || account.email}
                        </h5>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          account.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {account.email} • {config.name}
                      </p>
                      {account.lastSyncAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Last synced: {new Date(account.lastSyncAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleActive(account.id, account.isActive)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        account.isActive
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          : 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      }`}
                    >
                      {account.isActive ? 'Disable' : 'Enable'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDisconnect(account.id)}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
                    >
                      Remove
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Email Scanner Section */}
      {accounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                📧 Scan Email Messages
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan your email messages to automatically extract refund information
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowScanner(!showScanner)}
              className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              {showScanner ? 'Hide Scanner' : 'Show Scanner'}
            </motion.button>
          </div>

          <AnimatePresence>
            {showScanner && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <SMSEmailScanner onClose={() => setShowScanner(false)} defaultTab="email" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
