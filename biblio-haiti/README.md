# 📚 Biblio Haiti - Application de Bibliothèque Numérique

## 🎯 Vision
Devenir la principale plateforme de lecture numérique en Haïti, valorisant la culture et la littérature haïtienne tout en rendant le savoir accessible à tous.

**Slogan :** "Lire, c'est grandir" / "Li, se grandi"

---

## 📋 Table des Matières

1. [Présentation du Projet](#1-présentation-du-projet)
2. [Stack Technique](#2-stack-technique)
3. [Fonctionnalités Détaillées](#3-fonctionnalités-détaillées)
4. [Gamification & Engagement](#4-gamification--engagement)
5. [Architecture Google Drive](#5-architecture-google-drive)
6. [Structure du Projet](#6-structure-du-projet)

---

## 1. Présentation du Projet

Biblio Haiti est une application mobile de bibliothèque numérique destinée au marché haïtien. Elle permet aux utilisateurs de lire des livres électroniques en français et en kreyol ayisyen, découvrir des auteurs haïtiens, gagner des points de fidélité et accéder à des contenus payants ou gratuits via un système de déblocage flexible.

### 1.1 Objectifs Principaux

- ✅ Offrir un accès facile aux livres en français et kreyol depuis un smartphone
- ✅ Valoriser les auteurs et éditeurs haïtiens locaux
- ✅ Créer un système de monétisation adapté au contexte haïtien (MonCash, points)
- ✅ Gamifier la lecture pour encourager les habitudes de lecture régulières
- ✅ Protéger le contenu des éditeurs contre le piratage

### 1.2 Public Cible

| Segment | Description | Besoin Principal |
|---------|-------------|------------------|
| Étudiants | 15-25 ans, universités et lycées | Manuels, livres éducatifs |
| Professionnels | 25-45 ans, secteur formel | Développement personnel, romans |
| Enseignants | Tous âges, secteur éducation | Ressources pédagogiques |
| Diaspora | Haïtiens à l'étranger | Littérature et culture haïtienne |
| Invité | Sans compte | Livres gratuits uniquement |

---

## 2. Stack Technique

Tous les services utilisés disposent d'un plan gratuit généreux, permettant de lancer l'application sans frais initiaux.

| Service | Rôle | Plan Gratuit | Limite |
|---------|------|--------------|--------|
| **FastAPI (Python)** | Backend API REST | Render.com | 750h/mois |
| **Neon PostgreSQL** | Base de données | Gratuit | 0.5 GB |
| **Google Drive** | Fichiers livres (PDF/ePub) | Gratuit | 15 GB |
| **Cloudinary** | Images couvertures | Gratuit | 25 GB |
| **Firebase Auth** | Authentification | Gratuit | Illimité |
| **Cloudflare CDN** | Distribution + bande passante | Gratuit | Illimité |
| **React Native** | Application mobile iOS & Android | Open source | / |

### 2.1 Architecture Google Drive (Important)

**Modification clé :** Utilisation de **Google Drive Personnel** au lieu de Backblaze B2.

#### Configuration Requise :
1. **Compte Google** avec au moins 15 GB d'espace (gratuit)
2. **Google Cloud Platform** pour activer l'API Drive v3
3. **Credentials OAuth 2.0** (Service Account ou OAuth Client)
4. **Dossier partagé** pour stocker les fichiers livres

#### Règles de Sécurité :
- 🔒 Les fichiers Drive doivent rester **PRIVÉS**
- 🔑 Accès via **URLs signées temporaires** (30 min) générées par le backend
- 🚫 Jamais d'URLs publiques permanentes
- 🔐 Chiffrement AES-256 des fichiers avant upload
- 📱 Session liée à l'appareil (max 2 appareils simultanés)

#### Avantages Google Drive :
- ✅ 15 GB gratuit (partagé avec Gmail/Photos)
- ✅ Interface familière pour l'admin
- ✅ Pas de configuration CDN nécessaire (bande passante incluse)
- ✅ API mature et bien documentée
- ✅ Intégration facile avec Google OAuth

#### Limitations à considérer :
- ⚠️ Quota d'upload : 750 GB/jour (suffisant pour démarrer)
- ⚠️ Quota de téléchargement : 10 TB/jour (largement suffisant)
- ⚠️ Rate limiting : 100 requêtes/100 secondes par utilisateur
- ⚠️ Espace limité à 15 GB (vs 10 GB gratuits illimités chez B2)

---

## 3. Fonctionnalités Détaillées

### 3.1 Onboarding & Premier Lancement

#### Splash Screen
- Logo animé avec les couleurs nationales (bleu #00209F et rouge #D21034)
- Slogan : "Lire, c'est grandir" / "Li, se grandi"
- Durée : 2-3 secondes, puis redirection automatique

#### Écrans d'Introduction (Onboarding)
- 3 à 4 écrans illustrés présentant les fonctionnalités clés
- Bouton "Passer" disponible sur chaque écran
- Non réaffiché après le premier lancement (flag local)

#### Sélection de la Langue
- Français ou Kreyol ayisyen
- Préférence stockée localement (AsyncStorage)
- Modifiable à tout moment dans les paramètres

### 3.2 Authentification & Comptes

#### Modes de Connexion
- ✉️ Email + mot de passe (inscription classique)
- 🔵 Google OAuth (connexion en un clic)
- 🔵 Facebook OAuth
- 📱 Numéro de téléphone + OTP SMS (adapté au contexte haïtien)
- 👤 Mode invite : accès aux livres gratuits uniquement, sans création de compte

#### Profil Utilisateur
- Avatar personnalisable (photo ou initiales générées automatiquement)
- Bio courte
- Statistiques : livres lus, chapitres terminés, points cumulés
- Badges et niveau de lecteur
- Historique complet des achats et déblocages
- Gestion des appareils connectés

### 3.3 Catalogue & Recherche

#### Système de Filtres
- 🌍 Par pays d'origine de l'auteur (Haïti, France, USA, etc.)
- 📚 Par genre littéraire (Roman, Poésie, Éducation, Science, Religion, Histoire)
- 🗣️ Par langue (Français, Kreyol, Anglais, Espagnol)
- 💰 Par type d'accès (Gratuit / Payant / Débloquable par points)
- ⭐ Par note des lecteurs (1 à 5 étoiles)
- 📅 Par date d'ajout (Nouveautés, Cette semaine)

#### Recommandations Intelligentes
- Basées sur l'historique de lecture de l'utilisateur
- Section "Tendances en Haïti" mise à jour hebdomadairement
- Collections thématiques curées par l'admin
- "Lu par la communauté" : livres populaires cette semaine
- Mots-clés extraits du contenu pour améliorer la pertinence
- Recherche plein texte dans les titres, auteurs et descriptions

### 3.4 Système d'Accès & Paiement

#### Types d'Accès aux Livres

| Type | Description | Mode de Paiement |
|------|-------------|------------------|
| Gratuit permanent | Accès illimité sans paiement | Aucun |
| Déblocage 7 jours | Accès temporaire | Points ou argent |
| Déblocage 30 jours | Accès mensuel | Points ou argent |
| Accès à vie | Propriété permanente du livre | Points ou argent |
| Abonnement | Tous les livres illimités | Mensuel/Annuel |

#### Moyens de Paiement Acceptés
- 💵 **MonCash (Digicel Haïti)** - prioritaire
- 💵 Natcash
- 💳 Carte bancaire via Stripe (Visa, Mastercard)
- 🅿️ PayPal
- 🎯 Points de fidélité (Livres-Points)

#### Plans d'Abonnement

| Plan | Prix | Accès | Cible |
|------|------|-------|-------|
| Free | Gratuit | Livres gratuits uniquement | Tous |
| Basic | $2.99/mois | 10 livres/mois | Lecteurs occasionnels |
| Premium | $5.99/mois | Tout le catalogue | Lecteurs réguliers |
| Étudiant | $1.99/mois | Livres éducatifs illimités | Étudiants (ID requis) |
| Institution | Négociable | Multi-utilisateurs | Écoles / Entreprises |

### 3.5 Système de Points Fidélité (Livres-Points)

#### Comment Gagner des Points

| Action | Points Gagnés | Condition |
|--------|---------------|-----------|
| Terminer un chapitre | +5 pts | Lecture jusqu'à la fin détectée |
| Terminer un livre | +50 pts | Dernier chapitre terminé |
| Réussir un quiz | +10 à +30 pts | Score minimum 60% |
| Quiz parfait (100%) | +50 pts | Toutes les réponses correctes |
| Mini-jeu vocabulaire | +5 à +15 pts | Selon score obtenu |
| Connexion quotidienne | +2 pts | Une fois par jour |
| Streak 7 jours | +25 pts bonus | 7 connexions consécutives |
| Parrainer un ami | +100 pts | Ami inscrit via ton lien unique |
| Laisser un avis | +10 pts | Avis valide (>20 mots) |
| Acheter des points | Variable | Achat in-app en argent réel |

#### Comment Utiliser les Points
- 📖 Débloquer un livre pour 7 jours, 30 jours, ou à vie
- 🎁 Offrir un livre à un ami (cadeau via son identifiant)
- ⬆️ Monter de niveau lecteur (débloquer badges exclusifs)
- 🎧 Accéder à la version audio d'un livre (si disponible)

#### Niveaux de Lecteur

| Niveau | Points Requis | Badge | Avantages |
|--------|---------------|-------|-----------|
| Lecteur Débutant | 0 pts | 📕 | Accès standard |
| Lecteur Confirmé | 500 pts | 📗 | +10% points gagnés |
| Lecteur Avancé | 1000 pts | 📘 | +20% points gagnés |
| Maître des Lettres | 2500 pts | 📙 | +30% + badge exclusif |
| Légendaire Haïtien | 5000 pts | 👑 | Accès VIP + livre offert/mois |

### 3.6 Lecteur Intégré

#### Fonctionnalités de Lecture
- 🔤 Choix de la police (serif, sans-serif, monospace)
- 📏 Taille de texte réglable (5 niveaux)
- 🌙 Mode sombre, clair et sepia
- 🔆 Réglage de luminosité intégré à l'app
- 📴 Mode hors-ligne : les chapitres en cours sont mis en cache chiffrés
- 🔖 Signet automatique : reprendre exactement là où on s'est arrêté
- 🖍️ Surligner du texte (4 couleurs disponibles)
- 📝 Prendre des notes personnelles sur les passages
- 📖 Dictionnaire intégré (tap sur un mot pour la définition)
- 📤 Partager une citation (générée en image stylisée protégée)

### 3.7 Protection du Contenu (Anti-Piratage)

La protection du contenu est critique pour la confiance des éditeurs. Ces mesures doivent être implémentées dès la version 1.

#### Mesures Techniques
1. **FLAG_SECURE (Android)** : bloque tous les screenshots et enregistrements système au niveau de la fenêtre
2. **UIScreen.isCaptured (iOS)** : détecte en temps réel si l'écran est capturé et floute instantanément le contenu
3. **DRM sur les fichiers** : les livres sont chiffrés AES-256 et liés à l'identifiant unique de l'appareil
4. **Pas de téléchargement PDF** : le contenu est rendu exclusivement dans le viewer propriétaire de l'app
5. **URLs signées temporaires** : les fichiers Drive expirent après 30 minutes, impossible de partager un lien
6. **Session liée à l'appareil** : un compte ne peut être actif que sur 2 appareils maximum simultanément
7. **Filigrane invisible** : le texte contient des marqueurs invisibles identifiant l'utilisateur (pour tracer les fuites)

---

## 4. Gamification & Engagement

### 4.1 Quiz et Jeux
- ❓ Quiz de compréhension après chaque livre (10-15 questions)
- 🎮 Mini-jeu vocabulaire : retrouver la définition d'un mot du livre
- 🏆 Défi lecture : terminer un livre en X jours pour un bonus de points
- ✅ Questions "vrai ou faux" sur des faits du livre

### 4.2 Badges Collectionnables

| Badge | Condition | Récompense |
|-------|-----------|------------|
| Premier livre haïtien | Lire 1 livre d'un auteur haïtien | 30 pts bonus |
| Marathon de lecture | Lire 7 jours consécutifs | 50 pts bonus |
| Polyglotte | Lire en 2 langues différentes | 40 pts bonus |
| Encyclopédie | Lire 5 genres différents | 60 pts bonus |
| Ambassadeur | Parrainer 5 amis | 200 pts bonus |
| Quiz Master | 10 quiz avec score parfait | 100 pts bonus |

### 4.3 Fonctionnalités Sociales
- 💬 Laisser un avis et une note sur un livre (1-5 étoiles)
- 👀 Voir les livres lus par ses amis (opt-in dans les paramètres)
- 📤 Partager une citation en image stylisée sur les réseaux sociaux
- 🏆 Classement hebdomadaire des lecteurs les plus actifs
- 📚 Clubs de lecture : groupes de discussion autour d'un livre

### 4.4 Notifications Intelligentes
- 🔔 Rappel de lecture : "Tu n'as pas lu depuis 3 jours"
- ⏰ Expiration imminente : "Ton accès à [titre] expire dans 2 jours"
- 📢 Nouveau livre : "Un nouveau livre de ton genre préféré vient d'arriver"
- 🔥 Streak en danger : "Continue ta série de 6 jours - lis aujourd'hui !"
- ✅ Résultat de quiz : confirmation des points gagnés

---

## 5. Architecture Google Drive

### 5.1 Configuration Google Cloud Platform

#### Étapes de Configuration :
1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com/)
2. Activer l'API **Google Drive API v3**
3. Créer des credentials :
   - Option A : **Service Account** (recommandé pour le backend)
   - Option B : **OAuth 2.0 Client ID** (pour l'authentification utilisateur)
4. Configurer les scopes nécessaires :
   - `drive.file` : Gestion des fichiers créés par l'app
   - `drive.readonly` : Lecture des fichiers partagés
   - `drive.metadata.readonly` : Lecture des métadonnées

### 5.2 Structure des Dossiers Drive

```
Biblio Haiti/
├── 📁 Livres/
│   ├── 📁 PDF/
│   ├── 📁 ePub/
│   └── 📁 Audio/
├── 📁 Couvertures/
├── 📁 Temporaire/
└── 📁 Archives/
```

### 5.3 Flux de Téléchargement Sécurisé

```
Utilisateur → App Mobile → Backend FastAPI → Google Drive
     ↓              ↓            ↓              ↓
  Demande      Vérifie      Génère URL      Fichier
  de lecture   permissions  signée (30min)   Privé
     ↓              ↓            ↓              ↓
  Affiche ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  dans lecteur
```

### 5.4 Implémentation Backend (Aperçu)

```python
# Exemple de génération d'URL signée pour Google Drive
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io
import tempfile
from cryptography.fernet import Fernet

class GoogleDriveService:
    def __init__(self, credentials_path: str):
        self.creds = service_account.Credentials.from_service_account_file(
            credentials_path,
            scopes=['https://www.googleapis.com/auth/drive.readonly']
        )
        self.service = build('drive', 'v3', credentials=self.creds)
    
    async def get_temporary_download_url(self, file_id: str, user_id: str) -> str:
        """
        Génère une URL de téléchargement temporaire sécurisée
        Valide pendant 30 minutes maximum
        """
        # Vérifier les permissions utilisateur
        # Vérifier la session appareil
        # Générer URL signée avec token JWT
        # Retourner URL temporaire
        
        return f"https://drive.google.com/uc?id={file_id}&export=download&token={signed_token}"
    
    async def download_and_decrypt(self, file_id: str, device_key: str) -> bytes:
        """
        Télécharge le fichier chiffré et le déchiffre avec la clé appareil
        """
        request = self.service.files().get_media(fileId=file_id)
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        
        done = False
        while done is False:
            status, done = downloader.next_chunk()
        
        encrypted_data = fh.getvalue()
        
        # Déchiffrement AES-256
        fernet = Fernet(device_key.encode())
        decrypted_data = fernet.decrypt(encrypted_data)
        
        return decrypted_data
```

### 5.5 Comparaison : Google Drive vs Backblaze B2

| Critère | Google Drive | Backblaze B2 + Cloudflare |
|---------|--------------|---------------------------|
| Stockage gratuit | 15 GB | 10 GB |
| Bande passante | Incluse (quota journalier) | Gratuite avec Cloudflare |
| Configuration | Simple (Google Cloud) | Complexe (B2 + Cloudflare) |
| URLs signées | Support natif | Via signature S3 |
| Interface admin | Excellente (Drive UI) | Technique (Backblaze UI) |
| Évolutivité | Limité à 15 GB gratuit | 10 GB gratuit, puis $0.005/GB |
| Coût supplémentaire | $1.99/mois pour 100 GB | $0.005/GB stocké |
| Intégration OAuth | Native Google | Aucune |
| Rate limiting | 100 req/100s | Plus permissif |
| **Recommandation** | ✅ **Parfait pour MVP** | ⭐ Mieux pour production à grande échelle |

---

## 6. Structure du Projet

```
biblio-haiti/
├── README.md                  # Ce fichier
├── backend/                   # API FastAPI
│   ├── main.py               # Point d'entrée
│   ├── requirements.txt      # Dépendances Python
│   ├── config/               # Configuration
│   │   ├── settings.py       # Variables d'environnement
│   │   └── google_drive.py   # Configuration Drive
│   ├── api/                  # Routes API
│   │   ├── auth.py           # Authentification
│   │   ├── books.py          # Gestion livres
│   │   ├── users.py          # Gestion utilisateurs
│   │   ├── payments.py       # Paiements
│   │   └── gamification.py   # Points & badges
│   ├── models/               # Modèles de données
│   │   ├── user.py
│   │   ├── book.py
│   │   └── access.py
│   ├── services/             # Logique métier
│   │   ├── google_drive_service.py
│   │   ├── encryption.py
│   │   └── payment_service.py
│   └── database/             # Base de données
│       └── connection.py
│
├── frontend/                  # Application React Native
│   ├── App.js                # Composant principal
│   ├── package.json          # Dépendances Node
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   ├── screens/          # Écrans de l'app
│   │   │   ├── Onboarding/
│   │   │   ├── Auth/
│   │   │   ├── Catalogue/
│   │   │   ├── Reader/
│   │   │   └── Profile/
│   │   ├── navigation/       # Navigation
│   │   ├── services/         # Appels API
│   │   ├── store/            # State management
│   │   ├── utils/            # Utilitaires
│   │   └── assets/           # Images, polices, etc.
│   └── android/ios/          # Code natif
│
└── docs/                     # Documentation
    ├── api.md                # Documentation API
    ├── setup.md              # Guide d'installation
    └── drive-setup.md        # Configuration Google Drive
```

---

## 🚀 Prochaines Étapes

1. **Configuration Google Cloud Platform**
   - Créer le projet GCP
   - Activer l'API Drive
   - Générer les credentials

2. **Développement Backend (Phase 1)**
   - Setup FastAPI + PostgreSQL
   - Intégration Google Drive
   - Système d'authentification

3. **Développement Frontend (Phase 2)**
   - Setup React Native
   - Écrans d'onboarding
   - Catalogue et lecteur

4. **Tests & Déploiement**
   - Tests unitaires et d'intégration
   - Déploiement sur Render.com
   - Publication stores (iOS/Android)

---

## 📞 Contact & Support

Pour toute question ou contribution, veuillez ouvrir une issue sur le dépôt GitHub.

**Licence :** Propriétaire - Tous droits réservés
**Copyright © 2024 Biblio Haiti**
