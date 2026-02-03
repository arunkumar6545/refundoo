import { useState, useEffect, useCallback } from 'react';
import type { AppSettings } from '../types';
import { loadSettings, saveSettings } from '../services/storage';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings());

  useEffect(() => {
    try {
      const saved = loadSettings();
      setSettings(saved);
      
      // Apply theme
      const applyTheme = () => {
        if (typeof document === 'undefined') return;
        
        // Remove all theme classes
        document.documentElement.classList.remove('dark', 'gradient-theme');
        
        if (saved.theme === 'gradient') {
          document.documentElement.classList.add('gradient-theme', 'dark');
        } else if (saved.theme === 'dark' || (saved.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        }
      };
      
      applyTheme();
      
      // Listen for system theme changes
      if (saved.theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme();
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    } catch (error) {
      console.error('Error in useSettings useEffect:', error);
    }
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // Apply theme immediately
    if (updates.theme !== undefined) {
      // Remove all theme classes
      document.documentElement.classList.remove('dark', 'gradient-theme');
      
      if (updates.theme === 'gradient') {
        document.documentElement.classList.add('gradient-theme', 'dark');
      } else if (updates.theme === 'dark' || (updates.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    }
  }, [settings]);

  return {
    settings,
    updateSettings,
  };
}
