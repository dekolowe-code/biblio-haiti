import { useEffect } from 'react';
import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { LibraryProvider } from '@/context/LibraryContext';
import { useNotifications } from '@/hooks/useNotifications';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { BRAND } from '@/constants/Colors';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { resolvedTheme, colors } = useTheme();
  const insets = useSafeAreaInsets();
  useNotifications();
  const pathname = usePathname();
  const hideFabOn = ['/chat', '/book', '/reader', '/quiz'];

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="book/[id]" />
        <Stack.Screen
          name="reader/[id]"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen name="quiz/[bookId]" />
        <Stack.Screen name="chat/index" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="dashboard/index" />
        <Stack.Screen name="notifications/index" />
        <Stack.Screen name="leaderboard/index" />
        <Stack.Screen name="streak/index" />
      </Stack>
      {!hideFabOn.some(p => (pathname || '').startsWith(p)) && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/chat' as never)}
          style={[
            styles.fab,
            {
              left: '50%',
              marginLeft: -32,
              bottom: insets.bottom + 24,
              backgroundColor: BRAND.crimson,
            },
          ]}
        >
          <View style={styles.fabInner}>
            <Sparkles size={22} color="#fff" />
          </View>
        </TouchableOpacity>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <LibraryProvider>
              <RootLayoutInner />
            </LibraryProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    zIndex: 999,
    borderRadius: 32,
    shadowColor: BRAND.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 12,
  },
  fabInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
