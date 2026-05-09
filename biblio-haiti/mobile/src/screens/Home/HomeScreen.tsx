import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, BOOK_CATEGORIES } from '../../constants';
import apiService from '../../services/api';

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  category: string;
  rating: number;
  is_free: boolean;
  stars_required?: number;
}

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState(BOOK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch featured books and recent books from API
      // For now, we'll use mock data
      const mockBooks: Book[] = [
        {
          id: '1',
          title: 'Compère General Soleil',
          author: 'Jacques Stephen Alexis',
          cover_url: '',
          category: 'Roman',
          rating: 4.5,
          is_free: false,
          stars_required: 50,
        },
        {
          id: '2',
          title: 'Gouverneurs de la Rosée',
          author: 'Jacques Roumain',
          cover_url: '',
          category: 'Roman',
          rating: 4.8,
          is_free: true,
        },
        {
          id: '3',
          title: 'Rue des Pas-Perdus',
          author: 'René Depestre',
          cover_url: '',
          category: 'Poésie',
          rating: 4.3,
          is_free: false,
          stars_required: 30,
        },
      ];
      
      setBooks(mockBooks);
      setFeaturedBooks(mockBooks.slice(0, 2));
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery });
    }
  };

  const renderBookCard = (book: Book) => (
    <TouchableOpacity
      key={book.id}
      style={styles.bookCard}
      onPress={() => navigation.navigate('BookDetail', { bookId: book.id })}
    >
      <View style={styles.bookCover}>
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} style={styles.coverImage} />
        ) : (
          <View style={[styles.placeholderCover, { backgroundColor: COLORS.primary }]}>
            <Icon name="book-open" size={40} color={COLORS.white} />
          </View>
        )}
        {!book.is_free && (
          <View style={styles.starsBadge}>
            <Icon name="star" size={12} color={COLORS.star} />
            <Text variant="labelSmall" style={styles.starsText}>
              {book.stars_required}
            </Text>
          </View>
        )}
      </View>
      <Text variant="titleSmall" numberOfLines={2} style={styles.bookTitle}>
        {book.title}
      </Text>
      <Text variant="bodySmall" numberOfLines={1} style={styles.bookAuthor}>
        {book.author}
      </Text>
      <View style={styles.bookMeta}>
        <View style={styles.rating}>
          <Icon name="star" size={14} color={COLORS.star} />
          <Text variant="labelSmall" style={styles.ratingText}>{book.rating}</Text>
        </View>
        <Chip mode="outlined" compact textStyle={styles.categoryChip}>
          {book.category}
        </Chip>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Rechercher un livre, un auteur..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Catégories
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              <Chip
                selected={!selectedCategory}
                onPress={() => setSelectedCategory(null)}
                style={[styles.categoryChip, !selectedCategory && styles.selectedCategory]}
              >
                Tous
              </Chip>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  selected={selectedCategory === category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[styles.categoryChip, selectedCategory === category.id && styles.selectedCategory]}
                  avatar={<Icon name={category.icon} size={18} />}
                >
                  {category.name}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Featured Books */}
        {featuredBooks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                À la une
              </Text>
              <TouchableOpacity>
                <Text variant="bodySmall" style={styles.seeAll}>
                  Voir tout
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={featuredBooks}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.featuredCard}
                  onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
                >
                  <View style={[styles.featuredCover, { backgroundColor: COLORS.primary }]}>
                    <Icon name="book-open" size={60} color={COLORS.white} />
                  </View>
                  <View style={styles.featuredContent}>
                    <Text variant="titleMedium" numberOfLines={2} style={styles.featuredTitle}>
                      {item.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.featuredAuthor}>
                      {item.author}
                    </Text>
                    <View style={styles.featuredMeta}>
                      <View style={styles.rating}>
                        <Icon name="star" size={16} color={COLORS.star} />
                        <Text variant="bodySmall">{item.rating}</Text>
                      </View>
                      {item.is_free ? (
                        <Chip mode="flat" compact style={styles.freeChip}>
                          Gratuit
                        </Chip>
                      ) : (
                        <View style={styles.starsRequired}>
                          <Icon name="star" size={14} color={COLORS.star} />
                          <Text variant="bodySmall">{item.stars_required} étoiles</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}

        {/* Recent Books */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Récemment ajoutés
            </Text>
            <TouchableOpacity>
              <Text variant="bodySmall" style={styles.seeAll}>
                Voir tout
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.booksGrid}>
            {books.map(renderBookCard)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Quiz', { bookId: 'featured' })}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.warning }]}>
                <Icon name="trophy" size={24} color={COLORS.white} />
              </View>
              <Text variant="bodySmall" style={styles.quickActionText}>
                Gagner des étoiles
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Library')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.info }]}>
                <Icon name="bookshelf" size={24} color={COLORS.white} />
              </View>
              <Text variant="bodySmall" style={styles.quickActionText}>
                Ma bibliothèque
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.success }]}>
                <Icon name="account" size={24} color={COLORS.white} />
              </View>
              <Text variant="bodySmall" style={styles.quickActionText}>
                Mon profil
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
  },
  searchbar: {
    elevation: 2,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAll: {
    color: COLORS.primary,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  bookCover: {
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  placeholderCover: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  starsBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  bookTitle: {
    marginTop: 8,
    fontWeight: 'bold',
    height: 40,
  },
  bookAuthor: {
    color: COLORS.textLight,
    marginTop: 4,
  },
  bookMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontWeight: 'bold',
  },
  featuredCard: {
    width: 280,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  featuredCover: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    padding: 12,
  },
  featuredTitle: {
    fontWeight: 'bold',
  },
  featuredAuthor: {
    color: COLORS.textLight,
    marginTop: 4,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  freeChip: {
    backgroundColor: COLORS.success,
  },
  starsRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    width: '30%',
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    textAlign: 'center',
  },
});
