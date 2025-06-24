#!/bin/bash

# Script de validation du déploiement EcoTask
# Usage: ./scripts/validate-deployment.sh [host]

set -e

HOST=${1:-localhost}
API_PORT=${2:-3001}
FRONTEND_PORT=${3:-80}

echo "🔍 Validation du déploiement EcoTask sur $HOST"

# Fonction de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Fonction de test HTTP
test_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3
    
    log "🧪 Test: $description"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        log "✅ $description - OK ($response)"
        return 0
    else
        log "❌ $description - FAILED ($response)"
        return 1
    fi
}

# Fonction de test JSON
test_json_endpoint() {
    local url=$1
    local description=$2
    
    log "🧪 Test: $description"
    
    response=$(curl -s "$url" | jq -r '.success // empty' 2>/dev/null || echo "")
    
    if [ "$response" = "true" ]; then
        log "✅ $description - OK"
        return 0
    else
        log "❌ $description - FAILED"
        return 1
    fi
}

# Variables de test
FRONTEND_URL="http://$HOST:$FRONTEND_PORT"
API_URL="http://$HOST:$API_PORT"

# Compteurs
TESTS_PASSED=0
TESTS_FAILED=0

# Tests de base
log "🚀 Début des tests de validation"

# Test 1: Frontend accessible
if test_endpoint "$FRONTEND_URL" 200 "Frontend accessible"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

# Test 2: API Health Check
if test_json_endpoint "$API_URL/health" "API Health Check"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

# Test 3: API Users endpoint
if test_json_endpoint "$API_URL/api/users" "API Users endpoint"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

# Test 4: API Projects endpoint
if test_json_endpoint "$API_URL/api/projects" "API Projects endpoint"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

# Test 5: API Tasks endpoint
if test_json_endpoint "$API_URL/api/tasks" "API Tasks endpoint"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

# Test 6: API Stats endpoint
if test_json_endpoint "$API_URL/api/stats/dashboard" "API Stats endpoint"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

# Test 7: Frontend routing (SPA)
if test_endpoint "$FRONTEND_URL/projects" 200 "Frontend SPA routing"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

# Test 8: Static assets
if test_endpoint "$FRONTEND_URL/favicon.ico" 200 "Static assets"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

# Tests Docker (si disponible)
if command -v docker &> /dev/null; then
    log "🐳 Tests Docker"
    
    # Test 9: Conteneurs en cours d'exécution
    if docker ps | grep -q "ecotask"; then
        log "✅ Conteneurs EcoTask en cours d'exécution"
        ((TESTS_PASSED++))
    else
        log "❌ Aucun conteneur EcoTask trouvé"
        ((TESTS_FAILED++))
    fi
    
    # Test 10: Images Docker présentes
    if docker images | grep -q "ecotask"; then
        log "✅ Images Docker EcoTask présentes"
        ((TESTS_PASSED++))
    else
        log "❌ Aucune image Docker EcoTask trouvée"
        ((TESTS_FAILED++))
    fi
fi

# Tests de performance basiques
log "⚡ Tests de performance"

# Test 11: Temps de réponse API
start_time=$(date +%s%N)
curl -s "$API_URL/health" > /dev/null
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))

if [ $response_time -lt 1000 ]; then
    log "✅ Temps de réponse API acceptable (${response_time}ms)"
    ((TESTS_PASSED++))
else
    log "⚠️  Temps de réponse API lent (${response_time}ms)"
    ((TESTS_FAILED++))
fi

# Test 12: Temps de réponse Frontend
start_time=$(date +%s%N)
curl -s "$FRONTEND_URL" > /dev/null
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))

if [ $response_time -lt 2000 ]; then
    log "✅ Temps de réponse Frontend acceptable (${response_time}ms)"
    ((TESTS_PASSED++))
else
    log "⚠️  Temps de réponse Frontend lent (${response_time}ms)"
    ((TESTS_FAILED++))
fi

# Résumé des tests
log "📊 Résumé des tests"
echo ""
echo "✅ Tests réussis: $TESTS_PASSED"
echo "❌ Tests échoués: $TESTS_FAILED"
echo "📈 Taux de réussite: $(( TESTS_PASSED * 100 / (TESTS_PASSED + TESTS_FAILED) ))%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    log "🎉 Tous les tests sont passés! Déploiement validé."
    echo ""
    echo "🔗 URLs de l'application:"
    echo "  Frontend: $FRONTEND_URL"
    echo "  API: $API_URL"
    echo "  Health: $API_URL/health"
    exit 0
else
    log "❌ Certains tests ont échoué. Vérifiez la configuration."
    exit 1
fi
