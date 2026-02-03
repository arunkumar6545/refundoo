import { motion } from 'framer-motion';
import { useSettings } from '../hooks/useSettings';

export function ThemeSelector() {
  const { settings, updateSettings } = useSettings();

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️', description: 'Clean light theme' },
    { value: 'dark', label: 'Dark', icon: '🌙', description: 'Dark mode theme' },
    { value: 'gradient', label: 'Gradient', icon: '🌈', description: 'Colorful gradient theme' },
    { value: 'system', label: 'System', icon: '💻', description: 'Follow system preference' },
  ];

  const handleThemeChange = (theme: 'light' | 'dark' | 'gradient' | 'system') => {
    updateSettings({ theme });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => {
          const isActive = settings.theme === theme.value;
          return (
            <motion.button
              key={theme.value}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleThemeChange(theme.value as 'light' | 'dark' | 'gradient' | 'system')}
              className={`p-4 rounded-xl border-2 transition-all ${
                isActive
                  ? 'border-gray-900 dark:border-gray-100 bg-gray-100 dark:bg-gray-700'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">{theme.icon}</div>
              <div className={`text-sm font-semibold mb-1 ${
                isActive
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {theme.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {theme.description}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
