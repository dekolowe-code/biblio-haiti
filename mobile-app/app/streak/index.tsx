import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Flame, Trophy, Calendar, Clock, TrendingUp } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { Spinner } from '@/components/ui/Spinner';
import {
  getUserStreak, getStreakLeaderboard, getStreakMilestones,
  getEarnedMilestones, getStreakLeaderboard as getBoard,
  streakLabel, streakEmoji, formatReadingTime, nextMilestone,
  UserStreak, StreakLeaderEntry, StreakMilestone,
} from '@/lib/streakService';

export default function StreakScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [board, setBoard] = useState<StreakLeaderEntry[]>([]);
  const [milestones, setMilestones] = useState<StreakMilestone[]>([]);
  const [earned, setEarned] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [streakData, boardData, milestonesData, earnedData] = await Promise.all([
      getUserStreak(),
      getStreakLeaderboard(),
      getStreakMilestones(),
      getEarnedMilestones(),
    ]);
    setStreak(streakData);
    setBoard(boardData);
    setMilestones(milestonesData);
    setEarned(earnedData);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const current = streak?.current_streak ?? 0;
  const longest = streak?.longest_streak ?? 0;
  const totalDays = streak?.total_reading_days ?? 0;
  const totalSec = streak?.total_reading_sec ?? 0;
  const next = nextMilestone(current);

  const progressToNext = next
    ? Math.min((current / next.milestone) * 100, 100)
    : 100;

  const myRank = board.findIndex(e => e.user_id === user?.id) + 1;

  if (loading) return <Spinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Ma Série</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
      >
        {/* Hero — streak actuel */}
        <Animated.View entering={FadeInUp.duration(400)}>
          <View style={[styles.heroCard, { backgroundColor: current > 0 ? '#f59e0b' : colors.surface }]}>
            <Text style={{ fontSize: 64, marginBottom: 4 }}>{streakEmoji(current)}</Text>
            <Text style={[styles.heroCount, { color: current > 0 ? '#fff' : colors.textSecondary }]}>
              {current}
            </Text>
            <Text style={[styles.heroLabel, { color: current > 0 ? 'rgba(255,255,255,0.85)' : colors.textSecondary }]}>
              {current === 0 ? 'Lisez aujourd\'hui pour commencer votre série !' :
               current === 1 ? 'jour consécutif · Continuez demain !' :
               `jours consécutifs · ${streakEmoji(current)}`}
            </Text>

            {/* Prochain milestone */}
            {next && (
              <View style={[styles.nextMilestone, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.nextLabel}>
                  Prochain : {next.emoji} {next.label} (+{next.stars_bonus}⭐)
                </Text>
                <View style={styles.progressBarWrap}>
                  <View style={[styles.progressBarFill, { width: `${progressToNext}%` as any }]} />
                </View>
                <Text style={styles.nextSub}>
                  {next.milestone - current} jour{next.milestone - current > 1 ? 's' : ''} restant{next.milestone - current > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Statistiques */}
        <Animated.View entering={FadeInUp.delay(80).duration(400)}>
          <View style={styles.statsGrid}>
            {[
              { icon: <Flame size={18} color="#ef4444" />, label: 'Meilleure série', value: `${longest} j`, bg: '#ef444415' },
              { icon: <Calendar size={18} color="#8b5cf6" />, label: 'Jours de lecture', value: `${totalDays}`, bg: '#8b5cf615' },
              { icon: <Clock size={18} color="#C41E3A" />, label: 'Temps total', value: formatReadingTime(totalSec), bg: '#C41E3A15' },
              { icon: <Trophy size={18} color="#f59e0b" />, label: 'Classement', value: myRank > 0 ? `#${myRank}` : 'N/A', bg: '#f59e0b15' },
            ].map((stat, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.statIconWrap, { backgroundColor: stat.bg }]}>{stat.icon}</View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Milestones */}
        <Animated.View entering={FadeInUp.delay(160).duration(400)} style={{ padding: 16 }}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PALIERS & RÉCOMPENSES</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {milestones.map((m, i) => {
              const done = earned.includes(m.milestone);
              const isCurrent = !done && current < m.milestone &&
                (i === 0 || current >= milestones[i - 1].milestone);
              return (
                <View
                  key={m.milestone}
                  style={[
                    styles.milestoneRow,
                    i < milestones.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                    isCurrent && { backgroundColor: '#f59e0b08' },
                  ]}
                >
                  <View style={[
                    styles.milestoneEmoji,
                    {
                      backgroundColor: done ? '#f59e0b20' : isCurrent ? '#f59e0b10' : colors.surface,
                      opacity: done || isCurrent ? 1 : 0.4,
                    },
                  ]}>
                    <Text style={{ fontSize: 20 }}>{m.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.milestoneTitle, { color: done || isCurrent ? colors.text : colors.textSecondary }]}>
                      {m.label}
                    </Text>
                    <Text style={[styles.milestoneSub, { color: colors.textSecondary }]}>
                      {done ? '✅ Débloqué !' : isCurrent ? `Encore ${m.milestone - current} jour${m.milestone - current > 1 ? 's' : ''}` : `${m.milestone} jours consécutifs`}
                    </Text>
                  </View>
                  <View style={[
                    styles.rewardBadge,
                    { backgroundColor: done ? '#f59e0b20' : colors.surface, borderColor: done ? '#f59e0b' : colors.border },
                  ]}>
                    <Text style={[styles.rewardText, { color: done ? '#f59e0b' : colors.textSecondary }]}>
                      +{m.stars_bonus}⭐
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Classement des séries */}
        <Animated.View entering={FadeInUp.delay(240).duration(400)} style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CLASSEMENT DES SÉRIES</Text>
          {board.length === 0 ? (
            <Text style={[styles.empty, { color: colors.textSecondary }]}>
              Aucune série enregistrée. Soyez le premier !
            </Text>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {board.map((entry, i) => {
                const isMe = entry.user_id === user?.id;
                return (
                  <Animated.View
                    key={entry.user_id}
                    entering={FadeInLeft.delay(i * 50).duration(300)}
                    style={[
                      styles.boardRow,
                      i < board.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                      isMe && { backgroundColor: '#f59e0b08' },
                    ]}
                  >
                    <Text style={[styles.boardRank, { color: i < 3 ? '#f59e0b' : colors.textSecondary }]}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </Text>
                    <Avatar uri={entry.avatar_url} name={entry.full_name} size={36} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.boardName, { color: colors.text }]} numberOfLines={1}>
                          {entry.full_name ?? 'Lecteur'}
                        </Text>
                        {isMe && (
                          <View style={[styles.meBadge, { backgroundColor: '#f59e0b' }]}>
                            <Text style={styles.meBadgeText}>Moi</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.boardSub, { color: colors.textSecondary }]}>
                        {entry.total_reading_days} jours lus au total
                      </Text>
                    </View>
                    <View style={styles.boardStreak}>
                      <Text style={{ fontSize: 18 }}>{streakEmoji(entry.current_streak)}</Text>
                      <Text style={[styles.boardStreakText, { color: '#f59e0b' }]}>
                        {entry.current_streak}j
                      </Text>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  heroCard: {
    margin: 16, borderRadius: 20, padding: 28,
    alignItems: 'center',
    shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 8,
  },
  heroCount: { fontSize: 64, fontWeight: '900', lineHeight: 72 },
  heroLabel: { fontSize: 14, textAlign: 'center', marginBottom: 16, fontWeight: '500' },
  nextMilestone: {
    width: '100%', borderRadius: 12, padding: 12, alignItems: 'center',
  },
  nextLabel: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  progressBarWrap: {
    width: '100%', height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden', marginBottom: 6,
  },
  progressBarFill: { height: '100%', borderRadius: 4, backgroundColor: '#fff' },
  nextSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: 16, marginBottom: 4,
  },
  statCard: {
    width: '47%', padding: 14, borderRadius: 14, borderWidth: 1,
    alignItems: 'center', gap: 6,
  },
  statIconWrap: { padding: 10, borderRadius: 12 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, textAlign: 'center' },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 10,
  },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  milestoneRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
  },
  milestoneEmoji: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  milestoneTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  milestoneSub: { fontSize: 12 },
  rewardBadge: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  rewardText: { fontSize: 12, fontWeight: '700' },
  boardRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14,
  },
  boardRank: { width: 30, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  boardName: { fontSize: 13, fontWeight: '600' },
  boardSub: { fontSize: 11, marginTop: 2 },
  boardStreak: { alignItems: 'center', gap: 2 },
  boardStreakText: { fontSize: 13, fontWeight: '800' },
  meBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  meBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  empty: { textAlign: 'center', fontSize: 14, padding: 24 },
});
