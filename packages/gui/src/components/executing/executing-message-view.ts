import m, { FactoryComponent } from 'mithril';
import { MessageType, InjectType, InjectState } from 'trial-manager-models';
import { IExecutingInject } from '../../models';
import { RolePlayerMessageView, PhaseMessageForm, GeoJsonMessageForm, OstChangeStageMessageForm } from '../messages';
import { CapMessageForm } from '../messages/cap-message';
import { LcmsMessageForm } from '../messages/lcms-message';

export const ExecutingMessageView: FactoryComponent<{ inject?: IExecutingInject }> = () => {
  const getMessageForm = (inject: IExecutingInject) => {
    switch (inject.messageType) {
      case MessageType.ROLE_PLAYER_MESSAGE:
        return m(RolePlayerMessageView, { inject, disabled: inject.state === InjectState.EXECUTED });
      case MessageType.CAP_MESSAGE:
        return m(CapMessageForm, { inject, disabled: true });
      case MessageType.LCMS_MESSAGE:
        return m(LcmsMessageForm, { inject, disabled: true });
      case MessageType.PHASE_MESSAGE:
        return m(PhaseMessageForm, { inject, disabled: true });
      case MessageType.GEOJSON_MESSAGE:
        return m(GeoJsonMessageForm, { inject, disabled: true });
      case MessageType.CHANGE_OBSERVER_QUESTIONNAIRES:
        return m(OstChangeStageMessageForm, { inject, disabled: true });
      default:
        return m('.row', 'TODO');
    }
  };

  return {
    view: ({ attrs: { inject } }) =>
      inject ? (inject.type === InjectType.INJECT ? getMessageForm(inject) : undefined) : undefined,
  };
};
