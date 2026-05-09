# 🇭🇹 Biblio-Haïti - Application de Bibliothèque Numérique

Application mobile de bibliothèque numérique haïtienne avec lecture gratuite/premium, système d'étoiles via quiz, et publication pour auteurs.

---

## 📋 Table des Matières

1. [Architecture](#architecture)
2. [Prérequis](#prérequis)
3. [Installation - Étape par Étape](#installation---étape-par-étape)
   - [Backend FastAPI](#backend-fastapi)
   - [Mobile Expo](#mobile-expo)
   - [Base de Données](#base-de-données)
4. [Configuration](#configuration)
5. [Démarrage](#démarrage)
6. [Fonctionnalités](#fonctionnalités)
7. [Structure du Projet](#structure-du-projet)
8. [Développement](#développement)
9. [Déploiement](#déploiement)
10. [Contribuer](#contribuer)

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Mobile App    │────▶│   Backend API    │────▶│  PostgreSQL  │
│   (Expo/React)  │◀────│   (FastAPI)      │◀────│  Database    │
└─────────────────┘     └──────────────────┘     └──────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│   Cloudinary    │     │   Backblaze B2   │
│   (Images)      │     │   (PDF Storage)  │
└─────────────────┘     └──────────────────┘
```

**Stack Technique:**
- **Frontend Mobile**: Expo (React Native) + TypeScript
- **Backend**: FastAPI (Python) + SQLAlchemy
- **Base de données**: PostgreSQL 15
- **Storage**: Cloudinary (images) + Backblaze B2 (PDFs)
- **Paiements**: Stripe + MonCash
- **Authentification**: JWT tokens
- **Containerization**: Docker + Docker Compose

---

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir installé:

### Obligatoire
- **Node.js** v18+ ([Télécharger](https://nodejs.org/))
- **npm** ou **yarn** (inclus avec Node.js)
- **Python** 3.10+ ([Télécharger](https://www.python.org/))
- **Git** ([Télécharger](https://git-scm.com/))

### Recommandé
- **Docker** + **Docker Compose** ([Télécharger](https://www.docker.com/))
- **Expo CLI**: `npm install -g expo-cli`
- **PostgreSQL** (si vous ne utilisez pas Docker)

### Comptes Nécessaires
- [Cloudinary](https://cloudinary.com/) - Pour les images
- [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html) - Pour stockage PDF
- [Stripe](https://stripe.com/) - Paiements internationaux
- [MonCash](https://moncash.digicelgroup.com/) - Paiements locaux Haïti

---

## 🚀 Installation - Étape par Étape

### 📦 Étape 1: Cloner le Repository

```bash
cd /workspace
git clone <votre-repo> biblio-haiti
cd biblio-haiti
```

---

### 🔧 Étape 2: Configuration du Backend FastAPI

#### 2.1 Créer l'environnement virtuel Python

```bash
cd backend

# Linux/Mac
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

#### 2.2 Installer les dépendances

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 2.3 Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env
```

#### 2.4 Éditer le fichier `.env`

Ouvrez `backend/.env` et configurez:

```env
# Application
APP_NAME=Biblio-Haiti
DEBUG=True
SECRET_KEY=votre-clé-secrète-générée-aléatoirement
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Base de données
DATABASE_URL=postgresql://biblio:biblio123@localhost:5432/biblio_haiti

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret

# Backblaze B2
B2_BUCKET_NAME=votre-bucket
B2_KEY_ID=votre-key-id
B2_APPLICATION_KEY=votre-application-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# MonCash
MONCASH_CLIENT_ID=votre-client-id
MONCASH_CLIENT_SECRET=votre-client-secret
MONCASH_ENVIRONMENT=sandbox

# URLs
FRONTEND_URL=http://localhost:8081
BACKEND_URL=http://localhost:8000
```

#### 2.5 Générer une clé secrète sécurisée

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copiez la sortie et collez-la dans `SECRET_KEY` du fichier `.env`.

---

### 📱 Étape 3: Configuration de l'Application Mobile

#### 3.1 Installer les dépendances npm

```bash
cd ../mobile

# Avec npm
npm install

# Ou avec yarn
yarn install
```

#### 3.2 Configurer les variables d'environnement

Créez un fichier `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_APP_NAME=Biblio-Haïti
EXPO_PUBLIC_VERSION=1.0.0
```

#### 3.3 Vérifier l'installation

```bash
npx expo doctor
```

---

### 🗄️ Étape 4: Configuration de la Base de Données

#### Option A: Avec Docker (Recommandé)

```bash
# Retour au dossier racine
cd ..

# Démarrer PostgreSQL avec Docker Compose
docker-compose up -d postgres
```

#### Option B: PostgreSQL Local

```bash
# Créer la base de données
createdb biblio_haiti

# Ou avec psql
psql -U postgres
CREATE DATABASE biblio_haiti;
CREATE USER biblio WITH PASSWORD 'biblio123';
GRANT ALL PRIVILEGES ON DATABASE biblio_haiti TO biblio;
\q
```

#### 4.2 Initialiser la base de données

```bash
cd backend
source venv/bin/activate  # Activer l'environnement virtuel

# Exécuter les migrations (si Alembic est configuré)
alembic upgrade head

# Ou créer les tables manuellement
python -c "from app.db.database import engine; from app.db.models import *; Base.metadata.create_all(bind=engine)"
```

---

## ⚙️ Configuration

### Ports Utilisés

| Service | Port | URL |
|---------|------|-----|
| Backend API | 8000 | http://localhost:8000 |
| Mobile App | 8081 | http://localhost:8081 |
| PostgreSQL | 5432 | localhost:5432 |
| PgAdmin (optionnel) | 5050 | http://localhost:5050 |

### Variables d'Environnement Critiques

#### Backend (.env)
- `SECRET_KEY`: Clé pour signer les JWT tokens
- `DATABASE_URL`: Connection string PostgreSQL
- `CLOUDINARY_*`: Credentials Cloudinary
- `B2_*`: Credentials Backblaze B2
- `STRIPE_*`: Keys Stripe pour paiements
- `MONCASH_*`: Keys MonCash pour paiements locaux

#### Mobile (.env)
- `EXPO_PUBLIC_API_URL`: URL du backend API

---

## ▶️ Démarrage

### Méthode 1: Manuellement

#### Terminal 1 - Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Le backend sera disponible sur: **http://localhost:8000**

Documentation API automatique (Swagger): **http://localhost:8000/docs**

#### Terminal 2 - Mobile

```bash
cd mobile
npx expo start
```

Scannez le QR code avec:
- **iOS**: Camera app ou Expo Go
- **Android**: Expo Go app

Ou appuyez sur:
- `w` - Ouvrir dans le navigateur web
- `i` - Simulateur iOS
- `a` - Émulateur Android

### Méthode 2: Avec Docker (Tout-en-un)

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down
```

---

## ✨ Fonctionnalités

### 👤 Utilisateurs

#### Authentification
- ✅ Inscription avec email/mot de passe
- ✅ Connexion sécurisée (JWT)
- ✅ Réinitialisation de mot de passe
- ✅ Profil utilisateur editable

#### Lecture
- ✅ Livres gratuits (illimité)
- ✅ Livres premium (achat temporaire: 24h, 7j, 30j)
- ✅ Lecture offline (PDF chiffrés)
- ✅ Marque-pages et annotations
- ✅ Mode nuit/jour

#### Système d'Étoiles
- ✅ Gagner des étoiles via quiz
- ✅ Quiz après chaque livre lu
- ✅ Débloquer du contenu premium avec étoiles
- ✅ Historique des transactions d'étoiles

### ✍️ Auteurs

#### Publication
- ✅ Soumettre un manuscrit
- ✅ Upload de couverture (Cloudinary)
- ✅ Upload du PDF (Backblaze B2)
- ✅ Définir prix en étoiles ou argent
- ✅ Suivi des statistiques de lecture

#### Dashboard Auteur
- ✅ Nombre de lectures
- ✅ Revenus générés
- ✅ Avis et commentaires
- ✅ Gestion des droits d'auteur

### 🛡️ Sécurité & Copyright

#### Protection Contenu
- ✅ Filigrane invisible dans les PDF
- ✅ Anti-screenshot (natif mobile)
- ✅ Chiffrement des fichiers offline
- ✅ Validation automatique copyright
- ✅ Système de réclamations

#### Protection Utilisateurs
- ✅ Hachage bcrypt des mots de passe
- ✅ Tokens JWT avec expiration
- ✅ Rate limiting sur les API
- ✅ HTTPS obligatoire en production

### 💳 Paiements

#### Méthodes Supportées
- ✅ **Stripe**: Cartes internationales (Visa, Mastercard, Amex)
- ✅ **MonCash**: Portefeuille mobile haïtien
- ✅ **Étoiles**: Devise virtuelle gagnée via quiz

#### Options d'Achat
- Accès 24 heures
- Accès 7 jours
- Accès 30 jours
- Achat permanent (selon configuration auteur)

---

## 📂 Structure du Projet

```
biblio-haiti/
├── README.md                 # Ce fichier
├── docker-compose.yml        # Configuration Docker
├── docs/                     # Documentation additionnelle
│
├── backend/                  # API FastAPI
│   ├── app/
│   │   ├── api/             # Routes API
│   │   │   ├── auth.py      # Authentification
│   │   │   ├── books.py     # Gestion livres
│   │   │   ├── stars.py     # Système d'étoiles
│   │   │   ├── quiz.py      # Quiz
│   │   │   ├── payments.py  # Paiements
│   │   │   └── admin.py     # Administration
│   │   ├── core/            # Configuration centrale
│   │   │   ├── config.py    # Variables d'env
│   │   │   ├── security.py  # JWT, hashing
│   │   │   └── dependencies.py
│   │   ├── db/              # Base de données
│   │   │   ├── database.py  # Connection DB
│   │   │   └── models.py    # Modèles SQLAlchemy
│   │   ├── services/        # Services métier
│   │   │   ├── cloudinary_service.py
│   │   │   ├── b2_service.py
│   │   │   ├── stripe_service.py
│   │   │   └── moncash_service.py
│   │   └── main.py          # Point d'entrée
│   ├── requirements.txt     # Dépendances Python
│   ├── .env.example         # Template variables d'env
│   └── .env                 # Variables d'env (à créer)
│
└── mobile/                   # Application Expo
    ├── src/
    │   ├── components/      # Composants réutilisables
    │   ├── screens/         # Écrans de l'app
    │   │   ├── auth/        # Login, Register
    │   │   ├── main/        # Home, Search, Library
    │   │   ├── book/        # BookDetail, Reader
    │   │   ├── quiz/        # QuizScreen
    │   │   ├── payment/     # PaymentScreen
    │   │   └── profile/     # Profile, Settings
    │   ├── navigation/      # Navigation
    │   ├── context/         # Context React
    │   │   ├── AuthContext.tsx
    │   │   └── OfflineContext.tsx
    │   ├── services/        # Services API
    │   │   └── api.ts
    │   ├── constants/       # Constantes
    │   │   └── index.ts
    │   └── types/           # Types TypeScript
    ├── App.tsx              # Point d'entrée
    ├── app.json             # Configuration Expo
    ├── package.json         # Dépendances npm
    ├── tsconfig.json        # Configuration TypeScript
    └── .env                 # Variables d'env (à créer)
```

---

## 👨‍💻 Développement

### Backend

#### Lancer en mode développement

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

#### Exécuter les tests

```bash
pytest
```

#### Formater le code

```bash
black app/
isort app/
flake8 app/
```

#### Générer la documentation API

La documentation Swagger est auto-générée:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Mobile

#### Lancer en mode développement

```bash
cd mobile
npx expo start
```

#### Build pour production

```bash
# Build APK Android
eas build --platform android

# Build IPA iOS (nécessite compte Apple Developer)
eas build --platform ios

# Submit aux stores
eas submit --platform android
eas submit --platform ios
```

#### Tests

```bash
npm test
```

---

## 🌐 Déploiement

### Backend

#### Option 1: Docker

```bash
docker-compose up -d
```

#### Option 2: Serveur VPS

1. Installer Python, PostgreSQL, Nginx
2. Cloner le repository
3. Configurer `.env`
4. Utiliser Gunicorn + Nginx comme reverse proxy

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Option 3: Platform as a Service

- **Railway.app**
- **Render.com**
- **Heroku**
- **Google Cloud Run**

### Mobile

#### Expo Application Services (EAS)

```bash
# Installer EAS CLI
npm install -g eas-cli

# Configurer
eas build:configure

# Build
eas build --platform all

# Submit
eas submit --platform all
```

### Base de Données

#### Production PostgreSQL

Utilisez un service managé:
- **Supabase**
- **Neon**
- **AWS RDS**
- **Google Cloud SQL**
- **DigitalOcean Managed Databases**

---

## 🤝 Contribuer

### Workflow de Contribution

1. **Fork** le repository
2. Créez une branche feature: `git checkout -b feature/ma-fonctionnalite`
3. Committez vos changements: `git commit -am 'Ajoute nouvelle fonctionnalité'`
4. Push vers la branche: `git push origin feature/ma-fonctionnalite`
5. Ouvrez une **Pull Request**

### Standards de Code

#### Backend (Python)
- Suivre PEP 8
- Utiliser type hints
- Docstrings pour toutes les fonctions publiques
- Tests unitaires obligatoires

#### Mobile (TypeScript)
- ESLint + Prettier configurés
- Components fonctionnels avec hooks
- Typage strict TypeScript
- Tests avec Jest + React Testing Library

### Conventions de Commit

```
feat: ajoute nouvelle fonctionnalité
fix: corrige un bug
docs: met à jour la documentation
style: reformate le code
refactor: refactorisation sans changement de comportement
test: ajoute/modifie des tests
chore: met à jour dépendances, config, etc.
```

---

## 📞 Support

### Contact

- **Email**: support@biblio-haiti.ht
- **Discord**: [Lien vers serveur Discord]
- **GitHub Issues**: [Lien vers issues]

### FAQ

**Q: Comment tester les paiements?**
R: Utilisez les clés de test Stripe et MonCash sandbox. Les identifiants sont dans `.env.example`.

**Q: Puis-je contribuer sans connaître React Native?**
R: Oui! Le backend Python/FastAPI a aussi besoin de contributeurs.

**Q: Comment signaler un bug?**
R: Ouvrez une issue GitHub avec le template "Bug Report".

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- À toute l'équipe de développement
- Aux contributeurs open-source
- À la communauté haïtienne
- À nos partenaires technologiques

---

**Fait avec ❤️ pour Haïti 🇭🇹**

*Dernière mise à jour: Mai 2024*
