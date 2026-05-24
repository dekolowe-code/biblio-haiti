import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus, Trash2, Edit3, BookOpen, Users, BarChart2,
  ArrowLeft, X, Check, Upload, ChevronRight, AlertTriangle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getAllBooks } from '@/lib/bookService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { categories, styles as bookStyles } from '@/data/mockCategories';
import { Book } from '@/types';

type DashboardTab = 'books' | 'stats';

interface Stats {
  totalBooks: number;
  totalUsers: number;
  totalLibraryEntries: number;
  totalQuizzes: number;
}

interface BookForm {
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  category: string;
  country: string;
  style: string;
  type: 'text' | 'pdf' | 'epub';
  pdfUrl: string;
  epubUrl: string;
  pages: string;
  isPremium: boolean;
}

const EMPTY_FORM: BookForm = {
  title: '',
  author: '',
  description: '',
  coverUrl: '',
  category: 'Littérature',
  country: 'Haïti',
  style: 'Fiction',
  type: 'text',
  pdfUrl: '',
  epubUrl: '',
  pages: '',
  isPremium: false,
};

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [tab, setTab] = useState<DashboardTab>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<BookForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <AlertTriangle size={48} color={colors.error} strokeWidth={1.5} />
        <Text style={[styles.emptyTitle, { color: colors.text, marginTop: 16 }]}>Accès refusé</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Vous devez être administrateur pour accéder à ce tableau de bord.
        </Text>
        <Button title="Retour" onPress={() => router.back()} style={{ marginTop: 24 }} />
      </SafeAreaView>
    );
  }

  const loadData = useCallback(async () => {
    const [allBooks, usersRes, libRes, quizRes] = await Promise.all([
      getAllBooks(),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('user_library').select('id', { count: 'exact', head: true }),
      supabase.from('quizzes').select('id', { count: 'exact', head: true }),
    ]);
    setBooks(allBooks);
    setStats({
      totalBooks: allBooks.length,
      totalUsers: usersRes.count ?? 0,
      totalLibraryEntries: libRes.count ?? 0,
      totalQuizzes: quizRes.count ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingBook(null);
    setShowAddModal(true);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      description: book.description,
      coverUrl: book.coverUrl,
      category: book.category,
      country: book.country,
      style: book.style,
      type: book.type,
      pdfUrl: book.pdfUrl ?? '',
      epubUrl: book.epubUrl ?? '',
      pages: String(book.pages ?? ''),
      isPremium: book.isPremium,
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.author.trim()) {
      Alert.alert('Champs requis', 'Le titre et l\'auteur sont obligatoires.');
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      description: form.description.trim(),
      cover_url: form.coverUrl.trim(),
      category: form.category,
      country: form.country,
      style: form.style,
      type: form.type,
      pdf_url: form.pdfUrl.trim() || null,
      epub_url: form.epubUrl.trim() || null,
      pages: parseInt(form.pages) || 0,
      is_premium: form.isPremium,
      unlock_cost: 0,
      rating: 0,
      total_ratings: 0,
      content: [],
    };

    let error = null;
    if (editingBook && !editingBook.id.match(/^\d+$/)) {
      const res = await supabase.from('books').update(payload).eq('id', editingBook.id);
      error = res.error;
    } else {
      const res = await supabase.from('books').insert(payload);
      error = res.error;
    }

    setSaving(false);
    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAddModal(false);
      loadData();
    }
  };

  const handleDelete = (book: Book) => {
    if (book.id.match(/^\d+$/)) {
      Alert.alert('Impossible', 'Ce livre est une donnée de démonstration et ne peut pas être supprimé.');
      return;
    }
    Alert.alert(
      'Supprimer le livre',
      `Voulez-vous vraiment supprimer "${book.title}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive', onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            const { error } = await supabase.from('books').delete().eq('id', book.id);
            if (error) Alert.alert('Erreur', error.message);
            else loadData();
          },
        },
      ]
    );
  };

  const filteredBooks = books.filter(b =>
    !search || b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const STAT_CARDS = [
    { label: 'Livres', value: stats?.totalBooks ?? 0, icon: '📚', color: colors.primary },
    { label: 'Utilisateurs', value: stats?.totalUsers ?? 0, icon: '👥', color: '#10b981' },
    { label: 'Lectures', value: stats?.totalLibraryEntries ?? 0, icon: '📖', color: '#f59e0b' },
    { label: 'Quiz', value: stats?.totalQuizzes ?? 0, icon: '🧠', color: '#8b5cf6' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Tableau de bord</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Administration</Text>
        </View>
        <TouchableOpacity
          onPress={openAdd}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {([
          { key: 'books', label: '📚 Livres' },
          { key: 'stats', label: '📊 Statistiques' },
        ] as { key: DashboardTab; label: string }[]).map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[
              styles.tabItem,
              tab === t.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
          >
            <Text style={[styles.tabLabel, { color: tab === t.key ? colors.primary : colors.textSecondary }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Spinner fullScreen />
      ) : tab === 'stats' ? (
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vue d'ensemble</Text>
          <View style={styles.statsGrid}>
            {STAT_CARDS.map(card => (
              <View key={card.label} style={[styles.statCard, { backgroundColor: card.color + '15', borderColor: card.color + '30' }]}>
                <Text style={{ fontSize: 32, marginBottom: 6 }}>{card.icon}</Text>
                <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{card.label}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
            Répartition par catégorie
          </Text>
          {categories.map(cat => {
            const count = books.filter(b => b.category === cat.name).length;
            const pct = books.length > 0 ? (count / books.length) * 100 : 0;
            return (
              <View key={cat.id} style={[styles.catRow, { backgroundColor: colors.surface }]}>
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
                <View style={[styles.catBarTrack, { backgroundColor: colors.border }]}>
                  <View style={[styles.catBar, { width: `${pct}%`, backgroundColor: cat.color }]} />
                </View>
                <Text style={[styles.catCount, { color: colors.textSecondary }]}>{count}</Text>
              </View>
            );
          })}

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
            Types de livres
          </Text>
          {(['text', 'pdf', 'epub'] as const).map(type => {
            const count = books.filter(b => b.type === type).length;
            const typeLabel = type === 'text' ? '📝 Texte' : type === 'pdf' ? '📄 PDF' : '📗 EPUB';
            return (
              <View key={type} style={[styles.typeRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.typeLabel, { color: colors.text }]}>{typeLabel}</Text>
                <Text style={[styles.typeCount, { color: colors.primary }]}>{count} livre{count > 1 ? 's' : ''}</Text>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <>
          <View style={styles.searchWrap}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher un livre..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            />
          </View>
          <FlatList
            data={filteredBooks}
            keyExtractor={b => b.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 48 }}>📭</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun livre trouvé</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Ajoutez un livre avec le bouton +
                </Text>
              </View>
            }
            renderItem={({ item: book }) => (
              <View style={[styles.bookRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.bookInfo}>
                  <View style={styles.bookTitleRow}>
                    <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
                      {book.title}
                    </Text>
                    {book.isPremium && (
                      <Badge label="Premium" color="#f59e0b" size="sm" />
                    )}
                  </View>
                  <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                    {book.author}
                  </Text>
                  <View style={styles.bookMeta}>
                    <Badge label={book.category} size="sm" />
                    <Badge label={book.type.toUpperCase()} color={colors.primary} size="sm" />
                    {book.id.match(/^\d+$/) && (
                      <Badge label="Démo" color={colors.textSecondary} size="sm" />
                    )}
                  </View>
                </View>
                <View style={styles.bookActions}>
                  <TouchableOpacity
                    onPress={() => openEdit(book)}
                    style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}
                  >
                    <Edit3 size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(book)}
                    style={[styles.actionBtn, { backgroundColor: colors.error + '15' }]}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </>
      )}

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalCloseBtn}>
              <X size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingBook ? 'Modifier le livre' : 'Ajouter un livre'}
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
            >
              {saving ? (
                <Spinner size="small" />
              ) : (
                <Check size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={[styles.formSection, { color: colors.textSecondary }]}>INFORMATIONS GÉNÉRALES</Text>

            <Input
              label="Titre *"
              placeholder="Titre du livre"
              value={form.title}
              onChangeText={v => setForm(f => ({ ...f, title: v }))}
            />
            <Input
              label="Auteur *"
              placeholder="Nom de l'auteur"
              value={form.author}
              onChangeText={v => setForm(f => ({ ...f, author: v }))}
            />
            <Input
              label="Description"
              placeholder="Synopsis du livre..."
              value={form.description}
              onChangeText={v => setForm(f => ({ ...f, description: v }))}
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' } as never}
            />
            <Input
              label="URL de la couverture"
              placeholder="https://..."
              value={form.coverUrl}
              onChangeText={v => setForm(f => ({ ...f, coverUrl: v }))}
              keyboardType="url"
              autoCapitalize="none"
            />

            <Text style={[styles.formSection, { color: colors.textSecondary }]}>CATÉGORISATION</Text>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>Catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setForm(f => ({ ...f, category: cat.name }))}
                  style={[
                    styles.selectPill,
                    {
                      backgroundColor: form.category === cat.name ? cat.color : colors.surface,
                      borderColor: form.category === cat.name ? cat.color : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.selectPillText, { color: form.category === cat.name ? '#fff' : colors.text }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {bookStyles.map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setForm(f => ({ ...f, style: s }))}
                  style={[
                    styles.selectPill,
                    {
                      backgroundColor: form.style === s ? colors.primary : colors.surface,
                      borderColor: form.style === s ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.selectPillText, { color: form.style === s ? '#fff' : colors.text }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Input
              label="Pays"
              placeholder="Haïti"
              value={form.country}
              onChangeText={v => setForm(f => ({ ...f, country: v }))}
            />
            <Input
              label="Nombre de pages"
              placeholder="120"
              keyboardType="numeric"
              value={form.pages}
              onChangeText={v => setForm(f => ({ ...f, pages: v }))}
            />

            <Text style={[styles.formSection, { color: colors.textSecondary }]}>FORMAT & FICHIERS</Text>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>Type de fichier</Text>
            <View style={styles.typeButtons}>
              {(['text', 'pdf', 'epub'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setForm(f => ({ ...f, type: t }))}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor: form.type === t ? colors.primary : colors.surface,
                      borderColor: form.type === t ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.typeBtnText, { color: form.type === t ? '#fff' : colors.text }]}>
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {form.type === 'pdf' && (
              <Input
                label="URL du fichier PDF"
                placeholder="https://..."
                value={form.pdfUrl}
                onChangeText={v => setForm(f => ({ ...f, pdfUrl: v }))}
                keyboardType="url"
                autoCapitalize="none"
              />
            )}
            {form.type === 'epub' && (
              <Input
                label="URL du fichier EPUB"
                placeholder="https://..."
                value={form.epubUrl}
                onChangeText={v => setForm(f => ({ ...f, epubUrl: v }))}
                keyboardType="url"
                autoCapitalize="none"
              />
            )}

            <Text style={[styles.formSection, { color: colors.textSecondary }]}>OPTIONS</Text>

            <TouchableOpacity
              onPress={() => setForm(f => ({ ...f, isPremium: !f.isPremium }))}
              style={[styles.toggleRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>Livre premium</Text>
                <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                  Nécessite des étoiles pour être déverrouillé
                </Text>
              </View>
              <View style={[
                styles.toggleKnob,
                { backgroundColor: form.isPremium ? colors.primary : colors.border },
              ]}>
                <View style={[
                  styles.toggleCircle,
                  { transform: [{ translateX: form.isPremium ? 18 : 0 }] },
                ]} />
              </View>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 1 },
  addBtn: { marginLeft: 'auto', padding: 10, borderRadius: 12 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabLabel: { fontSize: 14, fontWeight: '600' },
  searchWrap: { paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: {
    borderRadius: 10, borderWidth: 1.5,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
  },
  bookRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 1,
    padding: 12, marginBottom: 8, gap: 10,
  },
  bookInfo: { flex: 1 },
  bookTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  bookTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  bookAuthor: { fontSize: 12, marginBottom: 6 },
  bookMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  bookActions: { gap: 6 },
  actionBtn: { padding: 8, borderRadius: 8 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%', alignItems: 'center', padding: 18,
    borderRadius: 16, borderWidth: 1,
  },
  statValue: { fontSize: 32, fontWeight: '800' },
  statLabel: { fontSize: 13, marginTop: 4 },
  catRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, padding: 12, borderRadius: 10, marginBottom: 8,
  },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { fontSize: 13, fontWeight: '500', width: 90 },
  catBarTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  catBar: { height: 6, borderRadius: 3 },
  catCount: { fontSize: 12, width: 24, textAlign: 'right' },
  typeRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 14, borderRadius: 10,
    borderWidth: 1, marginBottom: 8,
  },
  typeLabel: { fontSize: 14, fontWeight: '500' },
  typeCount: { fontSize: 14, fontWeight: '600' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, gap: 12,
  },
  modalCloseBtn: { padding: 4 },
  modalTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  modalSaveBtn: { padding: 10, borderRadius: 10 },
  modalContent: { padding: 16 },
  formSection: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.5,
    marginBottom: 12, marginTop: 8,
  },
  fieldLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  selectPill: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, marginRight: 8,
  },
  selectPillText: { fontSize: 13, fontWeight: '500' },
  typeButtons: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: {
    flex: 1, alignItems: 'center',
    paddingVertical: 10, borderRadius: 10, borderWidth: 1.5,
  },
  typeBtnText: { fontSize: 13, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12,
  },
  toggleLabel: { fontSize: 14, fontWeight: '500' },
  toggleDesc: { fontSize: 12, marginTop: 2 },
  toggleKnob: {
    width: 44, height: 26, borderRadius: 13,
    justifyContent: 'center', paddingHorizontal: 3,
  },
  toggleCircle: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff',
  },
});
