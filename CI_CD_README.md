# CI/CD Configuration pour EcoTaskv2

Ce document décrit la configuration de l'intégration continue et du déploiement continu (CI/CD) pour le projet EcoTaskv2.

## Vue d'ensemble

La pipeline CI/CD est configurée avec GitLab CI/CD et comprend les étapes suivantes :

1. **Installation des dépendances**
2. **Linting du code**
3. **Tests automatisés**
4. **Build de l'application**
5. **Audit de sécurité**

## Structure de la Pipeline

### Stages

1. **install** - Installation des dépendances
2. **lint** - Vérification de la qualité du code
3. **test** - Exécution des tests
4. **build** - Construction de l'application
5. **security** - Audit de sécurité

### Jobs

#### Installation des dépendances (`install_dependencies`)
- Installe les dépendances frontend et backend
- Cache les `node_modules` pour optimiser les builds suivants
- Génère des artifacts pour les autres jobs

#### Linting
- **Frontend** (`lint_frontend`) : Vérifie le code frontend avec ESLint
- **Backend** (`lint_backend`) : Vérifie le code backend avec ESLint
- Configuré avec `allow_failure: true` pour ne pas bloquer la pipeline

#### Tests
- **Frontend** (`test_frontend`) : 
  - Exécute les tests avec Vitest
  - Génère un rapport de couverture
  - 73 tests actuellement
- **Backend** (`test_backend`) :
  - Exécute les tests avec Jest
  - Génère un rapport de couverture
  - 72 tests actuellement
  - Configure une base de données PostgreSQL pour les tests

#### Build
- **Frontend** (`build_frontend`) : Build avec Vite
- **Backend** (`build_backend`) : Compilation TypeScript
- **Docker** (`build_docker`) : Construction des images Docker (manuel)

#### Sécurité
- **Audit** (`security_audit`) : Audit des dépendances avec `yarn audit`
- **Validation** (`validate_pipeline`) : Validation globale de la pipeline

## Configuration des Tests

### Frontend (Vitest)
- Configuration dans `vite.config.ts`
- Tests dans `src/**/__tests__/**`
- Couverture avec v8
- Rapports : text, json, html, cobertura

### Backend (Jest)
- Configuration dans `jest.config.js`
- Tests dans `backend/src/**/__tests__/**`
- Couverture avec Jest
- Rapports : text, lcov, html, cobertura, junit

## Variables d'Environnement

La pipeline utilise les variables suivantes :

```yaml
NODE_ENV: "test"
POSTGRES_DB: "ecotask_test"
POSTGRES_USER: "ecotask_user"
POSTGRES_PASSWORD: "ecotask_password"
DATABASE_URL: "postgresql://ecotask_user:ecotask_password@postgres:5432/ecotask_test"
JWT_SECRET: "test-jwt-secret-key"
```

## Services

- **PostgreSQL 15** : Base de données pour les tests backend

## Cache

Le cache est configuré pour optimiser les performances :
- Clé basée sur `package-lock.json` et `backend/package-lock.json`
- Cache des `node_modules` frontend et backend
- Cache Yarn

## Artifacts

- **Tests** : Rapports de couverture (1 semaine)
- **Build** : Fichiers compilés (1 semaine)

## Déclencheurs

La pipeline s'exécute sur :
- Merge requests
- Branche `main`
- Branche `develop`

## Commandes Locales

Pour reproduire la CI localement :

```bash
# Installation
yarn install
cd backend && yarn install

# Tests
yarn test --run
cd backend && yarn test:ci

# Build
yarn build
cd backend && yarn build

# Linting
yarn lint
cd backend && yarn lint
```

## Métriques Actuelles

- **Tests Frontend** : 73 tests passants
- **Tests Backend** : 72 tests passants
- **Couverture Frontend** : ~19% (en cours d'amélioration)
- **Couverture Backend** : ~67%

## Améliorations Futures

1. Déploiement automatique
2. Tests d'intégration
3. Tests E2E
4. Amélioration de la couverture de code
5. Notifications Slack/Teams
6. Analyse de qualité avec SonarQube
