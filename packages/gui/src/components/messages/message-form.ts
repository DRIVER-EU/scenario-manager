import m, { FactoryComponent } from 'mithril';
import { Select } from 'mithril-materialized';
import { IInject, InjectType, InjectLevel } from 'trial-manager-models';
import { RolePlayerMessageForm, PhaseMessageForm, ScenarioForm, DefaultMessageForm } from '.';
import { GeoJsonMessageForm } from './geojson-message';

export const MessageForm: FactoryComponent<{ inject: IInject }> = () => {
  const getMessageForm = (inject: IInject) => {
    switch (inject.type) {
      case InjectType.ROLE_PLAYER_MESSAGE:
        return m(RolePlayerMessageForm, { inject });
      case InjectType.PHASE_MESSAGE:
        return m(PhaseMessageForm, { inject });
      case InjectType.GEOJSON_MESSAGE:
        return m(GeoJsonMessageForm, { inject });
      default:
        return m('.row', 'TODO');
    }
  };

  return {
    view: ({ attrs: { inject } }) =>
      inject.level === InjectLevel.INJECT
        ? [
            m(Select, {
              iconName: 'message',
              placeholder: 'Select the message type',
              checkedId: inject.type,
              options: [
                { id: InjectType.ROLE_PLAYER_MESSAGE, label: 'ROLE PLAYER MESSAGE' },
                { id: InjectType.POST_MESSAGE, label: 'POST A MESSAGE' },
                { id: InjectType.GEOJSON_MESSAGE, label: 'SEND A GEOJSON FILE' },
                { id: InjectType.PHASE_MESSAGE, label: 'PHASE MESSAGE' },
                { id: InjectType.AUTOMATED_ACTION, label: 'AUTOMATED ACTION' },
              ],
              onchange: (v: unknown) => (inject.type = v as InjectType),
            }),
            getMessageForm(inject),
          ]
        : inject.level === InjectLevel.SCENARIO
        ? m(ScenarioForm, { inject })
        : m(DefaultMessageForm, { inject }),
  };
};
