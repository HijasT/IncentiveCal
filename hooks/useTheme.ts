'use client'

import { useState, useEffect } from 'react';
import { getThemeFromStorage, saveThemeToStorage } from '@/lib/storage';

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedTheme = getThemeFromStorage();
    setThemeState(storedTheme);
    applyTheme(storedTheme);
    setIsLoaded(true);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    saveThemeToStorage(newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return {
    theme,
    isLoaded,
    setTheme,
    toggleTheme,
  };
}
