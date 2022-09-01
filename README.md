# StudyStorm - API Backend

## Stack du backend
* [Typescript](https://www.typescriptlang.org/)
* [AdonisJs](https://adonisjs.com/)
* [Japa](https://japa.dev/)

## Prérequis
* [NodeJS](https://nodejs.org/en/download/) version 16.17.0
* [NPM](https://www.npmjs.com/package/download) version 8.15.0
* [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable) version 1.22.19

## Lancer le server de développement

Installer toutes les dépendances:

```bash
# yarn
yarn install

# npm
npm install
```

Dupliquez le fichier [.env.example](https://github.com/StudyStorm/api-backend/blob/dev/.env.example), renommez le ".env" et remplacez les valeurs par les votres.

Lancez le serveur à l'adresse http://localhost:3333

```bash
yarn dev
```

## Production

Build l'application pour la production:

```bash
yarn build
```

Consultez la [documentation de déploiement](https://docs.adonisjs.com/guides/deployment) pour plus d'informations.
