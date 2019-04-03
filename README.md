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

## TODO

- Add simulation-state views for all messages upon selection.
- Add role-player message with manual confirmation (when done).
  - Execute these messages, with an optional comment.
- Add markdown editor (using marked) for inject description.
- Add simple map editor (mapbox?) for editing/viewing locations.
- Add CAP message.
- Add Tactical Simulation Object (EMSI) message.
- Add settings/locations e.g. address and WGS84. May also be a route or area. Has alias, title, description.
  - Single GeoJSON feature for now.
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