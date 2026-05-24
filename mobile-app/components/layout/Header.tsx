import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  rightElement?: React.ReactNode;
  transparent?: boolean;
}

export function Header({ title, showBack = false, showNotifications = false, rightElement, transparent = false }: HeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: transparent ? 'transparent' : colors.background,
        borderBottomColor: transparent ? 'transparent' : colors.border,
        borderBottomWidth: transparent ? 0 : 1,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 0,
      },
    ]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={transparent ? '#fff' : colors.text} />
          </TouchableOpacity>
        )}
      </View>
      {title && (
        <Text style={[styles.title, { color: transparent ? '#fff' : colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      )}
      <View style={styles.right}>
        {showNotifications && (
          <TouchableOpacity style={styles.iconBtn}>
            <Bell size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        {rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    minHeight: 56,
  },
  left: { width: 40 },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600' },
  right: { width: 40, alignItems: 'flex-end' },
  backBtn: { padding: 4 },
  iconBtn: { padding: 4 },
});
