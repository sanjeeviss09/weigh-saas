import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Default to 'dark' — the platform's luxury dark aesthetic
    return localStorage.getItem('app-theme') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (currentTheme) => {
      let activeTheme = currentTheme;
      if (currentTheme === 'system') {
        activeTheme = mediaQuery.matches ? 'dark' : 'light';
      }
      // Apply directly to <html> — CSS variables cascade from here
      root.setAttribute('data-theme', activeTheme);
      // Also set body background immediately to prevent flash
      document.body.style.background = activeTheme === 'light' ? '#ffffff' : '#000000';
      localStorage.setItem('app-theme', currentTheme);
    };

    applyTheme(theme);

    const listener = () => {
      if (theme === 'system') applyTheme('system');
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
