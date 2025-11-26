import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createAppTheme, type ThemeColor, themeColors } from '../theme';

interface ThemeContextType {
  currentTheme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  gradient: string;
  setDynamicColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a CustomThemeProvider');
  }
  return context;
};

interface CustomThemeProviderProps {
  children: React.ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('ecoutons_theme');
    return (saved as ThemeColor) || 'Red';
  });
  const [dynamicColor, setDynamicColor] = useState<string>('#E50914');

  useEffect(() => {
    localStorage.setItem('ecoutons_theme', currentTheme);
  }, [currentTheme]);

  const theme = createAppTheme(currentTheme, dynamicColor);
  
  let gradient = themeColors[currentTheme].gradient;
  if (currentTheme === 'Dynamic') {
    // Simple gradient generation: Darken the color for the top, black for bottom
    // For now, we'll just use the dynamic color fading to black
    gradient = `linear-gradient(180deg, ${dynamicColor}40 0%, #000000 100%)`;
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme: setCurrentTheme, gradient, setDynamicColor }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
