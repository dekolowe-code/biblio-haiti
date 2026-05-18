import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setLoading(true);
    try {
      const success = await register(email, password, displayName);
      if (success) {
        Alert.alert('Succès', 'Compte créé avec succès !');
        router.replace('/');
      } else {
        Alert.alert('Erreur', 'Erreur lors de la création du compte');
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['#9B1B30', '#C41E3A', '#E85D04', '#FAA307']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <View className="px-4 pt-12">
        <Pressable onPress={() => router.back()} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
          <ArrowLeft size={20} color="white" />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-6 mt-4 mb-8">
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-3">
            <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text className="font-poppins font-bold text-2xl text-white">Biblio-Haiti</Text>
        </View>

        <View className="w-full bg-white rounded-3xl p-6 elevation-lg">
          <Text className="font-poppins font-bold text-lg text-[#1A1A2E] text-center mb-6">Créer un compte</Text>

          <View className="space-y-4">
            <View className="relative justify-center mb-4">
              <View className="absolute left-3 z-10"><User size={16} color="#6B7280" /></View>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Nom d'utilisateur"
                className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter text-[#1A1A2E]"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View className="relative justify-center mb-4">
              <View className="absolute left-3 z-10"><Mail size={16} color="#6B7280" /></View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter text-[#1A1A2E]"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View className="relative justify-center mb-6">
              <View className="absolute left-3 z-10"><Lock size={16} color="#6B7280" /></View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mot de passe"
                secureTextEntry={!showPassword}
                className="w-full h-12 pl-10 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter text-[#1A1A2E]"
                placeholderTextColor="#6B7280"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} className="absolute right-3 z-10 p-2">
                {showPassword ? <EyeOff size={16} color="#6B7280" /> : <Eye size={16} color="#6B7280" />}
              </Pressable>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className="w-full h-12 bg-[#2EC4B6] rounded-xl items-center justify-center flex-row mb-6"
              style={({ pressed }) => [{ opacity: pressed || loading ? 0.8 : 1 }]}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text className="font-poppins font-bold text-sm text-white">CRÉER MON COMPTE</Text>}
            </Pressable>
          </View>

          <View className="flex-row items-center gap-3 mb-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-xs text-[#6B7280] font-inter">OU</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <Pressable onPress={() => router.push('/login')} className="mb-2">
            <Text className="text-center text-sm text-secondary font-inter font-medium">Déjà un compte? Se connecter</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
