import { Tabs } from 'expo-router';
import { Home, Search, Bookmark, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#9B1B30',
          borderTopWidth: 0,
          elevation: 10,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#FAA307',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="catalogue"
        options={{
          title: 'Catalogue',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bibliotheque"
        options={{
          title: 'Ma Bib',
          tabBarIcon: ({ color, size }) => <Bookmark size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
