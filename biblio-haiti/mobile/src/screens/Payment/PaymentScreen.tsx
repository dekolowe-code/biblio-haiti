import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../../constants';

interface PaymentScreenProps {
  navigation: any;
  route: any;
}

export default function PaymentScreen({ navigation, route }: PaymentScreenProps) {
  const bookId = route.params?.bookId;
  const amount = route.params?.amount;

  return (
    <View style={styles.container}>
      <Text variant="bodyLarge">Paiement - À implémenter</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Livre: {bookId || 'N/A'}
      </Text>
      {amount && (
        <Text variant="headlineSmall" style={styles.amount}>
          {amount} HTG
        </Text>
      )}
      <Text variant="bodySmall" style={styles.info}>
        Méthodes de paiement disponibles:
        • MonCash (Haïti)
        • Stripe (International)
        • Étoiles (Quiz)
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
  amount: {
    marginTop: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  info: {
    marginTop: 24,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});
