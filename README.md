# Trial Management Tool (TMT)

A scenario editor and execution manager for testing crisis management systems.

In a Trial, experiment or exercise, there is a need to control the crisis management events that are exposed to the participants. The TMT helps you by:

- Organizing a Trial
  - Users, stakeholders and role players
  - Managing objectives and scenarios
  - Locations and objects that play a part in the scenario
- In a scenario, the events are grouped into:
  - Storylines, e.g. the main storyline
  - Acts, e.g. a set of related events
  - Injects, single messages for a simulator, participant or task for a role player
- Run a Scenario
  - The events are sent to remote simulators and solutions, e.g. to start a flooding or other incident.
  - Tasks are offered to role players, which need to execute them and indicate when they are done.

## Installing

The application is a mono repository split into 3 packages:

- Server: responsible for storing the Trial data
- GUI: user interface for the creators of a scenario, managers of a scenario run (a.k.a. session) and role players
- Models: shared interfaces between GUI and server

The first time, run `npm run bootstrap` in order to sym link the Models package to the GUI and Server. Next, install the dependencies using `pnpm` (`npm i -g pnpm`):

```console
pnpm m i
```

## Running the application

```console
npm start
```
