import m from 'mithril';
import { MessageType, InjectType, IInject } from '../../../../models';
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
import { IActions, IAppModel, MessageComponent } from '../../services';
import { getActiveTrialInfo, getInject } from '../../utils';
import { RolePlayerMessageView } from './role-player-message';

export type MessageScope = 'edit' | 'execute';

export const getMessageForm = (state: IAppModel, actions: IActions, inject: IInject, editing = true) => {
  const options = { editing };
  const sao = { state, actions, options };
  switch (inject.messageType) {
    case MessageType.CHECKPOINT:
      return m(RolePlayerMessageForm, { state, actions, options: { editing, checkpoint: true } });
    case MessageType.ROLE_PLAYER_MESSAGE:
      return editing ? m(RolePlayerMessageForm, sao) : m(RolePlayerMessageView, sao);
    case MessageType.POST_MESSAGE:
      return m(PostMessageForm, sao);
    case MessageType.PHASE_MESSAGE:
      return m(PhaseMessageForm, sao);
    case MessageType.GEOJSON_MESSAGE:
      return m(GeoJsonMessageForm, sao);
    case MessageType.CAP_MESSAGE:
      return m(CapMessageForm, sao);
    case MessageType.LCMS_MESSAGE:
      return m(LcmsMessageForm, sao);
    case MessageType.CHANGE_OBSERVER_QUESTIONNAIRES:
      return m(OstChangeStageMessageForm, sao);
    case MessageType.START_INJECT:
      return m(StartInjectForm, sao);
    case MessageType.LARGE_DATA_UPDATE:
      return m(LargeDataUpdateMessageForm, sao);
    case MessageType.SUMO_CONFIGURATION:
      return m(SumoConfigurationForm, sao);
    case MessageType.REQUEST_UNIT_MOVE:
      return m(RequestUnitMoveForm, sao);
    case MessageType.SET_AFFECTED_AREA:
      return m(SetAffectedAreaForm, sao);
    default:
      return m('.row', 'TODO: ' + inject.messageType);
  }
};

export const MessageForm: MessageComponent = () => {
  const MessageFormSelector: MessageComponent = () => {
    return {
      view: ({ attrs: { state, actions, options } }) => {
        const { inject } = getActiveTrialInfo(state);
        if (!inject) return;
        return getMessageForm(state, actions, inject, options?.editing);
      },
    };
  };

  return {
    oninit: () => console.log('ONINIT MessageForm'),
    view: ({ attrs: { state, actions, options } }) => {
      const { mode } = state.app;
      const isExecuting = mode === 'execute';
      const { trial, scenarioId, injectId } = isExecuting && state.exe.trial.id ? state.exe : state.app;
      const inject = getInject(trial, injectId || scenarioId);
      return inject
        ? inject.type === InjectType.INJECT
          ? m('.message-form', m(MessageFormSelector, { state, actions, options }))
          : inject.type === InjectType.SCENARIO
          ? m(ScenarioForm, { state, actions, options })
          : m(DefaultMessageForm, { state, actions, options })
        : undefined;
    },
  };
};
