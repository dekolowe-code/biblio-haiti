import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { COLORS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

interface PlaceholderScreenProps {
  navigation: any;
  title: string;
  description: string;
}

export default function PlaceholderScreen({ navigation, title, description }: PlaceholderScreenProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>{title}</Text>
      <Text variant="bodyMedium" style={styles.description}>{description}</Text>
      
      <Button 
        mode="outlined" 
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Se déconnecter
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  description: {
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  logoutButton: {
    borderColor: COLORS.error,
  },
});
