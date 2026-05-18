import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Heart, Lock, Trash2 } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useLibrary } from '../../src/context/LibraryContext';
import { type Book, books as mockBooks } from '../../src/data/mockData';
import { getAllBooks } from '../../src/lib/bookService';
import Svg, { Circle } from 'react-native-svg';

type TabType = 'reading' | 'favorites' | 'unlocked';

export default function LibraryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('reading');
  const { library } = useLibrary();
  const [books, setBooks] = useState<Book[]>(mockBooks);

  useEffect(() => {
    getAllBooks().then(setBooks);
  }, []);

  const readingBooks = library.filter(ub => !ub.isFinished && (ub.currentPage > 0 || ub.isUnlocked));
  const favoriteBooks = library.filter(ub => ub.isFavorite);
  const unlockedBooks = library.filter(ub => ub.isUnlocked);

  const getBook = (bookId: string) => books.find(b => b.id === bookId);

  const handleDelete = (bookId: string) => {
    // console.log('Delete', bookId);
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'reading', label: 'En cours' },
    { key: 'favorites', label: 'Favoris' },
    { key: 'unlocked', label: 'Débloqués' },
  ];

  const renderEmptyState = (type: TabType) => {
    const messages: Record<TabType, { title: string; desc: string }> = {
      reading: { title: "Tu n'as pas commencé de lecture", desc: 'Explore le catalogue pour commencer' },
      favorites: { title: 'Aucun favori', desc: 'Ajoute des livres à tes favoris' },
      unlocked: { title: 'Aucun livre débloqué', desc: 'Débloque des livres premium avec tes étoiles' },
    };
    const msg = messages[type];
    
    return (
      <View className="flex-1 items-center justify-center py-16 px-4">
        {/* Fallback View for image since we don't have the local asset directly sometimes */}
        <View className="w-32 h-32 rounded-2xl mb-4 bg-gray-200 items-center justify-center opacity-60">
           <BookOpen size={40} color="#9ca3af" />
        </View>
        <Text className="text-sm font-poppins font-semibold text-[#1A1A2E] text-center">{msg.title}</Text>
        <Text className="text-xs text-[#6B7280] font-inter text-center mt-1">{msg.desc}</Text>
        <Pressable
          onPress={() => router.push('/catalogue')}
          className="mt-4 px-6 py-2.5 bg-secondary rounded-xl"
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
        >
          <Text className="text-white font-poppins font-semibold text-sm">Explorer le catalogue</Text>
        </Pressable>
      </View>
    );
  };

  const renderBookList = (bookList: typeof library) => {
    if (bookList.length === 0) return renderEmptyState(activeTab);

    return (
      <View className="gap-3">
        {bookList.map(ub => {
          const book = getBook(ub.bookId);
          if (!book) return null;
          const progress = book.pages > 0 ? (ub.currentPage / book.pages) * 100 : 0;

          return (
            <Pressable
              key={ub.bookId}
              onPress={() => router.push(`/livre/${book.id}`)}
              className="bg-white rounded-xl p-3 flex-row items-center gap-3 elevation-sm"
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            >
              <Image
                source={{ uri: book.coverUrl }}
                className="w-14 h-[72px] rounded-lg"
              />
              <View className="flex-1">
                <Text className="font-poppins font-semibold text-sm text-[#1A1A2E]" numberOfLines={1}>{book.title}</Text>
                <Text className="text-[10px] text-[#6B7280] font-inter">{book.author}</Text>
                
                {activeTab === 'reading' && (
                  <View className="mt-1.5">
                    <View className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <View className="h-full bg-[#2EC4B6]" style={{ width: `${progress}%` }} />
                    </View>
                    <Text className="text-[9px] text-[#6B7280] font-inter mt-0.5">Page {ub.currentPage} sur {book.pages}</Text>
                  </View>
                )}
                {activeTab === 'unlocked' && (
                  <Text className="text-[10px] text-[#6B7280] font-inter mt-1">Débloqué récemment</Text>
                )}
              </View>
              
              {activeTab === 'favorites' && <Heart size={16} color="#C41E3A" fill="#C41E3A" />}
              {activeTab === 'reading' && (
                <View className="w-8 h-8 bg-[#2EC4B6]/10 rounded-full flex items-center justify-center">
                  <BookOpen size={16} color="#2EC4B6" />
                </View>
              )}
              {activeTab === 'unlocked' && (
                <Pressable onPress={() => handleDelete(ub.bookId)} className="w-8 h-8 flex items-center justify-center">
                  <Trash2 size={16} color="#6B7280" />
                </Pressable>
              )}
            </Pressable>
          );
        })}
      </View>
    );
  };

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-4 bg-background">
        <Lock size={48} color="#6B7280" className="mb-4" />
        <Text className="text-sm font-poppins text-[#1A1A2E] text-center mb-4">Connecte-toi pour accéder à ta bibliothèque</Text>
        <Pressable
          onPress={() => router.push('/login')}
          className="px-6 py-2.5 bg-warning rounded-xl"
        >
          <Text className="text-white font-poppins font-semibold text-sm">Se connecter</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="font-poppins font-bold text-xl text-[#1A1A2E]">Ma Bibliothèque</Text>
      </View>

      {/* Reading Stats Card */}
      <View className="px-4 mt-2">
        <View className="bg-primary rounded-2xl p-4 flex-row items-center gap-4">
          <View className="w-16 h-16 relative">
            <Svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
              <Circle
                cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 28 * (Math.min(100, readingBooks.length * 20) / 100)} ${2 * Math.PI * 28}`}
                strokeLinecap="round"
              />
            </Svg>
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-white font-poppins font-bold text-xs">{Math.min(100, readingBooks.length * 20)}%</Text>
            </View>
          </View>
          <View>
            <Text className="text-white font-poppins font-semibold text-sm">{readingBooks.length} livre{readingBooks.length !== 1 ? 's' : ''} en cours</Text>
            <Text className="text-white/80 text-xs font-inter mt-0.5">Objectif: 5 livres ce mois</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="px-4 mt-4">
        <View className="flex-row bg-white rounded-xl p-1 elevation-sm">
          {tabs.map(tab => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className="flex-1 py-2 items-center relative"
            >
              <Text className={`text-xs font-poppins font-medium ${activeTab === tab.key ? 'text-secondary' : 'text-[#6B7280]'}`}>
                {tab.label}
              </Text>
              {activeTab === tab.key && (
                <View className="absolute bottom-0 w-1/2 h-0.5 bg-secondary rounded-full" />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* Content */}
      <View className="px-4 mt-4 pb-6">
        {activeTab === 'reading' && renderBookList(readingBooks)}
        {activeTab === 'favorites' && renderBookList(favoriteBooks)}
        {activeTab === 'unlocked' && renderBookList(unlockedBooks)}
      </View>
    </ScrollView>
  );
}
