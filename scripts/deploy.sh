#!/bin/bash

# Script de déploiement pour EcoTask
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
APP_DIR="/var/www/ecotask"
BACKUP_DIR="/var/backups/ecotask"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🚀 Début du déploiement EcoTask - Environnement: $ENVIRONMENT"

# Fonction de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Fonction de sauvegarde
backup_database() {
    log "📦 Sauvegarde de la base de données..."
    mkdir -p $BACKUP_DIR
    if [ -f "$APP_DIR/backend/data/prod.db" ]; then
        cp "$APP_DIR/backend/data/prod.db" "$BACKUP_DIR/prod_${DATE}.db"
        log "✅ Base de données sauvegardée: $BACKUP_DIR/prod_${DATE}.db"
    else
        log "⚠️  Aucune base de données existante trouvée"
    fi
}

# Fonction de rollback
rollback() {
    log "🔄 Rollback en cours..."
    cd $APP_DIR
    docker-compose -f docker-compose.prod.yml down
    # Restaurer la dernière sauvegarde si nécessaire
    # docker-compose -f docker-compose.prod.yml up -d
    log "❌ Rollback terminé"
    exit 1
}

# Trap pour gérer les erreurs
trap rollback ERR

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    log "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Créer les répertoires nécessaires
log "📁 Création des répertoires..."
mkdir -p $APP_DIR
mkdir -p $BACKUP_DIR

# Se déplacer dans le répertoire de l'application
cd $APP_DIR

# Sauvegarder la base de données existante
backup_database

# Arrêter les conteneurs existants
log "🛑 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Nettoyer les images non utilisées
log "🧹 Nettoyage des images Docker..."
docker system prune -f

# Construire les nouvelles images
log "🔨 Construction des images Docker..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Démarrer les nouveaux conteneurs
log "🚀 Démarrage des nouveaux conteneurs..."
docker-compose -f docker-compose.prod.yml up -d

# Attendre que les services soient prêts
log "⏳ Attente que les services soient prêts..."
sleep 30

# Vérifier que les services sont en cours d'exécution
log "🔍 Vérification des services..."
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    log "❌ Erreur: Les services ne sont pas démarrés correctement"
    exit 1
fi

# Test de santé de l'API
log "🏥 Test de santé de l'API..."
for i in {1..10}; do
    if curl -f http://localhost:3002/health > /dev/null 2>&1; then
        log "✅ API en ligne"
        break
    fi
    if [ $i -eq 10 ]; then
        log "❌ L'API ne répond pas après 10 tentatives"
        exit 1
    fi
    log "⏳ Tentative $i/10 - Attente de l'API..."
    sleep 5
done

# Test de santé du frontend
log "🌐 Test de santé du frontend..."
if curl -f http://localhost > /dev/null 2>&1; then
    log "✅ Frontend en ligne"
else
    log "❌ Le frontend ne répond pas"
    exit 1
fi

# Nettoyer les anciennes sauvegardes (garder les 7 dernières)
log "🧹 Nettoyage des anciennes sauvegardes..."
find $BACKUP_DIR -name "prod_*.db" -type f -mtime +7 -delete

log "🎉 Déploiement terminé avec succès!"
log "📊 URL de l'application: http://$(hostname -I | awk '{print $1}')"
log "🔍 Logs: docker-compose -f $APP_DIR/docker-compose.prod.yml logs -f"
