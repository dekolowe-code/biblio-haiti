import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthScreen({ navigation }) {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [loginMethod, setLoginMethod] = useState('email'); // 'email', 'google', 'facebook', 'phone'
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);

  const handleEmailLogin = () => {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs');
      return;
    }
    // API call to backend
    console.log('Login with:', email);
    navigation.replace('MainApp');
  };

  const handleGoogleLogin = () => {
    // Google OAuth implementation
    console.log('Google login');
    navigation.replace('MainApp');
  };

  const handleFacebookLogin = () => {
    // Facebook OAuth implementation
    console.log('Facebook login');
    navigation.replace('MainApp');
  };

  const handlePhoneLogin = () => {
    if (!phone) {
      Alert.alert('Numéro requis', 'Veuillez entrer votre numéro de téléphone');
      return;
    }
    // Send OTP via SMS
    setShowOTPInput(true);
    Alert.alert('OTP envoyé', `Code envoyé au ${phone}`);
  };

  const handleOTPVerify = () => {
    if (!otp) {
      Alert.alert('OTP requis', 'Veuillez entrer le code reçu');
      return;
    }
    // Verify OTP
    navigation.replace('MainApp');
  };

  const handleGuestMode = () => {
    navigation.replace('Catalogue', { isGuest: true });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#00209F', '#D21034']}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoText}>BH</Text>
          </LinearGradient>
        </View>
        <Text style={styles.appName}>Biblio Haiti</Text>
        <Text style={styles.slogan}>Lire, c'est grandir • Li, se grandi</Text>
      </View>

      {/* Auth Mode Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, authMode === 'login' && styles.activeTab]}
          onPress={() => setAuthMode('login')}
        >
          <Text style={[styles.tabText, authMode === 'login' && styles.activeTabText]}>
            Connexion
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, authMode === 'signup' && styles.activeTab]}
          onPress={() => setAuthMode('signup')}
        >
          <Text style={[styles.tabText, authMode === 'signup' && styles.activeTabText]}>
            Inscription
          </Text>
        </TouchableOpacity>
      </View>

      {/* Login Methods */}
      {authMode === 'login' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Choisissez votre méthode de connexion</Text>

          {/* Social Login Buttons */}
          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
            <Text style={styles.socialIcon}>G</Text>
            <Text style={styles.socialButtonText}>Continuer avec Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin}>
            <Text style={styles.socialIconFb}>f</Text>
            <Text style={styles.socialButtonText}>Continuer avec Facebook</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Login */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => setAuthMode('forgot')}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={handleEmailLogin}>
              <Text style={styles.primaryButtonText}>Se connecter</Text>
            </TouchableOpacity>
          </View>

          {/* Phone Login */}
          <View style={styles.phoneContainer}>
            <Text style={styles.orText}>Ou connectez-vous avec votre téléphone</Text>
            
            {!showOTPInput ? (
              <>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="+509 XX XX XX XX"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <TouchableOpacity style={styles.secondaryButton} onPress={handlePhoneLogin}>
                  <Text style={styles.secondaryButtonText}>Recevoir le code OTP</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.otpInput}
                  placeholder="Entrez le code à 6 chiffres"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity style={styles.secondaryButton} onPress={handleOTPVerify}>
                  <Text style={styles.secondaryButtonText}>Vérifier le code</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}

      {/* Signup Form */}
      {authMode === 'signup' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Créez votre compte</Text>
          
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Nom complet</Text>
            <TextInput
              style={styles.input}
              placeholder="Jean Pierre"
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Numéro de téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="+509 XX XX XX XX"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
            />

            <Text style={styles.termsText}>
              En vous inscrivant, vous acceptez nos{' '}
              <Text style={styles.linkText}>Conditions d'utilisation</Text> et notre{' '}
              <Text style={styles.linkText}>Politique de confidentialité</Text>
            </Text>

            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>S'inscrire</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
            <Text style={styles.socialIcon}>G</Text>
            <Text style={styles.socialButtonText}>S'inscrire avec Google</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Forgot Password */}
      {authMode === 'forgot' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Réinitialiser le mot de passe</Text>
          <Text style={styles.infoText}>
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Envoyer le lien</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setAuthMode('login')}
          >
            <Text style={styles.backButtonText}>← Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Guest Mode */}
      <View style={styles.guestContainer}>
        <Text style={styles.guestText}>Vous voulez juste explorer ?</Text>
        <TouchableOpacity style={styles.guestButton} onPress={handleGuestMode}>
          <Text style={styles.guestButtonText}>Mode Invité</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoContainer: {
    marginBottom: 15,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00209F',
    marginBottom: 5,
  },
  slogan: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#00209F',
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 12,
  },
  socialIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 10,
  },
  socialIconFb: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1877F2',
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: '#00209F',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#00209F',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  phoneContainer: {
    marginTop: 10,
  },
  orText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
    fontSize: 14,
  },
  phoneInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  otpInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlign: 'center',
    letterSpacing: 5,
  },
  secondaryButton: {
    backgroundColor: '#D21034',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  linkText: {
    color: '#00209F',
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#00209F',
    fontSize: 16,
    fontWeight: '600',
  },
  guestContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  guestText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  guestButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#00209F',
    borderRadius: 25,
  },
  guestButtonText: {
    color: '#00209F',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 30,
  },
});
