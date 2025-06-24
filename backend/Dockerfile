FROM node:18-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache openssl

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Installer toutes les dépendances (y compris dev pour TypeScript)
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source
COPY src ./src/

# Construire l'application
RUN npm run build

# Supprimer les dépendances de développement après la construction
RUN npm prune --production

# Exposer le port
EXPOSE 3002

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3002

# Commande de démarrage
CMD ["npm", "start"]
