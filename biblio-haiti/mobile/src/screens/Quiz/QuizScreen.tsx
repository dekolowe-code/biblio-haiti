import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../../constants';

interface QuizScreenProps {
  navigation: any;
  route: any;
}

export default function QuizScreen({ navigation, route }: QuizScreenProps) {
  const bookId = route.params?.bookId;

  return (
    <View style={styles.container}>
      <Text variant="bodyLarge">Quiz - À implémenter</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Livre: {bookId || 'N/A'}
      </Text>
      <Text variant="bodySmall" style={styles.info}>
        Système de quiz pour gagner des étoiles:
        • Questions à choix multiples
        • Difficulté progressive
        • Récompenses en étoiles
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
