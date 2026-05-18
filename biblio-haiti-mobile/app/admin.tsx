import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, Trophy, Users, ShieldAlert, ExternalLink, Calendar } from 'lucide-react-native';
import { useAuth } from '../src/context/AuthContext';
import { getAllBooks } from '../src/lib/bookService';
import { getQuizzes } from '../src/lib/quizService';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState({ booksCount: 0, quizzesCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      Alert.alert('Accès Refusé', "Vous n'avez pas les autorisations nécessaires.");
      router.replace('/');
      return;
    }

    Promise.all([getAllBooks(), getQuizzes()]).then(([books, quizzes]) => {
      setStats({
        booksCount: books.length,
        quizzesCount: quizzes.length
      });
      setLoading(false);
    });
  }, [user, isLoading]);

  if (isLoading || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#9B1B30" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-12 pb-3 px-4 bg-white flex-row items-center gap-3 border-b border-gray-100">
        <Pressable onPress={() => router.replace('/(tabs)/profil')} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
          <ArrowLeft size={20} color="#1A1A2E" />
        </Pressable>
        <View>
          <Text className="font-poppins font-bold text-lg text-[#1A1A2E]">Tableau de Bord Admin</Text>
          <Text className="text-[10px] text-[#6B7280] font-inter">Statistiques & gestion globale</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 py-4">
        {/* Warning card */}
        <View className="bg-red-50 border border-red-200 rounded-2xl p-4 flex-row gap-3 mb-6">
          <ShieldAlert size={24} color="#C41E3A" className="mt-0.5" />
          <View className="flex-1">
            <Text className="font-poppins font-bold text-sm text-secondary">Accès Administration</Text>
            <Text className="text-xs text-gray-600 font-inter mt-1 leading-relaxed">
              Pour des raisons de confort et de sécurité, l'upload de nouveaux fichiers PDF/EPUB et la création de quiz complets s'effectuent depuis la console d'administration sur notre site web.
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <Text className="font-poppins font-bold text-sm text-[#1A1A2E] mb-3">Statistiques de la Bibliothèque</Text>
        <View className="flex-row justify-between mb-6">
          <View className="bg-white border border-gray-100 rounded-2xl p-4 w-[48%] elevation-sm items-center">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mb-2">
              <BookOpen size={20} color="#2EC4B6" />
            </View>
            <Text className="font-poppins font-bold text-2xl text-[#1A1A2E]">{stats.booksCount}</Text>
            <Text className="text-xs text-gray-500 font-inter mt-0.5">Livres publiés</Text>
          </View>

          <View className="bg-white border border-gray-100 rounded-2xl p-4 w-[48%] elevation-sm items-center">
            <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center mb-2">
              <Trophy size={20} color="#FAA307" />
            </View>
            <Text className="font-poppins font-bold text-2xl text-[#1A1A2E]">{stats.quizzesCount}</Text>
            <Text className="text-xs text-gray-500 font-inter mt-0.5">Quiz actifs</Text>
          </View>
        </View>

        {/* Quick Links */}
        <Text className="font-poppins font-bold text-sm text-[#1A1A2E] mb-3">Actions & Raccourcis</Text>
        <View className="bg-white border border-gray-100 rounded-2xl overflow-hidden elevation-sm mb-8">
          <Pressable 
            onPress={() => Alert.alert('Console Web', "Rendez-vous sur biblio-haiti.netlify.app pour accéder à l'interface d'administration complète.")}
            className="flex-row items-center justify-between p-4 border-b border-gray-100"
            style={({ pressed }) => [{ backgroundColor: pressed ? '#f9fafb' : 'white' }]}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 bg-gray-50 rounded-lg items-center justify-center">
                <ExternalLink size={16} color="#6B7280" />
              </View>
              <View>
                <Text className="text-sm font-inter text-[#1A1A2E] font-medium">Accéder au site d'administration</Text>
                <Text className="text-[10px] text-gray-500 font-inter">Ajouter des livres & quiz</Text>
              </View>
            </View>
          </Pressable>

          <View className="p-4 flex-row items-center gap-3">
            <View className="w-9 h-9 bg-gray-50 rounded-lg items-center justify-center">
              <Calendar size={16} color="#6B7280" />
            </View>
            <View>
              <Text className="text-sm font-inter text-[#1A1A2E] font-medium">Dernière synchronisation</Text>
              <Text className="text-[10px] text-gray-500 font-inter">Base de données en ligne active (Supabase)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
