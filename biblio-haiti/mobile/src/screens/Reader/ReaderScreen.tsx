import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../../constants';

interface ReaderScreenProps {
  navigation: any;
  route: any;
}

export default function ReaderScreen({ navigation, route }: ReaderScreenProps) {
  const bookId = route.params?.bookId;

  return (
    <View style={styles.container}>
      <Text variant="bodyLarge">Lecteur PDF - À implémenter</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Lecture du livre: {bookId || 'N/A'}
      </Text>
      <Text variant="bodySmall" style={styles.info}>
        Intégration de react-native-pdf prévue avec:
        • Anti-screenshot natif
        • Filigrane invisible
        • Support offline
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
  },
  info: {
    marginTop: 24,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});
