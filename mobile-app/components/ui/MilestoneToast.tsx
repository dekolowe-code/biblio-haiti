import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { StreakMilestone } from '@/lib/streakService';

interface MilestoneToastProps {
  milestone: StreakMilestone;
  starsBonus: number;
  onDismiss: () => void;
}

const { width } = Dimensions.get('window');

export function MilestoneToast({ milestone, starsBonus, onDismiss }: MilestoneToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-80)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.spring(opacity,     { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.spring(translateY,  { toValue: 0, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.spring(scale,       { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -80, duration: 400, useNativeDriver: true }),
      ]).start(onDismiss);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { opacity, transform: [{ translateY }, { scale }] },
      ]}
    >
      <Text style={{ fontSize: 40 }}>{milestone.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Série de {milestone.label} !</Text>
        <Text style={styles.subtitle}>
          {starsBonus > 0 ? `+${starsBonus} étoiles bonus gagnées 🌟` : 'Félicitations ! Continuez !'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#f59e0b',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 9999,
  },
  title: { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 2 },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
});
