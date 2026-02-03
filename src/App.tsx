import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
import { ToastContainer } from './components/Toast';
import { AppIcon } from './components/AppIcon';

function Navigation() {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="glass-card border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-50 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              whileHover={{ 
                rotate: 360,
                scale: 1.1,
                transition: { duration: 0.6 }
              }}
            >
              <AppIcon size={40} animated={true} />
            </motion.div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Refundoo</span>
          </div>
          <div className="flex gap-2">
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  location.pathname === '/'
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                📊 Dashboard
              </motion.div>
            </Link>
            <Link to="/settings">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  location.pathname === '/settings'
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                ⚙️ Settings
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

function AppContent() {
  const location = useLocation();
  const showTopNav = location.pathname !== '/' && !location.pathname.startsWith('/history') && 
                     !location.pathname.startsWith('/reports') && !location.pathname.startsWith('/profile');

  return (
    <div className="min-h-screen">
      {showTopNav && <Navigation />}
      <Routes>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardPage />
          </motion.div>
        } />
        <Route path="/settings" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SettingsPage />
          </motion.div>
        } />
        <Route path="/history" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <HistoryPage />
          </motion.div>
        } />
        <Route path="/reports" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ReportsPage />
          </motion.div>
        } />
        <Route path="/profile" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ProfilePage />
          </motion.div>
        } />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
