# Trial Management Tool GUI

Created using the Mithril framework.

## Adding a new message, e.g. CAP

1. Extend the current `MessageType` enumeration.
2. In `utils.ts`, add an icon for `MessageType.CAP_MESSAGE` in `getMessageIcon`.
3. In `utils.ts`, add a name for `MessageType.CAP_MESSAGE` in `getMessageTitle`.
4. In `MessageForm`, add a new component for the `CAP` message.

TODO
Add it to the execution service, so you can send it to the test-bed.
Add it to the simulation viewer.