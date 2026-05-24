import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface SpinnerProps {
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function Spinner({ size = 'large', fullScreen = false }: SpinnerProps) {
  const { colors } = useTheme();
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={colors.primary} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={colors.primary} />;
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
