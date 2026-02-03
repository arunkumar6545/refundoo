import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icons } from './Icons';

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Icons.Home, label: 'Home', path: '/' },
    { icon: Icons.Add, label: 'Add', path: '/add' },
    { icon: Icons.History, label: 'History', path: '/history' },
    { icon: Icons.Reports, label: 'Reports', path: '/reports' },
    { icon: Icons.Profile, label: 'Profile', path: '/profile' },
  ];

  const handleNavClick = (path: string) => {
    if (path === '/add') {
      // Trigger add refund action
      const event = new CustomEvent('openRefundForm');
      window.dispatchEvent(event);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-area-bottom">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path || 
                           (item.path === '/profile' && location.pathname.startsWith('/profile')) ||
                           (item.path === '/profile' && location.pathname.startsWith('/settings'));
            
            return (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleNavClick(item.path)}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <motion.span
                  className="text-2xl mb-1 flex items-center justify-center"
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <item.icon />
                </motion.span>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-900 dark:bg-white rounded-full"
                    layoutId="activeIndicator"
                    initial={false}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
