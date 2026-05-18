import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Trophy, Star, ChevronRight, Zap, ArrowLeft } from 'lucide-react-native';
import { getCompletedQuizzes } from '../../src/lib/starService';
import { getPaginatedQuizzes, type Quiz } from '../../src/lib/quizService';
import { useAuth } from '../../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function QuizListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getCompletedQuizzes().then(setCompletedQuizzes);
    }
    // Charger la première page
    getPaginatedQuizzes(0).then(result => {
      setQuizzes(result.data);
      setHasMore(result.hasMore);
      setInitialLoading(false);
    });
  }, [user]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const result = await getPaginatedQuizzes(nextPage);
    setQuizzes(prev => [...prev, ...result.data]);
    setHasMore(result.hasMore);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const stars = user?.starsBalance || 0;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-12 pb-2 px-4 flex-row items-center gap-3">
        <Pressable onPress={() => router.replace('/')} className="w-10 h-10 bg-white rounded-full items-center justify-center elevation-sm">
          <ArrowLeft size={20} color="#1A1A2E" />
        </Pressable>
        <View>
          <Text className="font-poppins font-bold text-xl text-[#1A1A2E]">Gagne des Étoiles</Text>
          <Text className="text-xs text-[#6B7280] font-inter">Teste tes connaissances et gagne des récompenses</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Daily Bonus */}
        <View className="px-4 mt-4">
          <LinearGradient
            colors={['#FAA307', '#E85D04']}
            style={{ borderRadius: 16 }}
          >
            <Pressable className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                  <Zap size={20} color="white" />
                </View>
                <View>
                  <Text className="text-white font-poppins font-semibold text-sm">Bonus quotidien</Text>
                  <Text className="text-white/80 text-xs font-inter">Connecte-toi chaque jour</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <Star size={16} color="white" fill="white" />
                <Text className="text-white font-poppins font-bold text-sm">+5</Text>
              </View>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Stars Balance */}
        <View className="px-4 mt-5 flex-row items-center gap-2">
          <Star size={20} color="#FAA307" fill="#FAA307" />
          <Text className="font-poppins font-bold text-lg text-[#1A1A2E]">{stars}</Text>
          <Text className="text-xs text-[#6B7280] font-inter">étoiles disponibles</Text>
        </View>

        {/* Quiz List */}
        <View className="px-4 mt-4 space-y-3">
          {initialLoading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#FAA307" />
            </View>
          ) : quizzes.length === 0 ? (
            <View className="items-center justify-center py-12 text-center">
              <Trophy size={48} color="#d1d5db" className="mb-3" />
              <Text className="text-sm text-[#6B7280] font-inter font-medium">Aucun quiz disponible pour le moment</Text>
              <Text className="text-xs text-[#9CA3AF] font-inter mt-1">Revenez bientôt !</Text>
            </View>
          ) : (
            <>
              {quizzes.map(quiz => {
                const isCompleted = completedQuizzes.includes(quiz.id);
                return (
                  <Pressable
                    key={quiz.id}
                    onPress={() => router.push(`/quiz/${quiz.id}`)}
                    className={`bg-white rounded-xl p-4 elevation-sm flex-row items-center gap-3 border border-gray-100 mb-3 ${isCompleted ? 'opacity-60 bg-gray-50' : ''}`}
                    style={({ pressed }) => [{ backgroundColor: pressed ? '#f9fafb' : isCompleted ? '#f9fafb' : 'white' }]}
                  >
                    <View className="w-12 h-12 rounded-xl items-center justify-center bg-[#3A86FF]">
                      <Trophy size={24} color="white" />
                    </View>
                    
                    <View className="flex-1">
                      <Text className={`font-poppins font-semibold text-sm ${isCompleted ? 'text-gray-600' : 'text-[#1A1A2E]'}`} numberOfLines={1}>
                        {quiz.title}
                      </Text>
                      <Text className="text-[10px] text-[#6B7280] font-inter mt-0.5">
                        {quiz.difficulty === 'easy' ? 'Facile' : quiz.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                        {' • '}
                        {quiz.questions.length} questions
                      </Text>
                      {isCompleted && (
                        <View className="bg-green-50 border border-green-200 self-start px-2 py-0.5 rounded mt-1">
                          <Text className="text-green-700 text-[8px] font-bold">COMPLÉTÉ</Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-row items-center gap-2">
                      <View className={`flex-row items-center gap-0.5 rounded-full px-2 py-1 ${isCompleted ? 'bg-gray-200' : 'bg-[#FFF8F0]'}`}>
                        <Star size={12} color={isCompleted ? '#9ca3af' : '#FAA307'} fill={isCompleted ? '#9ca3af' : '#FAA307'} />
                        <Text className={`text-[10px] font-poppins font-bold ${isCompleted ? 'text-gray-500' : 'text-[#FAA307]'}`}>
                          +{quiz.starReward}
                        </Text>
                      </View>
                      {!isCompleted && <ChevronRight size={16} color="#6B7280" />}
                    </View>
                  </Pressable>
                );
              })}

              {hasMore && (
                <View className="items-center mt-4">
                  <Pressable
                    onPress={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-3 bg-[#3A86FF] rounded-xl flex-row items-center justify-center gap-2 elevation-sm"
                  >
                    {loadingMore && <ActivityIndicator color="white" size="small" />}
                    <Text className="text-white font-poppins font-semibold text-sm">
                      {loadingMore ? 'Chargement...' : 'Voir plus de quiz'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </View>

        {!user && (
          <View className="px-4 mt-6">
            <Pressable
              onPress={() => router.push('/login')}
              className="w-full py-4 bg-warning rounded-xl items-center justify-center elevation-sm"
            >
              <Text className="text-white font-poppins font-semibold text-sm">Se connecter pour jouer</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
