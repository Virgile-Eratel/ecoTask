#!/bin/bash

# Script pour démarrer l'environnement de développement
echo "🚀 Démarrage de l'environnement de développement EcoTask"

# Fonction pour nettoyer les processus en arrière-plan
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    docker-compose stop postgres 2>/dev/null
    exit 0
}

# Capturer Ctrl+C pour nettoyer proprement
trap cleanup SIGINT

# Vérifier que PostgreSQL est démarré
echo "🐘 Vérification de PostgreSQL..."
if ! docker-compose ps postgres | grep -q "Up"; then
    echo "📦 Démarrage de PostgreSQL..."
    docker-compose up -d postgres
    echo "⏳ Attente que PostgreSQL soit prêt..."
    sleep 5
fi

# Démarrer le backend en arrière-plan
echo "🔧 Démarrage du backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Attendre un peu que le backend démarre
sleep 3

# Démarrer le frontend en arrière-plan
echo "🎨 Démarrage du frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services démarrés !"
echo ""
echo "📊 URLs disponibles :"
echo "   Frontend : http://localhost:5173"
echo "   Backend  : http://localhost:3001"
echo "   Health   : http://localhost:3001/health"
echo ""
echo "🔧 Outils de développement :"
echo "   Prisma Studio : cd backend && npm run db:studio"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter tous les services"
echo ""

# Attendre que les processus se terminent
wait $BACKEND_PID $FRONTEND_PID
