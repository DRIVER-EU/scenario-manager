import m from 'mithril';
import { Button, Icon, InputCheckbox, ModalPanel, Select, TextInput } from 'mithril-materialized';
import { deepCopy, deepEqual, IGuiTemplate, IKafkaMessage } from 'trial-manager-models';
import { MeiosisComponent } from '../../services';
import { getActiveTrialInfo } from '../../utils';

export const MessageConfigForm: MeiosisComponent = () => {
  let message = {} as IKafkaMessage;

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

      const onsubmit = (e: UIEvent) => {
        e.preventDefault();
        if (message) {
          actions.updateMessage(message);
        }
      };
      const hasChanged = !deepEqual(message, original);

      const { kafkaTopics } = state.app
      const topicOptionList = kafkaTopics.map((topic: string) => {
        return { id: topic, label: topic.charAt(0).toUpperCase() + topic.replace(/_/g, ' ').slice(1) };
      });

      const { templates } = state.app
      const formOptionList = templates.map((template: IGuiTemplate) => {
        return { id: template.topic, label: template.label };
      });

      return m(
        '.row',
        { style: 'color: black' },
        m('form.col.s12', [
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
                      className: 'col s4',
                      isMandatory: true,
                      initialValue: message.iconName,
                      onchange: (v: string) => (message.iconName = v),
                      label: 'Material Icon Name',
                    }),
                    m(Icon, {
                      iconName: message.iconName,
                      className: 'col s2',
                      style: 'margin-top: 16px;',
                    }),
                    m(Select, {
                      label: 'Form for the message',
                      className: 'col s6',
                      placeholder: 'Message form',
                      options: formOptionList,
                      checkedId: message.messageForm,
                      onchange: (v) => {message ? (message.messageForm = v[0] as string) : undefined},
                    }),
                    message.messageForm === 'send_file' ? [
                      m(Select, {
                      label: 'Kafka topic for the message',
                      className: 'col s6',
                      placeholder: 'Message type',
                      options: topicOptionList,
                      checkedId: message.kafkaTopic,
                      onchange: (v) => {message ? (message.kafkaTopic = v[0] as string) : undefined},
                    }), 
                    m(InputCheckbox, {
                      label: 'Will the file be GeoJSON?',
                      className: 'col s6',
                      checked: message.useNamespace,
                      onchange: (v) => {
                        message ? (message.useNamespace = v as boolean) : undefined
                        !v && message ? (message.namespace = '') : undefined
                      }
                    }),
                    message.useNamespace ? m(TextInput, {
                      id: 'namespace',
                      className: 'col s6',
                      isMandatory: true,
                      initialValue: message.namespace,
                      onchange: (v: string) => (message.namespace = v),
                      label: 'Namespace',
                    }) : undefined,
                  ] : undefined,
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
