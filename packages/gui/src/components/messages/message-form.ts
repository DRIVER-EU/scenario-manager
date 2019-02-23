import m, { FactoryComponent } from 'mithril';
import { IInject, MessageType, InjectType } from 'trial-manager-models';
import { RolePlayerMessageForm, PhaseMessageForm, ScenarioForm, DefaultMessageForm } from '.';
import { GeoJsonMessageForm } from './geojson-message';
import { OstChangeStageMessageForm } from './ost-change-stage-message';

export const MessageForm: FactoryComponent<{ inject: IInject }> = () => {
  const getMessageForm = (inject: IInject) => {
    switch (inject.messageType) {
      case MessageType.ROLE_PLAYER_MESSAGE:
        return m(RolePlayerMessageForm, { inject });
      case MessageType.PHASE_MESSAGE:
        return m(PhaseMessageForm, { inject });
      case MessageType.GEOJSON_MESSAGE:
        return m(GeoJsonMessageForm, { inject });
      case MessageType.CHANGE_OBSERVER_QUESTIONNAIRES:
        return m(OstChangeStageMessageForm, { inject });
      default:
        return m('.row', 'TODO');
    }
  };

  return {
    view: ({ attrs: { inject } }) =>
      inject.type === InjectType.INJECT
        ? getMessageForm(inject)
        : inject.type === InjectType.SCENARIO
        ? m(ScenarioForm, { inject })
        : m(DefaultMessageForm, { inject }),
  };
};
