import m from 'mithril';
import { Button, Icon, InputCheckbox, ModalPanel, Select, TextInput } from 'mithril-materialized';
import { UIForm, LayoutForm } from 'mithril-ui-form';
import { deepCopy, deepEqual, IAsset, IGuiTemplate, IKafkaMessage } from 'trial-manager-models';
import { MeiosisComponent } from '../../services';
import { getActiveTrialInfo } from '../../utils';

export const MessageConfigForm: MeiosisComponent = () => {
  let message = {} as IKafkaMessage;
  let visualizedGUI: UIForm | boolean;

  return {
    view: ({ attrs: { state, actions } }) => {
      const { trial } = getActiveTrialInfo(state);
      const messages = trial.selectedMessageTypes;
      const { messageId } = state.app;
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

      if (!message.useCustomGUI) {
        visualizedGUI = false;
      }

      const onsubmit = (e: UIEvent) => {
        if (message.useCustomGUI && message.messageForm === '') {
          message.messageForm = message.name;
        }
        e.preventDefault();
        if (message) {
          actions.updateMessage(message);
        }
      };
      const hasChanged = !deepEqual(message, original);

      const { kafkaTopics } = state.app;
      const topicOptionList = kafkaTopics
        .map((topic: string) => {
          return { id: topic, label: topic.charAt(0).toUpperCase() + topic.replace(/_/g, ' ').slice(1) };
        })
        .sort((a, b) => a.label.localeCompare(b.label));

      const { templates } = state.app;
      const formOptionList = templates.map((template: IGuiTemplate) => {
        return { id: template.topic, label: template.label };
      });

      if (message.useCustomGUI && message.customGUI) {
        const vizTopic = JSON.parse(message.customGUI) as IGuiTemplate;
        if (vizTopic.ui) {
          const uiString = JSON.stringify(vizTopic.ui);
          visualizedGUI =
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
                .replace(/"&kafkaTopicSet"/g, JSON.stringify('none'))
            ) as UIForm);
        } else {
          visualizedGUI = false;
        }
      }

      return m(
        '.row',
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
                    m(TextInput, {
                      id: 'name',
                      className: 'col s6',
                      isMandatory: true,
                      initialValue: message.name,
                      onchange: (v: string) => (message.name = v),
                      label: 'Name',
                    }),
                    m(TextInput, {
                      id: 'iconName',
                      className: 'col s2',
                      isMandatory: true,
                      initialValue: message.iconName,
                      onchange: (v: string) => (message.iconName = v),
                      label: 'Material Icon Name',
                    }),
                    m(Icon, {
                      iconName: message.iconName,
                      className: 'col s1',
                      style: 'margin-top: 16px;',
                    }),
                    m(InputCheckbox, {
                      label: 'Upload GUI',
                      className: 'col s3 checkbox-margin',
                      checked: message.useCustomGUI,
                      onchange: (v) => {
                        message ? (message.useCustomGUI = v as boolean) : undefined;
                        message && !message.asset ? (message.asset = { alias: 'gui_form' } as IAsset) : undefined;
                        if (!v && message && message.asset) {
                          actions.deleteAsset(message.asset);
                          message.asset = {} as IAsset;
                        }
                      },
                    }),
                    !message.useCustomGUI
                      ? m(Select, {
                          label: 'Form for the message',
                          className: 'col s6',
                          placeholder: 'Message form',
                          options: formOptionList,
                          checkedId: message.messageForm,
                          onchange: (v) => {
                            message ? (message.messageForm = v[0] as string) : undefined;
                          },
                        })
                      : undefined,
                    m(Select, {
                      label: 'Kafka topic for the message',
                      className: 'col s6',
                      placeholder: 'Message type',
                      options: topicOptionList,
                      checkedId: message.kafkaTopic,
                      onchange: (v) => {
                        message ? (message.kafkaTopic = v[0] as string) : undefined;
                      },
                    }),
                    m(InputCheckbox, {
                      label: 'GeoJSON?',
                      className: 'col s6 checkbox-margin-large',
                      checked: message.useNamespace,
                      onchange: (v) => {
                        message ? (message.useNamespace = v as boolean) : undefined;
                        !v && message ? (message.namespace = '') : undefined;
                      },
                    }),
                    message.useNamespace
                      ? m(TextInput, {
                          id: 'namespace',
                          className: 'col s6',
                          isMandatory: true,
                          initialValue: message.namespace,
                          onchange: (v: string) => (message.namespace = v),
                          label: 'Namespace',
                        })
                      : undefined,
                    message.useCustomGUI
                      ? [
                          m(
                            'div.input-field.col.s12',
                            { style: 'height: 300px; margin-bottom: 40px; max-height: 300px' },
                            [
                              m('span', 'JSON message'),
                              m(
                                'textarea.materialize-textarea',
                                {
                                  style: 'height: 300px; overflow-y: auto; max-height: 300px',
                                  id: 'jsonTextArea',
                                  onchange: (e: any) => {
                                    message.customGUI = e.target.value;
                                  },
                                  onblur: (e: any) => {
                                    try {
                                      const json = JSON.parse(e.target.value);
                                      const str = JSON.stringify(json, null, 2);
                                      message.customGUI = str;
                                    } catch (e) {
                                      M.toast({ html: `Error parsing JSON: ${e}`, classes: 'red' });
                                    }
                                  },
                                },
                                message.customGUI
                              ),
                            ]
                          ),
                        ]
                      : undefined,
                    visualizedGUI &&
                      m(
                        '.layout-form.col.s12',
                        {},
                        m(LayoutForm, {
                          form: visualizedGUI as UIForm,
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
                          await actions.deleteMessage(message);
                          const { trial } = getActiveTrialInfo(state);
                          const messages_new = trial.selectedMessageTypes;
                          const cur = messages_new && messages_new.length > 0 ? messages_new[0] : undefined;
                          cur && actions.selectMessage(cur);
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
