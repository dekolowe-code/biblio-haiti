# Guide de Configuration Google Drive Personnel pour Biblio Haiti

## 📋 Vue d'ensemble

Ce guide vous accompagne pas à pas pour configurer **Google Drive Personnel** comme solution de stockage pour votre application Biblio Haiti.

---

## 🔧 Prérequis

- Un compte Google (Gmail)
- Un projet Google Cloud Platform (GCP)
- Node.js et npm installés localement
- Python 3.8+ pour le backend

---

## Étape 1 : Créer un Projet Google Cloud Platform

### 1.1 Accéder à Google Cloud Console
1. Rendez-vous sur [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google
3. Cliquez sur **"Sélectionner un projet"** en haut de la page
4. Cliquez sur **"NOUVEAU PROJET"**

### 1.2 Configurer le projet
- **Nom du projet** : `biblio-haiti-storage`
- **Organisation** : (laissez vide si compte personnel)
- **Emplacement** : Sélectionnez votre organisation ou "Aucune organisation"
- Cliquez sur **"CRÉER"**

⏱️ Attendez quelques secondes que le projet soit créé.

---

## Étape 2 : Activer les APIs Nécessaires

### 2.1 Activer Google Drive API
1. Dans le menu de gauche, allez sur **"APIs et services"** > **"Bibliothèque"**
2. Recherchez **"Google Drive API"**
3. Cliquez dessus puis sur **"ACTIVER"**

### 2.2 Activer Google Sheets API (optionnel, pour métadonnées)
1. Retournez dans **"Bibliothèque"**
2. Recherchez **"Google Sheets API"**
3. Cliquez dessus puis sur **"ACTIVER"**

---

## Étape 3 : Créer un Compte de Service (Service Account)

### 3.1 Accéder aux identifiants
1. Menu de gauche : **"APIs et services"** > **"Identifiants"**
2. Cliquez sur **"+ CRÉER DES IDENTIFIANTS"** en haut
3. Sélectionnez **"Compte de service"**

### 3.2 Configurer le compte de service
- **Nom du compte de service** : `biblio-haiti-backend`
- **ID du compte de service** : (généré automatiquement, ex: `biblio-haiti-backend@biblio-haiti-storage.iam.gserviceaccount.com`)
- **Description** : `Backend API pour gestion des fichiers Google Drive`
- Cliquez sur **"CRÉER ET CONTINUER"**

### 3.3 Rôles (optionnel à cette étape)
- Vous pouvez sauter cette étape en cliquant sur **"CONTINUER"**
- Nous configurerons les permissions plus tard

### 3.4 Accorder l'accès aux utilisateurs (optionnel)
- Cliquez sur **"TERMINÉ"**

---

## Étape 4 : Générer la Clé JSON du Compte de Service

### 4.1 Créer une clé
1. Toujours dans **"Identifiants"**, trouvez votre compte de service `biblio-haiti-backend`
2. Cliquez sur l'adresse email du compte de service
3. Allez dans l'onglet **"CLÉS"**
4. Cliquez sur **"AJOUTER UNE CLÉ"** > **"Créer une clé"**
5. Sélectionnez le type **JSON**
6. Cliquez sur **"CRÉER"**

### 4.2 Télécharger la clé
- Un fichier JSON va se télécharger automatiquement
- **Nom du fichier** : Ressemble à `biblio-haiti-storage-xxxxx.json`
- **⚠️ IMPORTANT** : Ce fichier contient des informations sensibles !

### 4.3 Sécuriser la clé
```bash
# Déplacez la clé dans votre projet
mv ~/Downloads/biblio-haiti-storage-xxxxx.json /workspace/biblio-haiti/backend/credentials/

# Définissez des permissions restrictives (Linux/Mac)
chmod 600 /workspace/biblio-haiti/backend/credentials/biblio-haiti-storage-xxxxx.json
```

---

## Étape 5 : Configurer Google Drive

### 5.1 Créer un dossier dédié
1. Ouvrez [https://drive.google.com/](https://drive.google.com/)
2. Connectez-vous avec le même compte Google
3. Cliquez sur **"+ Nouveau"** > **"Dossier"**
4. Nommez-le : `Biblio Haiti - Livres`

### 5.2 Noter l'ID du dossier
1. Ouvrez le dossier `Biblio Haiti - Livres`
2. Regardez l'URL dans votre navigateur :
   ```
   https://drive.google.com/drive/folders/1aBCdefGHIjklMNOpqrSTUvwxYZ123456
   ```
3. L'ID du dossier est la partie après `/folders/` :
   ```
   FOLDER_ID = 1aBCdefGHIjklMNOpqrSTUvwxYZ123456
   ```

### 5.3 Partager le dossier avec le compte de service
1. Faites un clic droit sur le dossier > **"Partager"**
2. Dans "Ajouter des personnes et des groupes", collez l'email du compte de service :
   ```
   biblio-haiti-backend@biblio-haiti-storage.iam.gserviceaccount.com
   ```
3. Sélectionnez le rôle : **"Éditeur"**
4. Décochez "Notifier les personnes"
5. Cliquez sur **"Partager"**

---

## Étape 6 : Structure des Dossiers dans Google Drive

Créez la structure suivante dans votre dossier principal `Biblio Haiti - Livres` :

```
Biblio Haiti - Livres/
├── books/
│   ├── pdf/
│   └── epub/
├── covers/
├── audio/
└── temp/
```

### IDs à récupérer pour chaque sous-dossier :
- `BOOKS_PDF_FOLDER_ID`
- `BOOKS_EPUB_FOLDER_ID`
- `COVERS_FOLDER_ID`
- `AUDIO_FOLDER_ID`

---

## Étape 7 : Variables d'Environnement

Créez un fichier `.env` dans votre dossier backend :

```bash
# /workspace/biblio-haiti/backend/.env

# Google Cloud Platform
GOOGLE_APPLICATION_CREDENTIALS=./credentials/biblio-haiti-storage-xxxxx.json
GCP_PROJECT_ID=biblio-haiti-storage

# Google Drive Folder IDs
DRIVE_ROOT_FOLDER_ID=1aBCdefGHIjklMNOpqrSTUvwxYZ123456
DRIVE_BOOKS_PDF_FOLDER_ID=...
DRIVE_BOOKS_EPUB_FOLDER_ID=...
DRIVE_COVERS_FOLDER_ID=...
DRIVE_AUDIO_FOLDER_ID=...

# Security
ENCRYPTION_KEY=votre_cle_de_chiffrement_aes_256_ici
JWT_SECRET=votre_secret_jwt_ici

# App Settings
APP_NAME=Biblio Haiti
API_URL=http://localhost:8000
CORS_ORIGINS=["http://localhost:3000"]
```

---

## Étape 8 : Installation des Dépendances Backend

```bash
cd /workspace/biblio-haiti/backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install fastapi uvicorn google-auth google-auth-oauthlib google-api-python-client cryptography python-dotenv pydantic
```

---

## Étape 9 : Tester la Connexion

Créez un fichier de test `test_drive.py` :

```python
# /workspace/biblio-haiti/backend/test_drive.py

from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv

load_dotenv()

def test_drive_connection():
    """Teste la connexion à Google Drive"""
    
    credentials_file = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    folder_id = os.getenv('DRIVE_ROOT_FOLDER_ID')
    
    if not credentials_file or not folder_id:
        print("❌ Erreur: Variables d'environnement manquantes")
        return False
    
    try:
        # Authentification
        credentials = service_account.Credentials.from_service_account_file(
            credentials_file,
            scopes=['https://www.googleapis.com/auth/drive']
        )
        
        # Création du service
        service = build('drive', 'v3', credentials=credentials)
        
        # Récupérer les infos du dossier
        folder = service.files().get(
            fileId=folder_id,
            fields='id, name, mimeType'
        ).execute()
        
        print("✅ Connexion réussie !")
        print(f"📁 Dossier: {folder.get('name')}")
        print(f"🆔 ID: {folder.get('id')}")
        print(f"📄 Type: {folder.get('mimeType')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur de connexion: {str(e)}")
        return False

if __name__ == "__main__":
    test_drive_connection()
```

Exécutez le test :
```bash
python test_drive.py
```

---

## Étape 10 : Limites et Quotas Google Drive

### 10.1 Plan Gratuit (Compte Personnel)
- **Stockage** : 15 GB (partagé avec Gmail et Google Photos)
- **Taille max par fichier** : 5 TB
- **Bande passante** : Illimitée (mais soumise à quotas d'API)

### 10.2 Quotas d'API Google Drive
- **Requêtes par jour** : 1 000 000 (gratuit)
- **Requêtes par 100 secondes** : 100 (par défaut, augmentable)
- **Téléchargements** : 10 GB/jour/utilisateur (peut être augmenté)

### 10.3 Recommandations
1. **Compressez les PDF** avant upload (outil: `ghostscript`)
2. **Utilisez des thumbnails** pour les couvertures (max 500KB)
3. **Mettez en cache** les URLs signées (valables 30 min)
4. **Surveillez l'utilisation** dans [Google Cloud Console](https://console.cloud.google.com/apis/api/drive.googleapis.com/metrics)

---

## 🚨 Points de Vigilance

### Sécurité
- ✅ Ne jamais committer le fichier JSON de credentials dans Git
- ✅ Utiliser des URLs signées temporaires (30 min max)
- ✅ Chiffrer les fichiers avant upload (AES-256)
- ✅ Valider les types de fichiers côté serveur

### Performance
- ⚡ Google Drive n'est pas optimisé pour le streaming
- ⚡ Pour les gros fichiers (>50MB), préférez le téléchargement complet
- ⚡ Implémentez un système de cache côté client

### Coûts Futurs
- 💰 15 GB gratuits peuvent être insuffisants à terme
- 💰 Google One : 100 GB à $1.99/mois, 200 GB à $2.99/mois
- 💰 Google Workspace : À partir de $6/mois/utilisateur (stockage accru)

---

## 📞 Support et Ressources

- [Documentation officielle Google Drive API](https://developers.google.com/drive/api/guides/about-sdk)
- [Quotas et limites](https://developers.google.com/drive/api/guides/limits)
- [Guide d'authentification](https://developers.google.com/identity/protocols/oauth2/service-account)
- [Exemples de code Python](https://github.com/googleapis/python-drive)

---

## ✅ Checklist de Validation

- [ ] Projet GCP créé
- [ ] APIs Drive activées
- [ ] Compte de service créé
- [ ] Clé JSON téléchargée et sécurisée
- [ ] Dossier Drive créé avec la bonne structure
- [ ] Partage configuré avec le compte de service
- [ ] Variables d'environnement configurées
- [ ] Test de connexion réussi
- [ ] Fichier `.gitignore` mis à jour pour exclure `credentials/`

---

**Prochaine étape** : Développement du backend FastAPI avec intégration Google Drive !
