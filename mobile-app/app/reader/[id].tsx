import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Modal,
  TouchableWithoutFeedback, Animated, Linking, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ArrowLeft, Settings, Minus, Plus } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useLibrary } from '@/context/LibraryContext';
import { useReadingStore } from '@/store/readingStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { MilestoneToast } from '@/components/ui/MilestoneToast';
import { getBookById } from '@/lib/bookService';
import { getLocalBookPath } from '@/lib/downloadService';
import { recordReadingSession, SessionResult, StreakMilestone } from '@/lib/streakService';
import * as FileSystem from 'expo-file-system';
import { Book } from '@/types';

const { width: W, height: H } = Dimensions.get('window');

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { updateProgress } = useLibrary();
  const { fontSize, fontFamily, lineHeight, theme: readerTheme, setFontSize, setReaderTheme } = useReadingStore();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localPath, setLocalPath] = useState<string | null>(null);
  const [webViewLoading, setWebViewLoading] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [milestone, setMilestone] = useState<StreakMilestone | null>(null);
  const [milestoneStars, setMilestoneStars] = useState(0);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionStart = useRef<number>(Date.now());
  const lastProgress = useRef<number>(0);

  useEffect(() => {
    if (!id) return;
    sessionStart.current = Date.now();
    getBookById(id).then(async b => {
      setBook(b);
      if (b) {
        const type = b.type === 'epub' ? 'epub' : 'pdf';
        const local = await getLocalBookPath(id, type);
        setLocalPath(local);
      }
      setLoading(false);
    });
    scheduleHide();

    // Enregistrer la session quand l'utilisateur quitte le lecteur
    return () => {
      const durationSec = Math.floor((Date.now() - sessionStart.current) / 1000);
      if (id && durationSec >= 30) {
        recordReadingSession(id, durationSec, Math.round(lastProgress.current)).then(result => {
          if (result?.milestone) {
            // La milestone sera affichée au prochain accès (l'écran est déjà unmounted)
          }
        });
      }
    };
  }, [id]);

  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => toggleControls(false), 3000);
  };

  const toggleControls = (force?: boolean) => {
    const next = force !== undefined ? force : !controlsVisible;
    setControlsVisible(next);
    Animated.timing(controlsOpacity, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    if (next) scheduleHide();
  };

  const handleProgressUpdate = (pct: number) => {
    setProgress(pct);
    lastProgress.current = pct;
    if (id) updateProgress(id, Math.round(pct), pct >= 99);

    // Enregistrement auto toutes les 5 minutes
    const elapsed = Math.floor((Date.now() - sessionStart.current) / 1000);
    if (elapsed > 0 && elapsed % 300 === 0) {
      recordReadingSession(id!, elapsed, Math.round(pct)).then(result => {
        if (result?.milestone) {
          setMilestone(result.milestone as StreakMilestone);
          setMilestoneStars(result.stars_bonus);
        }
      });
    }
  };

  const textPages = useMemo(() => {
    if (!book?.content?.length) return [];
    const pageSize = 4;
    const pages: string[][] = [];
    for (let i = 0; i < book.content.length; i += pageSize) {
      pages.push(book.content.slice(i, i + pageSize));
    }
    return pages;
  }, [book?.content]);

  const readerBg = readerTheme === 'night' ? '#0f172a' : readerTheme === 'sepia' ? '#f5e6c8' : '#ffffff';
  const readerText = readerTheme === 'night' ? '#e2e8f0' : '#111827';

  if (loading) return <Spinner fullScreen />;
  if (!book) return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.text }}>Livre introuvable.</Text>
    </View>
  );

  const normalizedType = (book.type ?? 'text').toLowerCase() as 'text' | 'pdf' | 'epub';
  const fileUrl = localPath ?? (normalizedType === 'pdf'
    ? book.pdfUrl ?? book.epubUrl
    : normalizedType === 'epub'
      ? book.epubUrl ?? book.pdfUrl
      : null) ?? null;

  const pageCount = textPages.length;

  const renderContent = () => {
    if (book.type === 'text' && pageCount > 0) {
      return (
        <View style={{ flex: 1, backgroundColor: readerBg }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1, backgroundColor: readerBg }}
            onTouchStart={() => toggleControls(true)}
            onMomentumScrollEnd={({ nativeEvent }) => {
              const page = Math.round(nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width);
              setActivePage(page);
              handleProgressUpdate(Math.min(100, Math.round(((page + 1) / pageCount) * 100)));
            }}
          >
            {textPages.map((page, pageIndex) => (
              <View key={pageIndex} style={{ width: W, padding: 24 }}>
                {page.map((paragraph, idx) => (
                  <Text
                    key={idx}
                    style={{
                      color: readerText,
                      fontSize,
                      lineHeight: fontSize * lineHeight,
                      marginBottom: 16,
                      fontFamily: fontFamily === 'mono' ? 'Courier New' : undefined,
                    }}
                  >
                    {paragraph}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>
          <View style={styles.pageIndicator}>
            <Text style={[styles.pageIndicatorText, { color: readerText }]}>Page {activePage + 1} / {pageCount}</Text>
          </View>
        </View>
      );
    }

    if (fileUrl && (book.type === 'epub' || book.type === 'pdf')) {
      const epubHtml = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; background: ${readerBg}; color: ${readerText}; 
         font-size: ${fontSize}px; font-family: ${fontFamily === 'mono' ? 'monospace' : fontFamily === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif'};
         line-height: ${lineHeight}; padding: 20px; }
  img { max-width: 100%; }
</style>
</head><body>
<p>Chargement du livre <strong>${book.title}</strong>...</p>
<p style="opacity:0.6;font-size:13px;">Format: ${book.type.toUpperCase()} — connectez-vous avec un lecteur EPUB/PDF natif pour une meilleure expérience.</p>
</body></html>`;

      const isHttp = fileUrl.startsWith('http');
      const isFile = fileUrl.startsWith('file://') || fileUrl.startsWith('/');

      if (book.type === 'pdf' && (isHttp || isFile)) {
        const webUrl = isFile
          ? fileUrl
          : `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}`;

        return (
          <View style={{ flex: 1 }}>
            <WebView
              source={{ uri: webUrl }}
              originWhitelist={["*"]}
              allowFileAccess={true}
              allowingReadAccessToURL={isFile ? fileUrl : undefined}
              style={{ flex: 1, backgroundColor: readerBg }}
              onTouchStart={() => toggleControls(true)}
              onLoadStart={() => setWebViewLoading(true)}
              onLoadEnd={() => setWebViewLoading(false)}
              startInLoadingState
              showsVerticalScrollIndicator={false}
            />
            {webViewLoading && (
              <View style={styles.loadingOverlay}>
                <Spinner />
              </View>
            )}
          </View>
        );
      }

      if (book.type === 'epub') {
        const openEpub = async () => {
          try {
            const localFile = fileUrl.startsWith('file://') ? fileUrl : `file://${fileUrl}`;
            const uri = Platform.OS === 'android'
              ? await FileSystem.getContentUriAsync(localFile)
              : localFile;
            await Linking.openURL(uri);
          } catch (error) {
            Alert.alert('Impossible d\'ouvrir le EPUB', 'Assurez-vous qu\'une application de lecture EPUB est installée.');
          }
        };

        if (isFile) {
          return (
            <View style={[styles.noContent, { backgroundColor: readerBg }]}> 
              <Text style={[styles.noContentText, { color: readerText, marginBottom: 12 }]}>Le fichier EPUB est téléchargé mais ne peut pas être affiché dans le visualiseur intégré.</Text>
              <TouchableOpacity
                onPress={openEpub}
                style={{ paddingHorizontal: 18, paddingVertical: 12, backgroundColor: '#007AFF', borderRadius: 10 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Ouvrir dans une autre application</Text>
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <View style={[styles.noContent, { backgroundColor: readerBg }]}> 
            <Text style={[styles.noContentText, { color: readerText, marginBottom: 12 }]}>Ce EPUB ne peut pas être affiché dans l'application. Vous pouvez l'ouvrir directement dans une autre application.</Text>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await Linking.openURL(fileUrl);
                } catch {
                  Alert.alert('Impossible d\'ouvrir', 'Aucune application de lecture EPUB détectée.');
                }
              }}
              style={{ paddingHorizontal: 18, paddingVertical: 12, backgroundColor: '#007AFF', borderRadius: 10 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Ouvrir dans une autre application</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }

    return (
      <View style={[styles.noContent, { backgroundColor: readerBg }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📖</Text>
        <Text style={[styles.noContentText, { color: readerText }]}>
          Ce livre n'a pas de fichier disponible pour la lecture en ligne.
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderContent()}

      <Animated.View style={[styles.topControls, { opacity: controlsOpacity }]} pointerEvents={controlsVisible ? 'auto' : 'none'}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.controlBtn}>
              <ArrowLeft size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.topTitle} numberOfLines={1}>{book.title}</Text>
            <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.controlBtn}>
              <Settings size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.View style={[styles.bottomControls, { opacity: controlsOpacity }]} pointerEvents={controlsVisible ? 'auto' : 'none'}>
        <ProgressBar progress={progress} showLabel />
      </Animated.View>

      {/* Toast milestone streak */}
      {milestone && (
        <MilestoneToast
          milestone={milestone}
          starsBonus={milestoneStars}
          onDismiss={() => setMilestone(null)}
        />
      )}

      <Modal visible={showSettings} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowSettings(false)} activeOpacity={1}>
          <View style={[styles.settingsSheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.settingsTitle, { color: colors.text }]}>Paramètres de lecture</Text>

            <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>Taille du texte</Text>
            <View style={styles.fontSizeRow}>
              <TouchableOpacity onPress={() => setFontSize(Math.max(12, fontSize - 2))} style={[styles.fsBtn, { backgroundColor: colors.surface }]}>
                <Minus size={16} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.fsValue, { color: colors.text }]}>{fontSize}px</Text>
              <TouchableOpacity onPress={() => setFontSize(Math.min(28, fontSize + 2))} style={[styles.fsBtn, { backgroundColor: colors.surface }]}>
                <Plus size={16} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>Thème</Text>
            <View style={styles.themeRow}>
              {(['day', 'sepia', 'night'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setReaderTheme(t)}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: t === 'night' ? '#0f172a' : t === 'sepia' ? '#f5e6c8' : '#ffffff',
                      borderColor: readerTheme === t ? colors.primary : colors.border,
                      borderWidth: readerTheme === t ? 2 : 1,
                    },
                  ]}
                >
                  <Text style={{ color: t === 'night' ? '#fff' : '#000', fontSize: 12 }}>
                    {t === 'day' ? 'Jour' : t === 'sepia' ? 'Sépia' : 'Nuit'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topControls: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10, gap: 12,
  },
  controlBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 8 },
  topTitle: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' },
  bottomControls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', padding: 20, paddingBottom: 36,
  },
  noContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  noContentText: { fontSize: 15, textAlign: 'center', lineHeight: 24 },
  pageIndicator: {
    position: 'absolute', bottom: 18, left: 0, right: 0,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  pageIndicatorText: { fontSize: 13, fontWeight: '600' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)',
  },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  settingsSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  settingsTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  settingLabel: { fontSize: 13, fontWeight: '500', marginBottom: 10 },
  fontSizeRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  fsBtn: { padding: 10, borderRadius: 10 },
  fsValue: { fontSize: 16, fontWeight: '600', minWidth: 50, textAlign: 'center' },
  themeRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  themeOption: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
});
