# Biblio-Haïti Native - Application React Native Expo

Application mobile de bibliothèque culturelle haïtienne développée avec **React Native Expo SDK 54.0.6**.

## 🚀 Fonctionnalités

### Fonctionnalités principales (mêmes que le web)
- 📚 Catalogue de livres culturels haïtiens
- 📖 Lecture de livres avec progression sauvegardée
- ⭐ Système d'étoiles et récompenses
- 🎯 Quiz interactifs sur la culture haïtienne
- 🔐 Authentification utilisateur
- 📱 Navigation mobile optimisée
- 💾 Bibliothèque personnelle (en cours, favoris, débloqués)

### Fonctionnalités mobiles exclusives

#### 🔔 Notifications de rappel de lecture
- Notification quotidienne configurable (par défaut 19h00)
- Rappel motivant pour encourager la lecture
- Canal de notification Android dédié
- Permission demandée lors du premier lancement

#### 🛡️ Protection contre les captures d'écran
- Blocage des captures d'écran dans l'écran de lecture
- Détection des tentatives de screenshot
- Protection du contenu des livres (DRM léger)
- Empêche le téléchargement non autorisé

#### 📱 Page d'accueil (Onboarding)
- Écran de bienvenue au premier lancement
- 3 slides présentatifs de l'application
- Demande de permission pour les notifications
- Configuration automatique des rappels
- Animation fluide avec Reanimated

## 📁 Structure du projet

```
biblio-haiti-native/
├── app/                          # Routes Expo Router
│   ├── _layout.tsx              # Layout principal avec navigation
│   ├── index.tsx                # Écran de chargement initial
│   ├── onboarding.tsx           # Page d'accueil premier lancement
│   ├── home.tsx                 # Écran d'accueil principal
│   ├── catalogue.tsx            # Catalogue des livres
│   ├── book-detail.tsx          # Détail d'un livre
│   ├── reading.tsx              # Écran de lecture (protégé)
│   ├── library.tsx              # Bibliothèque personnelle
│   ├── quiz.tsx                 # Quiz
│   ├── profile.tsx              # Profil utilisateur
│   └── auth.tsx                 # Connexion/Inscription
├── src/
│   ├── components/              # Composants réutilisables
│   │   ├── BookCard.tsx         # Carte de livre
│   │   ├── CategoryPill.tsx     # Pilule de catégorie
│   │   └── MobileShell.tsx      # Shell de navigation
│   ├── context/
│   │   └── AuthContext.tsx      # Contexte d'authentification
│   ├── data/
│   │   └── mockData.ts          # Données mockées + stockage
│   ├── hooks/                   # Hooks personnalisés
│   ├── pages/                   # Pages (alternative)
│   └── utils/
│       ├── notifications.ts     # Gestion des notifications
│       └── screenCapture.ts     # Protection screenshots
├── assets/
│   ├── fonts/                   # Polices personnalisées
│   ├── icon.png                 # Icône de l'app
│   ├── splash-icon.png          # Écran de splash
│   └── adaptive-icon.png        # Icône adaptative Android
├── app.json                     # Configuration Expo
├── package.json                 # Dépendances
├── tsconfig.json               # Configuration TypeScript
└── babel.config.js             # Configuration Babel
```

## 🛠️ Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go sur votre téléphone (iOS/Android)

### Étapes d'installation

1. **Installer les dépendances**
```bash
cd biblio-haiti-native
npm install
```

2. **Copier les images depuis le projet web**
```bash
# Copier toutes les images du projet web vers assets/
cp ../app/public/* ./assets/
```

3. **Ajouter les polices** (optionnel mais recommandé)
- Télécharger les polices: Poppins, Inter, Merriweather
- Les placer dans `assets/fonts/`

4. **Démarrer l'application**
```bash
npm start
# ou
expo start
```

5. **Scanner le QR code**
- Avec Expo Go (iOS): Appareil photo
- Avec Expo Go (Android): Scanner dans l'app

## 🔧 Configuration des fonctionnalités mobiles

### Notifications
Les notifications sont configurées dans `src/utils/notifications.ts`:
- `requestNotificationPermission()`: Demande la permission
- `scheduleReadingReminder(hour, minute)`: Programme un rappel quotidien
- `createNotificationChannel()`: Crée le canal Android

### Protection Screenshots
La protection est activée dans `src/utils/screenCapture.ts`:
- `usePreventScreenCapture()`: Hook à utiliser dans ReadingScreen
- `preventScreenCaptureAsync()`: Bloque les captures
- Screenshot listener: Détecte les tentatives

### Stockage sécurisé
Utilisation de `expo-secure-store` pour:
- Informations utilisateur
- Progression de lecture
- Étoiles gagnées
- État de l'onboarding

## 📱 Écrans de l'application

### 1. Onboarding (Premier lancement)
- 3 slides animées
- Présentation des fonctionnalités
- Demande de permissions
- Configuration des notifications

### 2. Home (Accueil)
- Banner hero avec carousel
- Badge étoiles animé
- Catégories (pills horizontales)
- Livres recommandés
- Nouveautés
- Bannière Quiz CTA
- Liste des quiz disponibles

### 3. Catalogue
- Recherche de livres
- Filtres par catégorie, pays, style
- Grille de livres
- Pagination infinie

### 4. Book Detail
- Couverture du livre
- Description complète
- Auteur, catégorie, pays
- Bouton débloquer (si premium)
- Bouton ajouter aux favoris
- Progression de lecture

### 5. Reading Screen (🔒 Protégé)
- **Protection screenshot activée**
- Affichage page par page
- Contrôles de lecture (thème, taille)
- Barre de progression
- Navigation上一页/下一页
- Sauvegarde automatique

### 6. Library
- Onglets: En cours, Favoris, Débloqués
- Statistiques de lecture
- Progression circulaire
- Suppression de livres

### 7. Quiz
- Liste des quiz
- Questions à choix multiples
- Récompense en étoiles
- Résultats immédiats

### 8. Profile
- Informations utilisateur
- Solde d'étoiles
- Paramètres
- Déconnexion

## 🎨 Design System

### Couleurs (mêmes que le web)
- Primaire: `#9B1B30` (Rouge bordeaux)
- Secondaire: `#C41E3A` (Rouge)
- Accent: `#E85D04` (Orange)
- Or: `#FAA307` (Jaune/or)
- Fond: `#FFF8F0` (Crème)
- Texte: `#1A1A2E` (Bleu nuit)

### Polices
- Titres: **Poppins** (Bold, SemiBold, Medium, Regular)
- Corps: **Inter** (Regular)
- Lecture: **Merriweather** (Regular)

## 🔐 Sécurité

### Protection du contenu
1. **Screenshots bloqués** pendant la lecture
2. **Pas de téléchargement** des fichiers de livres
3. **Stockage sécurisé** avec expo-secure-store
4. **Contenu mocké** (à remplacer par une API sécurisée en production)

### Bonnes pratiques
- Utiliser HTTPS pour l'API en production
- Implémenter l'authentification JWT
- Chiffrer le contenu des livres
- Utiliser un DRM pour la protection avancée

## 🚧 Prochaines étapes

### À implémenter
1. [ ] Copier les images du projet web vers `assets/`
2. [ ] Ajouter les polices dans `assets/fonts/`
3. [ ] Créer les écrans manquants (home, catalogue, etc.)
4. [ ] Implémenter la navigation bottom tab
5. [ ] Connecter à une API backend (Supabase)
6. [ ] Tester sur appareil physique

### Améliorations possibles
- Mode hors ligne avec AsyncStorage
- Partage de livres (limité)
- Notes et surlignages
- Statistiques de lecture détaillées
- Badges et achievements
- Classement social

## 📦 Build pour production

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

### Configuration EAS
```bash
eas login
eas build:configure
```

## 🐛 Dépannage

### Problèmes courants
1. **Erreur de stockage**: Vider le cache Expo Go
2. **Notifications ne fonctionnent pas**: Vérifier les permissions
3. **Screenshots toujours possibles**: Tester sur appareil physique (pas en simulateur)
4. **Polices ne chargent pas**: Vérifier les chemins dans `_layout.tsx`

## 📄 Licence

Projet éducatif - Biblio-Haïti

## 👥 Contributeurs

Basé sur l'application web Biblio-Haïti existante.
