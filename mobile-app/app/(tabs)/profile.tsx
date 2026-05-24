import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND, GRADIENT_NAV } from '@/constants/Colors';
import { Sun, Moon, Smartphone, Bell, Trash2, Info, ChevronRight, LayoutDashboard, Trophy, Flame } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { getUserStreak, UserStreak } from '@/lib/streakService';
import { Theme } from '@/types';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { colors, theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { library } = useLibrary();
  const [signingOut, setSigningOut] = useState(false);
  const [streak, setStreak] = useState<UserStreak | null>(null);

  useEffect(() => {
    if (user) getUserStreak().then(setStreak);
  }, [user]);

  const booksRead = library.filter(b => b.isFinished).length;
  const booksReading = library.filter(b => !b.isFinished && b.currentPage > 0).length;
  const booksSaved = library.filter(b => b.isFavorite).length;

  const handleSignOut = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnecter', style: 'destructive', onPress: async () => {
          setSigningOut(true);
          await signOut();
          setSigningOut(false);
          router.replace('/(auth)/login' as never);
        },
      },
    ]);
  };

  const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: Smartphone },
  ];

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={styles.centered}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>👤</Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mon Profil</Text>
          <Text style={[{ color: colors.textSecondary, textAlign: 'center', marginBottom: 20 }]}>
            Connectez-vous pour accéder à votre profil
          </Text>
          <Button title="Se connecter" onPress={() => router.push('/(auth)/login' as never)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.offWhite }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[BRAND.deepRed, BRAND.crimson, BRAND.sunsetOrange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeaderGradient}
        >
        <View style={styles.profileHeader}>
          <Avatar uri={user.avatar_url} name={user.full_name} size={72} />
          <Text style={styles.name}>{user.full_name ?? 'Lecteur'}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {user.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>⚡ Administrateur</Text>
            </View>
          )}
          <View style={styles.starsRow}>
            <Text style={{ color: BRAND.goldenYellow, fontWeight: '700' }}>⭐ {user.starsBalance} étoiles</Text>
          </View>

          {/* Streak badge dans le profil */}
          {streak !== null && (
            <TouchableOpacity
              onPress={() => router.push('/streak' as never)}
              style={{ marginTop: 10 }}
            >
              <StreakBadge
                streak={streak.current_streak}
                variant="full"
                animated={streak.current_streak > 0}
              />
            </TouchableOpacity>
          )}
        </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          {[
            { label: 'Lus', value: booksRead, icon: '✅' },
            { label: 'En cours', value: booksReading, icon: '📖' },
            { label: 'Sauvegardés', value: booksSaved, icon: '❤️' },
          ].map(stat => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Text style={{ fontSize: 24 }}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {user.role === 'admin' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ADMINISTRATION</Text>
            <TouchableOpacity
              onPress={() => router.push('/dashboard' as never)}
              style={[styles.adminCard, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            >
              <LayoutDashboard size={24} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={styles.adminCardTitle}>Tableau de bord</Text>
                <Text style={styles.adminCardDesc}>Gérer les livres, voir les statistiques</Text>
              </View>
              <ChevronRight size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CLASSEMENT</Text>
          <TouchableOpacity
            onPress={() => router.push('/leaderboard' as never)}
            style={[styles.leaderboardCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.leaderboardIcon, { backgroundColor: colors.accent + '20' }]}>
              <Trophy size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.leaderboardTitle, { color: colors.text }]}>Classement général</Text>
              <Text style={[styles.leaderboardDesc, { color: colors.textSecondary }]}>
                {user?.stars_balance ? `⭐ ${user.stars_balance} étoiles` : 'Complétez des quiz pour gagner des étoiles'}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPARENCE</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.themeRow}>
              {THEME_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const active = theme === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setTheme(opt.value)}
                    style={[
                      styles.themeBtn,
                      { backgroundColor: active ? colors.primary : colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <Icon size={16} color={active ? '#fff' : colors.textSecondary} />
                    <Text style={[styles.themeBtnLabel, { color: active ? '#fff' : colors.text }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PARAMÈTRES</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => router.push('/notifications' as never)}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <Bell size={18} color={colors.primary} />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Gérer les alertes et rappels</Text>
                </View>
              </View>
              <ChevronRight size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>COMPTE</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { icon: Trash2, label: 'Vider le cache', onPress: () => Alert.alert('Cache', 'Cache vidé avec succès.') },
              { icon: Info, label: 'À propos de Biblio Haïti', onPress: () => Alert.alert('Biblio Haïti', 'Version 1.0.0\nDéveloppé avec ❤️ pour Haïti') },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={item.onPress}
                  style={[styles.settingRow, i < 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
                >
                  <View style={styles.settingLeft}>
                    <Icon size={18} color={colors.primary} />
                    <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                  </View>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          <Button
            title={signingOut ? 'Déconnexion...' : 'Se déconnecter'}
            onPress={handleSignOut}
            variant="danger"
            fullWidth
            loading={signingOut}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  profileHeaderGradient: { paddingTop: 8 },
  profileHeader: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  name: { fontSize: 22, fontWeight: '700', marginTop: 12, color: '#fff' },
  email: { fontSize: 14, marginTop: 4, color: 'rgba(255,255,255,0.8)' },
  adminBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.25)' },
  starsRow: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 12, gap: 4 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  adminCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 14,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  adminCardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  adminCardDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  card: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  themeRow: { flexDirection: 'row', gap: 8, padding: 12 },
  themeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, padding: 10, borderRadius: 8, borderWidth: 1,
  },
  themeBtnLabel: { fontSize: 12, fontWeight: '600' },
  leaderboardCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1,
  },
  leaderboardIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  leaderboardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  leaderboardDesc: { fontSize: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 14, fontWeight: '500' },
  settingDesc: { fontSize: 11, marginTop: 2 },
});
