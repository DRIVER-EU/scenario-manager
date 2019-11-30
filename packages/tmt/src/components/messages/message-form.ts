import m, { FactoryComponent } from 'mithril';
import { IInject, MessageType, InjectType } from 'trial-manager-models';
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
  RequestUnitTransportForm,
  SetAffectedAreaForm,
  LargeDataUpdateMessageForm,
  PostMessageForm,
} from '.';

export const MessageForm: FactoryComponent<{ inject?: IInject; disabled?: boolean; onChange?: () => void }> = () => {
  const MessageFormSelector: FactoryComponent<{ inject: IInject; disabled: boolean; onChange?: () => void }> = () => {
    return {
      view: ({ attrs: { inject, disabled, onChange } }) => {
        switch (inject.messageType) {
          case MessageType.CHECKPOINT:
            return m(RolePlayerMessageForm, { inject, disabled, checkpoint: true, onChange });
          case MessageType.ROLE_PLAYER_MESSAGE:
            return m(RolePlayerMessageForm, { inject, disabled, onChange });
          case MessageType.POST_MESSAGE:
            return m(PostMessageForm, { inject, disabled, onChange });
          case MessageType.PHASE_MESSAGE:
            return m(PhaseMessageForm, { inject, disabled, onChange });
          case MessageType.GEOJSON_MESSAGE:
            return m(GeoJsonMessageForm, { inject, disabled, onChange });
          case MessageType.CAP_MESSAGE:
            return m(CapMessageForm, { inject, disabled, onChange });
          case MessageType.LCMS_MESSAGE:
            return m(LcmsMessageForm, { inject, disabled, onChange });
          case MessageType.CHANGE_OBSERVER_QUESTIONNAIRES:
            return m(OstChangeStageMessageForm, { inject, disabled, onChange });
          case MessageType.START_INJECT:
            return m(StartInjectForm, { inject, disabled, onChange });
          case MessageType.LARGE_DATA_UPDATE:
            return m(LargeDataUpdateMessageForm, { inject, disabled, onChange });
          case MessageType.SUMO_CONFIGURATION:
            return m(SumoConfigurationForm, { inject, disabled, onChange });
          case MessageType.REQUEST_UNIT_TRANSPORT:
            return m(RequestUnitTransportForm, { inject, disabled, onChange });
          case MessageType.SET_AFFECTED_AREA:
            return m(SetAffectedAreaForm, { inject, disabled, onChange });
          default:
            return m('.row', '');
        }
      },
    };
  };

  return {
    view: ({ attrs: { inject, disabled = false, onChange } }) =>
      inject
        ? inject.type === InjectType.INJECT
          ? m('.message-form', m(MessageFormSelector, { inject, disabled, onChange }))
          // ? m('.message-form', getMessageForm(inject, disabled, onChange))
          : inject.type === InjectType.SCENARIO
          ? m(ScenarioForm, { inject, disabled, onChange, key: undefined })
          : m(DefaultMessageForm, { inject, disabled, key: undefined })
        : undefined,
  };
};
