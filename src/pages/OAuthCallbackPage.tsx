import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { handleOAuthCallback } from '../services/emailAuth';
import { notificationService } from '../services/notifications';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setStatus('error');
      setError(errorParam);
      notificationService.show('OAuth authentication failed', 'error');
      setTimeout(() => navigate('/settings'), 2000);
      return;
    }

    if (code && state) {
      handleOAuthCallback(code, state)
        .then((account) => {
          setStatus('success');
          notificationService.show(`${account.email} connected successfully!`, 'success');
          setTimeout(() => navigate('/settings'), 2000);
        })
        .catch((err) => {
          setStatus('error');
          setError(err.message);
          notificationService.show('Failed to connect email account', 'error');
          setTimeout(() => navigate('/settings'), 2000);
        });
    } else {
      setStatus('error');
      setError('Missing OAuth parameters');
      setTimeout(() => navigate('/settings'), 2000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-xl p-8 max-w-md w-full text-center"
      >
        {status === 'processing' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-5xl mb-4"
            >
              ⏳
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connecting...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we connect your email account
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-5xl mb-4"
            >
              ✅
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connected!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your email account has been connected successfully
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Redirecting to settings...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-5xl mb-4"
            >
              ❌
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || 'An error occurred while connecting your email account'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to settings...
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
