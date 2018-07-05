# server

## Description

REST service for the Scenario Manager backend. Requires a working PostgreSQL server running. See `ormconfig.json` for the settings. In case you don't have a PostgreSQL service running, you can optionally run the provided `docker-compose.yml` file using `npm run up` to start it.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

