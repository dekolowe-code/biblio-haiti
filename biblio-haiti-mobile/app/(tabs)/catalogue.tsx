import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
import BookCard from '../../src/components/BookCard';
import { countries, categories, styles, type Book, books as mockBooks } from '../../src/data/mockData';
import { getPaginatedBooks } from '../../src/lib/bookService';

export default function CatalogueScreen() {
  const router = useRouter();
  const { category: initialCategory } = useLocalSearchParams<{ category?: string }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [accessFilter, setAccessFilter] = useState<string>('all');
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setPage(0);
    setBooks(mockBooks);
    setInitialLoading(true);
    const isPremium = accessFilter === 'all' ? undefined : accessFilter === 'premium';
    
    getPaginatedBooks(0, {
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      country: selectedCountry || undefined,
      style: selectedStyle || undefined,
      isPremium,
    }).then(result => {
      setBooks(_prev => {
        const serverBooks = result.data;
        if (!searchQuery && !selectedCategory && !selectedCountry && !selectedStyle && accessFilter === 'all') {
          return [...mockBooks, ...serverBooks];
        }
        return serverBooks;
      });
      setHasMore(result.hasMore);
      setTotal(result.total);
      setInitialLoading(false);
    });
  }, [searchQuery, selectedCategory, selectedCountry, selectedStyle, accessFilter]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const isPremium = accessFilter === 'all' ? undefined : accessFilter === 'premium';
    const result = await getPaginatedBooks(nextPage, {
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      country: selectedCountry || undefined,
      style: selectedStyle || undefined,
      isPremium,
    });
    setBooks(prev => [...prev, ...result.data]);
    setHasMore(result.hasMore);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const activeFilters = [
    selectedCountry && { label: selectedCountry, onRemove: () => setSelectedCountry('') },
    selectedCategory && { label: selectedCategory, onRemove: () => setSelectedCategory('') },
    selectedStyle && { label: selectedStyle, onRemove: () => setSelectedStyle('') },
    accessFilter !== 'all' && { label: accessFilter === 'free' ? 'Gratuit' : 'Premium', onRemove: () => setAccessFilter('all') },
  ].filter(Boolean) as { label: string; onRemove: () => void }[];

  return (
    <View className="flex-1 bg-background">
      {/* Search Bar */}
      <View className="bg-background px-4 py-3 border-b border-gray-100 z-10">
        <View className="flex-row gap-2">
          <View className="flex-1 relative justify-center">
            <View className="absolute left-3 z-10">
              <Search size={16} color="#6B7280" />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Rechercher un livre, auteur..."
              className="w-full h-10 pl-10 pr-8 bg-white border border-gray-200 rounded-xl text-sm font-inter text-[#1A1A2E]"
              placeholderTextColor="#6B7280"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} className="absolute right-3 z-10 p-1">
                <X size={16} color="#6B7280" />
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={() => setShowFilters(true)}
            className="w-10 h-10 bg-secondary rounded-xl items-center justify-center elevation-sm"
          >
            <SlidersHorizontal size={16} color="white" />
          </Pressable>
        </View>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2" contentContainerStyle={{ gap: 8 }}>
            {activeFilters.map((filter, i) => (
              <View key={i} className="flex-row items-center gap-1 bg-gray-200 rounded-full px-2.5 py-1">
                <Text className="text-xs font-inter text-[#1A1A2E]">{filter.label}</Text>
                <Pressable onPress={filter.onRemove}>
                  <X size={12} color="#6B7280" />
                </Pressable>
              </View>
            ))}
            <Pressable
              onPress={() => { setSelectedCountry(''); setSelectedCategory(''); setSelectedStyle(''); setAccessFilter('all'); }}
              className="justify-center px-2"
            >
              <Text className="text-xs text-secondary font-inter font-medium">Réinitialiser</Text>
            </Pressable>
          </ScrollView>
        )}
      </View>

      {/* Book Grid */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Text className="text-xs text-[#6B7280] font-inter mb-3">
            {total > 0 ? `${total} livre${total !== 1 ? 's' : ''}` : `${books.length} livre${books.length !== 1 ? 's' : ''}`}
          </Text>
          
          {initialLoading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#C41E3A" />
            </View>
          ) : (
            <>
              <View className="flex-row flex-wrap justify-between gap-y-4">
                {books.map(book => (
                  <View key={book.id} className="w-[31%]">
                    <BookCard book={book} compact />
                  </View>
                ))}
              </View>
              
              {books.length === 0 && (
                <View className="items-center justify-center py-16">
                  <Search size={48} color="#9ca3af" className="mb-3" />
                  <Text className="text-sm text-[#6B7280] font-inter">Aucun résultat trouvé</Text>
                  <Text className="text-xs text-[#6B7280] font-inter mt-1">Essayez d'autres filtres</Text>
                </View>
              )}
              
              {hasMore && (
                <View className="items-center mt-6 mb-8">
                  <Pressable
                    onPress={loadMore}
                    disabled={loadingMore}
                    className="flex-row items-center justify-center gap-2 px-6 py-2.5 bg-secondary rounded-xl elevation-sm w-[200px]"
                    style={{ opacity: loadingMore ? 0.6 : 1 }}
                  >
                    {loadingMore && <ActivityIndicator size="small" color="white" />}
                    <Text className="text-white text-sm font-poppins font-semibold">
                      {loadingMore ? 'Chargement...' : 'Charger plus'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/40 justify-end">
          <Pressable className="flex-1" onPress={() => setShowFilters(false)} />
          <View className="bg-white rounded-t-3xl max-h-[80%] pb-6">
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>
            <View className="flex-row items-center justify-between px-4 pb-3 border-b border-gray-100">
              <Text className="font-poppins font-semibold text-lg text-[#1A1A2E]">Filtres</Text>
              <View className="flex-row gap-4 items-center">
                <Pressable onPress={() => { setSelectedCountry(''); setSelectedCategory(''); setSelectedStyle(''); setAccessFilter('all'); }}>
                  <Text className="text-xs text-[#6B7280] font-inter">Réinitialiser</Text>
                </Pressable>
                <Pressable onPress={() => setShowFilters(false)}>
                  <Text className="text-sm text-secondary font-inter font-semibold">Appliquer</Text>
                </Pressable>
              </View>
            </View>

            <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
              {/* Country */}
              <View className="mb-4">
                <Text className="font-poppins font-semibold text-sm text-[#1A1A2E] mb-2">Pays</Text>
                <View className="flex-row flex-wrap gap-2">
                  {countries.map(c => (
                    <Pressable
                      key={c}
                      onPress={() => setSelectedCountry(selectedCountry === c ? '' : c)}
                      className={`px-3 py-1.5 rounded-full ${selectedCountry === c ? 'bg-secondary' : 'bg-gray-100'}`}
                    >
                      <Text className={`text-xs font-inter ${selectedCountry === c ? 'text-white' : 'text-[#1A1A2E]'}`}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Category */}
              <View className="mb-4">
                <Text className="font-poppins font-semibold text-sm text-[#1A1A2E] mb-2">Catégorie</Text>
                <View className="flex-row flex-wrap gap-2">
                  {categories.map(c => (
                    <Pressable
                      key={c.id}
                      onPress={() => setSelectedCategory(selectedCategory === c.name ? '' : c.name)}
                      className={`px-3 py-1.5 rounded-full ${selectedCategory === c.name ? 'bg-secondary' : 'bg-gray-100'}`}
                    >
                      <Text className={`text-xs font-inter ${selectedCategory === c.name ? 'text-white' : 'text-[#1A1A2E]'}`}>{c.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Style */}
              <View className="mb-4">
                <Text className="font-poppins font-semibold text-sm text-[#1A1A2E] mb-2">Style</Text>
                <View className="flex-row flex-wrap gap-2">
                  {styles.map(s => (
                    <Pressable
                      key={s}
                      onPress={() => setSelectedStyle(selectedStyle === s ? '' : s)}
                      className={`px-3 py-1.5 rounded-full ${selectedStyle === s ? 'bg-secondary' : 'bg-gray-100'}`}
                    >
                      <Text className={`text-xs font-inter ${selectedStyle === s ? 'text-white' : 'text-[#1A1A2E]'}`}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Access */}
              <View className="mb-6">
                <Text className="font-poppins font-semibold text-sm text-[#1A1A2E] mb-2">Accès</Text>
                <View className="flex-row gap-2">
                  {[
                    { value: 'all', label: 'Tous' },
                    { value: 'free', label: 'Gratuits' },
                    { value: 'premium', label: 'Premium' },
                  ].map(opt => (
                    <Pressable
                      key={opt.value}
                      onPress={() => setAccessFilter(opt.value)}
                      className={`flex-1 py-2 rounded-xl items-center ${accessFilter === opt.value ? 'bg-secondary' : 'bg-gray-100'}`}
                    >
                      <Text className={`text-xs font-inter font-medium ${accessFilter === opt.value ? 'text-white' : 'text-[#1A1A2E]'}`}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
