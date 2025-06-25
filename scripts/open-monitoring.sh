#!/bin/bash

# Script pour ouvrir l'interface de monitoring Uptime Kuma
# Usage: ./scripts/open-monitoring.sh

echo "🔍 Ouverture de l'interface de monitoring Uptime Kuma..."

# Vérifier si Uptime Kuma est accessible
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Uptime Kuma est accessible"
    echo "🌐 Ouverture de http://localhost:3001 dans le navigateur..."
    
    # Ouvrir dans le navigateur selon l'OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open http://localhost:3001
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open http://localhost:3001
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        start http://localhost:3001
    else
        echo "📋 Copiez cette URL dans votre navigateur : http://localhost:3001"
    fi
    
    echo ""
    echo "📊 Interface de monitoring disponible :"
    echo "   - Surveillance des services EcoTask"
    echo "   - Historique de disponibilité"
    echo "   - Configuration des alertes"
    echo ""
    echo "💡 Première utilisation :"
    echo "   1. Créez un compte administrateur"
    echo "   2. Configurez les moniteurs recommandés (voir UPTIME_KUMA_SETUP.md)"
    echo "   3. Optionnel : configurez les notifications"
    
else
    echo "❌ Uptime Kuma n'est pas accessible sur http://localhost:3001"
    echo ""
    echo "🔧 Solutions possibles :"
    echo "   1. Démarrer les services Docker : docker compose up -d"
    echo "   2. Vérifier les logs : docker compose logs uptime-kuma"
    echo "   3. Redémarrer le service : docker compose restart uptime-kuma"
    echo ""
    echo "📖 Consultez UPTIME_KUMA_SETUP.md pour plus d'aide"
fi
