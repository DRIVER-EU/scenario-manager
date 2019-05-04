# Trial Management Tool GUI

Created using the Mithril framework.

## Adding a new message, e.g. CAP

1. Extend the current `MessageType` enumeration.
2. In `utils.ts`, add an icon for `MessageType.CAP_MESSAGE` in `getMessageIcon`.
3. In `utils.ts`, add a name for `MessageType.CAP_MESSAGE` in `getMessageTitle`.
4. In `MessageForm`, add a new component for the `CAP` message.
5. In the `execution.service`, `execute` method, add an entry for `CAP` message and create a method to send them.
6. In the `executing-message-view`, `getMessafeForm` method, add an entry for `CAP` message and return the component you wish to use for rendering a CAP message.

TODO
Add it to the simulation viewer.