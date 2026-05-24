import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Alert, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Share2, Download, Play, BookOpen, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useLibrary } from '@/context/LibraryContext';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { getBookById, resolveBookCover } from '@/lib/bookService';
import { downloadBook, getLocalBookPath } from '@/lib/downloadService';
import { categoryColors, BRAND } from '@/constants/Colors';
import { Book } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { isFavorite, toggleBookFavorite, isUnlocked, getProgress } = useLibrary();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (!id) return;
    getBookById(id).then(async b => {
      setBook(b);
      setLoading(false);
      if (b) {
        const normalizedType = (b.type ?? 'text').toLowerCase() as 'text' | 'pdf' | 'epub';
        const fileType = normalizedType === 'epub' ? 'epub' : normalizedType === 'pdf' ? 'pdf' : 'txt';
        const localPath = await getLocalBookPath(id, fileType);
        setDownloaded(!!localPath);
      }
    });
  }, [id]);

  if (loading) return <Spinner fullScreen />;
  if (!book) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, padding: 20 }}>Livre introuvable.</Text>
    </SafeAreaView>
  );

  const catColor = categoryColors[book.category];
  const progress = getProgress(book.id);
  const normalizedType = (book.type ?? 'text').toLowerCase() as 'text' | 'pdf' | 'epub';
  const fileType = normalizedType === 'epub' ? 'epub' : normalizedType === 'pdf' ? 'pdf' : 'txt';
  const fileUrl = normalizedType === 'pdf'
    ? book.pdfUrl ?? book.epubUrl ?? ''
    : normalizedType === 'epub'
      ? book.epubUrl ?? book.pdfUrl ?? ''
      : '';

  const handleFavorite = async () => {
    if (!user) { router.push('/(auth)/login' as never); return; }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleBookFavorite(book.id);
  };

  const handleRead = async () => {
    const local = await getLocalBookPath(book.id, fileType);
    if (local) {
      router.push(`/reader/${book.id}` as never);
      return;
    }

    if (!fileUrl) {
      Alert.alert('Indisponible', 'Ce livre n\'est pas disponible pour la lecture.');
      return;
    }

    if (fileType === 'epub') {
      setDownloading(true);
      try {
        await downloadBook(book.id, fileUrl, fileType, setDownloadProgress);
        setDownloaded(true);
        router.push(`/reader/${book.id}` as never);
        return;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Le téléchargement a échoué.';
        Alert.alert('Erreur', message);
        return;
      } finally {
        setDownloading(false);
      }
    }

    router.push(`/reader/${book.id}` as never);
  };

  const handleDownload = async () => {
    if (!fileUrl) { Alert.alert('Indisponible', 'Ce livre n\'est pas disponible au téléchargement.'); return; }
    setDownloading(true);
    try {
      const result = await downloadBook(book.id, fileUrl, fileType, setDownloadProgress);
      setDownloading(false);
      setDownloaded(true);
      Alert.alert('Téléchargé !', 'Le livre est disponible hors-ligne.');
    } catch (err) {
      setDownloading(false);
      const message = err instanceof Error ? err.message : 'Le téléchargement a échoué.';
      Alert.alert('Erreur', message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: SCREEN_HEIGHT * 0.55, position: 'relative' }}>
          <Image source={resolveBookCover(book.coverUrl)} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={[StyleSheet.absoluteFill, styles.heroOverlay]} />
          <SafeAreaView edges={['top']} style={styles.heroHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
              <ArrowLeft size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleFavorite} style={styles.headerBtn}>
                <Heart
                  size={22}
                  color={isFavorite(book.id) ? '#ef4444' : '#fff'}
                  fill={isFavorite(book.id) ? '#ef4444' : 'transparent'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn}>
                <Share2 size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.background }]}>
          <View style={styles.badgeRow}>
            <Badge label={book.category} color={catColor} />
            {book.type !== 'text' && (
              <Badge label={book.type.toUpperCase()} color={colors.primary} />
            )}
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
          <Text style={[styles.author, { color: colors.textSecondary }]}>par {book.author}</Text>

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                size={16}
                color={i <= Math.round(book.rating) ? '#f59e0b' : colors.border}
                fill={i <= Math.round(book.rating) ? '#f59e0b' : 'transparent'}
              />
            ))}
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {book.rating.toFixed(1)} ({book.totalRatings} avis)
            </Text>
          </View>

          <View style={styles.metaRow}>
            {[
              { label: 'Pages', value: String(book.pages || '—') },
              { label: 'Pays', value: book.country },
              { label: 'Style', value: book.style },
            ].map(meta => (
              <View key={meta.label} style={[styles.metaItem, { backgroundColor: colors.surface }]}>
                <Text style={[styles.metaValue, { color: colors.text }]}>{meta.value}</Text>
                <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{meta.label}</Text>
              </View>
            ))}
          </View>

          {progress > 0 && (
            <View style={[styles.progressSection, { backgroundColor: colors.surface }]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: colors.text }]}>Progression</Text>
                <Text style={[styles.progressPct, { color: colors.primary }]}>{progress}%</Text>
              </View>
              <ProgressBar progress={progress} />
            </View>
          )}

          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Synopsis</Text>
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={expanded ? undefined : 4}
            >
              {book.description}
            </Text>
            <TouchableOpacity onPress={() => setExpanded(e => !e)}>
              <Text style={[styles.expandLink, { color: colors.primary }]}>
                {expanded ? 'Voir moins' : 'Voir plus'}
              </Text>
            </TouchableOpacity>
          </View>

          {downloading && (
            <View style={{ marginTop: 12 }}>
              <Text style={[{ color: colors.textSecondary, marginBottom: 6, fontSize: 13 }]}>
                Téléchargement... {Math.round(downloadProgress * 100)}%
              </Text>
              <ProgressBar progress={downloadProgress * 100} color={colors.success} />
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      <View style={[styles.stickyBottom, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {!downloaded && fileUrl && (
          <TouchableOpacity
            onPress={handleDownload}
            disabled={downloading}
            style={[styles.downloadBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Download size={18} color={downloaded ? colors.success : colors.text} />
            <Text style={[styles.downloadBtnLabel, { color: colors.text }]}>
              {downloaded ? 'Disponible hors-ligne' : 'Télécharger'}
            </Text>
          </TouchableOpacity>
        )}
        <Button
          title={progress > 0 ? 'Continuer la lecture' : 'Lire maintenant'}
          onPress={handleRead}
          fullWidth
          size="lg"
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroOverlay: { background: 'transparent', backgroundColor: 'rgba(0,0,0,0.4)' },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  headerBtn: { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 24, padding: 8 },
  headerActions: { flexDirection: 'row', gap: 10 },
  detailCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, padding: 20 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  author: { fontSize: 15, marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  ratingText: { fontSize: 13, marginLeft: 4 },
  metaRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metaItem: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 10 },
  metaValue: { fontSize: 15, fontWeight: '700' },
  metaLabel: { fontSize: 11, marginTop: 2 },
  progressSection: { borderRadius: 12, padding: 14, marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, fontWeight: '600' },
  progressPct: { fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 22 },
  expandLink: { fontSize: 13, fontWeight: '600', marginTop: 6 },
  stickyBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 32,
    borderTopWidth: 1,
  },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1,
  },
  downloadBtnLabel: { fontSize: 13, fontWeight: '500' },
});
