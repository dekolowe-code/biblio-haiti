import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, ImageBackground, Pressable, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Trophy, Zap, ChevronRight, MessageCircle } from 'lucide-react-native';
import BookCard from '../../src/components/BookCard';
import CategoryPill from '../../src/components/CategoryPill';
import { categories, type Book, books as mockBooks } from '../../src/data/mockData';
import { getAllBooks } from '../../src/lib/bookService';
import { getQuizzes, type Quiz } from '../../src/lib/quizService';
import { useAuth } from '../../src/context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const heroImages = [
  require('../../assets/hero-banner.jpg'), // Placeholder fallback or web URL
  { uri: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=2071&auto=format&fit=crop' },
  { uri: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop' }
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const stars = user?.starsBalance || 0;
  
  const [heroIndex, setHeroIndex] = useState(0);
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  
  const pourToiRef = useRef<ScrollView>(null);
  const recentBooksRef = useRef<ScrollView>(null);
  const categoryRef = useRef<ScrollView>(null);

  useEffect(() => {
    getAllBooks().then(setBooks);
    getQuizzes().then(all => setQuizzes(all.slice(0, 3)));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const featuredBooks = books.slice(0, 5);
  const recentBooks = books.slice(0, 6);

  return (
    <View className="flex-1 bg-background">
      {/* Top Header Bar */}
      <View className="pt-12 pb-3 px-4 bg-white flex-row items-center justify-between border-b border-gray-100 z-20">
        <Text className="font-poppins font-extrabold text-xl text-[#9B1B30]">Biblio-Haïti</Text>
        <Pressable
          onPress={() => router.push('/chat')}
          className="w-10 h-10 bg-warning/10 rounded-full items-center justify-center border border-warning/20"
        >
          <MessageCircle size={20} color="#E85D04" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View className="relative h-[220px] overflow-hidden">
          <ImageBackground
            source={typeof heroImages[heroIndex] === 'number' ? heroImages[heroIndex] : heroImages[heroIndex]}
            className="w-full h-full justify-end"
            resizeMode="cover"
          >
          <View className="absolute inset-0 bg-black/40" />
          <View className="p-5 mb-6">
            <Text className="font-poppins font-bold text-lg text-white leading-tight">
              {heroIndex === 0 ? "Découvrez l'héritage d'Haïti" : heroIndex === 1 ? "La littérature à portée de main" : "Gagnez des étoiles en lisant"}
            </Text>
          </View>
        </ImageBackground>
        
        {/* Carousel dots */}
        <View className="absolute bottom-3 flex-row w-full justify-center gap-1.5">
          {heroImages.map((_, i) => (
            <View
              key={i}
              className={`h-1.5 rounded-full ${i === heroIndex ? 'bg-warning w-4' : 'bg-white/40 w-1.5'}`}
            />
          ))}
        </View>
      </View>

      {/* Star Points Badge */}
      <View className="px-4 -mt-8 flex-row justify-end z-10">
        <Pressable
          className="w-20 h-20 rounded-full bg-warning border-[3px] border-white flex items-center justify-center elevation-sm"
          style={{ shadowColor: '#FAA307', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 }}
        >
          <Text className="font-poppins font-extrabold text-lg text-white leading-none">{stars}</Text>
          <Text className="text-[9px] text-white font-inter mt-0.5">Étoiles</Text>
        </Pressable>
      </View>

      {/* Category Pills */}
      <View className="mt-4 px-4">
        <ScrollView 
          ref={categoryRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
        >
          {categories.map(cat => (
            <CategoryPill key={cat.id} {...cat} />
          ))}
        </ScrollView>
      </View>

      {/* For You Section */}
      <View className="mt-6 px-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-poppins font-semibold text-base text-[#1A1A2E]">Pour toi</Text>
          <Pressable onPress={() => router.push('/catalogue')} className="flex-row items-center gap-0.5">
            <Text className="text-secondary text-xs font-poppins font-medium">Voir tout</Text>
            <ChevronRight size={14} color="#C41E3A" />
          </Pressable>
        </View>
        <ScrollView 
          ref={pourToiRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
        >
          {featuredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </ScrollView>
      </View>

      {/* New Arrivals */}
      <View className="mt-6 px-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-poppins font-semibold text-base text-[#1A1A2E]">Nouveautés</Text>
          <Pressable onPress={() => router.push('/catalogue')} className="flex-row items-center gap-0.5">
            <Text className="text-secondary text-xs font-poppins font-medium">Voir tout</Text>
            <ChevronRight size={14} color="#C41E3A" />
          </Pressable>
        </View>
        <ScrollView 
          ref={recentBooksRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
        >
          {recentBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </ScrollView>
      </View>

      {/* Quiz CTA Banner */}
      <View className="mt-6 px-4">
        <Pressable
          onPress={() => router.push('/quiz')}
          className="relative overflow-hidden rounded-2xl h-[100px]"
        >
          {/* We use a solid background here to replace the image if the image isn't available, but we can also use an image */}
          <View className="absolute inset-0 bg-[#3A0CA3]" />
          <View className="absolute inset-0 bg-black/20 flex-row items-center justify-between px-4">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy size={20} color="#FAA307" />
              </View>
              <View>
                <Text className="font-poppins font-bold text-sm text-white">Gagne des Étoiles!</Text>
                <Text className="text-[10px] text-white/80">Joue et gagne des récompenses</Text>
              </View>
            </View>
            <View className="bg-warning rounded-xl px-4 py-2 flex-row items-center gap-1.5 elevation-md">
              <Zap size={16} color="white" />
              <Text className="font-poppins font-bold text-xs text-white">JOUER</Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* Quizzes Available */}
      <View className="mt-6 px-4 pb-6">
        <Text className="font-poppins font-semibold text-base text-[#1A1A2E] mb-3">Quiz disponibles</Text>
        <View className="gap-2">
          {quizzes.map(quiz => (
            <Pressable
              key={quiz.id}
              onPress={() => router.push(`/quiz/${quiz.id}`)}
              className="bg-white rounded-xl p-3 flex-row items-center gap-3 elevation-sm"
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            >
              <View className="w-10 h-10 rounded-lg bg-[#3A86FF] flex items-center justify-center">
                <Trophy size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="font-poppins font-semibold text-sm text-[#1A1A2E]" numberOfLines={1}>{quiz.title}</Text>
                <Text className="text-[10px] text-[#6B7280]">
                  {quiz.difficulty === 'easy' ? 'Facile' : quiz.difficulty === 'medium' ? 'Moyen' : 'Difficile'} • {quiz.questions.length} questions
                </Text>
              </View>
              <View className="flex-row items-center gap-1 bg-[#FFF8F0] rounded-full px-2 py-1">
                <Zap size={12} color="#FAA307" />
                <Text className="text-[10px] font-poppins font-bold text-[#FAA307]">+{quiz.starReward}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
    </View>
  );
}
