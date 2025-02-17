# VibeSync

VibeSync est une application de gestion de projets construite avec React, Firebase et Tailwind CSS. Elle permet aux utilisateurs de s'inscrire, de se connecter, de créer des projets et de gérer des tâches.

## Fonctionnalités

- Inscription et connexion des utilisateurs
- Création et gestion de projets
- Ajout et gestion de tâches
- Interface utilisateur réactive avec Tailwind CSS
- Authentification via Firebase

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

- [Node.js](https://nodejs.org/) (version 14 ou supérieure)
- [pnpm](https://pnpm.js.org/) (pour la gestion des paquets)

## Installation

1. Clonez le dépôt :

   ```bash
   git clone https://github.com/votre-utilisateur/vibesync.git
   cd vibesync
   ```

2. Installez les dépendances :

   ```bash
   pnpm install
   ```

3. Configurez Firebase :

   - Créez un projet sur [Firebase Console](https://console.firebase.google.com/).
   - Activez l'authentification par e-mail et mot de passe.
   - Remplissez les informations de configuration Firebase dans `src/lib/firebase.ts`.

4. Démarrez l'application en mode développement :

   ```bash
   pnpm dev
   ```

5. Ouvrez votre navigateur et accédez à `http://localhost:3000`.

## Scripts

- `dev`: Démarre le serveur de développement.
- `build`: Crée une version optimisée de l'application pour la production.
- `lint`: Vérifie le code avec ESLint.
- `preview`: Prévisualise la version construite de l'application.
- `fbase`: Déploie l'application sur Firebase Hosting.

## Contribuer

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Forkez le projet.
2. Créez une nouvelle branche (`git checkout -b feature/YourFeature`).
3. Apportez vos modifications et validez (`git commit -m 'Add some feature'`).
4. Poussez votre branche (`git push origin feature/YourFeature`).
5. Ouvrez une Pull Request.

## License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Acknowledgments

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)