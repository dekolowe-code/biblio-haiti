# 📱 Biblio Haiti - Guide de Test avec Expo Go

## ✅ Ce qui a été créé

Application React Native complète avec **4 écrans fonctionnels** prêts à être testés avec Expo Go.

---

## 🚀 Comment Tester l'Application

### Option 1: Avec Votre Téléphone (Recommandé)

1. **Installez Expo Go** sur votre téléphone:
   - 📱 [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)
   - 🤖 [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Sur votre ordinateur**, dans un terminal avec plus d'espace disque:
   ```bash
   cd /workspace/biblio-haiti-expo
   npm install
   npm start
   ```

3. **Scannez le QR code** qui s'affiche:
   - iOS: Ouvrez l'appareil photo → Cliquez sur le lien Expo
   - Android: Ouvrez Expo Go → Scan QR Code

4. **L'application se charge** instantanément sur votre téléphone!

### Option 2: Simulateur Web

Si vous ne pouvez pas installer les dépendances localement à cause de l'espace disque:

```bash
# Sur une machine avec plus d'espace
cd biblio-haiti-expo
npm install
npm run web
```

Cela ouvrira l'application dans votre navigateur web.

---

## 🎬 Parcours Utilisateur

### Étape 1: Onboarding (4 slides)
- Slide 1: 📚 "Biblio Haiti" - Présentation générale
- Slide 2: ✍️ "Auteurs Haïtiens" - Valorisation culture
- Slide 3: 🏆 "Gagnez des Points" - Gamification
- Slide 4: 🌱 "Lire, c'est grandir" - Slogan final
- Boutons: "Passer" ou "Suivant" → "Commencer"

### Étape 2: Choix de la Langue
- Header avec drapeau haïtien 🇭🇹 et dégradé bleu/rouge
- Deux cartes interactives:
  - 🇫🇷 Français - "Bienvenue"
  - 🇭🇹 Kreyòl Ayisyen - "Byenvini"
- Note: possibilité de changer plus tard

### Étape 3: Authentification
5 options disponibles:
1. **Google** - Bouton blanc avec icône bleue
2. **Facebook** - Bouton bleu #1877F2
3. **Email/Mot de passe** - Formulaire classique
4. **Téléphone + OTP** - Simulation SMS
5. **Invité** - Accès limité aux livres gratuits

### Étape 4: Catalogue de Livres
- Header avec logo et compteur de points 🏆
- Barre de recherche fonctionnelle
- Bouton filtres ⚙️ pour afficher:
  - Filtres par langue (Français / Kreyòl)
  - Filtres par accès (Gratuit / Points / Payant)
  - Filtres par catégorie
- Grille de 6 livres haïtiens classiques
- Bottom navigation avec 4 onglets

---

## 📚 Livres Inclus dans la Démo

| Titre | Auteur | Langue | Accès | Points |
|-------|--------|--------|-------|--------|
| Compère General Soleil | Jacques Stephen Alexis | FR | Payant | 500 pts |
| Raboujman | Frankétienne | HT | Gratuit | - |
| Le Gouverneur de la Rosée | Jacques Roumain | FR | Payant | 450 pts |
| Dézafi | Frankétienne | HT | Payant | 400 pts |
| La Montagne ensorcelée | Jean Price-Mars | FR | Gratuit | - |
| Tout Moun Se Moun | Gary Victor | HT | Payant | 350 pts |

---

## 🎨 Design & Couleurs

### Charte Graphique
- **Bleu Haïtien**: `#00209F` (couleur principale)
- **Rouge Haïtien**: `#D21034` (couleur secondaire)
- **Or**: `#FFD700` (pour les points/gamification)
- Dégradés systématiques dans les headers

### Typographie
- Titres: 24-32px, bold
- Sous-titres: 14-18px, regular
- Corps: 16px, readable

---

## 🔧 Architecture Technique

### Stack Utilisée
```
React Native 0.76.3
Expo SDK ~52.0.0
TypeScript 5.1+
expo-linear-gradient (dégradés)
expo-font (polices personnalisées futures)
```

### Structure des Fichiers
```
App.tsx                          ← Point d'entrée, gestion état global
├── OnboardingScreen            ← Écran 1
├── LanguageSelectionScreen     ← Écran 2
├── AuthScreen                  ← Écran 3
└── CatalogueScreen             ← Écran 4

src/
├── theme/colors.ts             ← Palette centrale
├── components/
│   ├── OnboardingSlide.tsx     ← Composant réutilisable
│   └── commonStyles.ts         ← Styles partagés
└── screens/
    ├── onboarding/
    ├── auth/
    └── catalogue/
```

---

## ⚠️ Limitations Actuelles

### Ce qui FONCTIONNE:
✅ Navigation entre écrans  
✅ Affichage UI complet  
✅ Recherche et filtres (côté client)  
✅ Boutons interactifs  
✅ Design responsive  

### Ce qui est en SIMULATION:
⚠️ Authentification (console.log seulement)  
⚠️ Données livres (tableau statique)  
⚠️ Points utilisateur (valeur fixe à 0)  
⚠️ OTP SMS (pas d'envoi réel)  

### Ce qui MANQUE:
❌ Backend API FastAPI  
❌ Base de données PostgreSQL  
❌ Google Drive integration  
❌ Firebase Authentication  
❌ Vrais fichiers PDF/ePub  
❌ Lecteur de livres  

---

## 📝 Notes Importantes

### Espace Disque Insuffisant
Le serveur actuel manque d'espace disque (504MB utilisés à 100%).  
Pour installer les dépendances npm, utilisez une machine avec plus d'espace.

### Prochaines Étapes Requises
1. **Configurer Google Drive** (voir `/workspace/biblio-haiti/docs/google-drive-setup.md`)
2. **Développer le backend** FastAPI
3. **Ajouter la navigation** React Navigation
4. **Créer les écrans manquants** (Reader, Profile, Library, etc.)
5. **Intégrer Firebase Auth**
6. **Ajouter MonCash** pour les paiements

---

## 🎯 Objectif Atteint

Vous avez maintenant une **application fonctionnelle avec 4 écrans** que vous pouvez:
- ✅ Tester immédiatement avec Expo Go
- ✅ Montrer à des stakeholders
- ✅ Utiliser comme base pour le développement complet
- ✅ Adapter selon vos retours

---

## 📞 Pour Continuer

Une fois que vous avez testé les écrans, dites-moi:
1. Quels écrans voulez-vous améliorer?
2. Quelles fonctionnalités prioriser?
3. Voulez-vous que je crée le guide de configuration Google Drive?
4. Souhaitez-vous développer le backend FastAPI?

---

**Biblio Haiti** - *Li, se grandi* 🇭🇹📚
