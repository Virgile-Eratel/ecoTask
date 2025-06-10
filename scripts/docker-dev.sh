#!/bin/bash

# Script pour démarrer l'environnement de développement complet avec Docker
echo "🐳 Démarrage de l'environnement de développement EcoTask avec Docker"

# Fonction pour nettoyer les conteneurs
cleanup() {
    echo ""
    echo "🛑 Arrêt des conteneurs Docker..."
    docker compose down
    exit 0
}

# Capturer Ctrl+C pour nettoyer proprement
trap cleanup SIGINT

# Vérifier que Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop."
    exit 1
fi

# Vérifier que docker compose est disponible
if ! docker compose version &> /dev/null; then
    echo "❌ docker compose n'est pas disponible. Veuillez mettre à jour Docker."
    exit 1
fi

echo "🔧 Construction et démarrage des conteneurs..."

# Construire et démarrer PostgreSQL et backend d'abord
echo "🐘 Démarrage de PostgreSQL et du backend..."
docker compose up --build -d postgres backend

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente que PostgreSQL soit prêt..."
timeout=30
counter=0
while ! docker compose exec -T postgres pg_isready -U ecotask_user -d ecotask > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Timeout: PostgreSQL n'est pas prêt après ${timeout} secondes"
        docker compose down
        exit 1
    fi
    sleep 1
    counter=$((counter + 1))
done

echo "✅ PostgreSQL est prêt !"

# Attendre que le backend soit prêt
echo "⏳ Attente que le backend soit prêt..."
timeout=30
counter=0
while ! curl -s http://localhost:3001/health > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Timeout: Backend n'est pas prêt après ${timeout} secondes"
        docker compose down
        exit 1
    fi
    sleep 1
    counter=$((counter + 1))
done

echo "✅ Backend est prêt !"

# Réinitialiser la base, appliquer les migrations et exécuter le seed Prisma (dev only)
echo "🗄️  Réinitialisation de la base, migrations Prisma..."
docker compose exec backend npx prisma migrate reset --force --skip-generate

# Exécuter explicitement le seed Prisma (données de test)
echo "🌱 Exécution du seed Prisma (données de test)..."
cd backend
npm run db:seed
cd ..

# Démarrer le frontend et l'attacher pour voir les logs
echo "🎨 Démarrage du frontend..."
docker compose up --build frontend

echo ""
echo "✅ Tous les services sont démarrés avec Docker !"
echo ""
echo "📊 URLs disponibles :"
echo "   Frontend : http://localhost:5173"
echo "   Backend  : http://localhost:3001"
echo "   Health   : http://localhost:3001/health"
echo "   Database : localhost:5434 (ecotask_user/ecotask_password)"
echo ""
echo "🐳 Commandes Docker utiles :"
echo "   Logs backend  : docker compose logs -f backend"
echo "   Logs frontend : docker compose logs -f frontend"
echo "   Logs database : docker compose logs -f postgres"
echo "   Tous les logs : docker compose logs -f"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter tous les conteneurs"
echo ""

# Attendre le signal d'arrêt
wait
