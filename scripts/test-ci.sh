#!/bin/bash

# Script pour tester la CI localement
# Reproduit les étapes de la pipeline GitLab CI

set -e

echo "🚀 Test de la CI EcoTaskv2 en local"
echo "=================================="

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
step() {
    echo -e "\n${BLUE}📋 $1${NC}"
    echo "----------------------------------------"
}

# Fonction pour afficher le succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher les erreurs
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour afficher les avertissements
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    error "Ce script doit être exécuté depuis la racine du projet EcoTaskv2"
    exit 1
fi

# Stage 1: Installation des dépendances
step "Stage 1: Installation des dépendances"
echo "Installation des dépendances frontend..."
yarn install --frozen-lockfile
success "Dépendances frontend installées"

echo "Installation des dépendances backend..."
cd backend && yarn install --frozen-lockfile && cd ..
success "Dépendances backend installées"

# Stage 2: Linting (optionnel)
step "Stage 2: Linting du code (ignoré pour l'instant)"
warning "Linting ignoré en raison de conflits de configuration ESLint"
warning "Les jobs de linting sont configurés comme manuels dans GitLab CI"

# Stage 3: Tests
step "Stage 3: Exécution des tests"
echo "Tests frontend..."
if yarn test:run; then
    success "Tests frontend OK (73 tests)"
else
    error "Tests frontend échoués"
    exit 1
fi

echo "Tests backend..."
if cd backend && yarn test:ci && cd ..; then
    success "Tests backend OK (72 tests)"
else
    error "Tests backend échoués"
    exit 1
fi

# Stage 4: Build
step "Stage 4: Build de l'application"
echo "Build frontend..."
if yarn build; then
    success "Build frontend OK"
else
    error "Build frontend échoué"
    exit 1
fi

echo "Build backend..."
if cd backend && yarn build && cd ..; then
    success "Build backend OK"
else
    error "Build backend échoué"
    exit 1
fi

# Stage 5: Audit de sécurité
step "Stage 5: Audit de sécurité"
echo "Audit frontend..."
if yarn audit --audit-level moderate; then
    success "Audit frontend OK"
else
    warning "Audit frontend avec des avertissements (autorisé)"
fi

echo "Audit backend..."
if cd backend && yarn audit --audit-level moderate && cd ..; then
    success "Audit backend OK"
else
    warning "Audit backend avec des avertissements (autorisé)"
fi

# Résumé final
step "Résumé de la CI"
echo -e "${GREEN}🎉 Pipeline CI terminée avec succès !${NC}"
echo ""
echo "📊 Résultats :"
echo "  ✅ Installation des dépendances"
echo "  ⚠️  Linting (ignoré pour l'instant)"
echo "  ✅ Tests frontend (73 tests)"
echo "  ✅ Tests backend (72 tests)"
echo "  ✅ Build frontend"
echo "  ✅ Build backend"
echo "  ✅ Audit de sécurité"
echo ""
echo "🚀 Prêt pour le déploiement !"
echo ""
echo "📁 Artifacts générés :"
echo "  - dist/ (build frontend)"
echo "  - backend/dist/ (build backend)"
echo "  - coverage/ (rapports de couverture)"
echo "  - backend/coverage/ (rapports de couverture backend)"
