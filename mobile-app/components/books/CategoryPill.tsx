import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { categoryColors } from '@/constants/Colors';

interface CategoryPillProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function CategoryPill({ label, selected = false, onPress }: CategoryPillProps) {
  const { colors } = useTheme();
  const catColor = categoryColors[label] ?? colors.primary;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      style={[
        styles.pill,
        {
          backgroundColor: selected ? catColor : colors.surface,
          borderColor: selected ? catColor : colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: selected ? '#ffffff' : colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    marginRight: 8,
  },
  label: { fontSize: 13, fontWeight: '500' },
});
