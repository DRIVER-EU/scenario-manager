import m from 'mithril';
import {
  Button,
  ISelectOptions,
  Icon,
  InputCheckbox,
  ModalPanel,
  Select,
  TextArea,
  TextInput,
} from 'mithril-materialized';
import { UIForm, LayoutForm } from 'mithril-ui-form';
import { deepCopy, deepEqual, IAsset, IGuiTemplate, IKafkaMessage, MessageType } from 'trial-manager-models';
import { MeiosisComponent } from '../../services';
import { getActiveTrialInfo } from '../../utils';

export const MessageConfigForm: MeiosisComponent = () => {
  const isGuiTemplate = (obj: any): obj is IGuiTemplate => typeof obj.ui !== 'undefined';

  const updateGUI = (message: IKafkaMessage) => {
    console.log('Updating GUI');
    if (message.customGUI) {
      try {
        let val = JSON.parse(message.customGUI) as IGuiTemplate | UIForm<any>;
        if (isGuiTemplate(val)) {
          val.label = message.name;
          val.icon = message.iconName;
          val.kafkaTopic = message.kafkaTopic;
        } else if (Array.isArray(val)) {
          val = {
            id: message.id,
            label: message.name,
            icon: message.iconName,
            kafkaTopic: message.kafkaTopic,
            ui: [
              {
                id: 'messageType',
                value: message.name.toUpperCase().replace(/ /g, '_'),
                type: 'none',
              },
              {
                id: 'title',
                label: 'Subject',
                icon: 'title',
                type: 'text',
              },
              {
                id: 'description',
                label: 'Description',
                icon: 'note',
                type: 'textarea',
              },
              {
                id: 'message',
                label: ' ',
                className: 'col s12',
                type: [
                  {
                    id: message.name.toUpperCase().replace(/ /g, '_'),
                    label: ' ',
                    className: 'col s12',
                    type: val,
                  },
                ],
              },
            ],
          } as IGuiTemplate;
        }
        message.customGUI = JSON.stringify(val, null, 2);
      } catch (e) {
        console.log('Invalid JSON');
      }
    }
  };

  let message = {} as IKafkaMessage;
  let guiForm: UIForm | boolean = false;
  let topicOptionList: {
    id: string;
    label: string;
  }[];
  return {
    oninit: ({
      attrs: {
        state: {
          app: { kafkaTopics },
        },
      },
    }) => {
      topicOptionList = kafkaTopics
        .map((topic: string) => ({
          id: topic,
          label: topic.charAt(0).toUpperCase() + topic.replace(/_/g, ' ').slice(1),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    view: ({
      attrs: {
        state,
        actions: { updateMessage, deleteAsset, deleteMessage, selectMessage },
      },
    }) => {
      const { trial } = getActiveTrialInfo(state);
      const messages = trial.selectedMessageTypes;
      const { messageId, templates } = state.app;
      console.log(templates);
      if (!messageId) {
        return m(
          'p',
          m(
            'i',
            `Please, create a message using the + button${messages.length > 0 ? ', or select one in the list' : ''}.`
          )
        );
      }
      const original = messages.filter((s) => s.id === messageId).shift() || ({} as IKafkaMessage);
      if (!message || original.id !== message.id) {
        message = deepCopy(original);
      }

      const onsubmit = (e: UIEvent) => {
        e.preventDefault();
        if (message.useCustomGUI) {
          if (message.templateId === '') {
            message.templateId = message.name;
          }
          message.messageType = message.name.toUpperCase().replace(/ /g, '_') as MessageType;
        }
        if (message) {
          updateMessage(message);
        }
      };

      const hasChanged = !deepEqual(message, original);

      const formOptionList = templates.map(({ id, label }) => ({ id, label }));

      if (message.useCustomGUI && message.customGUI) {
        const template = JSON.parse(message.customGUI) as IGuiTemplate;
        if (template.ui) {
          const uiString = JSON.stringify(template.ui);
          guiForm =
            typeof uiString === 'string' &&
            (JSON.parse(
              uiString
                .replace(/&id/g, 'preview_id')
                .replace(/&title/g, 'preview_title')
                .replace(/&owner/g, 'preview_owner')
                .replace(/"&participants"/g, JSON.stringify([{ id: 'preview_id', label: 'preview_label' }]))
                .replace(/"&participantEmails"/g, JSON.stringify([{ id: 'preview_id', label: 'preview_label' }]))
                .replace(/"&assets"/g, JSON.stringify([{ id: 'preview_id', label: 'preview_label' }]))
                .replace(/"&kafkaTopics"/g, JSON.stringify([{ id: 'preview_id', label: 'preview_label' }]))
            ) as UIForm);
          console.log(JSON.stringify(guiForm, null, 2))
        }
      }

      return m(
        '#message-config.row',
        { style: 'color: black; overflow-y: auto; height: 80vh' },
        m('.col.s12', [
          m(
            '.contact-form',
            { key: message ? message.id : undefined },
            message
              ? [
                m('h4', [
                  m(Icon, {
                    iconName: 'message',
                    style: 'margin-right: 12px;',
                  }),
                  'Message details',
                ]),
                [
                  m('.row', [
                    m(TextInput, {
                      id: 'name',
                      className: 'col s6',
                      isMandatory: true,
                      initialValue: message.name,
                      onchange: (v: string) => {
                        message.name = v;
                        updateGUI(message);
                      },
                      label: 'Name',
                    }),
                    m(TextInput, {
                      id: 'iconName',
                      className: 'col s2',
                      isMandatory: true,
                      initialValue: message.iconName,
                      onchange: (v: string) => {
                        message.iconName = v;
                        updateGUI(message);
                      },
                      label: 'Material Icon Name',
                    }),
                    m(Icon, {
                      iconName: message.iconName,
                      className: 'col s1',
                      style: 'margin-top: 16px;',
                    }),
                    m(InputCheckbox, {
                      label: 'Create GUI',
                      className: 'col s3 checkbox-margin',
                      checked: message.useCustomGUI,
                      onchange: (v) => {
                        message.useCustomGUI = v;
                        if (!message.asset) message.asset = { alias: 'gui_form' } as IAsset;
                        if (!v && message.asset) {
                          deleteAsset(message.asset);
                          message.asset = {} as IAsset;
                        }
                      },
                    }),
                  ]),
                  m('.row', [
                    !message.useCustomGUI
                      ? m(Select, {
                        label: 'Form for the message',
                        className: 'col s6',
                        placeholder: 'Message form',
                        options: formOptionList,
                        checkedId: message.templateId,
                        onchange: (v) => {
                          const t = templates.filter(t => t.id === v[0]).shift();
                          if (!t) return;
                          message.templateId = t.id;
                          if (!t) return;
                          message.kafkaTopic = t.kafkaTopic;
                          message.name = t.label;
                          message.iconName = t.icon;
                        },
                      } as ISelectOptions<string>)
                      : undefined,
                    m(Select, {
                      label: 'Kafka topic for the message',
                      className: 'col s12 m3',
                      placeholder: 'Kafka topic',
                      options: topicOptionList,
                      checkedId: message.kafkaTopic,
                      onchange: (v) => {
                        message.kafkaTopic = v[0];
                        updateGUI(message);
                      },
                    } as ISelectOptions<string>),
                    m(InputCheckbox, {
                      label: 'Is GeoJSON',
                      className: 'col s6 m3 checkbox-margin-large',
                      checked: message.useNamespace,
                      onchange: (v) => {
                        message.useNamespace = v;
                        if (!v) {
                          message.namespace = '';
                        }
                      },
                    }),
                    message.useNamespace &&
                    m(TextInput, {
                      id: 'namespace',
                      className: 'col s6 m3',
                      isMandatory: true,
                      initialValue: message.namespace || "eu.driver.model.geojson",
                      onchange: (v) => (message.namespace = v),
                      label: 'Namespace',
                    }),
                  ]),
                  message.useCustomGUI &&
                  m('.row', [
                    m(TextArea, {
                      id: 'json-text-area',
                      iconName: 'code',
                      label: 'UI definition',
                      class: 'col s12',
                      initialValue: message.customGUI,
                      onchange: (s) => {
                        message.customGUI = s;
                        updateGUI(message);
                      },
                    }),
                  ]),
                  guiForm &&
                  m(
                    '.layout-form.col.s12',
                    {},
                    m(LayoutForm, {
                      form: guiForm as UIForm,
                      obj: {},
                    })
                  ),
                ],
                m('form.col.s12', [
                  m(Button, {
                    iconName: 'undo',
                    class: `green ${hasChanged ? '' : 'disabled'}`,
                    onclick: () => (message = deepCopy(original)),
                  }),
                  ' ',
                  m(Button, {
                    iconName: 'save',
                    class: `green ${hasChanged ? '' : 'disabled'}`,
                    onclick: onsubmit,
                  }),
                  ' ',
                  m(Button, {
                    modalId: 'delete',
                    iconName: 'delete',
                    class: 'red',
                  }),
                ]),
                m(ModalPanel, {
                  id: 'delete',
                  title: `Do you really want to delete "${message.name}?"`,
                  options: { opacity: 0.7 },
                  buttons: [
                    {
                      label: 'OK',
                      onclick: async () => {
                        await deleteMessage(message);
                        const { trial } = getActiveTrialInfo(state);
                        const messages_new = trial.selectedMessageTypes;
                        const cur = messages_new && messages_new.length > 0 ? messages_new[0] : undefined;
                        cur && selectMessage(cur);
                      },
                    },
                    {
                      label: 'Cancel',
                    },
                  ],
                }),
              ]
              : []
          ),
        ])
      );
    },
  };
};
