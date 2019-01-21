# server

## Description

REST service for the Scenario Manager backend. Uses sqlite3 to store the data:

- A JSON file of the scenario: the scenario is saved using [automerge](https://github.com/automerge/automerge/issues), so we are only saving the differences.
- Assets (images and other media).

API

- `/repo/:id`: Download a scenario as SQLite3 database by ID
- `/scenarios`: List of the available scenarios
- `/scenarios/:id`: CRUD interface for a single scenario
- `/scenarios/:id/run`: Run a single scenario
- `/scenarios/:id/assets`: List of assets
- `/scenarios/:id/assets/:asset_id`: CRUD interface for an assent

ENVIRONMENT VARIABLES

- `SCENARIO_MANAGER_SERVER_FOLDER`: folder where all scenarios are stored
- `SCENARIO_MANAGER_SERVER_PORT`: port of the REST service

## Installation

```bash
> npm install
```

## Running the app

```bash
# development
> npm run start

# watch mode
> npm run start:dev

# production mode
> npm run start:prod
```

## Concept

A scenario is defined by:

- Generic aspects
- Storylines, acts, and messages (injects)

### Generic aspects

- Main objectives (per stakeholder).
- Timings, such as start and end time of the scenario, and of the execution.
- A list of actual persons/stakeholders, involved in the creation/execution of the scenario.
- A list of roles (trial director, role-player, editor, etc.), including assignment of actual persons to these roles.
- A list of groups, relevant for the scenario.
- A list of locations, relevant for the scenario (could be imported from a GeoJSON file, or entered manually).
- A list of persons of interest, i.e. players in the scenario.
- A list of objects of interest.
- Technical configuration of the Test-bed environment: URLs, topics, message types, etc.

### Storylines, acts, and messages

At the lowest level, a scenario is defined by a sequence of messages (a.k.a. injects, as they are injected into the scenario). A message can be aimed at a:

- Role-player, e.g. to pick up the telephone and send a distress message.
- Simulator, e.g. to start the flooding or send a series of tweets.
- Other systems, e.g. a mail server to send out an email.

As there may be many messages, we can group them into acts, and acts into storylines, so they become easier to manage. These messages are send out when certain criteria are met, e.g. when a certain timespan has been exceeded, or after manual activation.

### Application design

The application is a client-server application, where the client is a web-based single page application (SPA), responsible for configuring, editing and controlling the scenario (preferably collaboratively), and a server, responsible for storing the scenario data and for running it, i.e. sending out the non role-playing messages based on the criteria. The service should be able to run on the Internet, but also locally, for small teams.

The scenario manager is supported by a C2 service, documented separately, to have a better overview of the scenario.

At the highest level, there are menus to:

- Configure: to specify the main scenario aspects.
- Edit: to specify the storylines, acts and messages.
- Run: to start and stop the actual scenario.
- Play: for role-players, to perform a role or other manual actions.

### Uploading assets

When uploading a file, you can specify its alias, so you can later refer to it using `{{alias}}`.

### Locations

You can upload GeoJSON files: the Features are extracted and parsed to Locations, if possible.
