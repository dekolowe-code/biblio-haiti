# 📚 Biblio Haïti — Application Mobile

Application mobile React Native + Expo pour Biblio Haïti, le portage mobile de la bibliothèque numérique haïtienne.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- pnpm ou npm
- [Expo Go](https://expo.dev/client) sur votre téléphone (iOS ou Android)

### Installation

```bash
cd mobile-app
npm install
```

### Configuration de l'environnement

Copiez `.env.example` en `.env` et remplissez les valeurs :

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
EXPO_PUBLIC_MISTRAL_API_KEY=votre_clé_mistral  # Optionnel pour le chat IA
```

> Les valeurs Supabase sont les mêmes que celles du projet web (`app/`).

### Lancement

```bash
npm start
```

Scannez le QR code avec l'app **Expo Go** sur votre téléphone.

---

## 📁 Structure du projet

```
mobile-app/
├── app/                    # Expo Router (file-based routing)
│   ├── _layout.tsx         # Root layout (providers)
│   ├── index.tsx           # Redirect vers home
│   ├── (auth)/             # Écrans connexion/inscription
│   ├── (tabs)/             # Navigation principale (4 onglets)
│   ├── book/[id].tsx       # Détail d'un livre
│   ├── reader/[id].tsx     # Lecteur EPUB/PDF/Texte
│   └── quiz/[bookId].tsx   # Quiz IA
├── components/             # Composants réutilisables
│   ├── ui/                 # Button, Input, Badge, etc.
│   ├── books/              # BookCard, CategoryPill, SearchBar
│   └── layout/             # Header, SafeAreaWrapper
├── context/                # React Context (Theme, Auth, Library)
├── lib/                    # Services (Supabase, IA, notifications)
├── store/                  # Zustand stores (lecture, livres, settings)
├── constants/              # Colors.ts, Typography.ts
└── types/                  # Types TypeScript
```

## 🎨 Design

- **Couleur primaire** : `#1a56db` (bleu Haïti)
- **Accent** : `#f59e0b` (or)
- Design identique à l'app web (même palette, icônes Lucide)
- Support dark/light/système avec persistance

## ✨ Fonctionnalités

- ✅ Catalogue de livres (EPUB, PDF, Texte)
- ✅ Lecteur intégré avec contrôles
- ✅ Bibliothèque personnelle
- ✅ Authentification Supabase
- ✅ Quiz IA (Mistral)
- ✅ Mode sombre/clair/système
- ✅ Téléchargement hors-ligne
- ✅ Notifications push (rappel lecture)
- ✅ Persistance locale (Zustand + AsyncStorage)
- ✅ Haptic feedback

## 🔧 Technologies

| Technologie | Usage |
|---|---|
| Expo SDK 52 | Framework mobile |
| Expo Router v4 | Navigation |
| Supabase | Backend / Auth |
| Zustand | State management |
| lucide-react-native | Icônes |
| expo-notifications | Push notifications |
| expo-file-system | Stockage offline |
| expo-haptics | Retour tactile |
| react-hook-form + zod | Formulaires |
