import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ScrollView, View, Text, FlatList,
  RefreshControl, StyleSheet, TouchableOpacity,
  ImageBackground, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search, Sparkles, Star, Trophy } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { BookCard } from '@/components/books/BookCard';
import { CategoryPill } from '@/components/books/CategoryPill';
import { BookCardSkeleton } from '@/components/ui/Skeleton';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { getFeaturedBooks, getPaginatedBooks } from '@/lib/bookService';
import { getUserStreak } from '@/lib/streakService';
import { Book } from '@/types';
import { categories } from '@/data/mockCategories';
import { BRAND, GRADIENT_BG } from '@/constants/Colors';
import { Images } from '@/constants/Assets';

const { width: W } = Dimensions.get('window');

const HERO_IMAGES = [
  Images.heroBanner,
  null,
  null,
];

const HERO_TEXTS = [
  "Découvrez l'héritage d'Haïti",
  "La littérature à portée de main",
  "Gagnez des étoiles en lisant",
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { library } = useLibrary();
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

  const loadData = useCallback(async () => {
    const [featured, paginated, streakData] = await Promise.all([
      getFeaturedBooks(),
      getPaginatedBooks(0),
      user ? getUserStreak() : Promise.resolve(null),
    ]);
    setFeaturedBooks(featured);
    setRecentBooks(paginated.data.slice(0, 10));
    if (streakData) setCurrentStreak(streakData.current_streak);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-défilement hero (comme le web)
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(p => (p + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const readingBooks = library.filter(b => !b.isFinished && b.currentPage > 0);
  const stars = (user as any)?.starsBalance || 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.deepRed }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND.goldenYellow} />
        }
      >
        {/* ── Header gradient (même dégradé que le web : #9B1B30 → #C41E3A) */}
        <LinearGradient
          colors={[BRAND.deepRed, BRAND.crimson]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>
                {user ? `Bonjour, ${(user as any).full_name?.split(' ')[0] ?? 'Lecteur'} 👋` : 'Bienvenue 👋'}
              </Text>
              <Text style={styles.headerTitle}>Biblio Haïti</Text>
            </View>
            <View style={styles.headerActions}>
              {user && (
                <View style={styles.starsChip}>
                  <Star size={13} color={BRAND.goldenYellow} fill={BRAND.goldenYellow} />
                  <Text style={styles.starsText}>{stars}</Text>
                </View>
              )}
              {user && (
                <StreakBadge
                  streak={currentStreak}
                  variant="compact"
                  onPress={() => router.push('/streak' as never)}
                  animated={currentStreak > 0}
                />
              )}
              <TouchableOpacity
                onPress={() => router.push('/chat' as never)}
                style={styles.iconBtn}
              >
                <Sparkles size={20} color="#fff" strokeWidth={1.5} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/catalogue' as never)}
                style={styles.iconBtn}
              >
                <Search size={20} color="#fff" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* ── Hero banner (même carrousel que le web) */}
        <View style={styles.hero}>
          {HERO_IMAGES[heroIndex] ? (
            <ImageBackground
              source={HERO_IMAGES[heroIndex]!}
              style={styles.heroImage}
              imageStyle={{ borderRadius: 0 }}
            >
              <LinearGradient
                colors={['transparent', 'rgba(155,27,48,0.85)']}
                style={styles.heroOverlay}
              >
                <Text style={styles.heroText}>{HERO_TEXTS[heroIndex]}</Text>
              </LinearGradient>
            </ImageBackground>
          ) : (
            <LinearGradient
              colors={[BRAND.crimson, BRAND.sunsetOrange, BRAND.goldenYellow]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroImage}
            >
              <View style={styles.heroOverlay}>
                <Text style={styles.heroText}>{HERO_TEXTS[heroIndex]}</Text>
              </View>
            </LinearGradient>
          )}
          {/* Dots */}
          <View style={styles.heroDots}>
            {[0, 1, 2].map(i => (
              <View
                key={i}
                style={[
                  styles.heroDot,
                  i === heroIndex
                    ? { backgroundColor: BRAND.goldenYellow, width: 16 }
                    : { backgroundColor: 'rgba(255,255,255,0.4)' },
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── Main content wrapper (fond blanc cassé comme le web) */}
        <View style={[styles.content, { backgroundColor: BRAND.offWhite }]}>

          {!user && (
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login' as never)}
              style={styles.authBanner}
            >
              <LinearGradient
                colors={[BRAND.crimson + '22', BRAND.sunsetOrange + '22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.authBannerGradient}
              >
                <Text style={[styles.authBannerText, { color: BRAND.crimson }]}>
                  Connectez-vous pour sauvegarder votre progression de lecture →
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* ── Bannière AI assistant */}
          <TouchableOpacity
            onPress={() => router.push('/chat' as never)}
            style={styles.chatBanner}
          >
            <LinearGradient
              colors={[BRAND.crimson, BRAND.sunsetOrange]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.chatIcon}
            >
              <Sparkles size={18} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.chatBannerTitle}>Assistant IA</Text>
              <Text style={styles.chatBannerDesc}>
                Demandez une recommandation personnalisée
              </Text>
            </View>
            <View style={styles.chatArrow}>
              <Text style={{ color: BRAND.crimson, fontSize: 16, fontWeight: '700' }}>→</Text>
            </View>
          </TouchableOpacity>

          {/* ── Catégories */}
          <View style={styles.section}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[{ id: 'all', name: 'Tous', icon: 'Grid', color: BRAND.crimson }, ...categories]}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <CategoryPill
                  label={item.name}
                  selected={selectedCategory === item.name || (selectedCategory === null && item.name === 'Tous')}
                  onPress={() => setSelectedCategory(item.name === 'Tous' ? null : item.name)}
                />
              )}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
            />
          </View>

          {/* ── Livres en vedette */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Livres en Vedette</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/catalogue' as never)}>
                <Text style={styles.seeAll}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <FlatList
                horizontal data={[1, 2, 3]} keyExtractor={i => String(i)}
                renderItem={() => <BookCardSkeleton />}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <FlatList
                horizontal
                data={featuredBooks}
                keyExtractor={b => b.id}
                renderItem={({ item }) => <BookCard book={item} variant="hero" />}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                showsHorizontalScrollIndicator={false}
              />
            )}
          </View>

          {/* ── Continuer la lecture */}
          {readingBooks.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { paddingHorizontal: 16 }]}>Continuer la lecture</Text>
              <View style={{ paddingHorizontal: 16 }}>
                {readingBooks.slice(0, 3).map(entry => {
                  const book = recentBooks.find(b => b.id === entry.bookId);
                  if (!book) return null;
                  return <BookCard key={book.id} book={book} variant="compact" showProgress />;
                })}
              </View>
            </View>
          )}

          {/* ── Nouveautés */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nouveautés</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/catalogue' as never)}>
                <Text style={styles.seeAll}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <FlatList horizontal data={[1, 2, 3]} keyExtractor={i => String(i)}
                renderItem={() => <BookCardSkeleton />}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <FlatList
                horizontal
                data={recentBooks.filter(b => selectedCategory ? b.category === selectedCategory : true)}
                keyExtractor={b => b.id}
                renderItem={({ item }) => <BookCard book={item} variant="grid" />}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                showsHorizontalScrollIndicator={false}
              />
            )}
          </View>

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Header
  headerGradient: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginTop: 2, letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  starsChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  starsText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  iconBtn: {
    padding: 9, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  // Hero
  hero: { height: 220, overflow: 'hidden', position: 'relative' },
  heroImage: { flex: 1 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    lineHeight: 24,
  },
  heroDots: {
    position: 'absolute', bottom: 12,
    left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  heroDot: { height: 6, borderRadius: 3 },
  // Content
  content: { minHeight: 400, borderTopLeftRadius: 0, borderTopRightRadius: 0, paddingTop: 16 },
  authBanner: { marginHorizontal: 16, marginBottom: 12, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: BRAND.crimson + '40' },
  authBannerGradient: { padding: 12 },
  authBannerText: { fontSize: 13, fontWeight: '500' },
  chatBanner: {
    marginHorizontal: 16, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: BRAND.crimson + '20',
    shadowColor: BRAND.crimson,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  chatIcon: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  chatBannerTitle: { fontSize: 14, fontWeight: '700', color: BRAND.darkText, marginBottom: 2 },
  chatBannerDesc: { fontSize: 12, color: BRAND.mutedText },
  chatArrow: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: BRAND.crimson + '12',
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: BRAND.darkText, marginBottom: 12 },
  seeAll: { color: BRAND.crimson, fontSize: 13, fontWeight: '600' },
});
