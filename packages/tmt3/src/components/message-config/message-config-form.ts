import m from 'mithril';
import { Button, FileInput, Icon, InputCheckbox, ModalPanel, Select, TextInput, UrlInput } from 'mithril-materialized';
import { deepCopy, deepEqual, IAsset, IGuiTemplate, IKafkaMessage } from 'trial-manager-models';
import { MeiosisComponent } from '../../services';
import { getActiveTrialInfo } from '../../utils';

export const MessageConfigForm: MeiosisComponent = () => {
  let asset = {} as IAsset;
  let message = {} as IKafkaMessage;
  let files = undefined as FileList | undefined;
  let filePreview: string = '';
  let prev_file_id: number;

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

      if(message.asset) {
        asset = message.asset
      } else {
        asset = {} as IAsset;
        filePreview = '';
      }

      const onsubmit = (e: UIEvent) => {
        if(message.asset && message.messageForm === '') {
          message.messageForm = message.name
        }
        e.preventDefault();
        if (message) {
          actions.updateMessage(message, files);
        }
      };
      const hasChanged = !deepEqual(message, original);

      const { kafkaTopics } = state.app
      const topicOptionList = kafkaTopics.map((topic: string) => {
        return { id: topic, label: topic.charAt(0).toUpperCase() + topic.replace(/_/g, ' ').slice(1) };
      }).sort((a, b) => a.label.localeCompare(b.label));;

      const { templates } = state.app
      const formOptionList = templates.map((template: IGuiTemplate) => {
        return { id: template.topic, label: template.label };
      });

      if (asset.id && prev_file_id != asset?.id && asset.url) {
        prev_file_id = asset?.id;
        asset.url.length > 1
          ? m.request({ url: asset?.url as string, method: 'GET' }).then((json) => {
              filePreview = JSON.stringify(json, undefined, 4);
            })
          : undefined;
      } else if (!asset.url) {
        filePreview = '';
        prev_file_id = asset.id;
      }

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
                        message ? (message.useCustomGUI = v as boolean) : undefined
                        message && !message.asset ? (message.asset = {alias: 'gui_form'} as IAsset) : undefined
                        if(!v && message && message.asset) { 
                          actions.deleteAsset(message.asset)
                          message.asset = {} as IAsset
                        }
                      }
                    }),
                    message.useCustomGUI ? [
                    m(FileInput, {
                      initialValue: message.asset?.filename,
                      className: 'col s6',
                      placeholder: 'Select or replace the file',
                      onchange: (fl: FileList) => (files = fl),
                    }), m(UrlInput, {
                      id: 'file',
                      initialValue: message.asset?.url,
                      disabled: true,
                      label: 'URL',
                      iconName: 'link',
                      className: 'col s6',
                      style: 'margin-bottom: 51px'
                    }) ] : m(Select, {
                      label: 'Form for the message',
                      className: 'col s6',
                      placeholder: 'Message form',
                      options: formOptionList,
                      checkedId: message.messageForm,
                      onchange: (v) => {message ? (message.messageForm = v[0] as string) : undefined},
                    }),
                      m(Select, {
                      label: 'Kafka topic for the message',
                      className: 'col s6',
                      placeholder: 'Message type',
                      options: topicOptionList,
                      checkedId: message.kafkaTopic,
                      onchange: (v) => {message ? (message.kafkaTopic = v[0] as string) : undefined},
                    }), 
                    m(InputCheckbox, {
                      label: 'GeoJSON?',
                      className: 'col s6 checkbox-margin-large',
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
                    filePreview !== ''
                    ? m('div.input-field.col.s12', { style: 'height: 200px; margin-bottom: 40px' }, [
                        m('span', 'File Preview'),
                        m(
                          'textarea.materialize-textarea',
                          { style: 'height: 200px; overflow-y: auto;', disabled: true, id: 'previewArea' },
                          filePreview
                        ),
                      ])
                    : undefined,
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
