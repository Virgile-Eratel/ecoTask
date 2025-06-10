#!/bin/bash

# Script de configuration pour EcoTask
echo "🚀 Configuration d'EcoTask avec PostgreSQL et Docker"

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Créer les fichiers d'environnement s'ils n'existent pas
if [ ! -f backend/.env ]; then
    echo "📝 Création du fichier .env pour le backend..."
    cp backend/.env.example backend/.env
    echo "✅ Fichier backend/.env créé. Vous pouvez le modifier si nécessaire."
fi

if [ ! -f .env ]; then
    echo "📝 Création du fichier .env pour le frontend..."
    cat > .env << EOF
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=EcoTask
VITE_APP_VERSION=1.0.0
EOF
    echo "✅ Fichier .env créé pour le frontend."
fi

# Installer les dépendances du backend
echo "📦 Installation des dépendances du backend..."
cd backend
npm install
echo "✅ Dépendances du backend installées."

# Retourner au répertoire racine
cd ..

# Démarrer PostgreSQL avec Docker
echo "🐘 Démarrage de PostgreSQL avec Docker..."
docker-compose up -d postgres

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente que PostgreSQL soit prêt..."
sleep 10

# Générer le client Prisma et pousser le schéma
echo "🔧 Configuration de la base de données..."
cd backend
npx prisma generate
npx prisma db push

# Seeder la base de données
echo "🌱 Initialisation des données de test..."
npm run db:seed

echo "✅ Base de données configurée et initialisée."

# Retourner au répertoire racine
cd ..

echo ""
echo "🎉 Configuration terminée avec succès !"
echo ""
echo "Pour démarrer l'application :"
echo "1. Backend : cd backend && npm run dev"
echo "2. Frontend : npm run dev"
echo ""
echo "Ou utilisez les commandes Docker :"
echo "- Démarrer tout : docker-compose up"
echo "- Arrêter tout : docker-compose down"
echo ""
echo "URLs utiles :"
echo "- Frontend : http://localhost:5173"
echo "- Backend API : http://localhost:3001"
echo "- Prisma Studio : cd backend && npm run db:studio"
echo ""
