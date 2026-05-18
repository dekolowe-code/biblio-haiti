import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, Heart, ArrowLeft, Lock, BookOpen, Check } from 'lucide-react-native';
import { type Book, books as mockBooks } from '../../src/data/mockData';
import { useAuth } from '../../src/context/AuthContext';
import { useLibrary } from '../../src/context/LibraryContext';
import { getAllBooks } from '../../src/lib/bookService';

export default function BookDetailScreen() {
  const { id: bookId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const [book, setBook] = useState<Book | null>(mockBooks.find(b => b.id === bookId) || null);
  const [allBooks, setAllBooks] = useState<Book[]>(mockBooks);
  const [loading, setLoading] = useState(!book);

  useEffect(() => {
    getAllBooks().then(all => {
      setAllBooks(all);
      const found = all.find(b => b.id === bookId);
      setBook(found || null);
      setLoading(false);
    });
  }, [bookId]);

  const { isFavorite, isUnlocked: checkUnlocked, toggleFavorite, unlockBook } = useLibrary();
  const isUnlocked = checkUnlocked(bookId!) || !book?.isPremium;
  const favorite = isFavorite(bookId!);
  const stars = user?.starsBalance || 0;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background gap-3">
        <ActivityIndicator size="large" color="#C41E3A" />
        <Text className="text-sm text-[#6B7280] font-inter">Chargement du livre...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-[#6B7280] font-inter">Livre non trouvé</Text>
      </View>
    );
  }

  const handleUnlock = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (stars < book.unlockCost) {
      Alert.alert('Étoiles insuffisantes', 'Joue au quiz pour en gagner.');
      return;
    }
    const success = await unlockBook(book.id, book.unlockCost, book.title);
    if (success) {
      Alert.alert('DÉBLOQUÉ!', 'Tu peux maintenant lire ce livre');
    }
  };

  const handleFavorite = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    toggleFavorite(book.id);
  };

  const handleRead = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/livre/${book.id}/read`);
  };

  const relatedBooks = allBooks.filter(b => b.id !== book.id && (b.category === book.category || b.country === book.country)).slice(0, 5);

  return (
    <View className="flex-1 bg-background">
      {/* Back Button */}
      <View className="px-4 pt-12 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center elevation-sm"
        >
          <ArrowLeft size={20} color="#1A1A2E" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Book Cover */}
        <View className="items-center px-4 mt-2">
          <View className="w-[60%] max-w-[200px] relative">
            <Image
              source={{ uri: book.coverUrl }}
              className="w-full aspect-[3/4] rounded-2xl"
              style={{ opacity: isUnlocked ? 1 : 0.6 }}
            />
            {!isUnlocked && (
              <View className="absolute inset-0 items-center justify-center">
                <View className="bg-black/50 rounded-full p-3">
                  <Lock size={32} color="white" />
                </View>
              </View>
            )}
            {book.isPremium && (
              <View className="absolute top-2 right-2 bg-warning rounded-full px-2 py-1 flex-row items-center gap-1 elevation-sm">
                <Star size={12} color="white" fill="white" />
                <Text className="text-white font-poppins font-bold text-xs">{book.unlockCost}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Book Info */}
        <View className="px-4 mt-6 items-center">
          <Text className="font-poppins font-bold text-2xl text-[#1A1A2E] text-center">{book.title}</Text>
          <Text className="text-sm text-[#6B7280] font-inter mt-1">{book.author}</Text>
          <View className="flex-row items-center justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                size={16}
                color={i <= Math.round(book.rating) ? '#FAA307' : '#d1d5db'}
                fill={i <= Math.round(book.rating) ? '#FAA307' : 'transparent'}
              />
            ))}
            <Text className="text-sm font-poppins font-semibold text-[#1A1A2E] ml-1">{book.rating}</Text>
            <Text className="text-xs text-[#6B7280] font-inter">({book.totalRatings} avis)</Text>
          </View>
        </View>

        {/* Metadata Tags */}
        <View className="px-4 mt-4 flex-row flex-wrap justify-center gap-2">
          <View className="bg-blue-50 px-3 py-1 rounded-lg"><Text className="text-blue-700 text-xs font-inter">{book.country}</Text></View>
          <View className="bg-orange-50 px-3 py-1 rounded-lg"><Text className="text-orange-700 text-xs font-inter">{book.category}</Text></View>
          <View className="bg-gray-100 px-3 py-1 rounded-lg"><Text className="text-gray-700 text-xs font-inter">{book.style}</Text></View>
          <View className="bg-gray-100 px-3 py-1 rounded-lg"><Text className="text-gray-700 text-xs font-inter">{book.pages} pages</Text></View>
        </View>

        {/* Description */}
        <View className="px-4 mt-6">
          <Text className="text-sm text-[#1A1A2E] font-inter leading-relaxed">{book.description}</Text>
        </View>

        {/* Bottom Actions */}
        <View className="px-4 mt-8 space-y-3">
          {isUnlocked ? (
            <Pressable
              onPress={handleRead}
              className="w-full h-14 bg-[#2EC4B6] rounded-xl flex-row items-center justify-center gap-2 elevation-sm mb-3"
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <BookOpen size={20} color="white" />
              <Text className="font-poppins font-bold text-sm text-white">LIRE</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleUnlock}
              className={`w-full h-14 rounded-xl flex-row items-center justify-center gap-2 elevation-sm mb-3 ${stars >= book.unlockCost ? 'bg-warning' : 'bg-gray-300'}`}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              {stars >= book.unlockCost ? (
                <>
                  <Lock size={20} color="white" />
                  <Star size={16} color="white" fill="white" />
                  <Text className="font-poppins font-bold text-sm text-white">DÉBLOQUER ★ {book.unlockCost}</Text>
                </>
              ) : (
                <Text className="font-poppins font-bold text-sm text-white">★ INSUFFISANT</Text>
              )}
            </Pressable>
          )}

          {stars < book.unlockCost && !isUnlocked && (
            <Text className="text-center text-xs text-warning font-inter mb-3">
              Gagne plus d'étoiles en jouant aux quiz!
            </Text>
          )}

          <Pressable
            onPress={handleFavorite}
            className={`w-full h-12 rounded-xl flex-row items-center justify-center gap-2 border-2 ${favorite ? 'border-secondary bg-red-50' : 'border-gray-200 bg-white'}`}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            <Heart size={16} color={favorite ? '#C41E3A' : '#6B7280'} fill={favorite ? '#C41E3A' : 'transparent'} />
            <Text className={`font-poppins font-semibold text-xs ${favorite ? 'text-secondary' : 'text-[#1A1A2E]'}`}>
              {favorite ? 'DANS LES FAVORIS' : 'AJOUTER AUX FAVORIS'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
