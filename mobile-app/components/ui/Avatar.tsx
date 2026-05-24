import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/context/ThemeContext';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
}

export function Avatar({ uri, name, size = 40 }: AvatarProps) {
  const { colors } = useTheme();
  const initials = name
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
      />
    );
  }

  return (
    <View style={[
      styles.fallback,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary },
    ]}>
      <Text style={[styles.initials, { fontSize: size * 0.35, color: '#ffffff' }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '700' },
});
