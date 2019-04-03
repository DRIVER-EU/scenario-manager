import m, { FactoryComponent } from 'mithril';
import { MessageType, InjectType } from 'trial-manager-models';
import { IExecutingInject } from '../../models';
import { RolePlayerMessageView } from '../messages';

export const ExecutingMessageView: FactoryComponent<{ inject?: IExecutingInject }> = () => {
  const getMessageForm = (inject: IExecutingInject) => {
    switch (inject.messageType) {
      case MessageType.ROLE_PLAYER_MESSAGE:
        return m(RolePlayerMessageView, { inject });
      // case MessageType.PHASE_MESSAGE:
      //   return m(PhaseMessageForm, { inject });
      // case MessageType.GEOJSON_MESSAGE:
      //   return m(GeoJsonMessageForm, { inject });
      // case MessageType.CHANGE_OBSERVER_QUESTIONNAIRES:
      //   return m(OstChangeStageMessageForm, { inject });
      default:
        return m('.row', 'TODO');
    }
  };

  return {
    view: ({ attrs: { inject } }) =>
      inject ? (inject.type === InjectType.INJECT ? getMessageForm(inject) : undefined) : undefined,
  };
};
