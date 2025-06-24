# Migration de PostgreSQL vers SQLite

## Résumé des modifications

Ce document décrit la migration complète de PostgreSQL vers SQLite dans le backend EcoTask, permettant de simplifier la CI/CD et l'environnement de développement.

## Modifications apportées

### 1. Schéma Prisma (`backend/prisma/schema.prisma`)
- **Changement du provider** : `postgresql` → `sqlite`
- **Conversion des enums** : SQLite ne supportant pas les enums natifs, ils ont été convertis en champs `String` avec commentaires
- **Suppression des enums Prisma** : Les définitions d'enums ont été supprimées du schéma

### 2. Types TypeScript (`backend/src/types/enums.ts`)
- **Nouveau fichier créé** pour remplacer les enums Prisma
- **Types constants** : Utilisation de `const assertions` pour maintenir la sécurité des types
- **Fonctions de validation** : Ajout d'utilitaires pour valider les valeurs d'enums

### 3. Configuration de base de données
- **Fichiers .env** : Mise à jour des URLs de base de données
  - `DATABASE_URL="file:./dev.db"` (développement)
  - `DATABASE_URL="file:./test.db"` (tests)
- **Gitignore** : Ajout des fichiers SQLite (*.db, *.sqlite, etc.)

### 4. Configuration GitLab CI (`.gitlab-ci.yml`)
- **Suppression du service PostgreSQL** : Plus besoin de conteneur de base de données
- **Simplification des variables** : Suppression des variables PostgreSQL
- **Tests backend simplifiés** : Suppression des étapes d'attente de PostgreSQL

### 5. Docker Compose (`docker-compose.yml`)
- **Suppression du service PostgreSQL**
- **Mise à jour du backend** : Nouvelle URL de base de données et volume pour SQLite
- **Volume SQLite** : Ajout d'un volume pour persister les données SQLite

### 6. Mise à jour du code
- **Imports** : Remplacement des imports d'enums `@prisma/client` par `../types/enums`
- **Validators** : Mise à jour des schémas Zod pour utiliser `z.enum()` au lieu de `z.nativeEnum()`
- **Tests** : Mise à jour de tous les fichiers de test pour utiliser les nouveaux types

### 7. Documentation
- **INSTALLATION.md** : Mise à jour des instructions d'installation
- **package.json** : Mise à jour des mots-clés (postgresql → sqlite)
- **Scripts** : Simplification du script de setup

## Avantages de la migration

### 🚀 CI/CD Simplifiée
- **Plus de service externe** : Pas besoin de PostgreSQL dans la CI
- **Temps de build réduit** : Suppression de l'attente de démarrage de PostgreSQL
- **Configuration simplifiée** : Moins de variables d'environnement

### 💻 Développement Local
- **Setup plus simple** : Pas besoin de Docker pour la base de données
- **Portabilité** : Base de données incluse dans le projet
- **Débogage facilité** : Fichier de base de données accessible directement

### 🧪 Tests
- **Isolation** : Chaque test peut avoir sa propre base de données
- **Performance** : Tests plus rapides sans réseau
- **Simplicité** : Pas de configuration de base de données externe

## Compatibilité

### ✅ Fonctionnalités conservées
- Toutes les fonctionnalités de l'API restent identiques
- Les types TypeScript sont maintenus
- La validation des données fonctionne de la même manière
- Les tests passent tous (72 tests)

### ⚠️ Limitations SQLite
- **Pas d'enums natifs** : Utilisation de chaînes de caractères avec validation
- **Concurrence limitée** : SQLite supporte moins d'écritures simultanées que PostgreSQL
- **Pas de types avancés** : Certains types PostgreSQL ne sont pas disponibles

## Migration des données

Pour migrer des données existantes de PostgreSQL vers SQLite :

1. **Exporter les données** depuis PostgreSQL
2. **Adapter le format** si nécessaire (notamment pour les enums)
3. **Importer dans SQLite** via Prisma ou scripts SQL

## Tests et validation

- ✅ **72 tests passent** avec succès
- ✅ **Couverture de code** : 67.72%
- ✅ **CI/CD** : Tests backend simplifiés et fonctionnels
- ✅ **Serveur** : Démarrage et fonctionnement confirmés
- ✅ **Seeding** : Base de données initialisée avec succès

## Commandes utiles

```bash
# Générer le client Prisma
cd backend && npx prisma generate

# Créer/mettre à jour la base de données
cd backend && npx prisma db push

# Initialiser avec des données de test
cd backend && npm run db:seed

# Lancer les tests
cd backend && yarn test

# Lancer les tests CI
cd backend && yarn test:ci

# Démarrer le serveur de développement
cd backend && npm run dev
```

## Déploiement Docker

### Configuration CI/CD avec Docker

La migration vers SQLite a également permis de simplifier le déploiement avec Docker :

- **Images Docker** : Frontend (Nginx) + Backend (Node.js)
- **Registry** : GitLab Container Registry
- **Déploiement** : Automatisé via GitLab CI/CD
- **Serveur** : dev5@51.68.233.128

### Fichiers de déploiement ajoutés

- `Dockerfile.prod` : Image de production frontend
- `backend/Dockerfile.prod` : Image de production backend
- `docker-compose.prod.yml` : Configuration de production
- `scripts/deploy.sh` : Script de déploiement
- `scripts/setup-server.sh` : Configuration du serveur
- `DEPLOYMENT.md` : Guide de déploiement complet

### Pipeline CI/CD

1. **Install** → **Lint** → **Test** → **Build**
2. **Docker Build** : Construction des images
3. **Deploy** : Déploiement sur le serveur (manuel)

## Conclusion

La migration vers SQLite a été réalisée avec succès, simplifiant considérablement l'infrastructure tout en conservant toutes les fonctionnalités. Cette approche est particulièrement adaptée pour :

- Les environnements de développement
- Les tests automatisés
- Les déploiements simples avec Docker
- Les projets de taille petite à moyenne
- La CI/CD simplifiée sans services externes

Pour des besoins de production avec forte concurrence, PostgreSQL reste recommandé, mais la migration inverse est possible grâce à Prisma.
