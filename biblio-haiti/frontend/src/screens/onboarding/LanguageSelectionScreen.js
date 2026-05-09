import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LanguageSelectionScreen({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const languages = [
    {
      id: 'fr',
      name: 'Français',
      flag: '🇫🇷',
      greeting: 'Bonjour',
      description: 'Langue officielle',
    },
    {
      id: 'ht',
      name: 'Kreyòl Ayisyen',
      flag: '🇭🇹',
      greeting: 'Bonjou',
      description: 'Langue nationale',
    },
  ];

  const handleContinue = () => {
    if (!selectedLanguage) {
      Alert.alert('Sélection requise', 'Veuillez choisir une langue pour continuer.');
      return;
    }
    // Stocker la préférence de langue dans AsyncStorage (à implémenter)
    navigation.replace('Auth');
  };

  return (
    <LinearGradient
      colors={['#00209F', '#0040FF']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Choisissez votre langue</Text>
        <Text style={styles.subtitle}>Chwazi lang ou</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.id}
            style={[
              styles.languageCard,
              selectedLanguage === lang.id && styles.selectedCard,
            ]}
            onPress={() => setSelectedLanguage(lang.id)}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <Text style={styles.flag}>{lang.flag}</Text>
              <View style={styles.langInfo}>
                <Text style={styles.langName}>{lang.name}</Text>
                <Text style={styles.langGreeting}>{lang.greeting}</Text>
                <Text style={styles.langDescription}>{lang.description}</Text>
              </View>
              {selectedLanguage === lang.id && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.infoText}>
          Vous pourrez changer cette option à tout moment dans les paramètres.
        </Text>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedLanguage && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedLanguage}
        >
          <Text style={styles.continueButtonText}>Continuer / Kontinye</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  languageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    marginVertical: 10,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: '#fff',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 48,
    marginRight: 20,
  },
  langInfo: {
    flex: 1,
  },
  langName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  langGreeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  langDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#00209F',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#00209F',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
