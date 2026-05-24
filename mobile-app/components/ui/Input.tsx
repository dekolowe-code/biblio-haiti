import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export function Input({ label, error, isPassword = false, style, ...props }: InputProps) {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text, fontSize: Typography.fontSize.sm }]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputWrap,
        {
          backgroundColor: colors.surface,
          borderColor: error ? colors.error : focused ? colors.primary : colors.border,
        },
      ]}>
        <TextInput
          style={[styles.input, { color: colors.text, fontSize: Typography.fontSize.md }, style]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
            {showPassword
              ? <EyeOff size={18} color={colors.textSecondary} />
              : <Eye size={18} color={colors.textSecondary} />
            }
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { marginBottom: 6, fontWeight: '500' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 12 },
  eyeBtn: { padding: 4 },
  error: { marginTop: 4, fontSize: 12 },
});
