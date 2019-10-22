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

To run it locally, it assumes you have [nodejs](http://nodejs.org/en/download) installed. Next, install the package manager using `npm i -g pnpm`. Use git to clone this repository with `git clone https://github.com/DRIVER-EU/scenario-manager.git`. Enter the new folder (`cd scenario-manager`) and install all dependencies with:

```console
pnpm m i
```

To run the application, enter:

```console
npm start
```

This will run a [local server on port 8081](http://localhost:8081).

## State management

During execution, all messages (a.k.a. injects) are pass through 5 states:

- Initially, they are ON_HOLD, except the main scenario (root), which is IN_PROGRESS
- When a message's parent is IN_PROGRESS, and it satisfies all timing conditions, it can transition to SCHEDULED.
- A SCHEDULED message, if it does not require manual confirmation, will automatically transition to IN_PROGRESS.
- A message that requires manual confirmation will wait for that: it will transition to IN_PROGRESS after receiving the confirmation (via the REST interface).
- An inject message IN_PROGRESS will be executed, which will make it transition to EXECUTED.
- A group (act, storyline) message will transition to EXECUTED when all of its children are EXECUTED too.
- There is a fifth state, CANCELLED, but that hasn't been implemented yet.

## TODO

- Add Tactical Simulation Object (EMSI) message.
- Add settings/items (e.g. buildings, vehicles, weapons, etc.)
  - Properties: Alias, title, description, picture.
  - Buildings may have occupants
  - Vehicles may have occupants
  - Items may have a location. This location can change in time.
- Add settings/actors (non-playing characters, NPG, or personas), which may carry items (but not buildings and vehicles).
  - May have a picture, age, home/work location, length, nickname, and other properties (bag).
  - May own/carry items.
- Add script message: An info message, not necessarily sent to the Test-bed, to tell the story.
  - May have a location | building, vehicles, items | actors
  - Buildings can contain vehicles, vehicles can transport actors, actors can carry items.
  - Use markdown to edit the text
  - Uses special mark-up to denote items, actors, etc. in the text, e.g. ITEM.weapon1 or ACTOR.bad_guy. In the generated HTML, they will be replaced by their title.
- Add map component to simulation view: show the state of all actors on the map when selecting an item:
  - When a message is selected, compute the current state of all actors/vehicles on the map.
  - This map may be shared using the test-bed (for the white cell).
- Manual actions are always simulated and carried out after 30 seconds. Make this customizable.
- Scenario selection and, optional, filtering, should be hidden when requested (kind of side menu).
- The session may run in a shorter time frame than the scenario. How to deal with the messages outside the current time frame? For example, the VENARI script is a couple of days long, whereas the action only takes place during certain hours.
