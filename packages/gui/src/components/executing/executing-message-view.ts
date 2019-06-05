import m, { FactoryComponent } from 'mithril';
import { MessageType, InjectType, InjectState, InjectConditionType } from 'trial-manager-models';
import { IExecutingInject } from '../../models';
import {
  RolePlayerMessageView,
  PhaseMessageForm,
  GeoJsonMessageForm,
  OstChangeStageMessageForm,
  LcmsMessageForm,
  CapMessageForm,
  StartInjectForm,
  SumoConfigurationForm,
  RequestUnitTransportForm,
  SetAffectedAreaForm,
  RolePlayerMessageForm,
} from '../messages';

export const ExecutingMessageView: FactoryComponent<{ inject?: IExecutingInject }> = () => {
  const disabled = true;
  const getMessageForm = (inject: IExecutingInject) => {
    switch (inject.messageType) {
      case MessageType.CHECKPOINT:
        return m(RolePlayerMessageForm, { inject, checkpoint: true, disabled });
      case MessageType.ROLE_PLAYER_MESSAGE:
        return m(RolePlayerMessageView, { inject, disabled: inject.state === InjectState.EXECUTED });
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
      case MessageType.SUMO_CONFIGURATION:
        return m(SumoConfigurationForm, { inject, disabled });
      case MessageType.REQUEST_UNIT_TRANSPORT:
        return m(RequestUnitTransportForm, { inject, disabled });
      case MessageType.SET_AFFECTED_AREA:
        return m(SetAffectedAreaForm, { inject, disabled });
      default:
        return m('.row', 'TODO');
    }
  };

  return {
    view: ({ attrs: { inject } }) => (inject && inject.type === InjectType.INJECT ? getMessageForm(inject) : undefined),
  };
};
