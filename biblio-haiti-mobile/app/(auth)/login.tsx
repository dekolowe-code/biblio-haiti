import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Fingerprint } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [hasBiometricStored, setHasBiometricStored] = useState(false);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricSupported(compatible && enrolled);

    const storedEmail = await SecureStore.getItemAsync('biblio_email');
    const storedPass = await SecureStore.getItemAsync('biblio_pass');
    if (storedEmail && storedPass) {
      setHasBiometricStored(true);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Connexion à Biblio-Haiti',
        cancelLabel: 'Annuler',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setLoading(true);
        const storedEmail = await SecureStore.getItemAsync('biblio_email');
        const storedPass = await SecureStore.getItemAsync('biblio_pass');
        
        if (storedEmail && storedPass) {
          const success = await login(storedEmail, storedPass);
          if (success) {
            router.replace('/');
          } else {
            Alert.alert('Erreur', 'Identifiants biométriques expirés ou incorrects');
          }
        }
      }
    } catch (e: any) {
      Alert.alert('Erreur Biométrie', e.message || 'Échec de l\'authentification biométrique');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        // Enregistrer pour les futures connexions biométriques
        await SecureStore.setItemAsync('biblio_email', email);
        await SecureStore.setItemAsync('biblio_pass', password);
        router.replace('/');
      } else {
        Alert.alert('Erreur', 'Email ou mot de passe incorrect');
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

      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-white/20 rounded-2xl items-center justify-center mb-4">
            <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text className="font-poppins font-bold text-3xl text-white">Biblio-Haiti</Text>
          <Text className="text-sm text-white/80 font-inter mt-1">Ta bibliothèque culturelle</Text>
        </View>

        <View className="w-full bg-white rounded-3xl p-6 elevation-lg">
          <Text className="font-poppins font-bold text-lg text-[#1A1A2E] text-center mb-6">Se connecter</Text>

          <View className="space-y-4">
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

            <View className="flex-row gap-2 mb-6">
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                className="flex-1 h-12 bg-[#2EC4B6] rounded-xl items-center justify-center flex-row"
                style={({ pressed }) => [{ opacity: pressed || loading ? 0.8 : 1 }]}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text className="font-poppins font-bold text-sm text-white">SE CONNECTER</Text>}
              </Pressable>

              {isBiometricSupported && hasBiometricStored && (
                <Pressable
                  onPress={handleBiometricAuth}
                  disabled={loading}
                  className="w-12 h-12 bg-warning rounded-xl items-center justify-center"
                  style={({ pressed }) => [{ opacity: pressed || loading ? 0.8 : 1 }]}
                >
                  <Fingerprint size={24} color="white" />
                </Pressable>
              )}
            </View>
          </View>

          <View className="flex-row items-center gap-3 mb-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-xs text-[#6B7280] font-inter">OU</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <Pressable onPress={() => router.push('/register')} className="mb-4">
            <Text className="text-center text-sm text-secondary font-inter font-medium">Créer un compte</Text>
          </Pressable>
          
          <Pressable>
            <Text className="text-center text-xs text-[#6B7280] font-inter">Mot de passe oublié?</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
