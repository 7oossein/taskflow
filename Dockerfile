
# Image officielle de Node.js
FROM node:24-alpine

# Dossier de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste du projet
COPY . .

# Port utilisé par Express
EXPOSE 3000

# Démarrer le serveur
CMD ["npm", "start"]
