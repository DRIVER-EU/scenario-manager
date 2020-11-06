import m from 'mithril';
import { MessageType, InjectType } from '../../../../models';
import {
  RolePlayerMessageForm,
  PhaseMessageForm,
  ScenarioForm,
  DefaultMessageForm,
  GeoJsonMessageForm,
  OstChangeStageMessageForm,
  LcmsMessageForm,
  CapMessageForm,
  StartInjectForm,
  SumoConfigurationForm,
  RequestUnitMoveForm,
  SetAffectedAreaForm,
  LargeDataUpdateMessageForm,
  PostMessageForm,
} from '.';
import { MeiosisComponent } from '../../services';
import { getInject } from '../../utils';

export type MessageScope = 'edit' | 'execute';

export const MessageForm: MeiosisComponent = () => {
  const MessageFormSelector: MeiosisComponent = () => {
    return {
      view: ({ attrs: { state, actions } }) => {
        const { injectId, trial } = state.app;
        const inject = getInject(trial, injectId);
        if (!inject) return;
        switch (inject.messageType) {
          case MessageType.CHECKPOINT:
            return m(RolePlayerMessageForm, { state, actions, options: { checkpoint: true } });
          case MessageType.ROLE_PLAYER_MESSAGE:
            return m(RolePlayerMessageForm, { state, actions });
          case MessageType.POST_MESSAGE:
            return m(PostMessageForm, { state, actions });
          case MessageType.PHASE_MESSAGE:
            return m(PhaseMessageForm, { state, actions });
          case MessageType.GEOJSON_MESSAGE:
            return m(GeoJsonMessageForm, { state, actions });
          case MessageType.CAP_MESSAGE:
            return m(CapMessageForm, { state, actions });
          case MessageType.LCMS_MESSAGE:
            return m(LcmsMessageForm, { state, actions });
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
            return m('.row', '');
        }
      },
    };
  };

  return {
    oninit: () => console.log('ONINIT MessageForm'),
    view: ({ attrs: { state, actions } }) => {
      const { injectId, trial } = state.app;
      const inject = getInject(trial, injectId);
      return inject
        ? inject.type === InjectType.INJECT
          ? m('.message-form', m(MessageFormSelector, { state, actions }))
          : inject.type === InjectType.SCENARIO
          ? m(ScenarioForm, { state, actions })
          : m(DefaultMessageForm, { state, actions })
        : undefined;
    },
  };
};
