# StudyStorm - API

L'API de StudyStorm est développement en Typescript avec le framework AdonisJs. Ce dernier reprend la philosophie de Laravel et permet de développer rapidement des applications web complètes. Ici, nous n'utilisons que le preset API permettant de servir des endpoints REST.

L'API communique avec une base de données PostgreSQL, un mailer et une service S3 de stockage d'objets.

## Stack du backend
* [Typescript](https://www.typescriptlang.org/)
* [AdonisJs](https://adonisjs.com/)
* [Japa](https://japa.dev/)
* [ESLint](https://eslint.org/)

## Prérequis
* [NodeJS](https://nodejs.org/en/download/) >= version 16
* [NPM](https://www.npmjs.com/package/download) >= version 8
* [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable) >= version 1.22

## Lancer le server de développement

Une fois le repository cloné, il faut tout d'abord installer toutes les dépendances:
```bash
cd racine_du_projet
yarn install
```

Dupliquez le fichier [.env.example](https://github.com/StudyStorm/application/blob/main/.env.example), renommez le en ``.env`` et remplacez les valeurs par les vôtres.

Pour votre environnement de développement, vous pouvez utiliser les valeurs suivantes:

```yaml
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=YD3408Z6AswuXXV1OB7o2bjREhzkYA0w
APP_URL=http://localhost:3333
DRIVE_DISK=local
DB_CONNECTION=pg

CLIENT_URL=http://localhost:3000

PG_HOST=localhost
PG_PORT=5432
PG_USER=user
PG_PASSWORD=password123
PG_DB_NAME=studystorm

SESSION_DRIVER=cookie
CACHE_VIEWS=false
```

> **Note**  
> ``APP_KEY`` peut être générée à tout moment avec la commande ```node ace generate:key```. Celle proposée en exemple n'est bien entendue pas utilisée en production. :)

Les variables suivantes doivent concorder avec les informations fournies par vos services.

```yaml
S3_KEY=<s3-key>
S3_SECRET=<s3-secret>
S3_BUCKET=<s3-bucket>
S3_REGION=<s3-region>
S3_ENDPOINT=<s3-endpoint>
```

> **Note**  
> Nous utilisons une instance [Minio](https://min.io/) privée pour le service S3. Si vous voulez utiliser d'autres services compatibles avec ce protocole, vous pouvez toujours consulter la documentation du module [AdonisJs Drive](https://docs.adonisjs.com/guides/drive) qui propose d'autres alternatives et comment les configurer.

```yaml
MAILGUN_API_KEY=<mailgun-api-key>
MAILGUN_DOMAIN=<your-domain>
```

> **Note**  
> Nous utilisons [Mailgun](https://www.mailgun.com/) pour notre mailer. Ici aussi, vous pouvez consulter la documentation du module [AdonisJs Mailer](https://docs.adonisjs.com/guides/mailer) qui propose d'autres alternatives et comment les configurer.
## Lancer le serveur de développement

> **Warning**  
> N'oubliez pas de de configurer et de lancer votre base de données PostgreSQL avant !

Tout d'abord, il faut lancer les migrations pour créer les tables dans la base de données:
```bash
node ace migration:run

# Si la base de données contient des informations, vous pouvez forcer une réinitialisation avec:
node ace migration:fresh
```

Nous avons préparé un seeder pour facilement peupler la base de données que nous pouvons lancer avec:
```bash
node ace db:seed
```

Pour éviter de faire une création de compte avec vérification d'email, vous pouvez facilement créer un utilisateur avec la commande:

```bash
node ace create:user
```

Pour lancer le serveur de développement:
```bash
yarn dev
```
Le serveur est maintenant accessible à l'adresse affichée sur le terminal.

## Lancement des tests et du linter

Pour les tests: 
```bash
yarn test
```

Pour fixer des éventuels problèmes de formattage:
```bash
yarn format
```

## Mise en production

Durant la configuration de votre pipeline de déploiement sur le providers de votre choix, il est impératif d'utiliser les deux commandes suivantes:

```bash
# Build du dossier de build et migration de la base de données. A ce niveau-là, si la base de données est peuplée, seules les nouvelles migrations vont se lancer.
yarn install --production=false && yarn build && node ace migration:run --force

# Démarrage du serveur de production
node build/server.js
```

La majorité des providers proposent des champs spécifiques pour lancer ces commandes.

> **Warning**  
> Le ``.env`` n'étant pas commit, il ne faut pas oublier d'ajouter les bonnes variables durant la configuration.

### Précisions sur le déploiement

AdonisJs est déployé comme un serveur NodeJS. Il est alors nécessaire d'utiliser des providers comme AWS, Azure ou Digital Ocean.
