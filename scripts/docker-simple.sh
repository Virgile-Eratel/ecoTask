#!/bin/bash

# Script simple pour démarrer l'environnement complet avec Docker
echo "🐳 Démarrage rapide de l'environnement EcoTask avec Docker"

# Fonction pour nettoyer les conteneurs
cleanup() {
    echo ""
    echo "🛑 Arrêt des conteneurs..."
    docker compose down
    exit 0
}

# Capturer Ctrl+C pour nettoyer proprement
trap cleanup SIGINT

# Vérifier Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas en cours d'exécution."
    exit 1
fi

echo "🚀 Démarrage de tous les services..."

# Démarrer tous les services
docker compose up --build

echo "✅ Services arrêtés proprement."
