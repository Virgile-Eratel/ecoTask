#!/bin/bash

# Script d'installation et de configuration du serveur pour EcoTask
# Usage: ./scripts/setup-server.sh

set -e

echo "🚀 Configuration du serveur EcoTask"

# Fonction de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Vérifier que le script est exécuté en tant qu'utilisateur dev5
if [ "$USER" != "dev5" ]; then
    log "❌ Ce script doit être exécuté en tant qu'utilisateur dev5"
    exit 1
fi

# Mise à jour du système
log "📦 Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# Installation des dépendances de base
log "🔧 Installation des dépendances de base..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Installation de Docker
log "🐳 Installation de Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker dev5
    rm get-docker.sh
    log "✅ Docker installé"
else
    log "✅ Docker déjà installé"
fi

# Installation de Docker Compose
log "🐙 Installation de Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log "✅ Docker Compose installé"
else
    log "✅ Docker Compose déjà installé"
fi

# Création des répertoires nécessaires
log "📁 Création des répertoires..."
sudo mkdir -p /var/www/ecotask
sudo mkdir -p /var/backups/ecotask
sudo mkdir -p /var/log/ecotask

# Configuration des permissions
log "🔐 Configuration des permissions..."
sudo chown -R dev5:dev5 /var/www/ecotask
sudo chown -R dev5:dev5 /var/backups/ecotask
sudo chown -R dev5:dev5 /var/log/ecotask

# Configuration du firewall (UFW)
log "🔥 Configuration du firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp  # API backend
sudo ufw reload

# Installation de fail2ban pour la sécurité SSH
log "🛡️ Installation de fail2ban..."
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configuration de logrotate pour les logs Docker
log "📋 Configuration de logrotate..."
sudo tee /etc/logrotate.d/docker > /dev/null <<EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

# Configuration des limites système
log "⚙️ Configuration des limites système..."
sudo tee -a /etc/security/limits.conf > /dev/null <<EOF
dev5 soft nofile 65536
dev5 hard nofile 65536
dev5 soft nproc 4096
dev5 hard nproc 4096
EOF

# Configuration de la swap (si nécessaire)
log "💾 Vérification de la swap..."
if [ $(free | grep Swap | awk '{print $2}') -eq 0 ]; then
    log "📝 Création d'un fichier de swap de 2GB..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    log "✅ Swap configurée"
else
    log "✅ Swap déjà configurée"
fi

# Installation de monitoring basique
log "📊 Installation d'outils de monitoring..."
sudo apt install -y htop iotop nethogs ncdu

# Configuration de cron pour le nettoyage automatique
log "🧹 Configuration du nettoyage automatique..."
(crontab -l 2>/dev/null; echo "0 2 * * 0 docker system prune -f") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 find /var/backups/ecotask -name '*.db' -mtime +30 -delete") | crontab -

# Création d'un script de monitoring
log "📈 Création du script de monitoring..."
tee /home/dev5/monitor-ecotask.sh > /dev/null <<'EOF'
#!/bin/bash
echo "=== EcoTask System Status ==="
echo "Date: $(date)"
echo ""
echo "=== Docker Containers ==="
cd /var/www/ecotask
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "=== System Resources ==="
free -h
echo ""
df -h
echo ""
echo "=== Application Health ==="
curl -s http://localhost/health || echo "Frontend: DOWN"
curl -s http://localhost:3001/health || echo "Backend: DOWN"
EOF
chmod +x /home/dev5/monitor-ecotask.sh

# Test de Docker
log "🧪 Test de Docker..."
if docker run --rm hello-world > /dev/null 2>&1; then
    log "✅ Docker fonctionne correctement"
else
    log "❌ Problème avec Docker"
    exit 1
fi

# Affichage des informations finales
log "🎉 Configuration du serveur terminée!"
echo ""
echo "📋 Résumé de la configuration:"
echo "  - Docker: $(docker --version)"
echo "  - Docker Compose: $(docker-compose --version)"
echo "  - Répertoire app: /var/www/ecotask"
echo "  - Répertoire backup: /var/backups/ecotask"
echo "  - Utilisateur: dev5"
echo ""
echo "🔧 Prochaines étapes:"
echo "  1. Configurer les clés SSH dans GitLab CI/CD"
echo "  2. Lancer un déploiement depuis GitLab"
echo "  3. Vérifier l'application sur http://$(hostname -I | awk '{print $1}')"
echo ""
echo "📊 Monitoring:"
echo "  - Script de monitoring: ~/monitor-ecotask.sh"
echo "  - Logs Docker: docker-compose -f /var/www/ecotask/docker-compose.prod.yml logs -f"
echo ""
log "✅ Serveur prêt pour le déploiement EcoTask!"
