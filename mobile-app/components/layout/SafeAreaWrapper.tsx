import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function SafeAreaWrapper({ children, style, edges = ['top', 'bottom'] }: SafeAreaWrapperProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }, style]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
