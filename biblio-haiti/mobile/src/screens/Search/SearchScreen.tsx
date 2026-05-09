import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../../constants';

interface SearchScreenProps {
  navigation: any;
  route: any;
}

export default function SearchScreen({ navigation, route }: SearchScreenProps) {
  const initialQuery = route.params?.query || '';

  return (
    <View style={styles.container}>
      <Text variant="bodyLarge">Écran de recherche - À implémenter</Text>
      {initialQuery ? (
        <Text variant="bodyMedium">Recherche: {initialQuery}</Text>
      ) : null}
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
});
