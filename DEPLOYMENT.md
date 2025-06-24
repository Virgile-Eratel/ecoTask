# Guide de Déploiement EcoTask

## Vue d'ensemble

Ce guide décrit le processus de déploiement automatisé d'EcoTask utilisant GitLab CI/CD et Docker.

## Architecture de Déploiement

### 🏗️ Pipeline CI/CD

1. **Install** - Installation des dépendances
2. **Lint** - Vérification du code (manuel)
3. **Test** - Tests automatisés (manuel)
4. **Build** - Construction des applications
5. **Docker Build** - Construction des images Docker
6. **Deploy** - Déploiement sur le serveur (manuel)

### 🐳 Images Docker

- **Frontend**: Image Nginx avec l'application React buildée
- **Backend**: Image Node.js avec l'API Express

## Configuration Requise

### Variables GitLab CI/CD

Configurez ces variables dans GitLab (Settings > CI/CD > Variables) :

```bash
# Clés SSH pour le déploiement
SSH_KEY          # Clé privée SSH (type: File)
SSH_PUB          # Clé publique SSH (type: Variable)

# Registry Docker GitLab (automatiques)
CI_REGISTRY_USER     # Utilisateur du registry
CI_REGISTRY_PASSWORD # Mot de passe du registry
CI_REGISTRY_IMAGE    # URL de l'image
```

### Serveur de Production

**Serveur**: `dev5@51.68.233.128`

#### Prérequis sur le serveur :

```bash
# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker dev5

# Installation de Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Création des répertoires
sudo mkdir -p /var/www/ecotask
sudo chown dev5:dev5 /var/www/ecotask
```

## Processus de Déploiement

### 1. Déclenchement Automatique

Le pipeline se déclenche automatiquement sur :
- Push sur la branche `main`
- Merge requests

### 2. Étapes Automatiques

- ✅ Installation des dépendances
- ✅ Build des applications
- ✅ Construction des images Docker
- ✅ Push vers le GitLab Container Registry

### 3. Déploiement Manuel

Le déploiement en production est **manuel** pour plus de sécurité :

1. Aller dans GitLab > CI/CD > Pipelines
2. Cliquer sur la pipeline de la branche `main`
3. Cliquer sur le bouton "Play" du job `deploy_production`

### 4. Processus de Déploiement

```bash
# 1. Connexion au serveur via SSH
# 2. Copie des fichiers de configuration
# 3. Connexion au GitLab Container Registry
# 4. Pull des nouvelles images Docker
# 5. Arrêt des anciens conteneurs
# 6. Démarrage des nouveaux conteneurs
# 7. Vérification de santé de l'application
```

## Structure des Fichiers

```
.
├── .gitlab-ci.yml              # Configuration CI/CD
├── Dockerfile                  # Frontend (dev)
├── Dockerfile.prod             # Frontend (production)
├── docker-compose.yml          # Développement
├── docker-compose.prod.yml     # Production
├── nginx.conf                  # Configuration Nginx
├── .env.prod.example           # Variables d'environnement
└── scripts/
    └── deploy.sh               # Script de déploiement
```

## Configuration de Production

### Variables d'Environnement

Copiez `.env.prod.example` vers `.env.prod` sur le serveur et configurez :

```bash
# Domaine et ports
DOMAIN=your-domain.com
FRONTEND_PORT=80
FRONTEND_URL=http://your-domain.com

# Sécurité
JWT_SECRET=your-super-secure-jwt-secret

# Base de données
DATABASE_URL=file:./data/prod.db
```

### Ports Exposés

- **Frontend**: Port 80 (HTTP)
- **Backend**: Port 3001 (interne)
- **Traefik** (optionnel): Ports 80, 443, 8080

## Monitoring et Logs

### Vérifier le statut des conteneurs

```bash
cd /var/www/ecotask
docker-compose -f docker-compose.prod.yml ps
```

### Consulter les logs

```bash
# Logs de tous les services
docker-compose -f docker-compose.prod.yml logs -f

# Logs d'un service spécifique
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Health Checks

- **API**: `http://51.68.233.128:3001/health`
- **Frontend**: `http://51.68.233.128/`

## Rollback

En cas de problème, rollback vers la version précédente :

```bash
cd /var/www/ecotask

# Arrêter les conteneurs actuels
docker-compose -f docker-compose.prod.yml down

# Utiliser une version précédente
export CI_COMMIT_SHA=previous-commit-sha
docker-compose -f docker-compose.prod.yml up -d
```

## Sécurité

### Bonnes Pratiques

- ✅ Images Docker non-root
- ✅ Secrets via variables GitLab CI/CD
- ✅ Connexion SSH sécurisée
- ✅ Registry Docker privé
- ✅ Health checks automatiques
- ✅ Déploiement manuel en production

### Sauvegarde

La base de données SQLite est automatiquement sauvegardée avant chaque déploiement dans `/var/backups/ecotask/`.

## Dépannage

### Problèmes Courants

1. **Erreur de connexion SSH**
   - Vérifier les variables SSH_KEY et SSH_PUB
   - Vérifier que la clé publique est dans `~/.ssh/authorized_keys` sur le serveur

2. **Erreur Docker Registry**
   - Vérifier les permissions du GitLab Container Registry
   - Vérifier que Docker est installé sur le serveur

3. **Application ne répond pas**
   - Vérifier les logs des conteneurs
   - Vérifier que les ports ne sont pas bloqués par un firewall

### Support

Pour plus d'aide, consulter :
- Logs GitLab CI/CD
- Logs des conteneurs Docker
- Documentation GitLab CI/CD
