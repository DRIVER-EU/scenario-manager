# Trial Management Tool GUI

Created using the Mithril framework.

When using PNPM, install dependencies using `pnpm --shamefully-hoist`!

## Adding a new message, e.g. CAP

1. Extend the current `MessageType` enumeration.
2. In `utils.ts`, add an icon for `MessageType.CAP_MESSAGE` in `getMessageIcon`.
3. In `utils.ts`, add a name for `MessageType.CAP_MESSAGE` in `getMessageTitle`.
4. In `MessageForm`, add a new component for the `CAP` message.
5. In the `execution.service`, `execute` method, add an entry for `CAP` message and create a method to send them.
6. In the `executing-message-view`, `getMessafeForm` method, add an entry for `CAP` message and return the component you wish to use for rendering a CAP message.
7. In case you are using new schemes or topics, make sure to register them (publish) in `kafka.ts`.

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

- In the execution view, I cannot see the route for the ambulance.
- Can we save the executed trial (to a new name)?
- Add the option to select the user upon start (while executing?)
