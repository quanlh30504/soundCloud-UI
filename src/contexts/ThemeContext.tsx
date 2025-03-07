import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: 'dark' | 'light';
  themeMode: ThemeMode;
  toggleTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme() || 'dark';
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark'); // Default to dark
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Apply theme based on mode
    if (themeMode === 'system') {
      setTheme(systemTheme);
    } else {
      setTheme(themeMode);
    }
  }, [themeMode, systemTheme]);

  const toggleTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};