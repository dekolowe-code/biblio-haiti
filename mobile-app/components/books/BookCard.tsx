import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Heart, Download, ChevronRight, Star, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { useLibrary } from '@/context/LibraryContext';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { categoryColors, BRAND } from '@/constants/Colors';
import { resolveBookCover } from '@/lib/bookService';
import { Book } from '@/types';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BookCardProps {
  book: Book;
  variant?: 'grid' | 'compact' | 'hero';
  showProgress?: boolean;
  isDownloaded?: boolean;
}

export function BookCard({ book, variant = 'grid', showProgress = false, isDownloaded = false }: BookCardProps) {
  const { colors } = useTheme();
  const { isFavorite, toggleBookFavorite, getProgress, isUnlocked: isUnlockedFn } = useLibrary();
  const catColor = categoryColors[book.category] || BRAND.crimson;
  const progress = getProgress(book.id);
  const isUnlocked = isUnlockedFn(book.id) || !book.isPremium;
  const coverSource = resolveBookCover(book.coverUrl);

  const handlePress = () => router.push(`/book/${book.id}` as never);
  const handleFavorite = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleBookFavorite(book.id);
  };

  if (variant === 'hero') {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={[styles.hero, { width: SCREEN_WIDTH - 32 }]}>
        <Image source={coverSource} style={styles.heroImage} contentFit="cover" />
        <View style={styles.heroOverlay}>
          <Badge label={book.category} color={catColor} />
          <Text style={styles.heroTitle} numberOfLines={2}>{book.title}</Text>
          <Text style={styles.heroAuthor} numberOfLines={1}>{book.author}</Text>
          <View style={[styles.heroBtn, { backgroundColor: BRAND.goldenYellow }]}>
            <Text style={styles.heroBtnText}>Lire maintenant</Text>
          </View>
        </View>
        {!isUnlocked && book.isPremium && (
          <View style={styles.premiumOverlay}>
            <View style={styles.premiumBadge}>
              <Lock size={12} color="#fff" />
              <Star size={12} color="#fff" fill="#fff" />
              <Text style={styles.premiumText}>{book.unlockCost}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}
        style={[styles.compact, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.compactImageWrap}>
          <Image source={coverSource} style={styles.compactImage} contentFit="cover" />
          {!isUnlocked && book.isPremium && (
            <View style={styles.compactLock}>
              <Lock size={10} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.compactContent}>
          <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={2}>{book.title}</Text>
          <Text style={[styles.compactAuthor, { color: colors.textSecondary }]} numberOfLines={1}>{book.author}</Text>
          <Badge label={book.category} color={catColor} size="sm" />
          {showProgress && progress > 0 && (
            <View style={{ marginTop: 8 }}>
              <ProgressBar progress={progress} showLabel />
            </View>
          )}
        </View>
        <ChevronRight size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  }

  // grid (default) — même rendu que le BookCard web
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={styles.grid}>
      <View style={[styles.gridImageWrap, { backgroundColor: colors.surface }]}>
        <Image
          source={coverSource}
          style={[styles.gridImage, !isUnlocked && book.isPremium && { opacity: 0.7 }]}
          contentFit="cover"
        />
        {!isUnlocked && book.isPremium && (
          <View style={styles.premiumOverlaySm}>
            <View style={styles.premiumBadgeSm}>
              <Lock size={9} color="#fff" />
              <Star size={9} color="#fff" fill="#fff" />
              <Text style={styles.premiumTextSm}>{book.unlockCost}</Text>
            </View>
          </View>
        )}
        <TouchableOpacity onPress={handleFavorite} style={styles.heartBtn}>
          <Heart
            size={14}
            color={isFavorite(book.id) ? '#ef4444' : '#ffffff'}
            fill={isFavorite(book.id) ? '#ef4444' : 'transparent'}
          />
        </TouchableOpacity>
        {isDownloaded && (
          <View style={[styles.downloadBadge, { backgroundColor: BRAND.green }]}>
            <Download size={10} color="#fff" />
          </View>
        )}
      </View>
      <Text style={[styles.gridTitle, { color: colors.text }]} numberOfLines={2}>{book.title}</Text>
      <Text style={[styles.gridAuthor, { color: colors.textSecondary }]} numberOfLines={1}>{book.author}</Text>
      <View style={styles.ratingRow}>
        <Star size={11} color={BRAND.goldenYellow} fill={BRAND.goldenYellow} />
        <Text style={[styles.ratingText, { color: colors.text }]}>{book.rating}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  heroImage: { ...StyleSheet.absoluteFillObject },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.50)',
    padding: 16,
    justifyContent: 'flex-end',
    gap: 6,
  },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  heroAuthor: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  heroBtn: { marginTop: 8, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' },
  heroBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  premiumOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumOverlaySm: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BRAND.goldenYellow,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  premiumBadgeSm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: BRAND.goldenYellow,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  premiumText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  premiumTextSm: { color: '#fff', fontWeight: '700', fontSize: 10 },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 10,
  },
  compactImageWrap: { position: 'relative' },
  compactImage: { width: 60, height: 90, borderRadius: 8 },
  compactLock: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContent: { flex: 1, gap: 4 },
  compactTitle: { fontSize: 14, fontWeight: '600' },
  compactAuthor: { fontSize: 12 },
  grid: { width: 120, marginRight: 12 },
  gridImageWrap: { width: 120, height: 180, borderRadius: 12, overflow: 'hidden', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  gridImage: { width: '100%', height: '100%' },
  heartBtn: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 20, padding: 5,
  },
  downloadBadge: {
    position: 'absolute', bottom: 6, right: 6,
    borderRadius: 20, padding: 4,
  },
  gridTitle: { fontSize: 12, fontWeight: '600', marginBottom: 2, lineHeight: 16 },
  gridAuthor: { fontSize: 10, marginBottom: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 10, fontWeight: '600' },
});
