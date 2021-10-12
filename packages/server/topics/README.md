# Topics folder

The topics folder contains a set of JSON files, one for each published (non-standard) message. The GUI retreives these topics and converts them to a form, so the end user can use a simple form to create the messages.

Each JSON file follows the following naming convention: `[TOPIC_NAME(LOWERCASE)].json`. It contains an object, for example, the following:

```json
{
  "ui": [
    { "id": "messageType", "value": "START_INJECT", "type":"none" },
    {
      "id": "message",
      "label": " ",
      "type": [
        {
          "id": "START_INJECT",
          "label": " ",
          "type": [
            {
              "id": "id",
              "value": "&id",
              "type": "none"
            },
            {
              "id": "applicant",
              "value": "&owner",
              "type": "none"
            },
            {
              "id": "inject",
              "label": "Event name",
              "type": "text",
              "placeholder": "Name of the event / inject you want to run."
            }
          ]
        }
      ]
    },
    {
      "id": "description",
      "label": "Description",
      "type": "textarea"
    }
  ],
  "update": {
    "title": "Start event: &message.START_INJECT.inject"
  }
}
```

The `ui` element contains the `UIForm (mithril-ui-form)` form definition, where `@id` is replaced by the inject's `id` and `&owner` is replaced by the name of the application.

The `update` element may contain properties that need to be updated when the object has been updated.

The resulting object will also contain a `topic` property, containing the name of the topic where this message should be sent too. However, this does not need to be specified here (as it will be overwritten), since it will be overwritten by the topic name.
