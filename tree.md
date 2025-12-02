➜  trans git:(main) ✗ tree
.
├── api
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── src
│   │   ├── auth
│   │   │   ├── 2fa-routes.ts
│   │   │   ├── routes.ts
│   │   │   ├── schemas.ts
│   │   │   └── totp.ts
│   │   ├── chat
│   │   │   └── ws.ts
│   │   ├── core
│   │   │   ├── presence.ts
│   │   │   └── security.ts
│   │   ├── db
│   │   │   ├── db.ts
│   │   │   ├── migrate.ts
│   │   │   └── schema.sql
│   │   ├── friends
│   │   │   └── ws.ts
│   │   ├── game
│   │   │   ├── constants.ts
│   │   │   ├── GameManager.ts
│   │   │   ├── IA
│   │   │   │   └── DummyAI.ts
│   │   │   ├── physics.ts
│   │   │   ├── PongGame.ts
│   │   │   ├── routes.ts
│   │   │   ├── types.ts
│   │   │   └── ws.ts
│   │   ├── i18n
│   │   │   ├── de.ts
│   │   │   ├── en.ts
│   │   │   ├── es.ts
│   │   │   ├── fr.ts
│   │   │   └── translations.ts
│   │   ├── index.ts
│   │   ├── middleware
│   │   │   ├── auth.ts
│   │   │   └── presence.ts
│   │   ├── openapi.ts
│   │   └── users
│   │       └── routes.ts
│   └── tsconfig.json
├── blockchain
│   ├── contracts
│   │   └── Scores.sol
│   ├── hardhat.config.ts
│   ├── package.json
│   └── scripts
│       └── deploy.ts
├── concepts-syntaxes-cheatsheet.md
├── docker-compose.yml
├── fastify-nodejs-guide.md
├── fixtures
│   ├── matches.json
│   ├── snapshots
│   │   └── sample_match.json
│   ├── tournaments.json
│   └── users.json
├── frontend
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── postcss.config.js
│   ├── public
│   │   └── logo.png
│   ├── src
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   ├── components
│   │   │   ├── language-selector.ts
│   │   │   └── user-stats-modal.ts
│   │   ├── constants.ts
│   │   ├── i18n
│   │   │   ├── index.ts
│   │   │   └── translations
│   │   │       ├── de.ts
│   │   │       ├── en.ts
│   │   │       ├── es.ts
│   │   │       └── fr.ts
│   │   ├── main.ts
│   │   ├── oauth42.ts
│   │   ├── router.ts
│   │   ├── style.css
│   │   ├── views
│   │   │   ├── Chat.ts
│   │   │   ├── friends-view.ts
│   │   │   ├── Login.ts
│   │   │   ├── Match.ts
│   │   │   ├── Menu.ts
│   │   │   ├── menu-view.ts
│   │   │   ├── oauth42-callback.ts
│   │   │   ├── partie-view.ts
│   │   │   ├── profile.ts
│   │   │   ├── profil-view.ts
│   │   │   ├── Signup.ts
│   │   │   ├── tournoi-view.ts
│   │   │   ├── TwoFactorAuth.ts
│   │   │   └── TwoFactorLogin.ts
│   │   └── ws-client.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── Makefile
├── STATUS_NEW.md
├── traefik
│   ├── certs
│   │   └── README.md
│   ├── dynamic.yml
│   └── traefik.yml
├── tree.md
└── typescript-javascript-resume.md

27 directories, 89 files