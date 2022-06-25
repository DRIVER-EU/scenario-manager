# Trial Management Tool GUI

Created using the Mithril framework.

When using PNPM, install dependencies using `pnpm --shamefully-hoist`!

## Creating your own injects
This version of the scenario manager supports the creation of your own injects. This guide explains how:
1. Click on an existing scenario, or create a new one
2. Click on the gear icon in the top right corner
3. Click on the `Message Config` tab
4. Click on the green `+` icon
5. Fill in the form
    - `name` - The name of the new inject
    - `Material Icon Name` - The name of the icon used for this inject [Material Icons](https://materializecss.com/icons.html)
    - `Upload GUI` - Selecting this checkbox allows you to upload your own message form [Message Form](https://github.com/erikvullings/mithril-ui-form)
    - `Form for the message` - You can also select an existing message form
    - `Kafka topic for the message` - The kafka topic that the inject will be send to
    - `GeoJSON?` - If the new inject sends GeoJSON files, the scenario manager needs a namespace to ensure the data can be send on Kafka and be shown on a map.
6. Click the green save icon
7. Click on the pencil symbol in the top right corner
8. Test out your new inject!

If a kafka topic is missing, you should add this to the docker compose that you used to run this scenario-manager, and it will automatically show up in the GUI.

TODO

- Use the active message topics to determine which topics to subscribe to.
- Refactor MessageType to a Record, where the key is a message type (as string), and the value is an object, either a component or a JSON form that can be turned into a component using the ui-form lib.
- Timeline should use the state.treeState to show open/closed items
- Wrap the runSvc in an action.

Add it to the simulation viewer.

    ROLE_PLAYER_MESSAGE = 0,
    PHASE_MESSAGE = 1,
    POST_MESSAGE = 2,
    GEOJSON_MESSAGE = 3,
    CHANGE_OBSERVER_QUESTIONNAIRES = 4,
    CAP_MESSAGE = 5,
    LCMS_MESSAGE = 6,
    START_INJECT = 7,
    REQUEST_UNIT_TRANSPORT = 8,
    SET_AFFECTED_AREA = 9,
    SUMO_CONFIGURATION = 10,
    CHECKPOINT = 11

## Features / Bugs

- Add message selector back again
- In the execution view, I cannot see the route for the ambulance.
- Can we save the executed trial (to a new name)?
- Add the option to select the user upon start (while executing?)
