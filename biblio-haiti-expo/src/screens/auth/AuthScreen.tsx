import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

type AuthMode = 'email' | 'google' | 'facebook' | 'phone' | 'guest';

export const AuthScreen: React.FC<{ 
  onLogin: (mode: AuthMode, data?: any) => void 
}> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);

  const handleEmailLogin = () => {
    if (email && password) {
      onLogin('email', { email, password });
    }
  };

  const handlePhoneSendOTP = () => {
    if (phone) {
      setShowOTP(true);
      // Ici: envoyer OTP via API backend
    }
  };

  const handlePhoneLogin = () => {
    if (otp) {
      onLogin('phone', { phone, otp });
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.flagEmoji}>🇭🇹</Text>
        <Text style={styles.title}>Biblio Haiti</Text>
        <Text style={styles.subtitle}>Li, se grandi</Text>
      </LinearGradient>

      {/* Contenu principal */}
      <View style={styles.content}>
        <Text style={styles.welcomeTitle">
          {mode === 'guest' ? 'Accès Invité' : 'Connexion / Inscription'}
        </Text>
        <Text style={styles.welcomeSubtitle}>
          {mode === 'guest' 
            ? 'Découvrez les livres gratuits sans créer de compte'
            : 'Choisissez votre méthode de connexion'}
        </Text>

        {!showOTP && mode !== 'guest' && (
          <>
            {/* Boutons sociaux */}
            <TouchableOpacity 
              style={[styles.socialButton, styles.googleButton]}
              onPress={() => onLogin('google')}
            >
              <Text style={styles.socialIcon}>🔵</Text>
              <Text style={styles.socialButtonText}>Continuer avec Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.facebookButton]}
              onPress={() => onLogin('facebook')}
            >
              <Text style={styles.socialIcon}>📘</Text>
              <Text style={styles.socialButtonText}>Continuer avec Facebook</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.gray[400]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor={colors.gray[400]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity 
              style={styles.button}
              onPress={handleEmailLogin}
            >
              <Text style={styles.buttonText}>Se connecter</Text>
            </TouchableOpacity>

            {/* Téléphone */}
            <TouchableOpacity 
              style={[styles.button, styles.buttonOutline]}
              onPress={() => setMode('phone')}
            >
              <Text style={[styles.buttonText, styles.buttonOutlineText]}>
                📱 Continuer avec le téléphone
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Mode téléphone avec OTP */}
        {showOTP && mode === 'phone' && (
          <>
            <Text style={styles.otpInstruction}>
              Entrez le code reçu par SMS au{'\n'}
              <Text style={styles.phoneNumber}>{phone}</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="Code OTP"
              placeholderTextColor={colors.gray[400]}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity 
              style={styles.button}
              onPress={handlePhoneLogin}
            >
              <Text style={styles.buttonText}>Vérifier</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={() => setShowOTP(false)}
            >
              <Text style={styles.resendText}>Changer de numéro</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Mode invité */}
        {mode === 'guest' && (
          <View style={styles.guestContainer}>
            <Text style={styles.guestInfo}>
              🔓 En mode invité, vous pouvez:{'\n\n'}
              • Parcourir le catalogue{'\n'}
              • Lire les livres gratuits{'\n'}
              • Découvrir les auteurs haïtiens{'\n\n'}
              ⚠️ Pour sauvegarder votre progression et débloquer des livres payants, créez un compte.
            </Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => onLogin('guest')}
            >
              <Text style={styles.buttonText}>Commencer en invité</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bouton mode invité (si pas déjà en mode invité) */}
        {mode !== 'guest' && !showOTP && (
          <>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>
            <TouchableOpacity 
              style={[styles.button, styles.buttonGuest]}
              onPress={() => setMode('guest')}
            >
              <Text style={[styles.buttonText, styles.buttonGuestText]}>
                Continuer sans compte (Invité)
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            En continuant, vous acceptez nos{' '}
            <Text style={styles.link}>Conditions d'utilisation</Text>{' '}
            et notre{' '}
            <Text style={styles.link}>Politique de confidentialité</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
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
    fontSize: 18,
    color: colors.white,
    opacity: 0.9,
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 32,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: colors.white,
    borderColor: colors.gray[300],
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  socialIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[700],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[300],
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.gray[500],
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    fontSize: 16,
    marginBottom: 16,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonOutline: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonOutlineText: {
    color: colors.primary,
  },
  buttonGuest: {
    backgroundColor: colors.gray[100],
  },
  buttonGuestText: {
    color: colors.gray[700],
  },
  otpInstruction: {
    fontSize: 16,
    color: colors.gray[700],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  phoneNumber: {
    fontWeight: '600',
    color: colors.primary,
  },
  resendButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  resendText: {
    color: colors.gray[500],
    fontSize: 14,
  },
  guestContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  guestInfo: {
    fontSize: 15,
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: 20,
  },
  footer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
