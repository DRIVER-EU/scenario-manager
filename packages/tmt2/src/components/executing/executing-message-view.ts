import m from 'mithril';
import { MessageType, InjectType } from '../../../../models';
import { MeiosisComponent } from '../../services';
import { getInject } from '../../utils';
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
} from '../messages';
import { PostMessageForm } from '../messages/post-message';

export const ExecutingMessageView: MeiosisComponent = () => {
  return {
    oninit: ({
      attrs: {
        actions: { setEditMode },
      },
    }) => {
      setEditMode(false);
    },
    view: ({ attrs: { state, actions } }) => {
      const { injectId, trial } = state.app;
      const inject = getInject(trial, injectId);
      if (!inject) return;

      const getMessageForm = () => {
        switch (inject.messageType) {
          case MessageType.CHECKPOINT:
            return m(RolePlayerMessageForm, { state, actions });
          case MessageType.ROLE_PLAYER_MESSAGE:
            return m(RolePlayerMessageView, { state, actions });
          case MessageType.POST_MESSAGE:
            return m(PostMessageForm, { state, actions });
          case MessageType.CAP_MESSAGE:
            return m(CapMessageForm, { state, actions });
          case MessageType.LCMS_MESSAGE:
            return m(LcmsMessageForm, { state, actions });
          case MessageType.PHASE_MESSAGE:
            return m(PhaseMessageForm, { state, actions });
          case MessageType.GEOJSON_MESSAGE:
            return m(GeoJsonMessageForm, { state, actions });
          case MessageType.CHANGE_OBSERVER_QUESTIONNAIRES:
            return m(OstChangeStageMessageForm, { state, actions });
          case MessageType.START_INJECT:
            return m(StartInjectForm, { state, actions });
          case MessageType.LARGE_DATA_UPDATE:
            return m(LargeDataUpdateMessageForm, { state, actions });
          case MessageType.SUMO_CONFIGURATION:
            return m(SumoConfigurationForm, { state, actions });
          case MessageType.REQUEST_UNIT_MOVE:
            return m(RequestUnitMoveForm, { state, actions });
          case MessageType.SET_AFFECTED_AREA:
            return m(SetAffectedAreaForm, { state, actions });
          default:
            return m('.row', 'TODO');
        }
      };

      return inject && inject.type === InjectType.INJECT ? getMessageForm() : undefined;
    },
  };
};
