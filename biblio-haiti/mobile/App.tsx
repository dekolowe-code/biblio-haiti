import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { OfflineProvider } from './src/context/OfflineContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <OfflineProvider>
            <AppNavigator />
            <StatusBar style="light" backgroundColor={COLORS.primary} />
          </OfflineProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
