# TaskFlow

**TaskFlow** est une application web de gestion de tâches permettant aux utilisateurs de créer, consulter, modifier, supprimer et suivre leurs tâches personnelles.

## Démo

- **Frontend :** https://taskflow-frontend-bay-theta.vercel.app/
- **Backend API :** https://taskflow-5hsg.onrender.com
- **Documentation API (Swagger) :** https://taskflow-5hsg.onrender.com/api-docs

## Fonctionnalités

- Création d'un compte utilisateur.
- Connexion et authentification avec JWT.
- Gestion personnelle des tâches.
- Ajout, consultation, modification et suppression des tâches.
- Marquer une tâche comme terminée ou la réactiver.
- Filtrage des tâches.
- Protection des données de chaque utilisateur.

## Technologies utilisées

### Backend
- Node.js
- Express.js
- PostgreSQL
- JSON Web Token (JWT)
- Swagger

### Frontend
- HTML5
- CSS3
- JavaScript

### Hébergement
- Frontend : Vercel
- Backend : Render
- Base de données : Neon PostgreSQL

## Installation locale

### 1. Cloner le dépôt

```bash
git clone https://github.com/7oossein/taskflow.git
cd taskflow
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://127.0.0.1:5500
```

Remplacer les valeurs d'exemple par sa propre configuration.

**Important :** ne jamais publier le fichier `.env` ni partager les identifiants de la base de données ou le secret JWT.

### 4. Lancer le serveur

```bash
npm start
```

Le backend sera accessible à l'adresse :

```text
http://localhost:3000
```

## Documentation API

La documentation interactive des endpoints est disponible avec Swagger :

https://taskflow-5hsg.onrender.com/api-docs

## Base de données

TaskFlow utilise PostgreSQL pour stocker les utilisateurs et leurs tâches.

La relation entre les utilisateurs et les tâches permet à chaque utilisateur de gérer uniquement ses propres tâches.

## Auteur

Développé par **7oossein** dans le cadre d'un projet de développement web full-stack.
