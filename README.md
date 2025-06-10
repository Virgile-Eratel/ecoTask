# EcoTask - Plateforme de Gestion de Tâches Écologique

EcoTask est une plateforme web de gestion de tâches dédiée aux petites entreprises cherchant à réduire leur empreinte écologique. L'application aide les équipes à collaborer tout en suivant l'impact environnemental de leurs projets grâce au calcul automatique du bilan carbone des tâches.

## 🌱 Fonctionnalités principales

### Gestion des tâches
- **CRUD complet** : Création, lecture, mise à jour et suppression des tâches
- **Détails enrichis** : Titre, description, responsable, échéance, priorité
- **Calcul automatique du CO₂** : Basé sur le type de tâche et la durée estimée
- **Filtrage avancé** : Par statut, priorité, type, projet et recherche textuelle

### Statistiques écologiques
- **Tableau de bord** : Vue d'ensemble des émissions de CO₂ par projet
- **Graphiques d'évolution** : Suivi temporel des émissions
- **Répartition par type** : Analyse des émissions par catégorie de tâche
- **Indicateurs visuels** : Badges colorés selon le niveau d'impact

### Collaboration d'équipe
- **Gestion des utilisateurs** : Rôles administrateur et membre
- **Gestion des projets** : Organisation par projets avec équipes assignées
- **Visibilité partagée** : Accès aux tâches selon les projets

## 🔧 Technologies utilisées

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS v3** + shadcn/ui
- **Zustand** pour l'état global
- **Recharts** pour les graphiques
- **Vite** comme build tool
- **Lucide React** pour les icônes

### Backend
- **Node.js** avec Express.js
- **TypeScript** pour la sécurité des types
- **Prisma ORM** pour PostgreSQL
- **Zod** pour la validation
- **Docker** pour la containerisation

### Base de données
- **PostgreSQL 15** avec Docker
- **Prisma** pour les migrations et requêtes
- **Calculs CO₂** automatiques avec triggers

## 📊 Calcul des émissions CO₂

L'application utilise des coefficients hypothétiques pour estimer l'impact carbone :

| Type de tâche | Coefficient | Exemples |
|---------------|-------------|----------|
| **Bureautique légère** | 0.1 kg CO₂/h | Rédaction, réunions en ligne, emails |
| **Technique** | 1.0 kg CO₂/h | Développement, conception graphique, tests |
| **Forte intensité** | 3.5 kg CO₂/h | Simulation, rendu vidéo, calculs lourds |

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+
- Docker et Docker Compose
- npm ou yarn

### Installation rapide
```bash
# Cloner le projet
git clone <repository-url>
cd ecotaskv2

# Configuration automatique (PostgreSQL + Backend + Frontend)
npm run setup

# Démarrer l'environnement complet
npm run dev:full
```

### 🐳 Démarrage avec Docker (Recommandé)
```bash
# Test de la configuration Docker
npm run docker:test

# Démarrage complet avec Docker (frontend + backend + base de données)
npm run dev:docker
# ou pour un démarrage plus simple
npm run dev:docker:simple
```

**Avantages Docker :**
- ✅ Environnement identique pour tous les développeurs
- ✅ Pas besoin d'installer PostgreSQL localement
- ✅ Isolation complète des services
- ✅ Configuration automatique

Consultez [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) pour plus de détails.

### Installation manuelle
```bash
# Installer les dépendances frontend
npm install

# Installer les dépendances backend
cd backend && npm install && cd ..

# Démarrer PostgreSQL
docker-compose up -d postgres

# Configurer la base de données
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
cd ..

# Démarrer le backend (terminal 1)
cd backend && npm run dev

# Démarrer le frontend (terminal 2)
npm run dev
```

### URLs d'accès
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001
- **Health Check** : http://localhost:3001/health
- **Prisma Studio** : `cd backend && npm run db:studio`

### Scripts disponibles
```bash
# Frontend
npm run dev          # Démarrage en mode développement
npm run build        # Build de production
npm run preview      # Aperçu du build de production
npm run lint         # Vérification ESLint

# Projet complet
npm run setup        # Configuration initiale complète
npm run dev:full     # Démarrer tout l'environnement (local)

# Docker (recommandé)
npm run dev:docker        # Environnement complet avec Docker (avec vérifications)
npm run dev:docker:simple # Environnement Docker simple et rapide
npm run docker:up         # Démarrer les services Docker
npm run docker:down       # Arrêter les services Docker
npm run docker:logs       # Voir les logs des conteneurs
npm run docker:build      # Construire les images Docker
npm run docker:test       # Tester la configuration Docker

# Base de données
npm run db:studio    # Ouvrir Prisma Studio
```

Pour plus de détails, consultez [INSTALLATION.md](./INSTALLATION.md).

## 🏗️ Architecture du projet

```
├── frontend/
│   ├── src/
│   │   ├── components/          # Composants React
│   │   │   ├── ui/             # Composants UI de base (shadcn/ui)
│   │   │   ├── Dashboard.tsx   # Tableau de bord principal
│   │   │   ├── TaskList.tsx    # Liste et gestion des tâches
│   │   │   ├── TaskCard.tsx    # Carte d'affichage d'une tâche
│   │   │   ├── TaskForm.tsx    # Formulaire de création/édition
│   │   │   ├── ProjectList.tsx # Gestion des projets
│   │   │   ├── TeamList.tsx    # Gestion de l'équipe
│   │   │   ├── Navigation.tsx  # Navigation principale
│   │   │   └── CO2Indicator.tsx # Indicateur d'émissions CO₂
│   │   ├── services/           # Services API
│   │   │   ├── api.ts         # Client API de base
│   │   │   ├── userService.ts # Service utilisateurs
│   │   │   ├── projectService.ts # Service projets
│   │   │   ├── taskService.ts # Service tâches
│   │   │   └── statsService.ts # Service statistiques
│   │   ├── hooks/             # Hooks personnalisés
│   │   │   └── useApi.ts      # Hooks pour les appels API
│   │   ├── lib/
│   │   │   └── utils.ts       # Utilitaires et calculs CO₂
│   │   ├── store/
│   │   │   └── useStore.ts    # Store Zustand simplifié
│   │   ├── types/
│   │   │   └── index.ts       # Types TypeScript
│   │   └── main.tsx          # Point d'entrée
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/            # Routes API Express
│   │   │   ├── users.ts      # CRUD utilisateurs
│   │   │   ├── projects.ts   # CRUD projets
│   │   │   ├── tasks.ts      # CRUD tâches
│   │   │   └── stats.ts      # Statistiques et dashboard
│   │   ├── middleware/        # Middlewares Express
│   │   │   ├── errorHandler.ts # Gestion d'erreurs
│   │   │   └── notFound.ts   # Route 404
│   │   ├── utils/            # Utilitaires backend
│   │   │   ├── database.ts   # Client Prisma
│   │   │   ├── co2Calculator.ts # Calculs CO₂
│   │   │   ├── validators.ts # Validation Zod
│   │   │   └── seed.ts       # Données de test
│   │   └── index.ts          # Serveur Express
│   ├── prisma/
│   │   └── schema.prisma     # Schéma de base de données
│   └── package.json
├── database/
│   └── init/                 # Scripts d'initialisation PostgreSQL
├── scripts/                  # Scripts de développement
│   ├── setup.sh             # Configuration initiale
│   └── dev.sh               # Démarrage développement
├── docker-compose.yml        # Configuration Docker
└── README.md
```

## 🎨 Design System

L'application utilise un design system basé sur :
- **Couleurs écologiques** : Palette verte pour rappeler l'aspect environnemental
- **Composants shadcn/ui** : Interface moderne et accessible
- **Indicateurs visuels** : Badges colorés pour les niveaux de CO₂
- **Responsive design** : Adaptation mobile et desktop

## 📈 Fonctionnalités futures

- [ ] Intégration base de données PostgreSQL
- [ ] Authentification utilisateur
- [ ] API REST complète
- [ ] Notifications en temps réel
- [ ] Export des rapports CO₂
- [ ] Objectifs de réduction d'émissions
- [ ] Intégration calendrier
- [ ] Mode hors ligne

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🌍 Impact environnemental

EcoTask vise à sensibiliser les équipes à leur impact numérique et à encourager des pratiques plus durables dans le développement et la gestion de projets.
