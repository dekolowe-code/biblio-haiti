import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color, size = 'md' }: BadgeProps) {
  const { colors } = useTheme();
  const bg = color ? color + '22' : colors.primary + '22';
  const textColor = color ?? colors.primary;
  const fontSize = size === 'sm' ? 10 : 12;
  const px = size === 'sm' ? 7 : 10;
  const py = size === 'sm' ? 2 : 4;

  return (
    <View style={[styles.badge, { backgroundColor: bg, paddingHorizontal: px, paddingVertical: py }]}>
      <Text style={[styles.text, { color: textColor, fontSize }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 999, alignSelf: 'flex-start' },
  text: { fontWeight: '600' },
});
