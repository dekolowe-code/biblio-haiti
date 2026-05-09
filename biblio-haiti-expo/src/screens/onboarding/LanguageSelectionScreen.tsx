import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

interface LanguageOption {
  code: string;
  name: string;
  greeting: string;
  flag: string;
}

const languages: LanguageOption[] = [
  {
    code: 'fr',
    name: 'Français',
    greeting: 'Bienvenue',
    flag: '🇫🇷',
  },
  {
    code: 'ht',
    name: 'Kreyòl Ayisyen',
    greeting: 'Byenvini',
    flag: '🇭🇹',
  },
];

export const LanguageSelectionScreen: React.FC<{ onSelect: (lang: string) => void }> = ({ 
  onSelect 
}) => {
  return (
    <View style={styles.container}>
      {/* Header avec drapeau haïtien */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.flagEmoji}>🇭🇹</Text>
        <Text style={styles.title}>Biblio Haiti</Text>
        <Text style={styles.subtitle}>Chwazi lang ou a / Choisissez votre langue</Text>
      </LinearGradient>

      {/* Options de langue */}
      <View style={styles.content}>
        <Text style={styles.instruction}>
          Sélectionnez la langue pour commencer{'\n'}
          Chwazi lang pou kòmanse
        </Text>

        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => onSelect(lang.code)}
            style={styles.languageCard}
            activeOpacity={0.7}
          >
            <View style={styles.languageContent}>
              <Text style={styles.flag}>{lang.flag}</Text>
              <View style={styles.languageInfo}>
                <Text style={styles.languageName}>{lang.name}</Text>
                <Text style={styles.greeting}>{lang.greeting}</Text>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Note en bas */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Vous pourrez changer la langue à tout moment dans les paramètres
        </Text>
        <Text style={styles.footerTextCreole}>
          Ou ka chanje lang la nenpòt ki lè nan paramèt yo
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  instruction: {
    fontSize: 18,
    color: colors.gray[700],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  languageCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  flag: {
    fontSize: 48,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  greeting: {
    fontSize: 16,
    color: colors.gray[500],
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 4,
  },
  footerTextCreole: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
});
