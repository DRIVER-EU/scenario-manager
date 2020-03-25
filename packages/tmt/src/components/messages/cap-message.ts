import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select, MapEditor, IInputOption } from 'mithril-materialized';
import { EditableTable, IEditableTable } from 'mithril-table';
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
  InjectKeys,
} from '../../../../models';
import { TrialSvc } from '../../services';
import { enumToOptions } from '../../utils';

export const CapMessageForm: FactoryComponent<{
  inject: IInject;
  onChange?: (i: IInject, prop: InjectKeys) => void;
  disabled?: boolean;
}> = () => {
  const state = {} as {
    alert: IAlert;
    alertInfo: IInfo;
    parameters: IValueNamePair[];
    participants: IPerson[];
    statusOptions: IInputOption[];
    msgTypeOptions: IInputOption[];
    scopeOptions: IInputOption[];
    categoryOptions: IInputOption[];
    urgencyOptions: IInputOption[];
    severityOptions: IInputOption[];
    certaintyOptions: IInputOption[];
    // actionList: IActionList[];
  };

  return {
    oninit: ({ attrs: { inject } }) => {
      const alert = getMessage<IAlert>(inject, MessageType.CAP_MESSAGE);
      const participants = TrialSvc.getUsersByRole(UserRole.PARTICIPANT) || [];
      alert.identifier = inject.id;
      alert.status = alert.status || Status.Exercise;
      alert.msgType = alert.msgType || MsgType.Alert;
      alert.scope = alert.scope || Scope.Public;
      if (!alert.info) {
        const alertInfo = {} as IInfo;
        alert.info = alertInfo;
        alertInfo.event = 'Monitor';
        state.alertInfo = alertInfo;
      } else {
        if (alert.info instanceof Array) {
          // console.log('Converting array')
          alert.info = alert.info[0];
        }
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

      // const actionParameter = state.parameters.filter(p => p.valueName === ActionListParameter).shift();
      // state.actionList = actionParameter ? JSON.parse(actionParameter.value) : [];
    },
    view: ({ attrs: { inject, disabled, onChange } }) => {
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
      // console.table(statusOptions);
      const update = (prop: keyof IInject | Array<keyof IInject> = 'message') => onChange && onChange(inject, prop);

      return [
        m(TextInput, {
          disabled,
          id: 'headline',
          className: 'col s12 m6',
          initialValue: inject.title,
          onchange: (v: string) => {
            inject.title = alertInfo.headline = v;
            update(['title', 'message']);
          },
          label: 'Headline',
          iconName: 'title',
        }),
        m(Select, {
          disabled,
          label: 'Sender',
          iconName: 'person',
          className: 'col s12 m6',
          placeholder: 'Sender',
          options: participants.map(p => ({ id: p.id || '', label: `${p.name} (${p.email})` })),
          checkedId: participants
            .filter(p => p.email === alert.sender)
            .map(p => p.email)
            .shift(),
          onchange: v => {
            alert.sender = v[0] as string;
            alertInfo.senderName = (participants.filter(p => p.id === v[0]).shift() || ({} as IPerson)).name;
            update();
          },
        }),
        m(TextArea, {
          disabled,
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => {
            inject.description = alertInfo.description = v;
            update(['description', 'message']);
          },
          label: 'Description',
          iconName: 'note',
        }),
        m(Select, {
          disabled,
          label: 'Status',
          iconName: 'menu',
          className: 'col s12 m4 l3',
          placeholder: 'Status',
          options: statusOptions,
          checkedId: alert.status,
          onchange: v => {
            alert.status = v[0] as Status;
            update();
          },
        }),
        m(Select, {
          disabled,
          label: 'Message type',
          iconName: 'menu',
          className: 'col s12 m4 l3',
          placeholder: 'Message type',
          options: msgTypeOptions,
          checkedId: alert.msgType,
          onchange: v => {
            alert.msgType = v[0] as MsgType;
            update();
          },
        }),
        m(Select, {
          disabled,
          label: 'Scope',
          iconName: 'menu',
          className: 'col s12 m4 l3',
          placeholder: 'Scope',
          options: scopeOptions,
          checkedId: alert.scope,
          onchange: v => {
            alert.scope = v[0] as Scope;
            update();
          },
        }),
        m(Select, {
          disabled,
          label: 'Urgency',
          iconName: 'menu',
          className: 'col s12 m4 l3',
          placeholder: 'Urgency',
          options: urgencyOptions,
          checkedId: alertInfo.urgency,
          onchange: v => {
            alertInfo.urgency = v[0] as Urgency;
            update();
          },
        }),
        m(Select, {
          disabled,
          label: 'Severity',
          iconName: 'menu',
          className: 'col s12 m4 l3',
          placeholder: 'Severity',
          options: severityOptions,
          checkedId: alertInfo.severity,
          onchange: v => {
            alertInfo.severity = v[0] as Severity;
            update();
          },
        }),
        m(Select, {
          disabled,
          label: 'Certainty',
          iconName: 'menu',
          className: 'col s12 m4 l3',
          placeholder: 'Certainty',
          options: certaintyOptions,
          checkedId: alertInfo.certainty,
          onchange: v => {
            alertInfo.certainty = v[0] as Certainty;
            update();
          },
        }),
        m(Select, {
          disabled,
          label: 'Category',
          iconName: 'menu',
          className: 'col s12 m6',
          placeholder: 'Category',
          multiple: true,
          options: categoryOptions,
          checkedId: alertInfo.category,
          onchange: v => {
            alertInfo.category = v as Category | Category[];
            update();
          },
        }),
        // m(EditableTable, {
        //   headers: [
        //     { column: 'title', title: 'Title' },
        //     { column: 'description', title: 'Description' },
        //     { column: 'priority', title: 'Priority' },
        //   ],
        //   // data: state.actionList,
        //   disabled,
        //   addRows: true,
        //   deleteRows: true,
        //   moveRows: true,
        //   onchange: data => {
        //     // state.actionList = data;
        //     const updatedActionList = parameters.filter(p => p.valueName !== ActionListParameter);
        //     updatedActionList.push({
        //       valueName: ActionListParameter,
        //       value: JSON.stringify(data),
        //     });
        //     alertInfo.parameter = state.parameters = updatedActionList;
        //     update();
        //   },
        // } as IEditableTable<IActionList>),
        m(MapEditor, {
          disabled,
          label: 'Parameters',
          labelKey: 'Section',
          labelValue: 'HTML text',
          disallowArrays: true,
          keyClass: '.col.s4.m3',
          valueClass: '.col.s8.m9',
          properties: parameters.reduce((acc, cur) => {
            acc[cur.valueName] = cur.value;
            return acc;
          }, {} as { [key: string]: string }),
          onchange: (props: { [key: string]: string | number | boolean | Array<string | number> }) => {
            alertInfo.parameter = state.parameters = Object.keys(props).map(
              p => ({ valueName: p, value: props[p] } as IValueNamePair)
            );
            update();
          },
        }),
      ];
    },
  };
};
