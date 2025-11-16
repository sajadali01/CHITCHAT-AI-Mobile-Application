  import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
  import * as SecureStore from 'expo-secure-store';

  interface Colors {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    inputBackground: string; // ✅ NEW
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;

  }

  interface ThemeContextType {
    isDark: boolean;
    colors: Colors;
    toggleTheme: () => void;
  }

  const lightColors: Colors = {
    primary: '#EBAD12',
    secondary: '#FCD34D',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    inputBackground: '#f1f1f1', // ✅ light input bg
    text: '#333333',
    textSecondary: '#666666',
    border: '#E5E5E7',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',

  };

  const darkColors: Colors = {
    primary: '#EBAD12',
    secondary: '#FCD34D',
    background: '#121212',
    surface: '#1C1C1E',
    inputBackground: '#2A2A2A', // ✅ dark input bg
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#38383A',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
  
  };

  const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

  export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
      loadTheme();
    }, []);

    const loadTheme = async () => {
      try {
        const storedTheme = await SecureStore.getItemAsync('theme');
        if (storedTheme) {
          setIsDark(storedTheme === 'dark');
        }
      } catch (error) {
        console.log('Failed to load theme');
      }
    };

    const toggleTheme = async () => {
      const newTheme = !isDark;
      setIsDark(newTheme);

      try {
        await SecureStore.setItemAsync('theme', newTheme ? 'dark' : 'light');
      } catch (error) {
        console.log('Failed to save theme');
      }
    };

    const colors = isDark ? darkColors : lightColors;

    const value = {
      isDark,
      colors,
      toggleTheme,
    };

    return (
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    );
  }

  export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
      throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
  }
