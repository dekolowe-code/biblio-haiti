# 📱 Biblio Haiti - Écrans de l'Application

Ce document présente les écrans principaux de l'application mobile Biblio Haiti développée avec **React Native**.

---

## 🎨 Structure des Écrans

```
frontend/src/screens/
├── onboarding/
│   ├── OnboardingScreen.js        # Écran d'introduction (4 slides)
│   └── LanguageSelectionScreen.js # Sélection de la langue
├── auth/
│   └── AuthScreen.js              # Connexion / Inscription
├── catalogue/
│   └── CatalogueScreen.js         # Page d'accueil avec livres
├── reader/
│   └── (à venir)                  # Lecteur de livres
├── profile/
│   └── (à venir)                  # Profil utilisateur
└── gamification/
    └── (à venir)                  # Points, badges, quiz
```

---

## 📋 Description des Écrans

### 1. OnboardingScreen.js
**Objectif** : Présenter l'application aux nouveaux utilisateurs

**Fonctionnalités** :
- ✅ 4 slides illustrées avec dégradés aux couleurs nationales
- ✅ Bouton "Passer" pour skipper l'onboarding
- ✅ Pagination avec points indicateurs
- ✅ Bouton "Suivant" contextuel
- ✅ Navigation vers la sélection de langue

**Éléments visuels** :
- Couleurs : Bleu (#00209F) et Rouge (#D21034)
- Illustrations placeholder (à remplacer par des illustrations personnalisées)
- Animations de transition fluides

**Code** : `/workspace/biblio-haiti/frontend/src/screens/onboarding/OnboardingScreen.js`

---

### 2. LanguageSelectionScreen.js
**Objectif** : Permettre à l'utilisateur de choisir sa langue préférée

**Fonctionnalités** :
- ✅ Choix entre Français et Kreyòl Ayisyen
- ✅ Cartes interactives avec drapeaux
- ✅ Indicateur de sélection (checkmark)
- ✅ Stockage local de la préférence (AsyncStorage à implémenter)
- ✅ Modification possible dans les paramètres

**Éléments visuels** :
- Dégradé bleu en fond
- Cartes avec effets de survol
- Bouton "Continuer" conditionnel

**Code** : `/workspace/biblio-haiti/frontend/src/screens/onboarding/LanguageSelectionScreen.js`

---

### 3. AuthScreen.js
**Objectif** : Authentification multi-options adaptée au contexte haïtien

**Fonctionnalités** :
- ✅ Onglets Connexion / Inscription
- ✅ Connexion par email + mot de passe
- ✅ Google OAuth (bouton prêt à intégrer)
- ✅ Facebook OAuth (bouton prêt à intégrer)
- ✅ Numéro de téléphone + OTP SMS
- ✅ Mode invité (accès limité aux livres gratuits)
- ✅ Réinitialisation de mot de passe

**Adaptation contexte haïtien** :
- Format de téléphone : +509 XX XX XX XX
- OTP par SMS (coût réduit)
- Option "Mode Invité" pour tester sans engagement

**Éléments visuels** :
- Logo animé avec dégradé national
- Formulaires épurés et accessibles
- Boutons sociaux reconnaissables

**Code** : `/workspace/biblio-haiti/frontend/src/screens/auth/AuthScreen.js`

---

### 4. CatalogueScreen.js
**Objectif** : Présenter le catalogue de livres avec filtres intelligents

**Fonctionnalités** :
- ✅ Barre de recherche intégrée
- ✅ Filtres : Tous / Gratuits / Points
- ✅ Catégories horizontales scrollables
- ✅ Livres en vedette (featured)
- ✅ Tendances en Haïti 🔥
- ✅ Recommandations personnalisées (utilisateurs connectés)
- ✅ Navigation bottom bar (5 onglets)
- ✅ Support mode invité

**Système d'accès** :
- 🟢 Gratuit : Badge vert "Gratuit"
- 🟠 Points : Badge orange avec nombre de points requis

**Données factices incluses** :
- 6 catégories (Roman, Poésie, Éducation, Histoire, Science, Religion)
- 5 livres exemples avec auteurs haïtiens célèbres
- Système de notation (étoiles)

**Éléments visuels** :
- Header avec dégradé bleu
- Cartes livres avec couvertures colorées
- Bottom navigation fixe

**Code** : `/workspace/biblio-haiti/frontend/src/screens/catalogue/CatalogueScreen.js`

---

## 🚀 Prochains Écrans à Développer

### 5. BookDetailScreen.js (À FAIRE)
- Détails du livre (résumé, auteur, avis)
- Bouton "Lire maintenant" ou "Débloquer"
- Section commentaires et notes
- Livres similaires

### 6. ReaderScreen.js (À FAIRE)
- Lecteur PDF/ePub intégré
- Contrôles : police, taille, thème (sombre/clair/sépia)
- Signets et surlignage
- Progression de lecture
- Mode hors-ligne

### 7. ProfileScreen.js (À FAIRE)
- Informations utilisateur
- Statistiques de lecture
- Historique des achats
- Paramètres de l'application
- Gestion des appareils connectés

### 8. LibraryScreen.js (À FAIRE)
- Mes livres (achetés/débloqués)
- En cours de lecture
- Terminés
- Favoris

### 9. PointsScreen.js (À FAIRE)
- Solde de points
- Historique des gains
- Boutique de points (déblocage)
- Quêtes et défis du jour

### 10. QuizScreen.js (À FAIRE)
- Quiz de compréhension
- Mini-jeux vocabulaire
- Résultats et points gagnés
- Classement hebdomadaire

---

## 🎯 Fonctionnalités Clés par Écran

| Écran | Features Principales | Status |
|-------|---------------------|--------|
| Onboarding | 4 slides, animations, skip | ✅ Complet |
| LanguageSelection | FR/HT, stockage local | ✅ Complet |
| Auth | Email, Google, FB, Phone+OTP, Guest | ✅ Complet |
| Catalogue | Recherche, filtres, catégories, bottom nav | ✅ Complet |
| BookDetail | Détails, déblocage, avis | ⏳ À faire |
| Reader | Lecture, personnalisation, offline | ⏳ À faire |
| Profile | Stats, historique, paramètres | ⏳ À faire |
| Library | Mes livres, progression | ⏳ À faire |
| Points | Solde, boutique, quêtes | ⏳ À faire |
| Quiz | Quiz, jeux, classement | ⏳ À faire |

---

## 🛠️ Technologies Utilisées

- **React Native** : Framework mobile cross-platform
- **Expo** : Outil de développement et build
- **expo-linear-gradient** : Dégradés de couleurs
- **React Navigation** : Navigation entre écrans
- **AsyncStorage** : Stockage local (à implémenter)
- **Firebase Auth** : Authentification (à intégrer)
- **Axios** : Appels API (à intégrer)

---

## 📦 Installation et Lancement

### Prérequis
```bash
node --version  # v16+ recommandé
npm --version   # v8+ recommandé
```

### Installation
```bash
cd /workspace/biblio-haiti/frontend

# Installer les dépendances
npm install

# Ou avec yarn
yarn install
```

### Lancement (Expo)
```bash
# Démarrer le serveur de développement
npx expo start

# Ouvrir sur iOS Simulator
npx expo start --ios

# Ouvrir sur Android Emulator
npx expo start --android

# Scanner QR code avec Expo Go app
```

---

## 🎨 Charte Graphique

### Couleurs Nationales
```javascript
const colors = {
  primary: '#00209F',    // Bleu drapeau haïtien
  secondary: '#D21034',  // Rouge drapeau haïtien
  success: '#00A86B',    // Vert pour "Gratuit"
  warning: '#FF8C00',    // Orange pour "Points"
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
};
```

### Typographie
- **Titres** : Bold, 24-32px
- **Sous-titres** : Semi-Bold, 18-20px
- **Corps** : Regular, 14-16px
- **Labels** : Medium, 12-14px

### Espacement
- Marges : 20px (standard), 15px (compact)
- Padding boutons : 14-16px vertical
- Border radius : 10-15px (cartes), 20-30px (boutons)

---

## 🔄 Navigation Flow

```
Splash Screen
    ↓
Onboarding (premier lancement seulement)
    ↓
Language Selection
    ↓
Auth (Login/Signup/Guest)
    ↓
Catalogue (Main App)
    ├── Book Detail
    │       ↓
    │   Reader
    ├── Library
    ├── Points
    ├── Profile
    └── Search
```

---

## 📝 Notes Importantes

### Pour les Développeurs
1. **Placeholder Images** : Les images d'onboarding sont des placeholders. Remplacer par de vraies illustrations haïtiennes.
2. **API Integration** : Tous les appels API sont actuellement mockés (`console.log`). Intégrer le backend FastAPI.
3. **Authentication** : Firebase Auth doit être configuré avec les bons credentials.
4. **Google Drive** : Suivre le guide `/docs/google-drive-setup.md` pour configurer le stockage.

### Pour les Designers
1. **Illustrations** : Créer 4 illustrations pour l'onboarding représentant :
   - La bienvenue et la découverte
   - Les auteurs haïtiens
   - La gamification (points, badges)
   - La lecture hors-ligne
2. **Couvertures de livres** : Créer de vraies couvertures pour les livres exemples.
3. **Icônes** : Uniformiser le style des icônes (emoji → icônes vectorielles).

---

## ✅ Checklist de Validation

- [x] OnboardingScreen créé et fonctionnel
- [x] LanguageSelectionScreen créé et fonctionnel
- [x] AuthScreen avec toutes les méthodes de connexion
- [x] CatalogueScreen avec filtres et navigation
- [ ] BookDetailScreen à développer
- [ ] ReaderScreen à développer
- [ ] ProfileScreen à développer
- [ ] LibraryScreen à développer
- [ ] PointsScreen à développer
- [ ] QuizScreen à développer
- [ ] Intégration API backend
- [ ] Tests unitaires
- [ ] Tests e2e

---

**Prochaine étape** : Développer les écrans manquants et intégrer le backend FastAPI avec Google Drive !
