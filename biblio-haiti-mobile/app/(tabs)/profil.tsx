import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Pressable, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Star, Trophy, Heart, Settings, Info, LogOut, ChevronRight, User, History, X, Check, ExternalLink, MessageCircle } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useLibrary } from '../../src/context/LibraryContext';
import { clearAllData } from '../../src/data/mockData';
import { getStarHistory, getCompletedQuizzes, type StarTransaction } from '../../src/lib/starService';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile, isLoading } = useAuth();
  const { library } = useLibrary();
  
  const stars = user?.starsBalance || 0;
  const libraryCount = library.filter(ub => ub.isFinished).length;
  const favCount = library.filter(ub => ub.isFavorite).length;

  const [activeModal, setActiveModal] = useState<'account' | 'history' | 'about' | null>(null);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [starHistory, setStarHistory] = useState<StarTransaction[]>([]);
  const [quizCount, setQuizCount] = useState(0);

  useEffect(() => {
    if (user) {
      setEditName(user.displayName);
      getStarHistory().then(setStarHistory);
      getCompletedQuizzes().then(quizzes => setQuizCount(quizzes.length));
    }
  }, [user, activeModal]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const handleReset = () => {
    Alert.alert(
      'Réinitialiser',
      'Voulez-vous vraiment réinitialiser toutes vos données locales ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Oui', onPress: () => { clearAllData(); Alert.alert('Succès', 'Redémarrez l\'application.'); } }
      ]
    );
  };

  const handleSupport = () => {
    // Web used window.open. In RN we'd use Linking.openURL('https://wa.me/50933970083')
    // We can add expo-linking if needed.
    Alert.alert('Support', 'Contactez-nous sur WhatsApp: +50933970083');
  };

  const handleSaveAccount = async () => {
    setIsSaving(true);
    try {
      // Avatar logic is omitted for brevity (requires expo-image-picker)
      const success = await updateProfile({ displayName: editName });
      if (success) {
        setActiveModal(null);
        Alert.alert('Succès', 'Profil mis à jour !');
      } else {
        Alert.alert('Erreur', 'Erreur lors de la mise à jour du profil');
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Problème lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-[#6B7280]">Chargement...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-background">
        <View className="w-20 h-20 bg-secondary rounded-full items-center justify-center mb-4">
          <User size={40} color="white" />
        </View>
        <Text className="font-poppins font-bold text-xl text-[#1A1A2E] text-center">Bienvenue sur Biblio-Haiti</Text>
        <Text className="text-sm text-[#6B7280] font-inter text-center mt-2">
          Connecte-toi pour accéder à ta bibliothèque et gagner des étoiles
        </Text>
        <Pressable
          onPress={() => router.push('/login')}
          className="w-full mt-6 py-3 bg-warning rounded-xl"
        >
          <Text className="text-white text-center font-poppins font-bold text-sm">Se connecter</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/register')}
          className="w-full mt-3 py-3 border-2 border-secondary rounded-xl"
        >
          <Text className="text-secondary text-center font-poppins font-semibold text-sm">Créer un compte</Text>
        </Pressable>
      </View>
    );
  }

  const stats = [
    { icon: BookOpen, value: libraryCount, label: 'Livres lus', color: '#2EC4B6' },
    { icon: Star, value: stars, label: 'Étoiles', color: '#FAA307' },
    { icon: Trophy, value: quizCount, label: 'Quiz', color: '#E85D04' },
    { icon: Heart, value: favCount, label: 'Favoris', color: '#9D4EDD' },
  ];

  const menuItems = [
    { icon: User, label: 'Mon Compte', action: () => setActiveModal('account') },
    { icon: History, label: 'Historique des Étoiles', action: () => setActiveModal('history') },
    ...(user?.isAdmin ? [{ icon: Settings, label: 'Dashboard Admin', action: () => router.push('/admin') }] : []),
    { icon: MessageCircle, label: 'Aide & Support (WhatsApp)', action: handleSupport, isExternal: true },
    { icon: Info, label: 'À Propos', action: () => setActiveModal('about') },
  ];

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      {/* User Info Card */}
      <View className="px-4 pt-4">
        <View className="bg-primary rounded-2xl p-5 flex-row items-center gap-4 elevation-md">
          <View className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-white/20 items-center justify-center">
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} className="w-full h-full" />
            ) : (
              <User size={32} color="white" />
            )}
          </View>
          <View className="flex-1">
            <Text className="font-poppins font-bold text-lg text-white">{user.displayName}</Text>
            <Text className="text-xs text-white/80 font-inter" numberOfLines={1}>{user.email}</Text>
            <Pressable 
              onPress={() => setActiveModal('account')}
              className="bg-white/20 px-2 py-1 rounded mt-2 self-start"
            >
              <Text className="text-xs text-white">Modifier le profil</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View className="px-4 mt-4 flex-row justify-between">
        {stats.map((stat, i) => (
          <View key={i} className="bg-white rounded-xl p-3 elevation-sm items-center w-[23%]">
            <stat.icon size={20} color={stat.color} className="mb-1" />
            <Text className="font-poppins font-bold text-lg text-[#1A1A2E]">{stat.value}</Text>
            <Text className="text-[8px] text-[#6B7280] font-inter uppercase text-center">{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu Items */}
      <View className="px-4 mt-6">
        <View className="bg-white rounded-2xl elevation-sm overflow-hidden border border-gray-100">
          {menuItems.map((item, i) => (
            <Pressable
              key={i}
              onPress={item.action}
              className={`flex-row items-center gap-3 px-4 py-4 ${i < menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
              style={({ pressed }) => [{ backgroundColor: pressed ? '#F9FAFB' : 'white' }]}
            >
              <View className="w-9 h-9 bg-gray-50 rounded-lg items-center justify-center">
                <item.icon size={16} color="#6B7280" />
              </View>
              <Text className="flex-1 text-sm font-inter text-[#1A1A2E]">{item.label}</Text>
              {item.isExternal ? <ExternalLink size={14} color="#9ca3af" /> : <ChevronRight size={16} color="#9ca3af" />}
            </Pressable>
          ))}
        </View>
      </View>

      {/* Danger Zone */}
      <View className="px-4 mt-6 mb-8">
        <View className="bg-white rounded-2xl elevation-sm overflow-hidden border border-gray-100">
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center gap-3 px-4 py-4 border-b border-gray-100"
          >
            <View className="w-9 h-9 bg-red-50 rounded-lg items-center justify-center">
              <LogOut size={16} color="#C41E3A" />
            </View>
            <Text className="flex-1 text-sm font-inter text-secondary font-medium">Se déconnecter</Text>
          </Pressable>
          <Pressable
            onPress={handleReset}
            className="flex-row items-center gap-3 px-4 py-4"
          >
            <View className="w-9 h-9 bg-gray-50 rounded-lg items-center justify-center">
              <History size={16} color="#9ca3af" />
            </View>
            <Text className="flex-1 text-sm font-inter text-gray-500">Réinitialiser les données locales</Text>
          </Pressable>
        </View>
        <Text className="text-center text-[10px] text-[#6B7280] font-inter uppercase mt-6 tracking-widest">
          Biblio-Haiti Mobile v1.0.0
        </Text>
      </View>

      {/* MODALS */}
      
      {/* Account Modal */}
      <Modal visible={activeModal === 'account'} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-poppins font-bold text-lg text-[#1A1A2E]">Modifier mon Profil</Text>
              <Pressable onPress={() => setActiveModal(null)} className="p-2">
                <X size={20} color="#6B7280" />
              </Pressable>
            </View>
            <View className="space-y-4 pb-6">
              <Text className="text-xs font-semibold text-gray-500">Nom d'affichage</Text>
              <TextInput 
                value={editName}
                onChangeText={setEditName}
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter mb-4"
              />
              <Text className="text-xs font-semibold text-gray-500">Email (Non modifiable)</Text>
              <TextInput 
                value={user.email} 
                editable={false}
                className="w-full h-12 px-4 bg-gray-100 border border-gray-200 rounded-xl text-sm font-inter text-gray-500 mb-6"
              />
              <Pressable 
                onPress={handleSaveAccount}
                disabled={isSaving}
                className="w-full h-12 bg-[#1A1A2E] rounded-xl flex-row items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Text className="text-white font-poppins font-bold">Enregistrement...</Text>
                ) : (
                  <>
                    <Check size={16} color="white" />
                    <Text className="text-white font-poppins font-bold">Enregistrer</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal visible={activeModal === 'history'} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 h-[70%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-poppins font-bold text-lg text-[#1A1A2E]">Historique des Étoiles</Text>
              <Pressable onPress={() => setActiveModal(null)} className="p-2">
                <X size={20} color="#6B7280" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {starHistory.length === 0 ? (
                <Text className="text-center text-sm text-gray-500 py-4">Aucune transaction récente</Text>
              ) : (
                starHistory.map((item) => {
                  const dateObj = new Date(item.created_at);
                  const dateStr = dateObj.toLocaleDateString();
                  return (
                    <View key={item.id} className="flex-row items-center justify-between p-3 bg-gray-50 rounded-xl mb-2">
                      <View>
                        <Text className="text-sm font-poppins font-semibold text-[#1A1A2E]">{item.description}</Text>
                        <Text className="text-[10px] text-gray-400 font-inter">{dateStr}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Text className={`font-poppins font-bold text-sm ${item.type === 'plus' ? 'text-green-500' : item.type === 'minus' ? 'text-red-500' : 'text-gray-400'}`}>
                          {item.type === 'plus' ? '+' : item.type === 'minus' ? '-' : ''}{item.amount}
                        </Text>
                        <Star size={12} color={item.type === 'plus' ? '#22c55e' : item.type === 'minus' ? '#ef4444' : '#9ca3af'} fill={item.type === 'plus' ? '#22c55e' : item.type === 'minus' ? '#ef4444' : '#9ca3af'} />
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal visible={activeModal === 'about'} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center px-4">
          <View className="bg-white rounded-3xl p-6 items-center">
            <View className="flex-row justify-end w-full mb-2">
              <Pressable onPress={() => setActiveModal(null)} className="p-2">
                <X size={20} color="#6B7280" />
              </Pressable>
            </View>
            <Text className="font-poppins font-bold text-xl text-[#1A1A2E] mb-4">À Propos</Text>
            <Text className="text-sm text-gray-600 font-inter text-center mb-6">
              Biblio-Haiti Mobile est une plateforme dédiée à la promotion de la culture et de la littérature haïtienne.
            </Text>
            <View className="bg-gray-50 p-4 rounded-xl w-full mb-4">
              <Text className="text-xs text-gray-500 font-inter mb-1">Version: 1.0.0 (Bêta Mobile)</Text>
              <Text className="text-xs text-gray-500 font-inter mb-1">Développeur: Equipe Biblio-Haiti</Text>
            </View>
            <Text className="text-xs text-secondary font-inter italic text-center">
              "Rendre le savoir accessible à tous les enfants d'Haïti."
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
