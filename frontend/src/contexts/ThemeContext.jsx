import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (currentTheme) => {
      let activeTheme = currentTheme;
      if (currentTheme === 'system') {
        activeTheme = mediaQuery.matches ? 'dark' : 'light';
      }
      
      root.setAttribute('data-theme', activeTheme);
      localStorage.setItem('app-theme', currentTheme);
    };

    applyTheme(theme);

    const listener = () => {
      if (theme === 'system') applyTheme('system');
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
