import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { streakEmoji } from '@/lib/streakService';

interface StreakBadgeProps {
  streak: number;
  variant?: 'compact' | 'full' | 'hero';
  onPress?: () => void;
  animated?: boolean;
}

export function StreakBadge({ streak, variant = 'compact', onPress, animated = false }: StreakBadgeProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated || streak === 0) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.06, duration: 900, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 1, duration: 900, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0, duration: 900, useNativeDriver: false }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [animated, streak]);

  const emoji = streakEmoji(streak);
  const active = streak > 0;

  const glowColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(245,158,11,0)', 'rgba(245,158,11,0.35)'],
  });

  if (variant === 'compact') {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress}>
        <Animated.View style={[
          styles.compact,
          {
            backgroundColor: active ? '#f59e0b18' : colors.surface,
            borderColor: active ? '#f59e0b' : colors.border,
            transform: [{ scale }],
          },
        ]}>
          <Text style={{ fontSize: 14 }}>{emoji}</Text>
          <Text style={[styles.compactText, { color: active ? '#f59e0b' : colors.textSecondary }]}>
            {streak}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  if (variant === 'full') {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.85}>
        <Animated.View style={[
          styles.full,
          {
            backgroundColor: active ? '#f59e0b18' : colors.surface,
            borderColor: active ? '#f59e0b' : colors.border,
            shadowColor: active ? '#f59e0b' : 'transparent',
          },
        ]}>
          <Text style={{ fontSize: 28 }}>{emoji}</Text>
          <View>
            <Text style={[styles.fullCount, { color: active ? '#f59e0b' : colors.textSecondary }]}>
              {streak} jour{streak > 1 ? 's' : ''}
            </Text>
            <Text style={[styles.fullLabel, { color: colors.textSecondary }]}>
              {active ? 'Série en cours 🔥' : 'Commencez à lire !'}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  if (variant === 'hero') {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.85}>
        <Animated.View style={[
          styles.hero,
          {
            backgroundColor: active ? '#f59e0b' : colors.surface,
            shadowColor: '#f59e0b',
            shadowOpacity: active ? 0.4 : 0,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
            elevation: active ? 8 : 0,
            transform: [{ scale }],
          },
        ]}>
          <Text style={{ fontSize: 36 }}>{emoji}</Text>
          <Text style={[styles.heroCount, { color: active ? '#fff' : colors.textSecondary }]}>
            {streak}
          </Text>
          <Text style={[styles.heroLabel, { color: active ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
            {streak === 1 ? 'jour' : 'jours'}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  compact: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1.5,
  },
  compactText: { fontSize: 13, fontWeight: '700' },
  full: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1.5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  fullCount: { fontSize: 18, fontWeight: '800' },
  fullLabel: { fontSize: 12, marginTop: 2 },
  hero: {
    alignItems: 'center', justifyContent: 'center',
    padding: 20, borderRadius: 20, gap: 2,
    minWidth: 90,
  },
  heroCount: { fontSize: 32, fontWeight: '900' },
  heroLabel: { fontSize: 12, fontWeight: '600' },
});
