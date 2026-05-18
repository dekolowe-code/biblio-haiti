import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { LibraryProvider } from '../src/context/LibraryContext';
import { StatusBar } from 'expo-status-bar';
import { registerForPushNotificationsAsync } from '../src/lib/notificationService';
import '../global.css';

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <AuthProvider>
      <LibraryProvider>
        <StatusBar style="light" />
        <Slot />
      </LibraryProvider>
    </AuthProvider>
  );
}
