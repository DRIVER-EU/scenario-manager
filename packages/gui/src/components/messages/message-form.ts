import m, { FactoryComponent } from 'mithril';
import { IInject, MessageType, InjectType } from 'trial-manager-models';
import { RolePlayerMessageForm, PhaseMessageForm, ScenarioForm, DefaultMessageForm } from '.';
import { GeoJsonMessageForm } from './geojson-message';
import { OstChangeStageMessageForm } from './ost-change-stage-message';
import { CapMessageForm } from './cap-message';
import { LcmsMessageForm } from './lcms-message';

export const MessageForm: FactoryComponent<{ inject: IInject, onChange: () => void }> = () => {
  const getMessageForm = (inject: IInject, onChange: () => void) => {
    switch (inject.messageType) {
      case MessageType.ROLE_PLAYER_MESSAGE:
        return m(RolePlayerMessageForm, { inject, onChange });
      case MessageType.PHASE_MESSAGE:
        return m(PhaseMessageForm, { inject, onChange });
      case MessageType.GEOJSON_MESSAGE:
        return m(GeoJsonMessageForm, { inject, onChange });
      case MessageType.CAP_MESSAGE:
        return m(CapMessageForm, { inject, onChange });
      case MessageType.LCMS_MESSAGE:
        return m(LcmsMessageForm, { inject, onChange });
      case MessageType.CHANGE_OBSERVER_QUESTIONNAIRES:
        return m(OstChangeStageMessageForm, { inject, onChange });
      default:
        return m('.row', 'TODO');
    }
  };

  return {
    view: ({ attrs: { inject, onChange } }) =>
      inject.type === InjectType.INJECT
        ? getMessageForm(inject, onChange)
        : inject.type === InjectType.SCENARIO
        ? m(ScenarioForm, { inject, onChange })
        : m(DefaultMessageForm, { inject }),
  };
};
