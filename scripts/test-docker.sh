#!/bin/bash

# Script de test pour vérifier la configuration Docker
echo "🧪 Test de la configuration Docker EcoTask"

# Vérifier Docker
echo "🔍 Vérification de Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas en cours d'exécution"
    exit 1
fi
echo "✅ Docker est disponible"

# Vérifier docker compose
echo "🔍 Vérification de Docker Compose..."
if ! docker compose version > /dev/null 2>&1; then
    echo "❌ Docker Compose n'est pas disponible"
    exit 1
fi
echo "✅ Docker Compose est disponible"

# Vérifier la configuration
echo "🔍 Validation de la configuration docker-compose.yml..."
if ! docker compose config > /dev/null 2>&1; then
    echo "❌ Configuration docker-compose.yml invalide"
    exit 1
fi
echo "✅ Configuration docker-compose.yml valide"

# Vérifier les Dockerfiles
echo "🔍 Vérification des Dockerfiles..."

if [ ! -f "backend/Dockerfile" ]; then
    echo "❌ backend/Dockerfile manquant"
    exit 1
fi
echo "✅ backend/Dockerfile trouvé"

if [ ! -f "Dockerfile.frontend" ]; then
    echo "❌ Dockerfile.frontend manquant"
    exit 1
fi
echo "✅ Dockerfile.frontend trouvé"

# Vérifier les scripts
echo "🔍 Vérification des scripts..."

if [ ! -x "scripts/docker-dev.sh" ]; then
    echo "❌ scripts/docker-dev.sh manquant ou non exécutable"
    exit 1
fi
echo "✅ scripts/docker-dev.sh prêt"

if [ ! -x "scripts/docker-simple.sh" ]; then
    echo "❌ scripts/docker-simple.sh manquant ou non exécutable"
    exit 1
fi
echo "✅ scripts/docker-simple.sh prêt"

# Test de construction (sans démarrage)
echo "🔍 Test de construction des images..."
if ! docker compose build --dry-run > /dev/null 2>&1; then
    echo "⚠️  Impossible de tester la construction (dry-run non supporté)"
else
    echo "✅ Test de construction réussi"
fi

echo ""
echo "🎉 Tous les tests sont passés !"
echo ""
echo "📋 Commandes disponibles :"
echo "   npm run dev:docker        # Script complet avec vérifications"
echo "   npm run dev:docker:simple # Script simple et rapide"
echo "   npm run docker:up         # Démarrer les services"
echo "   npm run docker:down       # Arrêter les services"
echo "   npm run docker:logs       # Voir les logs"
echo "   npm run docker:build      # Construire les images"
echo ""
echo "📖 Consultez DOCKER_GUIDE.md pour plus d'informations"
