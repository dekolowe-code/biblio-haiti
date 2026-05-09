import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../../constants';

interface LibraryScreenProps {
  navigation: any;
}

export default function LibraryScreen({ navigation }: LibraryScreenProps) {
  return (
    <View style={styles.container}>
      <Text variant="bodyLarge">Ma Bibliothèque - À implémenter</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Vos livres téléchargés et accessibles offline apparaîtront ici
      </Text>
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
  subtitle: {
    marginTop: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
