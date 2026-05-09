# Biblio Haiti - Application React Native Expo

## 📱 Application Mobile de Bibliothèque Numérique Haïtienne

Application mobile développée avec **React Native** et **Expo Go** pour tester rapidement les écrans.

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ installé
- npm ou yarn
- **Expo Go** installé sur votre téléphone (iOS/Android)
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Installation

```bash
cd biblio-haiti-expo

# Installer les dépendances (quand l'espace disque le permet)
npm install

# Démarrer le serveur de développement
npm start
```

### Tester avec Expo Go

1. Lancez `npm start`
2. Scannez le QR code affiché avec:
   - **iOS**: Appareil photo → Ouvrir avec Expo Go
   - **Android**: App Expo Go → Scan QR Code
3. L'application se charge sur votre téléphone!

---

## 📁 Structure du Projet

```
biblio-haiti-expo/
├── App.tsx                      # Point d'entrée principal
├── app.json                     # Configuration Expo
├── package.json                 # Dépendances
├── assets/                      # Images, icônes, splash screen
└── src/
    ├── screens/
    │   ├── onboarding/
    │   │   ├── OnboardingScreen.tsx        ✅ Écran d'introduction (4 slides)
    │   │   └── LanguageSelectionScreen.tsx ✅ Choix de la langue
    │   ├── auth/
    │   │   └── AuthScreen.tsx              ✅ Authentification multi-options
    │   └── catalogue/
    │       └── CatalogueScreen.tsx         ✅ Catalogue avec filtres
    ├── components/
    │   ├── OnboardingSlide.tsx             ✅ Composant slide onboarding
    │   └── commonStyles.ts                 ✅ Styles partagés
    └── theme/
        ├── colors.ts                       ✅ Palette de couleurs
        └── index.ts                        ✅ Export du thème
```

---

## 🎨 Écrans Implémentés

### 1. **OnboardingScreen** 
- 4 slides animées aux couleurs nationales (bleu #00209F, rouge #D21034)
- Présentation des fonctionnalités clés
- Indicateurs de progression
- Boutons "Suivant" / "Passer"

### 2. **LanguageSelectionScreen**
- Choix entre Français et Kreyòl Ayisyen
- Design avec dégradé aux couleurs haïtiennes
- Cartes interactives pour chaque langue

### 3. **AuthScreen**
- **5 modes d'authentification**:
  - Email + mot de passe
  - Google OAuth (bouton prêt)
  - Facebook OAuth (bouton prêt)
  - Téléphone + OTP SMS
  - Mode Invité (accès livres gratuits)
- Champs de formulaire stylisés
- Conditions d'utilisation

### 4. **CatalogueScreen**
- Barre de recherche fonctionnelle
- **3 systèmes de filtres**:
  - Langue (Français / Kreyòl)
  - Type d'accès (Gratuit / Points / Payant)
  - Catégories (Romans, Poésie, Histoire...)
- Grille de livres avec couvertures emoji (démo)
- Badges: Gratuit, Points, Langue, Rating
- Bottom navigation (Accueil, Bibliothèque, Points, Profil)
- Affichage des points utilisateur

---

## 🎯 Fonctionnalités Clés

### Couleurs Nationales
- **Bleu Haïtien**: #00209F
- **Rouge Haïtien**: #D21034
- Dégradés dans tous les headers

### Bilingue FR/HT
- Tous les textes importants en français ET kreyòl
- Système de langue extensible

### Gamification
- Système de points visible dans le header
- Prêt pour l'intégration des badges et niveaux

### Livres Haïtiens
- Auteurs classiques intégrés dans la démo:
  - Jacques Stephen Alexis
  - Frankétienne
  - Jacques Roumain
  - Jean Price-Mars
  - Gary Victor

---

## 🔧 Prochaines Étapes

### Backend (à développer)
- [ ] API FastAPI sur Render.com
- [ ] Base de données Neon PostgreSQL
- [ ] Intégration Google Drive pour stockage PDF/ePub
- [ ] Authentification Firebase
- [ ] URLs signées temporaires (30 min)

### Écrans à Ajouter
- [ ] ReaderScreen (lecteur intégré)
- [ ] LibraryScreen (bibliothèque personnelle)
- [ ] ProfileScreen (profil utilisateur)
- [ ] PointsScreen (gestion des points)
- [ ] QuizScreen (quiz de compréhension)
- [ ] PaymentScreen (MonCash, Stripe)

### Fonctionnalités à Implémenter
- [ ] Navigation React Navigation
- [ ] AsyncStorage pour persistance locale
- [ ] Gestion offline des livres
- [ ] Protection anti-piratage (FLAG_SECURE, DRM)
- [ ] Notifications push
- [ ] Dictionnaire intégré

---

## 📦 Dépendances Principales

```json
{
  "expo": "~52.0.0",
  "react": "18.3.1",
  "react-native": "0.76.3",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/stack": "^6.3.20",
  "expo-linear-gradient": "~13.0.2",
  "expo-font": "~13.0.1"
}
```

---

## 🌐 Ressources Utiles

- [Documentation Expo](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Guide Google Drive Setup](../docs/google-drive-setup.md)
- [Spécifications Complètes](../README.md)

---

## 📞 Support

Pour toute question ou problème:
- Vérifiez que Expo Go est à jour
- Redémarrez le serveur: `npm start --clear`
- Consultez les logs dans le terminal

---

**Développé avec ❤️ pour Haïti**  
*"Li, se grandi" - Lire, c'est grandir*
