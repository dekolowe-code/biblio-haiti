import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { OnboardingScreen } from './src/screens/onboarding/OnboardingScreen';
import { LanguageSelectionScreen } from './src/screens/onboarding/LanguageSelectionScreen';
import { AuthScreen } from './src/screens/auth/AuthScreen';
import { CatalogueScreen } from './src/screens/catalogue/CatalogueScreen';

type AppState = 'onboarding' | 'language' | 'auth' | 'catalogue';

export default function App() {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [language, setLanguage] = useState<string>('fr');

  const handleOnboardingComplete = () => {
    setAppState('language');
  };

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setAppState('auth');
  };

  const handleLogin = (mode: string, data?: any) => {
    console.log('Login with:', mode, data);
    // Ici: logique d'authentification avec Firebase ou backend
    setAppState('catalogue');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {appState === 'onboarding' && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}
      
      {appState === 'language' && (
        <LanguageSelectionScreen onSelect={handleLanguageSelect} />
      )}
      
      {appState === 'auth' && (
        <AuthScreen onLogin={handleLogin} />
      )}
      
      {appState === 'catalogue' && (
        <CatalogueScreen />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
