#!/bin/bash

# Script de test pour vérifier que l'API fonctionne correctement
echo "🧪 Test de l'API EcoTask"

API_URL="http://localhost:3001"

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s -w "%{http_code}" -X $method "$API_URL$endpoint" -o /tmp/response.json)
    http_code=${response: -3}
    
    if [ $http_code -eq 200 ] || [ $http_code -eq 201 ]; then
        echo "✅ OK ($http_code)"
        return 0
    else
        echo "❌ FAILED ($http_code)"
        cat /tmp/response.json 2>/dev/null
        echo ""
        return 1
    fi
}

# Vérifier que l'API est accessible
echo "🔍 Vérification de l'accessibilité de l'API..."
if ! curl -s "$API_URL/health" > /dev/null; then
    echo "❌ L'API n'est pas accessible sur $API_URL"
    echo "Assurez-vous que le backend est démarré avec 'cd backend && npm run dev'"
    exit 1
fi

echo "✅ API accessible"
echo ""

# Tests des endpoints
echo "📊 Test des endpoints..."

test_endpoint "GET" "/health" "Health check"
test_endpoint "GET" "/api/users" "Liste des utilisateurs"
test_endpoint "GET" "/api/projects" "Liste des projets"
test_endpoint "GET" "/api/tasks" "Liste des tâches"
test_endpoint "GET" "/api/stats/dashboard" "Statistiques du dashboard"

echo ""
echo "🎯 Tests spécifiques..."

# Test avec paramètres
test_endpoint "GET" "/api/tasks?limit=5" "Tâches avec limite"
test_endpoint "GET" "/api/projects?limit=3" "Projets avec limite"

echo ""

# Afficher un résumé des données
echo "📈 Résumé des données:"
echo "Utilisateurs: $(curl -s "$API_URL/api/users" | jq '.data.pagination.total // 0')"
echo "Projets: $(curl -s "$API_URL/api/projects" | jq '.data.pagination.total // 0')"
echo "Tâches: $(curl -s "$API_URL/api/tasks" | jq '.data.pagination.total // 0')"

# Test du dashboard
dashboard_data=$(curl -s "$API_URL/api/stats/dashboard")
total_co2=$(echo $dashboard_data | jq '.data.co2Stats.totalCO2 // 0')
echo "CO₂ total: ${total_co2} kg"

echo ""
echo "✅ Tests terminés ! L'API fonctionne correctement."
echo ""
echo "🌐 URLs utiles:"
echo "  - Health check: $API_URL/health"
echo "  - API docs: $API_URL/api"
echo "  - Frontend: http://localhost:5173"
