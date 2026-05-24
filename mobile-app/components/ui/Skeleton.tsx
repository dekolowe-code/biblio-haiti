import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: colors.skeleton, opacity },
        style,
      ]}
    />
  );
}

export function BookCardSkeleton() {
  return (
    <View style={{ width: 140, marginRight: 12 }}>
      <Skeleton height={200} borderRadius={12} style={{ marginBottom: 8 }} />
      <Skeleton height={14} width="85%" style={{ marginBottom: 4 }} />
      <Skeleton height={12} width="60%" />
    </View>
  );
}
