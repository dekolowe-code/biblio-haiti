import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { colors } from '../../theme/colors';

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  language: 'fr' | 'ht';
  isFree: boolean;
  points?: number;
  rating: number;
}

// Données fictives pour la démo
const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Compère General Soleil',
    author: 'Jacques Stephen Alexis',
    cover: '📕',
    language: 'fr',
    isFree: false,
    points: 500,
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Raboujman',
    author: 'Frankétienne',
    cover: '📘',
    language: 'ht',
    isFree: true,
    rating: 4.6,
  },
  {
    id: '3',
    title: 'Le Gouverneur de la Rosée',
    author: 'Jacques Roumain',
    cover: '📗',
    language: 'fr',
    isFree: false,
    points: 450,
    rating: 4.9,
  },
  {
    id: '4',
    title: 'Dézafi',
    author: 'Frankétienne',
    cover: '📙',
    language: 'ht',
    isFree: false,
    points: 400,
    rating: 4.7,
  },
  {
    id: '5',
    title: 'La Montagne ensorcelée',
    author: 'Jean Price-Mars',
    cover: '📕',
    language: 'fr',
    isFree: true,
    rating: 4.5,
  },
  {
    id: '6',
    title: 'Tout Moun Se Moun',
    author: 'Gary Victor',
    cover: '📘',
    language: 'ht',
    isFree: false,
    points: 350,
    rating: 4.4,
  },
];

const categories = ['Tous', 'Romans', 'Poésie', 'Histoire', 'Éducation', 'Religion'];
const languages = ['Toutes', 'Français', 'Kreyòl'];
const accessTypes = ['Tous', 'Gratuit', 'Points', 'Payant'];

export const CatalogueScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedLanguage, setSelectedLanguage] = useState('Toutes');
  const [selectedAccess, setSelectedAccess] = useState('Tous');
  const [showFilters, setShowFilters] = useState(false);

  const filteredBooks = mockBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous';
    const matchesLanguage = 
      selectedLanguage === 'Toutes' ||
      (selectedLanguage === 'Français' && book.language === 'fr') ||
      (selectedLanguage === 'Kreyòl' && book.language === 'ht');
    const matchesAccess = 
      selectedAccess === 'Tous' ||
      (selectedAccess === 'Gratuit' && book.isFree) ||
      (selectedAccess === 'Points' && !book.isFree && book.points !== undefined) ||
      (selectedAccess === 'Payant' && !book.isFree);
    
    return matchesSearch && matchesCategory && matchesLanguage && matchesAccess;
  });

  const renderBookCard = ({ item }: { item: Book }) => (
    <TouchableOpacity style={styles.bookCard} activeOpacity={0.7}>
      <View style={styles.bookCover}>
        <Text style={styles.coverEmoji}>{item.cover}</Text>
        {!item.isFree && (
          <View style={styles.accessBadge}>
            <Text style={styles.accessBadgeText}>
              {item.points ? `${item.points} pts` : '$'}
            </Text>
          </View>
        )}
        {item.isFree && (
          <View style={[styles.accessBadge, styles.freeBadge]}>
            <Text style={styles.freeBadgeText}>Gratuit</Text>
          </View>
        )}
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookAuthor}>{item.author}</Text>
        <View style={styles.bookMeta}>
          <Text style={styles.languageBadge}>
            {item.language === 'fr' ? '🇫🇷 FR' : '🇭🇹 HT'}
          </Text>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Biblio Haiti</Text>
          <Text style={styles.headerSubtitle}>Découvrez des livres incroyables</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsIcon}>🏆</Text>
          <Text style={styles.pointsValue}>0</Text>
        </View>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un livre, un auteur..."
          placeholderTextColor={colors.gray[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Langue</Text>
            <FlatList
              data={languages}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedLanguage === item && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedLanguage(item)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedLanguage === item && styles.filterChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Accès</Text>
            <FlatList
              data={accessTypes}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedAccess === item && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedAccess(item)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedAccess === item && styles.filterChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Catégorie</Text>
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedCategory === item && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedCategory === item && styles.filterChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      )}

      {/* Liste des livres */}
      <FlatList
        data={filteredBooks}
        renderItem={renderBookCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.booksList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyText}>Aucun livre trouvé</Text>
          </View>
        }
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📖</Text>
          <Text style={styles.navText}>Bibliothèque</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏆</Text>
          <Text style={styles.navText}>Points</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gold,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
  },
  filterButton: {
    width: 48,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 20,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  booksList: {
    padding: 16,
  },
  bookCard: {
    flex: 1,
    margin: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookCover: {
    height: 140,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coverEmoji: {
    fontSize: 64,
  },
  accessBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accessBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  freeBadge: {
    backgroundColor: colors.success,
  },
  freeBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageBadge: {
    fontSize: 11,
    color: colors.gray[600],
    backgroundColor: colors.gray[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rating: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: colors.gray[500],
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: colors.gray[600],
  },
});
