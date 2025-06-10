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

- **Frontend** : React 18 avec TypeScript
- **Styling** : Tailwind CSS v3 + shadcn/ui
- **État global** : Zustand
- **Graphiques** : Recharts
- **Build** : Vite
- **Icons** : Lucide React

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
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd ecotaskv2

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Scripts disponibles
```bash
npm run dev          # Démarrage en mode développement
npm run build        # Build de production
npm run preview      # Aperçu du build de production
npm run lint         # Vérification ESLint
```

## 🏗️ Architecture du projet

```
src/
├── components/          # Composants React
│   ├── ui/             # Composants UI de base (shadcn/ui)
│   ├── Dashboard.tsx   # Tableau de bord principal
│   ├── TaskList.tsx    # Liste et gestion des tâches
│   ├── TaskCard.tsx    # Carte d'affichage d'une tâche
│   ├── TaskForm.tsx    # Formulaire de création/édition
│   ├── ProjectList.tsx # Gestion des projets
│   ├── TeamList.tsx    # Gestion de l'équipe
│   ├── Navigation.tsx  # Navigation principale
│   └── CO2Indicator.tsx # Indicateur d'émissions CO₂
├── lib/
│   └── utils.ts        # Utilitaires et calculs CO₂
├── store/
│   └── useStore.ts     # Store Zustand
├── types/
│   └── index.ts        # Types TypeScript
└── main.tsx           # Point d'entrée
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
