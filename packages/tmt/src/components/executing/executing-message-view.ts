import m, { FactoryComponent } from 'mithril';
import { MessageType, InjectType, InjectState, IExecutingInject } from '../../../../models';
import {
  RolePlayerMessageView,
  PhaseMessageForm,
  GeoJsonMessageForm,
  OstChangeStageMessageForm,
  LcmsMessageForm,
  CapMessageForm,
  StartInjectForm,
  SumoConfigurationForm,
  RequestUnitMoveForm,
  SetAffectedAreaForm,
  RolePlayerMessageForm,
  LargeDataUpdateMessageForm,
  MessageScope,
} from '../messages';
import { PostMessageForm } from '../messages/post-message';

export const ExecutingMessageView: FactoryComponent<{ inject?: IExecutingInject; scope: MessageScope }> = () => {
  const disabled = true;
  const getMessageForm = (inject: IExecutingInject, scope: MessageScope) => {
    switch (inject.messageType) {
      case MessageType.CHECKPOINT:
        return m(RolePlayerMessageForm, { inject, checkpoint: true, disabled, scope });
      case MessageType.ROLE_PLAYER_MESSAGE:
        return m(RolePlayerMessageView, { inject, disabled: inject.state === InjectState.EXECUTED });
      case MessageType.POST_MESSAGE:
        return m(PostMessageForm, { inject, disabled, scope });
      case MessageType.CAP_MESSAGE:
        return m(CapMessageForm, { inject, disabled });
      case MessageType.LCMS_MESSAGE:
        return m(LcmsMessageForm, { inject, disabled });
      case MessageType.PHASE_MESSAGE:
        return m(PhaseMessageForm, { inject, disabled });
      case MessageType.GEOJSON_MESSAGE:
        return m(GeoJsonMessageForm, { inject, disabled });
      case MessageType.CHANGE_OBSERVER_QUESTIONNAIRES:
        return m(OstChangeStageMessageForm, { inject, disabled });
      case MessageType.START_INJECT:
        return m(StartInjectForm, { inject, disabled });
      case MessageType.LARGE_DATA_UPDATE:
        return m(LargeDataUpdateMessageForm, { inject, disabled });
      case MessageType.SUMO_CONFIGURATION:
        return m(SumoConfigurationForm, { inject, disabled });
      case MessageType.REQUEST_UNIT_MOVE:
        return m(RequestUnitMoveForm, { inject, disabled });
      case MessageType.SET_AFFECTED_AREA:
        return m(SetAffectedAreaForm, { inject, disabled });
      default:
        return m('.row', 'TODO');
    }
  };

  return {
    view: ({ attrs: { inject, scope = 'edit' } }) =>
      inject && inject.type === InjectType.INJECT ? getMessageForm(inject, scope) : undefined,
  };
};
