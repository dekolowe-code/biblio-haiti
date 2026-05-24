import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trophy, Star, Medal, TrendingUp, BookOpen, Target } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import {
  getGlobalLeaderboard, getLeaderboardCategories, getCategoryLeaderboard,
  getUserRank, getStarTransactions, getUserQuizHistory,
  LeaderboardEntry, REASON_LABELS, starsLabel,
} from '@/lib/leaderboardService';
import { categories } from '@/data/mockCategories';

type Tab = 'global' | 'categories' | 'history';

const MEDAL_COLORS = ['#f59e0b', '#9ca3af', '#d97706'];
const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('global');
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [categoryBoard, setCategoryBoard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<{ rank: number | null; entry: LeaderboardEntry | null }>({ rank: null, entry: null });
  const [starHistory, setStarHistory] = useState<ReturnType<typeof getStarTransactions> extends Promise<infer T> ? T : never>([]);
  const [quizHistory, setQuizHistory] = useState<ReturnType<typeof getUserQuizHistory> extends Promise<infer T> ? T : never>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [globalData, cats] = await Promise.all([
      getGlobalLeaderboard(),
      getLeaderboardCategories(),
    ]);
    setBoard(globalData);
    setAvailableCategories(cats);

    if (user?.id) {
      const [rankData, txData, histData] = await Promise.all([
        getUserRank(user.id),
        getStarTransactions(),
        getUserQuizHistory(user.id),
      ]);
      setUserRank(rankData);
      setStarHistory(txData);
      setQuizHistory(histData);
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const loadCategory = useCallback(async (cat: string) => {
    setSelectedCategory(cat);
    const data = await getCategoryLeaderboard(cat);
    setCategoryBoard(data as unknown as LeaderboardEntry[]);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderRankBadge = (rank: number) => {
    if (rank <= 3) {
      return (
        <View style={[styles.medalBadge, { backgroundColor: MEDAL_COLORS[rank - 1] + '25' }]}>
          <Text style={{ fontSize: 18 }}>{MEDAL_EMOJIS[rank - 1]}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.rankBadge, { backgroundColor: colors.surface }]}>
        <Text style={[styles.rankText, { color: colors.textSecondary }]}>#{rank}</Text>
      </View>
    );
  };

  const renderEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isMe = item.user_id === user?.id;
    return (
      <Animated.View entering={FadeInLeft.delay(index * 40).duration(300)}>
        <View style={[
          styles.entryRow,
          {
            backgroundColor: isMe ? colors.primary + '12' : colors.card,
            borderColor: isMe ? colors.primary : colors.border,
          },
        ]}>
          {renderRankBadge(item.rank ?? index + 1)}
          <Avatar uri={item.avatar_url} name={item.full_name} size={40} />
          <View style={{ flex: 1 }}>
            <View style={styles.entryNameRow}>
              <Text style={[styles.entryName, { color: colors.text }]} numberOfLines={1}>
                {item.full_name ?? 'Lecteur'}
              </Text>
              {isMe && (
                <View style={[styles.meBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.meBadgeText}>Moi</Text>
                </View>
              )}
            </View>
            <Text style={[styles.entryMeta, { color: colors.textSecondary }]}>
              {item.total_quizzes} quiz · {Math.round(item.avg_score)}% moy.
              {item.perfect_scores > 0 ? ` · ${item.perfect_scores} 🏆` : ''}
            </Text>
          </View>
          <View style={styles.entryStars}>
            <Star size={14} color={colors.accent} fill={colors.accent} />
            <Text style={[styles.entryStarsText, { color: colors.accent }]}>
              {item.total_stars}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const tabs: { key: Tab; label: string; icon: typeof Trophy }[] = [
    { key: 'global', label: 'Classement', icon: Trophy },
    { key: 'categories', label: 'Catégories', icon: BookOpen },
    { key: 'history', label: 'Mon historique', icon: TrendingUp },
  ];

  if (loading) return <Spinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Classement</Text>
        <View style={{ width: 34 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tab, active && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            >
              <Icon size={15} color={active ? colors.primary : colors.textSecondary} />
              <Text style={[styles.tabText, { color: active ? colors.primary : colors.textSecondary }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Mon rang (bannière personnelle) */}
      {user && userRank.rank && tab === 'global' && (
        <Animated.View entering={FadeInUp.duration(400)}>
          <View style={[styles.myRankBanner, { backgroundColor: colors.primary, marginHorizontal: 16, marginTop: 12 }]}>
            <View>
              <Text style={styles.myRankLabel}>Votre position</Text>
              <Text style={styles.myRankValue}>#{userRank.rank}</Text>
            </View>
            <View style={styles.myRankDivider} />
            <View>
              <Text style={styles.myRankLabel}>Étoiles</Text>
              <Text style={styles.myRankValue}>⭐ {userRank.entry?.total_stars ?? 0}</Text>
            </View>
            <View style={styles.myRankDivider} />
            <View>
              <Text style={styles.myRankLabel}>Score moyen</Text>
              <Text style={styles.myRankValue}>{Math.round(userRank.entry?.avg_score ?? 0)}%</Text>
            </View>
            <View style={styles.myRankDivider} />
            <View>
              <Text style={styles.myRankLabel}>Parfaits 🏆</Text>
              <Text style={styles.myRankValue}>{userRank.entry?.perfect_scores ?? 0}</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Podium top 3 */}
      {tab === 'global' && board.length >= 3 && (
        <Animated.View entering={FadeInUp.delay(80).duration(400)}>
          <View style={styles.podium}>
            {[board[1], board[0], board[2]].map((entry, idx) => {
              const positions = [2, 1, 3];
              const pos = positions[idx];
              const heights = [90, 120, 70];
              return (
                <View key={entry.user_id} style={styles.podiumSlot}>
                  <Avatar uri={entry.avatar_url} name={entry.full_name} size={pos === 1 ? 52 : 44} />
                  <Text style={{ fontSize: pos === 1 ? 28 : 22 }}>{MEDAL_EMOJIS[pos - 1]}</Text>
                  <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>
                    {entry.full_name?.split(' ')[0] ?? 'Lecteur'}
                  </Text>
                  <View style={[
                    styles.podiumBar,
                    {
                      height: heights[idx],
                      backgroundColor: MEDAL_COLORS[pos - 1] + '30',
                      borderTopColor: MEDAL_COLORS[pos - 1],
                    },
                  ]}>
                    <Text style={{ color: MEDAL_COLORS[pos - 1], fontWeight: '700', fontSize: 13 }}>
                      ⭐ {entry.total_stars}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>
      )}

      {/* Contenu selon onglet */}
      {tab === 'global' && (
        <FlatList
          data={board.slice(3)}
          keyExtractor={e => e.user_id}
          renderItem={renderEntry}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.textSecondary }]}>
              Aucun score enregistré. Complétez un quiz pour apparaître ici !
            </Text>
          }
        />
      )}

      {tab === 'categories' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          <View style={{ padding: 16 }}>
            {availableCategories.length === 0 ? (
              <Text style={[styles.empty, { color: colors.textSecondary }]}>
                Complétez des quiz pour voir le classement par catégorie.
              </Text>
            ) : (
              <>
                {/* Sélecteur catégorie */}
                <FlatList
                  horizontal
                  data={availableCategories}
                  keyExtractor={c => c}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => loadCategory(item)}
                      style={[
                        styles.catPill,
                        {
                          backgroundColor: selectedCategory === item ? colors.primary : colors.surface,
                          borderColor: selectedCategory === item ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[
                        styles.catPillText,
                        { color: selectedCategory === item ? '#fff' : colors.text },
                      ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, marginBottom: 16 }}
                />

                {/* Classement de la catégorie */}
                {selectedCategory && categoryBoard.map((e, i) => renderEntry({ item: { ...e, rank: i + 1 }, index: i }))}
                {!selectedCategory && (
                  <Text style={[styles.empty, { color: colors.textSecondary }]}>
                    Sélectionnez une catégorie pour voir son classement.
                  </Text>
                )}
              </>
            )}
          </View>
        </ScrollView>
      )}

      {tab === 'history' && !user && (
        <View style={styles.emptyCenter}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🔒</Text>
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            Connectez-vous pour voir votre historique.
          </Text>
        </View>
      )}

      {tab === 'history' && user && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          {/* Étoiles gagnées */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ÉTOILES GAGNÉES</Text>
          {starHistory.length === 0 ? (
            <Text style={[styles.empty, { color: colors.textSecondary }]}>Aucune étoile gagnée pour l'instant.</Text>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {starHistory.map((tx, i) => (
                <View key={tx.id} style={[
                  styles.txRow,
                  i < starHistory.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                ]}>
                  <Text style={{ fontSize: 22 }}>{REASON_LABELS[tx.reason]?.split(' ')[0] ?? '⭐'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.txLabel, { color: colors.text }]}>
                      {REASON_LABELS[tx.reason]?.substring(2) ?? tx.reason}
                    </Text>
                    <Text style={[styles.txDate, { color: colors.textSecondary }]}>
                      {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <Text style={[styles.txAmount, { color: colors.accent }]}>+{tx.amount} ⭐</Text>
                </View>
              ))}
            </View>
          )}

          {/* Historique quiz */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 20 }]}>MES QUIZ</Text>
          {quizHistory.length === 0 ? (
            <Text style={[styles.empty, { color: colors.textSecondary }]}>Aucun quiz complété pour l'instant.</Text>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {quizHistory.map((q, i) => {
                const pct = Math.round(q.percentage);
                const info = starsLabel(pct);
                return (
                  <View key={q.id} style={[
                    styles.quizRow,
                    i < quizHistory.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                  ]}>
                    <Text style={{ fontSize: 22 }}>{info.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.quizTitle, { color: colors.text }]} numberOfLines={1}>
                        {q.book_title}
                      </Text>
                      <View style={styles.quizMeta}>
                        <Text style={[styles.quizMetaText, { color: colors.textSecondary }]}>
                          {q.score}/{q.total} · {q.category}
                        </Text>
                        <Text style={[styles.quizMetaText, { color: colors.textSecondary }]}>
                          {new Date(q.completed_at).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                      <View style={[styles.scoreBar, { backgroundColor: colors.border }]}>
                        <View style={[
                          styles.scoreBarFill,
                          {
                            width: `${pct}%` as any,
                            backgroundColor: pct >= 80 ? colors.success : pct >= 60 ? colors.accent : colors.error,
                          },
                        ]} />
                      </View>
                    </View>
                    <View style={styles.quizRight}>
                      <Text style={[styles.quizPct, { color: pct >= 80 ? colors.success : pct >= 60 ? colors.accent : colors.error }]}>
                        {pct}%
                      </Text>
                      {q.stars_earned > 0 && (
                        <Text style={[styles.quizStars, { color: colors.accent }]}>+{q.stars_earned}⭐</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  tabBar: {
    flexDirection: 'row', borderBottomWidth: 1,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 5, paddingVertical: 12,
  },
  tabText: { fontSize: 12, fontWeight: '600' },
  myRankBanner: {
    flexDirection: 'row', borderRadius: 14, padding: 14,
    marginBottom: 8, justifyContent: 'space-around', alignItems: 'center',
  },
  myRankLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'center', marginBottom: 4 },
  myRankValue: { color: '#ffffff', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  myRankDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.25)' },
  podium: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  podiumSlot: { flex: 1, alignItems: 'center', gap: 4 },
  podiumName: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  podiumBar: {
    width: '100%', borderRadius: 8,
    alignItems: 'center', justifyContent: 'flex-start',
    paddingTop: 8, borderTopWidth: 3,
  },
  medalBadge: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  rankBadge: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontSize: 12, fontWeight: '700' },
  entryRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, padding: 12,
    borderRadius: 12, borderWidth: 1,
  },
  entryNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  entryName: { fontSize: 14, fontWeight: '600', flex: 1 },
  meBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  meBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  entryMeta: { fontSize: 11 },
  entryStars: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  entryStarsText: { fontSize: 15, fontWeight: '700' },
  catPill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
  },
  catPillText: { fontSize: 13, fontWeight: '600' },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 4 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  txLabel: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  txDate: { fontSize: 11 },
  txAmount: { fontSize: 16, fontWeight: '800' },
  quizRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  quizTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  quizMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  quizMetaText: { fontSize: 11 },
  scoreBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 2 },
  quizRight: { alignItems: 'flex-end', gap: 2 },
  quizPct: { fontSize: 16, fontWeight: '800' },
  quizStars: { fontSize: 11, fontWeight: '600' },
  empty: { textAlign: 'center', fontSize: 14, padding: 24 },
  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
});
