# Guide Docker pour EcoTask

Ce guide explique comment utiliser Docker pour lancer l'application EcoTask complète (frontend, backend et base de données).

## 🐳 Scripts Docker disponibles

### 1. Script complet avec vérifications (`dev:docker`)
```bash
npm run dev:docker
# ou directement
./scripts/docker-dev.sh
```

**Fonctionnalités :**
- Vérifie que Docker est en cours d'exécution
- Construit et démarre PostgreSQL et le backend
- Attend que PostgreSQL soit prêt
- Attend que le backend soit prêt
- Démarre le frontend
- Affiche les URLs et commandes utiles
- Gestion propre de l'arrêt avec Ctrl+C

### 2. Script simple (`dev:docker:simple`)
```bash
npm run dev:docker:simple
# ou directement
./scripts/docker-simple.sh
```

**Fonctionnalités :**
- Démarrage rapide de tous les services
- Moins de vérifications mais plus direct
- Utilise les profils Docker Compose

## 🚀 URLs de l'application

Une fois les conteneurs démarrés :

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001
- **Health Check** : http://localhost:3001/health
- **Base de données** : localhost:5434
  - Utilisateur : `ecotask_user`
  - Mot de passe : `ecotask_password`
  - Base : `ecotask`

## 🔧 Commandes Docker utiles

### Gestion des conteneurs
```bash
# Voir les logs
docker compose logs -f                    # Tous les services
docker compose logs -f backend           # Backend seulement
docker compose logs -f frontend          # Frontend seulement
docker compose logs -f postgres          # Base de données seulement

# Arrêter les services
docker compose down                       # Arrêt normal
docker compose down -v                    # Arrêt + suppression des volumes

# Reconstruire les images
docker compose build                      # Toutes les images
docker compose build frontend            # Frontend seulement
docker compose build backend             # Backend seulement
```

### Accès aux conteneurs
```bash
# Accéder au conteneur backend
docker compose exec backend sh

# Accéder au conteneur frontend
docker compose exec frontend sh

# Accéder à PostgreSQL
docker compose exec postgres psql -U ecotask_user -d ecotask
```

## 📁 Structure des fichiers Docker

```
.
├── docker-compose.yml          # Configuration des services
├── Dockerfile.frontend         # Image Docker pour le frontend
├── backend/Dockerfile          # Image Docker pour le backend
└── scripts/
    ├── docker-dev.sh          # Script complet avec vérifications
    └── docker-simple.sh       # Script simple et rapide
```

## 🔄 Développement avec Docker

### Avantages
- ✅ Environnement identique pour tous les développeurs
- ✅ Pas besoin d'installer PostgreSQL localement
- ✅ Isolation complète des services
- ✅ Rechargement automatique (hot reload) conservé

### Points d'attention
- Les volumes sont montés pour le développement (hot reload)
- Les `node_modules` sont exclus du montage pour éviter les conflits
- Le frontend est accessible sur le port 5173 (Vite par défaut)
- Le backend reste sur le port 3001

## 🐛 Dépannage

### Problèmes courants

**Docker n'est pas démarré :**
```bash
# Vérifier le statut de Docker
docker info
```

**Ports déjà utilisés :**
```bash
# Voir les processus utilisant les ports
lsof -i :5173  # Frontend
lsof -i :3001  # Backend
lsof -i :5434  # PostgreSQL
```

**Problèmes de construction :**
```bash
# Reconstruire sans cache
docker compose build --no-cache

# Nettoyer les images Docker
docker system prune -a
```

**Base de données corrompue :**
```bash
# Supprimer le volume PostgreSQL
docker compose down -v
docker volume rm ecotaskv2_postgres_data
```

## 🔄 Migration depuis l'environnement local

Si vous utilisiez l'environnement local (`npm run dev:full`), vous pouvez facilement passer à Docker :

1. Arrêter l'environnement local
2. Lancer `npm run dev:docker`
3. L'application sera accessible aux mêmes URLs

Les données de la base PostgreSQL locale ne seront pas automatiquement migrées vers le conteneur Docker.
