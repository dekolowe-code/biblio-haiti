import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false,
  style, textStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const bgColor = {
    primary: colors.primary,
    secondary: colors.surface,
    ghost: 'transparent',
    danger: colors.error,
  }[variant];

  const textColor = {
    primary: '#ffffff',
    secondary: colors.text,
    ghost: colors.primary,
    danger: '#ffffff',
  }[variant];

  const paddingV = { sm: 8, md: 12, lg: 16 }[size];
  const paddingH = { sm: 14, md: 20, lg: 28 }[size];
  const fontSize = { sm: 13, md: 15, lg: 17 }[size];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.base,
        { backgroundColor: bgColor, paddingVertical: paddingV, paddingHorizontal: paddingH },
        variant === 'secondary' && { borderWidth: 1, borderColor: colors.border },
        fullWidth && { width: '100%' },
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
  },
});
