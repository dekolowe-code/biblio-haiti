import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../../constants';

interface BookDetailScreenProps {
  navigation: any;
  route: any;
}

export default function BookDetailScreen({ navigation, route }: BookDetailScreenProps) {
  const bookId = route.params?.bookId;

  return (
    <View style={styles.container}>
      <Text variant="bodyLarge">Détails du livre - À implémenter</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        ID du livre: {bookId || 'N/A'}
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
});
