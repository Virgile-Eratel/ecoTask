# Intégration API EcoTask - Documentation

## 🎉 Implémentation terminée !

L'intégration complète entre le frontend React et l'API backend PostgreSQL est maintenant fonctionnelle.

## ✅ Ce qui a été implémenté

### 1. **Backend API complet**
- **Express.js + TypeScript** avec middleware de sécurité
- **PostgreSQL** avec Prisma ORM
- **Validation Zod** pour toutes les entrées
- **Calculs CO₂ automatiques** avec triggers de base de données
- **API REST complète** avec pagination et filtres

### 2. **Services API Frontend**
- **Client API centralisé** (`src/services/api.ts`)
- **Services spécialisés** pour chaque entité :
  - `userService.ts` - Gestion des utilisateurs
  - `projectService.ts` - Gestion des projets  
  - `taskService.ts` - Gestion des tâches
  - `statsService.ts` - Statistiques et dashboard

### 3. **Hooks personnalisés**
- **`useApiCall`** - Appels API simples
- **`useApiList`** - Listes avec pagination
- **`useApiMutation`** - Mutations (create/update/delete)
- **`useApiData`** - Chargement automatique au montage

### 4. **Composants mis à jour**
- **Dashboard** - Statistiques en temps réel depuis l'API
- **TaskList** - CRUD complet avec filtres côté serveur
- **ProjectList** - Liste des projets depuis la base de données
- **TeamList** - Gestion des utilisateurs
- **TaskForm** - Formulaire avec validation et calculs CO₂

## 🔧 Configuration actuelle

### Ports utilisés
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3002
- **PostgreSQL** : localhost:5434
- **Prisma Studio** : http://localhost:5555 (quand lancé)

### Variables d'environnement

**Frontend (`.env`):**
```env
VITE_API_BASE_URL=http://localhost:3002/api
VITE_APP_NAME=EcoTask
VITE_APP_VERSION=1.0.0
```

**Backend (`backend/.env`):**
```env
DATABASE_URL="postgresql://ecotask_user:ecotask_password@localhost:5434/ecotask"
NODE_ENV=development
PORT=3002
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## 🚀 Démarrage rapide

### Option 1: Démarrage manuel
```bash
# Terminal 1: PostgreSQL
docker compose up -d postgres

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: Frontend
npm run dev
```

### Option 2: Script automatisé
```bash
# Configuration initiale (une seule fois)
npm run setup

# Démarrage complet
npm run dev:full
```

## 📊 Données de test

La base de données contient automatiquement :
- **5 utilisateurs** avec différents rôles
- **4 projets** avec équipes assignées
- **10 tâches** avec calculs CO₂ réels
- **Statistiques complètes** pour le dashboard

## 🧪 Tests d'intégration

### Test automatique
```bash
node test-integration.js
```

### Test dans l'interface
1. Ouvrir http://localhost:5173
2. Cliquer sur "Test API" dans la navigation
3. Cliquer sur "Lancer les tests API"

## 📈 Fonctionnalités API

### Endpoints disponibles

**Users:**
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/:id` - Détails d'un utilisateur
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

**Projects:**
- `GET /api/projects` - Liste des projets
- `GET /api/projects/:id` - Détails d'un projet
- `POST /api/projects` - Créer un projet
- `PUT /api/projects/:id` - Mettre à jour un projet
- `DELETE /api/projects/:id` - Supprimer un projet

**Tasks:**
- `GET /api/tasks` - Liste des tâches (avec filtres)
- `GET /api/tasks/:id` - Détails d'une tâche
- `POST /api/tasks` - Créer une tâche
- `PUT /api/tasks/:id` - Mettre à jour une tâche
- `DELETE /api/tasks/:id` - Supprimer une tâche
- `PUT /api/tasks/:id/status` - Changer le statut

**Stats:**
- `GET /api/stats/dashboard` - Statistiques du tableau de bord
- `GET /api/stats/co2-trends` - Tendances CO₂
- `GET /api/stats/project/:id` - Stats d'un projet
- `GET /api/stats/user/:id` - Stats d'un utilisateur

### Filtres et pagination

Tous les endpoints de liste supportent :
- **Pagination** : `?page=1&limit=10`
- **Recherche** : `?search=terme`
- **Filtres spécifiques** selon l'entité

## 🔄 Calculs CO₂ automatiques

### Coefficients utilisés
- **Bureautique légère** : 0.1 kg CO₂/h
- **Technique** : 1.0 kg CO₂/h
- **Forte intensité** : 3.5 kg CO₂/h

### Mise à jour automatique
- Calcul automatique lors de la création/modification de tâches
- Mise à jour du total CO₂ des projets via triggers PostgreSQL
- Recalcul possible via l'endpoint `/api/projects/:id/recalculate-co2`

## 🛠️ Outils de développement

### Prisma Studio
```bash
cd backend && npm run db:studio
```

### Logs de développement
```bash
# Logs du backend
cd backend && npm run dev

# Logs Docker
docker compose logs -f postgres
```

### Reset de la base de données
```bash
cd backend
npx prisma db push --force-reset
npm run db:seed
```

## 🔍 Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   - Modifier les ports dans `.env` et `docker-compose.yml`

2. **Erreur de connexion à la base de données**
   - Vérifier que PostgreSQL est démarré : `docker compose ps`
   - Vérifier l'URL dans `backend/.env`

3. **Erreurs CORS**
   - Vérifier `FRONTEND_URL` dans `backend/.env`

4. **Données manquantes**
   - Relancer le seed : `cd backend && npm run db:seed`

## 🎯 Prochaines étapes

L'application est maintenant **entièrement fonctionnelle** avec :
- ✅ Base de données PostgreSQL persistante
- ✅ API REST complète avec validation
- ✅ Frontend React intégré
- ✅ Calculs CO₂ automatiques
- ✅ Interface utilisateur moderne

Vous pouvez maintenant :
1. **Développer de nouvelles fonctionnalités**
2. **Ajouter l'authentification**
3. **Déployer en production**
4. **Ajouter des tests automatisés**

---

🎉 **L'intégration PostgreSQL + API est terminée et fonctionnelle !**
