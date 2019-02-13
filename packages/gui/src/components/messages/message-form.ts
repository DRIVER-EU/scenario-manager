import m, { FactoryComponent } from 'mithril';
import { Select } from 'mithril-materialized';
import { IInject, MessageType, InjectType } from 'trial-manager-models';
import { RolePlayerMessageForm, PhaseMessageForm, ScenarioForm, DefaultMessageForm } from '.';
import { GeoJsonMessageForm } from './geojson-message';

export const MessageForm: FactoryComponent<{ inject: IInject }> = () => {
  const getMessageForm = (inject: IInject) => {
    switch (inject.messageType) {
      case MessageType.ROLE_PLAYER_MESSAGE:
        return m(RolePlayerMessageForm, { inject });
      case MessageType.PHASE_MESSAGE:
        return m(PhaseMessageForm, { inject });
      case MessageType.GEOJSON_MESSAGE:
        return m(GeoJsonMessageForm, { inject });
      default:
        return m('.row', 'TODO');
    }
  };

  return {
    view: ({ attrs: { inject } }) =>
      inject.type === InjectType.INJECT
        ? [
            m(Select, {
              iconName: 'message',
              placeholder: 'Select the message type',
              checkedId: inject.messageType,
              options: [
                { id: MessageType.ROLE_PLAYER_MESSAGE, label: 'ROLE PLAYER MESSAGE' },
                { id: MessageType.POST_MESSAGE, label: 'POST A MESSAGE' },
                { id: MessageType.GEOJSON_MESSAGE, label: 'SEND A GEOJSON FILE' },
                { id: MessageType.PHASE_MESSAGE, label: 'PHASE MESSAGE' },
                { id: MessageType.AUTOMATED_ACTION, label: 'AUTOMATED ACTION' },
              ],
              onchange: (v: unknown) => (inject.messageType = v as MessageType),
            }),
            getMessageForm(inject),
          ]
        : inject.type === InjectType.SCENARIO
        ? m(ScenarioForm, { inject })
        : m(DefaultMessageForm, { inject }),
  };
};
