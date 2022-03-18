import m from 'mithril';
import { MessageConfigForm } from './message-config-form';
import { MeiosisComponent } from '../../services';
import { Collection, CollectionMode, ICollectionItem, RoundIconButton } from 'mithril-materialized';
import { getActiveTrialInfo } from '../../utils';
import { IKafkaMessage, MessageType, uniqueId } from 'trial-manager-models';

const MessageConfigList: MeiosisComponent = () => {

  return {
    view: ({attrs: {state, actions}}) => {
      const { trial } = getActiveTrialInfo(state);
      const messages = trial.selectedMessageTypes;
      const { messageId } = state.app;

      const items = messages.map(
        (msg) =>
          ({
            id: msg.id,
            title: msg.name || '?',
            iconName: 'create',
            className: 'yellow black-text',
            active: messageId === msg.id,
            content: `${msg.name + ' ' + msg.kafkaTopic}`,
            onclick: () => actions.selectMessage(msg),
          } as ICollectionItem)
      );
      return [
        m(
          '.row',
          m('.col.s12', [
            m(RoundIconButton, {
              iconName: 'add',
              class: 'green right btn-small',
              style: 'margin: 1em;',
              onclick: async () => {
                const msg = {
                  id: uniqueId(),
                  name: 'New message',
                  kafkaTopic: '',
                  messageForm: '',
                  messageType: MessageType.SEND_FILE as MessageType,
                  useCustomGUI: false
                } as IKafkaMessage;
                await actions.createMessage(msg);
              },
            }),
          ])
        ),
        messages.length > 0
          ? m('.row.sb', m('.col.s12', m(Collection, { mode: CollectionMode.BASIC, items })))
          : undefined,
      ];
    },
  };
};

export const MessageConfigView: MeiosisComponent = () => {
  return {
    view: ({ attrs: { state, actions } }) =>
      m('.row', [
        m('.col.s12.m5.l4', m(MessageConfigList, { state, actions })),
        m('.col.s12.m7.l8', m(MessageConfigForm, { state, actions })),
      ]),
  };
};
