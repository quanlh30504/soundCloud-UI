import { useTheme } from '../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../config/theme';

/**
 * Custom hook that provides theme styles based on current theme mode
 * @returns Object containing theme styles and current theme information
 */
export const useThemeStyles = () => {
  const { theme, themeMode, toggleTheme, isLoading } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;

  return {
    theme,
    themeMode,
    themeStyles,
    toggleTheme,
    isLoading,
    colors: themeStyles.colors,
    // Commonly used color shortcuts
    backgroundColor: themeStyles.colors.background,
    textColor: themeStyles.colors.text,
    primaryColor: themeStyles.colors.primary,
    secondaryColor: themeStyles.colors.secondary,
    cardColor: themeStyles.colors.card,
    borderColor: themeStyles.colors.border,
  };
};
