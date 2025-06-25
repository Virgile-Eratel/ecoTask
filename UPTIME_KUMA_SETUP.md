# Uptime Kuma - Configuration de monitoring

## 🚀 Démarrage

Uptime Kuma est intégré dans votre environnement de développement Docker. Il permet de surveiller la disponibilité de vos services.

### Accès à l'interface

Une fois les conteneurs démarrés avec `docker compose up -d`, accédez à :
- **Interface Uptime Kuma** : http://localhost:3001
- **Script d'ouverture rapide** : `npm run monitoring`

### Premier démarrage

1. **Créer un compte administrateur**
   - Lors du premier accès, vous devrez créer un compte administrateur
   - Choisissez un nom d'utilisateur et un mot de passe sécurisé

2. **Configuration des moniteurs recommandés**

   Ajoutez ces moniteurs pour surveiller votre application EcoTask :

   #### Backend API Health Check
   - **Type** : HTTP(s)
   - **Nom** : EcoTask Backend Health
   - **URL** : http://backend:3002/health
   - **Intervalle** : 60 secondes
   - **Description** : Surveillance de l'API backend

   #### Frontend Application
   - **Type** : HTTP(s)
   - **Nom** : EcoTask Frontend
   - **URL** : http://frontend:5173
   - **Intervalle** : 60 secondes
   - **Description** : Surveillance de l'application frontend

   #### API Endpoints principaux
   - **Type** : HTTP(s)
   - **Nom** : EcoTask API Users
   - **URL** : http://backend:3002/users
   - **Intervalle** : 300 secondes (5 min)
   - **Description** : Test de l'endpoint utilisateurs

   - **Type** : HTTP(s)
   - **Nom** : EcoTask API Projects
   - **URL** : http://backend:3002/projects
   - **Intervalle** : 300 secondes (5 min)
   - **Description** : Test de l'endpoint projets

## 📊 Fonctionnalités disponibles

- **Monitoring en temps réel** : Surveillance continue de vos services
- **Alertes** : Notifications en cas de panne (email, Discord, Slack, etc.)
- **Historique** : Graphiques de disponibilité et temps de réponse
- **Status Page** : Page de statut publique (optionnel)
- **Multi-protocoles** : HTTP(s), TCP, Ping, DNS, etc.

## 🔧 Configuration avancée

### Notifications (optionnel)
Vous pouvez configurer des notifications pour être alerté en cas de problème :
1. Allez dans **Settings** > **Notifications**
2. Ajoutez votre service préféré (Email, Discord, Slack, etc.)
3. Testez la notification
4. Associez-la à vos moniteurs

### Variables d'environnement
Les URLs internes utilisent les noms des services Docker :
- `backend:3002` pour l'API backend
- `frontend:5173` pour le frontend React

### Données persistantes
Les données d'Uptime Kuma sont stockées dans le volume Docker `uptime_kuma_data` et persistent entre les redémarrages.

## 🚨 Dépannage

### Le service ne démarre pas
```bash
# Vérifier les logs
docker-compose logs uptime-kuma

# Redémarrer le service
docker-compose restart uptime-kuma
```

### Impossible d'accéder aux services
- Vérifiez que tous les conteneurs sont sur le même réseau (`ecotask-network`)
- Utilisez les noms de services Docker dans les URLs (ex: `http://backend:3002`)

### Reset des données
```bash
# Arrêter les services
docker-compose down

# Supprimer le volume (ATTENTION: perte de données)
docker volume rm ecotaskv2_uptime_kuma_data

# Redémarrer
docker-compose up
```

## 📝 Notes

- Uptime Kuma est configuré uniquement pour l'environnement de développement
- Pour la production, il faudra l'ajouter au `docker-compose.prod.yml`
- L'interface est accessible uniquement en local sur le port 3001
