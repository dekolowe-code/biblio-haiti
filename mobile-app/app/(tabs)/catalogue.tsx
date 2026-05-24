import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, FlatList, Text, Modal, TouchableOpacity, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { BRAND, GRADIENT_NAV } from '@/constants/Colors';
import { BookCard } from '@/components/books/BookCard';
import { CategoryPill } from '@/components/books/CategoryPill';
import { SearchBar } from '@/components/books/SearchBar';
import { Spinner } from '@/components/ui/Spinner';
import { BookCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { getPaginatedBooks } from '@/lib/bookService';
import { Book } from '@/types';
import { categories } from '@/data/mockCategories';

export default function CatalogueScreen() {
  const { colors } = useTheme();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadBooks = useCallback(async (pageNum: number, q: string, cat: string | null, append = false) => {
    if (pageNum === 0) setLoading(true); else setLoadingMore(true);
    const result = await getPaginatedBooks(pageNum, { search: q || undefined, category: cat || undefined });
    if (append) setBooks(prev => [...prev, ...result.data]);
    else setBooks(result.data);
    setHasMore(result.hasMore);
    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(0);
      loadBooks(0, search, selectedCategory);
    }, 350);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [search, selectedCategory, loadBooks]);

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadBooks(nextPage, search, selectedCategory, true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.offWhite }} edges={['top']}>
      <LinearGradient
        colors={GRADIENT_NAV}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <Text style={styles.title}>Catalogue</Text>
      </LinearGradient>
      <View style={[styles.headerWrap]}>
        <Text style={{ display: 'none' }} />
        <View style={{ paddingHorizontal: 16 }}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onFilterPress={() => setShowFilter(true)}
          />
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: 'Tous', color: BRAND.crimson }, ...categories]}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CategoryPill
              label={item.name}
              selected={selectedCategory === item.name || (selectedCategory === null && item.name === 'Tous')}
              onPress={() => setSelectedCategory(item.name === 'Tous' ? null : item.name)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        />
      </View>

      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={i => String(i)}
          numColumns={2}
          renderItem={() => <View style={{ flex: 1, margin: 8 }}><BookCardSkeleton /></View>}
          contentContainerStyle={{ padding: 8 }}
        />
      ) : books.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📚</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun résultat</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Essayez une autre recherche ou catégorie
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={b => b.id}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={{ flex: 1, margin: 6 }}>
              <BookCard book={item} variant="grid" />
            </View>
          )}
          contentContainerStyle={{ padding: 10 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={loadingMore ? <Spinner size="small" /> : null}
        />
      )}

      <Modal visible={showFilter} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowFilter(false)} activeOpacity={1}>
          <View style={[styles.filterSheet, { backgroundColor: colors.card }]}>
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Filtres</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <X size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Catégorie</Text>
            <View style={styles.filterPills}>
              {[{ id: 'all', name: 'Toutes' }, ...categories].map(cat => (
                <CategoryPill
                  key={cat.id}
                  label={cat.name}
                  selected={selectedCategory === cat.name || (selectedCategory === null && cat.name === 'Toutes')}
                  onPress={() => {
                    setSelectedCategory(cat.name === 'Toutes' ? null : cat.name);
                    setShowFilter(false);
                  }}
                />
              ))}
            </View>
            <Button title="Réinitialiser les filtres" onPress={() => { setSelectedCategory(null); setShowFilter(false); }} variant="ghost" />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerGradient: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  headerWrap: { paddingTop: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  filterSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filterTitle: { fontSize: 18, fontWeight: '700' },
  filterLabel: { fontSize: 13, fontWeight: '500', marginBottom: 10 },
  filterPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
});
