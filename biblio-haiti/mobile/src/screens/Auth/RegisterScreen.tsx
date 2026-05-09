import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SCREENS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  
  const { register } = useAuth();

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.full_name || !formData.email || !formData.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
      });
      // Navigation handled by AuthContext after successful registration
    } catch (error: any) {
      Alert.alert(
        'Échec de l\'inscription',
        error.response?.data?.detail || 'Une erreur est survenue. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="account-plus" size={60} color={COLORS.primary} />
          <Text variant="headlineMedium" style={styles.title}>
            Créer un compte
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Rejoignez Biblio-Haïti dès aujourd'hui
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="Nom complet *"
            value={formData.full_name}
            onChangeText={(value) => updateField('full_name', value)}
            mode="outlined"
            style={styles.input}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Email *"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput
            label="Téléphone (optionnel)"
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="phone" />}
          />

          <TextInput
            label="Mot de passe *"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            mode="outlined"
            secureTextEntry={secureTextEntry}
            style={styles.input}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />

          <TextInput
            label="Confirmer le mot de passe *"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            mode="outlined"
            secureTextEntry={confirmSecureTextEntry}
            style={styles.input}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon
                icon={confirmSecureTextEntry ? 'eye-outline' : 'eye-off-outline'}
                onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
            contentStyle={styles.registerButtonContent}
          >
            {loading ? <ActivityIndicator color={COLORS.white} /> : "S'inscrire"}
          </Button>

          <View style={styles.loginContainer}>
            <Text variant="bodyMedium">Déjà un compte?</Text>
            <TouchableOpacity onPress={() => navigation.navigate(SCREENS.LOGIN)}>
              <Text variant="bodyMedium" style={styles.loginLink}>
                Se connecter
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.termsContainer}>
            <Text variant="bodySmall" style={styles.termsText}>
              En vous inscrivant, vous acceptez nos{' '}
              <Text style={styles.termsLink}>Conditions d'utilisation</Text> et notre{' '}
              <Text style={styles.termsLink}>Politique de confidentialité</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 24,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 16,
    color: COLORS.primary,
  },
  subtitle: {
    color: COLORS.textLight,
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: COLORS.white,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  registerButtonContent: {
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  termsContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  termsText: {
    textAlign: 'center',
    color: COLORS.textLight,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});
