import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { lightColors, darkColors, ColorPalette } from '@/constants/Colors';
import { Theme } from '@/types';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: Theme) => void;
  colors: ColorPalette;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
  colors: lightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    SecureStore.getItemAsync('app_theme').then(v => {
      if (v === 'light' || v === 'dark' || v === 'system') {
        setThemeState(v);
      }
    });
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemTheme ?? 'light') : theme;

  const setTheme = async (t: Theme) => {
    setThemeState(t);
    await SecureStore.setItemAsync('app_theme', t);
  };

  const colors = resolvedTheme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
