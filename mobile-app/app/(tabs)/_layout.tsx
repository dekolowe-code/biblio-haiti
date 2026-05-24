import { Tabs } from 'expo-router';
import { Home, BookOpen, BookMarked, User } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/constants/Colors';

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: insets.bottom + 6,
          height: 64 + insets.bottom,
          shadowColor: BRAND.crimson,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 6,
          letterSpacing: 0.2,
        },
        tabBarIconStyle: { marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? [styles.activeIcon, { backgroundColor: BRAND.crimson + '18' }] : undefined}>
              <Home size={size} color={color} strokeWidth={focused ? 2 : 1.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="catalogue"
        options={{
          title: 'Catalogue',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? [styles.activeIcon, { backgroundColor: BRAND.crimson + '18' }] : undefined}>
              <BookOpen size={size} color={color} strokeWidth={focused ? 2 : 1.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Bibliothèque',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? [styles.activeIcon, { backgroundColor: BRAND.crimson + '18' }] : undefined}>
              <BookMarked size={size} color={color} strokeWidth={focused ? 2 : 1.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? [styles.activeIcon, { backgroundColor: BRAND.crimson + '18' }] : undefined}>
              <User size={size} color={color} strokeWidth={focused ? 2 : 1.5} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIcon: {
    padding: 6,
    borderRadius: 12,
  },
});
