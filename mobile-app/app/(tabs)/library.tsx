import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { BRAND, GRADIENT_NAV } from '@/constants/Colors';
import { useLibrary } from '@/context/LibraryContext';
import { useAuth } from '@/context/AuthContext';
import { BookCard } from '@/components/books/BookCard';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { getAllBooks } from '@/lib/bookService';
import { Book } from '@/types';

type Tab = 'reading' | 'completed' | 'saved';

export default function LibraryScreen() {
  const { colors } = useTheme();
  const { library, loading, refresh } = useLibrary();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('reading');

  useEffect(() => {
    getAllBooks().then(setBooks);
    refresh();
  }, []);

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={styles.centered}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📚</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Ma Bibliothèque</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Connectez-vous pour accéder à votre bibliothèque personnelle
          </Text>
          <Button title="Se connecter" onPress={() => router.push('/(auth)/login' as never)} style={{ marginTop: 20 }} />
        </View>
      </SafeAreaView>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'reading', label: 'En cours' },
    { key: 'completed', label: 'Terminés' },
    { key: 'saved', label: 'Sauvegardés' },
  ];

  const filteredLibrary = library.filter(entry => {
    if (activeTab === 'reading') return !entry.isFinished && entry.currentPage > 0;
    if (activeTab === 'completed') return entry.isFinished;
    if (activeTab === 'saved') return entry.isFavorite;
    return false;
  });

  const filteredBooks = filteredLibrary
    .map(entry => books.find(b => b.id === entry.bookId))
    .filter(Boolean) as Book[];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.offWhite }} edges={['top']}>
      <LinearGradient
        colors={GRADIENT_NAV}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <Text style={styles.title}>Ma Bibliothèque</Text>
      </LinearGradient>
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[
              styles.tab,
              activeTab === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
          >
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab.key ? colors.primary : colors.textSecondary },
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Spinner fullScreen />
      ) : filteredBooks.length === 0 ? (
        <View style={styles.centered}>
          <BookOpen size={48} color={colors.textSecondary} strokeWidth={1} />
          <Text style={[styles.emptyTitle, { color: colors.text, marginTop: 16 }]}>
            {activeTab === 'reading' ? 'Aucun livre en cours' :
             activeTab === 'completed' ? 'Aucun livre terminé' : 'Aucun livre sauvegardé'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Explorez le catalogue pour commencer à lire
          </Text>
          <Button
            title="Explorer le catalogue"
            onPress={() => router.push('/(tabs)/catalogue' as never)}
            style={{ marginTop: 20 }}
          />
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={b => b.id}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 16 }}>
              <BookCard book={item} variant="compact" showProgress={activeTab === 'reading'} />
            </View>
          )}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerGradient: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabLabel: { fontSize: 14, fontWeight: '600' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
});
