import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select, MapEditor, ISelectOption } from 'mithril-materialized';
import {
  IInject,
  getMessage,
  MessageType,
  UserRole,
  IPerson,
  IAlert,
  Status,
  IInfo,
  MsgType,
  Scope,
  Category,
  Urgency,
  Severity,
  Certainty,
  IValueNamePair,
} from 'trial-manager-models';
import { TrialSvc } from '../../services';
import { enumToOptions } from '../../utils';

export const CapMessageForm: FactoryComponent<{ inject: IInject; onChange: () => void }> = () => {
  const state = {} as {
    alert: IAlert;
    alertInfo: IInfo;
    parameters: IValueNamePair[];
    participants: IPerson[];
    statusOptions: Array<ISelectOption<string>>;
    msgTypeOptions: Array<ISelectOption<string>>;
    scopeOptions: Array<ISelectOption<string>>;
    categoryOptions: Array<ISelectOption<string>>;
    urgencyOptions: Array<ISelectOption<string>>;
    severityOptions: Array<ISelectOption<string>>;
    certaintyOptions: Array<ISelectOption<string>>;
  };
  return {
    oninit: ({ attrs: { inject } }) => {
      const alert = getMessage<IAlert>(inject, MessageType.CAP_MESSAGE);
      const participants = TrialSvc.getUsersByRole(UserRole.PARTICIPANT) || [];
      alert.identifier = inject.id;
      alert.status = alert.status || Status.Exercise;
      alert.msgType = alert.msgType || MsgType.Alert;
      alert.scope = alert.scope || Scope.Public;
      // alert.scope = 'Exercise';
      if (!alert.info) {
        const alertInfo = {} as IInfo;
        alert.info = [alertInfo];
        alertInfo.event = 'Monitor';
        state.alertInfo = alertInfo;
      } else {
        state.alertInfo = alert.info instanceof Array ? alert.info[0] : alert.info;
      }
      if (!state.alertInfo.parameter) {
        state.alertInfo.parameter = [] as IValueNamePair[];
      }
      state.parameters = state.alertInfo.parameter as IValueNamePair[];
      state.alertInfo.headline = inject.title = inject.title || 'New CAP message';
      state.alert = alert;
      state.participants = participants;
      state.statusOptions = enumToOptions(Status);
      state.msgTypeOptions = enumToOptions(MsgType);
      state.scopeOptions = enumToOptions(Scope);
      state.categoryOptions = enumToOptions(Category);
      state.urgencyOptions = enumToOptions(Urgency);
      state.severityOptions = enumToOptions(Severity);
      state.certaintyOptions = enumToOptions(Certainty);
    },
    view: ({ attrs: { inject } }) => {
      const {
        alert,
        alertInfo,
        parameters,
        participants,
        statusOptions,
        msgTypeOptions,
        scopeOptions,
        categoryOptions,
        urgencyOptions,
        severityOptions,
        certaintyOptions,
      } = state;
      console.table(statusOptions);
      return [
        m(TextInput, {
          id: 'headline',
          className: 'col s12 m6',
          initialValue: inject.title,
          onchange: (v: string) => (inject.title = alertInfo.headline = v),
          label: 'Headline',
          iconName: 'title',
        }),
        m(Select, {
          label: 'Sender',
          iconName: 'person',
          className: 'col s12 m6',
          placeholder: 'Sender',
          options: participants.map(p => ({ id: p.email, label: `${p.name} (${p.email})` })),
          checkedId: participants
            .filter(p => p.email === alert.sender)
            .map(p => p.email)
            .shift(),
          onchange: (v: unknown) => {
            alert.sender = v as string;
            alertInfo.senderName = (participants.filter(p => p.email === v).shift() || ({} as IPerson)).name;
          },
        }),
        m(TextArea, {
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => (inject.description = alertInfo.description = v),
          label: 'Description',
          iconName: 'note',
        }),
        m(Select, {
          label: 'Status',
          iconName: 'menu',
          className: 'col s12 m4',
          placeholder: 'Status',
          options: statusOptions,
          checkedId: alert.status,
          onchange: (v: unknown) => {
            alert.status = v as Status;
          },
        }),
        m(Select, {
          label: 'Message type',
          iconName: 'menu',
          className: 'col s12 m4',
          placeholder: 'Message type',
          options: msgTypeOptions,
          checkedId: alert.msgType,
          onchange: (v: unknown) => {
            alert.msgType = v as MsgType;
          },
        }),
        m(Select, {
          label: 'Scope',
          iconName: 'menu',
          className: 'col s12 m4',
          placeholder: 'Scope',
          options: scopeOptions,
          checkedId: alert.scope,
          onchange: (v: unknown) => {
            alert.scope = v as Scope;
          },
        }),
        m(Select, {
          label: 'Urgency',
          iconName: 'menu',
          className: 'col s12 m4',
          placeholder: 'Urgency',
          options: urgencyOptions,
          checkedId: alertInfo.urgency,
          onchange: (v: unknown) => {
            alertInfo.urgency = v as Urgency;
          },
        }),
        m(Select, {
          label: 'Severity',
          iconName: 'menu',
          className: 'col s12 m4',
          placeholder: 'Severity',
          options: severityOptions,
          checkedId: alertInfo.severity,
          onchange: (v: unknown) => {
            alertInfo.severity = v as Severity;
          },
        }),
        m(Select, {
          label: 'Certainty',
          iconName: 'menu',
          className: 'col s12 m4',
          placeholder: 'Certainty',
          options: certaintyOptions,
          checkedId: alertInfo.certainty,
          onchange: (v: unknown) => {
            alertInfo.certainty = v as Certainty;
          },
        }),
        m(Select, {
          label: 'Category',
          iconName: 'menu',
          className: 'col s12 m6',
          placeholder: 'Category',
          multiple: true,
          options: categoryOptions,
          checkedId: alertInfo.category,
          onchange: (v: unknown) => {
            alertInfo.category = v as Category | Category[];
          },
        }),
        m(MapEditor, {
          label: 'Parameters',
          labelKey: 'Section',
          labelValue: 'HTML text',
          disallowArrays: true,
          keyClass: '.col.s4.m3',
          valueClass: '.col.s8.m9',
          properties: parameters.reduce(
            (acc, cur) => {
              acc[cur.valueName] = cur.value;
              return acc;
            },
            {} as { [key: string]: string }
          ),
          onchange: (props: { [key: string]: string | number | boolean | Array<string | number> }) => {
            alertInfo.parameter = state.parameters = Object.keys(props).map(
              p => ({ valueName: p, value: props[p] } as IValueNamePair)
            );
          },
        }),
      ];
    },
  };
};
