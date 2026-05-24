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
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const { colors } = useTheme();
  const { signIn } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    const { error } = await signIn(data.email, data.password);
    if (error) {
      setApiError('E-mail ou mot de passe incorrect. Veuillez réessayer.');
    } else {
      router.replace('/(tabs)/home' as never);
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
              Votre bibliothèque numérique haïtienne
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Connexion</Text>

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
                  placeholder="••••••••"
                  isPassword
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            {apiError && (
              <View style={[styles.errorBox, { backgroundColor: colors.error + '15' }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>{apiError}</Text>
              </View>
            )}

            <Button
              title="Se connecter"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              fullWidth
              size="lg"
              style={{ marginTop: 8 }}
            />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>ou</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Button
              title="Continuer sans compte"
              onPress={() => router.replace('/(tabs)/home' as never)}
              variant="ghost"
              fullWidth
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register' as never)}
            style={styles.registerLink}
          >
            <Text style={[styles.registerText, { color: colors.textSecondary }]}>
              Pas encore de compte ?{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoEmoji: { fontSize: 56, marginBottom: 8 },
  logoTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  logoSubtitle: { fontSize: 14, marginTop: 4 },
  card: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  errorBox: { borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { fontSize: 13, fontWeight: '500' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  registerLink: { alignItems: 'center', paddingVertical: 12 },
  registerText: { fontSize: 14 },
});
