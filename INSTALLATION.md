# Installation et Configuration d'EcoTask

Ce guide vous accompagne dans l'installation et la configuration complète d'EcoTask avec PostgreSQL et Docker.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **Docker** et **Docker Compose** ([télécharger](https://www.docker.com/))
- **Git** ([télécharger](https://git-scm.com/))

## 🚀 Installation rapide

### 1. Cloner le projet
```bash
git clone <repository-url>
cd ecotaskv2
```

### 2. Configuration automatique
```bash
npm run setup
```

Cette commande va :
- Créer les fichiers d'environnement
- Installer les dépendances du backend
- Démarrer PostgreSQL avec Docker
- Configurer la base de données avec Prisma
- Initialiser les données de test

### 3. Démarrer l'application
```bash
npm run dev:full
```

Cette commande démarre automatiquement :
- PostgreSQL (Docker)
- Backend API (port 3001)
- Frontend React (port 5173)

## 🔧 Installation manuelle

Si vous préférez configurer manuellement :

### 1. Configuration des variables d'environnement

**Backend (.env dans le dossier backend) :**
```env
DATABASE_URL="postgresql://ecotask_user:ecotask_password@localhost:5432/ecotask"
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Frontend (.env à la racine) :**
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=EcoTask
VITE_APP_VERSION=1.0.0
```

### 2. Installation des dépendances

**Backend :**
```bash
cd backend
npm install
cd ..
```

**Frontend :**
```bash
npm install
```

### 3. Base de données

**Démarrer PostgreSQL :**
```bash
docker-compose up -d postgres
```

**Configurer Prisma :**
```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Démarrage des services

**Backend (terminal 1) :**
```bash
cd backend
npm run dev
```

**Frontend (terminal 2) :**
```bash
npm run dev
```

## 📊 Accès aux services

Une fois l'installation terminée, vous pouvez accéder à :

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001
- **Health Check** : http://localhost:3001/health
- **Prisma Studio** : `cd backend && npm run db:studio`

## 🐳 Commandes Docker utiles

```bash
# Démarrer tous les services
npm run docker:up

# Arrêter tous les services
npm run docker:down

# Voir les logs
npm run docker:logs

# Redémarrer PostgreSQL uniquement
docker-compose restart postgres

# Accéder au shell PostgreSQL
docker-compose exec postgres psql -U ecotask_user -d ecotask
```

## 🔧 Scripts disponibles

### Frontend
- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire pour la production
- `npm run preview` - Prévisualiser le build de production

### Backend
- `cd backend && npm run dev` - Démarrer le serveur de développement
- `cd backend && npm run build` - Construire pour la production
- `cd backend && npm run start` - Démarrer en mode production

### Base de données
- `cd backend && npm run db:generate` - Générer le client Prisma
- `cd backend && npm run db:push` - Pousser le schéma vers la DB
- `cd backend && npm run db:migrate` - Créer une migration
- `cd backend && npm run db:seed` - Initialiser les données de test
- `cd backend && npm run db:studio` - Ouvrir Prisma Studio

### Projet complet
- `npm run setup` - Configuration initiale complète
- `npm run dev:full` - Démarrer tout l'environnement de développement

## 🗄️ Structure de la base de données

La base de données contient les tables suivantes :

- **users** - Utilisateurs de l'application
- **projects** - Projets avec calcul CO₂
- **project_members** - Relation many-to-many projets/utilisateurs
- **tasks** - Tâches avec calcul automatique CO₂
- **task_types** - Types de tâches avec coefficients CO₂

## 🌱 Données de test

Le script de seed crée automatiquement :
- 5 utilisateurs de test
- 4 projets d'exemple
- 10 tâches avec différents types et statuts
- Calculs CO₂ automatiques

## 🔍 Dépannage

### Problème de connexion à la base de données
```bash
# Vérifier que PostgreSQL fonctionne
docker-compose ps postgres

# Redémarrer PostgreSQL
docker-compose restart postgres

# Vérifier les logs
docker-compose logs postgres
```

### Problème de port déjà utilisé
```bash
# Changer le port dans docker-compose.yml
# Ou arrêter le service qui utilise le port
sudo lsof -i :5432  # Pour PostgreSQL
sudo lsof -i :3001  # Pour le backend
sudo lsof -i :5173  # Pour le frontend
```

### Réinitialiser la base de données
```bash
cd backend
npx prisma db push --force-reset
npm run db:seed
```

### Problèmes de permissions (macOS/Linux)
```bash
chmod +x scripts/*.sh
```

## 📝 Notes importantes

1. **Sécurité** : Changez les mots de passe par défaut en production
2. **Performance** : Les données de test sont optimisées pour le développement
3. **Backup** : Configurez des sauvegardes régulières en production
4. **Monitoring** : Utilisez les endpoints de health check pour le monitoring

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez que tous les prérequis sont installés
2. Consultez les logs avec `npm run docker:logs`
3. Réinitialisez l'environnement avec `npm run setup`
4. Consultez la documentation de l'API : http://localhost:3001/health

---

Pour plus d'informations, consultez le [README.md](./README.md) principal.
