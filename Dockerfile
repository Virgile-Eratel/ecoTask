# Dockerfile pour le frontend React/Vite
FROM node:18-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache git

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY eslint.config.js ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY src ./src/
COPY public ./public/
COPY index.html ./

# Exposer le port Vite
EXPOSE 5173

# Variables d'environnement
ENV NODE_ENV=development

# Commande de démarrage en mode développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
