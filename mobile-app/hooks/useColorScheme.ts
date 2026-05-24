import { useColorScheme as useRNColorScheme } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export function useColorScheme() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme;
}

export function useSystemColorScheme() {
  return useRNColorScheme();
}
