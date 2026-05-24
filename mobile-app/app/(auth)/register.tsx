import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { signUp } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    const { error } = await signUp(data.email, data.password, data.fullName);
    if (error) {
      setApiError(error);
    } else {
      setSuccess(true);
      setTimeout(() => router.replace('/(tabs)/home' as never), 2000);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoSection}>
            <Text style={styles.logoEmoji}>📚</Text>
            <Text style={[styles.logoTitle, { color: colors.primary }]}>Biblio Haïti</Text>
            <Text style={[styles.logoSubtitle, { color: colors.textSecondary }]}>
              Rejoignez notre communauté de lecteurs
            </Text>
          </View>

          {success ? (
            <View style={[styles.successBox, { backgroundColor: colors.success + '15', borderColor: colors.success }]}>
              <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>🎉</Text>
              <Text style={[styles.successTitle, { color: colors.success }]}>Compte créé avec succès !</Text>
              <Text style={[styles.successText, { color: colors.textSecondary }]}>
                Redirection vers l'accueil...
              </Text>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Créer un compte</Text>

              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Nom complet"
                    placeholder="Marie Dupont"
                    autoCapitalize="words"
                    value={value}
                    onChangeText={onChange}
                    error={errors.fullName?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Adresse e-mail"
                    placeholder="votre@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Mot de passe"
                    placeholder="Min. 6 caractères"
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    error={errors.password?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Confirmer le mot de passe"
                    placeholder="••••••••"
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              {apiError && (
                <View style={[styles.errorBox, { backgroundColor: colors.error + '15' }]}>
                  <Text style={[styles.errorText, { color: colors.error }]}>{apiError}</Text>
                </View>
              )}

              <Button
                title="Créer mon compte"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                fullWidth
                size="lg"
                style={{ marginTop: 8 }}
              />
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login' as never)}
            style={styles.loginLink}
          >
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              Déjà inscrit ?{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 28 },
  logoEmoji: { fontSize: 48, marginBottom: 8 },
  logoTitle: { fontSize: 28, fontWeight: '800' },
  logoSubtitle: { fontSize: 13, marginTop: 4 },
  card: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  errorBox: { borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { fontSize: 13, fontWeight: '500' },
  successBox: { borderRadius: 16, borderWidth: 1, padding: 28, alignItems: 'center', marginBottom: 16 },
  successTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  successText: { fontSize: 14, textAlign: 'center' },
  loginLink: { alignItems: 'center', paddingVertical: 12 },
  loginText: { fontSize: 14 },
});
