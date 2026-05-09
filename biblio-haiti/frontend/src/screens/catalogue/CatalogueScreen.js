import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Données factices pour la démo
const categories = [
  { id: '1', name: 'Roman', icon: '📖' },
  { id: '2', name: 'Poesie', icon: '✒️' },
  { id: '3', name: 'Education', icon: '📚' },
  { id: '4', name: 'Histoire', icon: '🏛️' },
  { id: '5', name: 'Science', icon: '🔬' },
  { id: '6', name: 'Religion', icon: '🙏' },
];

const featuredBooks = [
  {
    id: '1',
    title: 'Le Gouverneur de la rosée',
    author: 'Jacques Roumain',
    language: 'Français',
    rating: 4.8,
    isFree: true,
    coverColor: '#FF6B6B',
  },
  {
    id: '2',
    title: 'Compère General Soleil',
    author: 'Jacques Stephen Alexis',
    language: 'Français',
    rating: 4.6,
    isFree: false,
    points: 150,
    coverColor: '#4ECDC4',
  },
  {
    id: '3',
    title: 'Ravine aux Calebasses',
    author: 'Depestre',
    language: 'Kreyòl',
    rating: 4.9,
    isFree: true,
    coverColor: '#45B7D1',
  },
];

const trendingBooks = [
  {
    id: '4',
    title: 'Marie-Chauve',
    author: 'Félix Morisseau-Leroy',
    language: 'Kreyòl',
    rating: 4.7,
    isFree: false,
    points: 100,
    coverColor: '#96CEB4',
  },
  {
    id: '5',
    title: 'Théâtre haïtien',
    author: 'Collectif',
    language: 'Français',
    rating: 4.5,
    isFree: true,
    coverColor: '#FFEAA7',
  },
];

export default function CatalogueScreen({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // all, free, points
  
  const isGuest = route?.params?.isGuest || false;

  const renderBookCard = (book) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => navigation.push('BookDetail', { book })}
      activeOpacity={0.8}
    >
      <View style={[styles.bookCover, { backgroundColor: book.coverColor }]}>
        <Text style={styles.bookCoverPlaceholder}>📕</Text>
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>
        <View style={styles.bookMeta}>
          <Text style={styles.bookLanguage}>{book.language}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>{book.rating}</Text>
          </View>
        </View>
        <View style={styles.accessBadge}>
          {book.isFree ? (
            <Text style={styles.freeBadge}>Gratuit</Text>
          ) : (
            <Text style={styles.pointsBadge}>{book.points} pts</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#00209F', '#0040FF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>
              {isGuest ? 'Mode Invité' : 'Bonjou!'}
            </Text>
            <Text style={styles.greetingText}>
              Découvrez des livres incroyables
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.push('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un livre, un auteur..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'all' && styles.activeFilter]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
              Tous
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'free' && styles.activeFilter]}
            onPress={() => setActiveFilter('free')}
          >
            <Text style={[styles.filterText, activeFilter === 'free' && styles.activeFilterText]}>
              Gratuits
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'points' && styles.activeFilter]}
            onPress={() => setActiveFilter('points')}
          >
            <Text style={[styles.filterText, activeFilter === 'points' && styles.activeFilterText]}>
              Points
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Catégories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.selectedCategory,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Books */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Livres en vedette</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {featuredBooks.map(renderBookCard)}
        </View>

        {/* Trending in Haiti */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tendances en Haïti 🔥</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {trendingBooks.map(renderBookCard)}
        </View>

        {/* Recommended Based on History */}
        {!isGuest && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommandé pour vous</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recommendationBanner}>
              <Text style={styles.recommendationText}>
                Basé sur vos lectures précédentes
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Catalogue')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navText}>Recherche</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Library')}>
          <Text style={styles.navIcon}>📚</Text>
          <Text style={styles.navText}>Biblio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Points')}>
          <Text style={styles.navIcon}>⭐</Text>
          <Text style={styles.navText}>Points</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 5,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#00209F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchIcon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilter: {
    backgroundColor: '#00209F',
    borderColor: '#00209F',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#00209F',
    fontWeight: '600',
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginLeft: 20,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategory: {
    borderColor: '#00209F',
    backgroundColor: '#f0f4ff',
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookCoverPlaceholder: {
    fontSize: 40,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookLanguage: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 14,
    marginRight: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  accessBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  freeBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00A86B',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF8C00',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendationBanner: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
  },
  recommendationText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#666',
  },
});
