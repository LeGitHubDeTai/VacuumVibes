# VacuumVibes 🌐

## Avertissement ⚠️

Ce projet a été créé dans le but spécifique de convertir un site WordPress en un site statique. Il est destiné à un usage éducatif et/ou personnel. L'utilisation de ce projet pour extraire des sites Web sans autorisation préalable peut enfreindre les droits d'auteur et les conditions d'utilisation des sites Web. Assurez-vous toujours de respecter les droits d'auteur et les lois locales lors de l'utilisation de ce logiciel.

## Description 📄

Ce projet vise à fournir un ensemble d'outils et de scripts pour transformer un site Web WordPress en un site Web statique. Il permet de télécharger le contenu du site Web, y compris les pages, les images et les fichiers, puis de les convertir en fichiers HTML, CSS, JavaScript, etc., qui peuvent être hébergés sur un serveur Web statique.

## Fonctionnement 🚀

1. **Prérequis** : Avant d'utiliser ce projet, assurez-vous d'avoir installé Node.js sur votre ordinateur.

2. **Clonage du Projet** : Clonez ce dépôt GitHub sur votre machine locale.

```sh
git clone https://github.com/LeGitHubDeTai/VacuumVibes.git
cd VacuumVibes
```

3. **Installation des Dépendances** : Installez les dépendances nécessaires en exécutant la commande suivante :

```sh
npm install
```

4. **Exécution** : Exécutez le script principal en spécifiant l'URL du site WordPress que vous souhaitez convertir en site statique.

Avant d'exécuter le script, vous devez définir l'URL de votre site WordPress. Pour cela, ajoutez l'URL à la variable SITE_URL dans le fichier .env.

```dotenv
SITE_URL=https://exemple.com
```

Une fois l'URL définie, exécutez le script principal. Il parcourra le site WordPress, téléchargera tous les contenus et les organisera dans un format statique approprié.

```sh
npm start -- --site_url=https://exemple.com
```

Le script téléchargera le contenu du site, le convertira en fichiers statiques et les stockera dans le dossier "out".

5. **Téléchargement de l'Archive** : Vous pouvez télécharger une archive ZIP contenant les fichiers statiques en utilisant l'action GitHub. Activez le workflow "Execute Code and Create Archive" dans l'onglet "Actions" de votre dépôt et suivez les instructions pour spécifier l'URL du site WordPress.

## Avertissement Légal 📜

Ce projet est proposé à des fins éducatives et personnelles. Vous êtes responsable de l'utilisation que vous en faites. Assurez-vous de respecter les droits d'auteur, les conditions d'utilisation et les lois locales lors de l'utilisation de ce logiciel. L'auteur et les contributeurs de ce projet déclinent toute responsabilité en cas d'utilisation abusive ou illégale du logiciel.

## Contributeurs 👥

- [Tai Tetsuyuki](https://github.com/LeGitHubDeTai) - Créateur du Projet

## Licence 📝

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.
