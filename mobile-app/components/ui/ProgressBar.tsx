import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  height?: number;
  color?: string;
}

export function ProgressBar({ progress, showLabel = false, height = 6, color }: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(100, progress));
  const barColor = color ?? colors.primary;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height, backgroundColor: colors.border }]}>
        <View
          style={[
            styles.fill,
            { width: `${clamped}%`, backgroundColor: barColor, height },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{Math.round(clamped)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1, borderRadius: 999, overflow: 'hidden' },
  fill: { borderRadius: 999 },
  label: { fontSize: 11, fontWeight: '500', minWidth: 32, textAlign: 'right' },
});
