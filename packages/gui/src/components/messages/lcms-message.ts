import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select, MapEditor } from 'mithril-materialized';
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
  IActionList,
  ActionListParameter,
  ResponseType,
} from 'trial-manager-models';
import { TrialSvc } from '../../services';

/** LCMS message, currently a wrapped CAP message */
export const LcmsMessageForm: FactoryComponent<{ inject: IInject; onChange?: () => void; disabled?: boolean }> = () => {
  const state = {} as {
    alert: IAlert;
    alertInfo: IInfo;
    parameters: IValueNamePair[];
    participants: IPerson[];
    actionList: IActionList[];
  };

  return {
    oninit: ({ attrs: { inject } }) => {
      const alert = getMessage<IAlert>(inject, MessageType.CAP_MESSAGE);
      const participants = TrialSvc.getUsersByRole(UserRole.PARTICIPANT) || [];
      alert.identifier = inject.id;
      console.log(alert.identifier);
      alert.msgType = alert.msgType || MsgType.Alert;
      alert.scope = alert.scope || Scope.Public;
      alert.status = alert.status || Status.Exercise;
      // alert.
      if (!alert.info) {
        const alertInfo = {} as IInfo;
        alert.info = alertInfo;
        alertInfo.event = 'Monitor';
        alertInfo.category = Category.Other;
        alertInfo.certainty = Certainty.Unknown;
        alertInfo.responseType = ResponseType.None;
        alertInfo.severity = Severity.Unknown;
        alertInfo.urgency = Urgency.Unknown;
        // alertInfo.area = IArea
        state.alertInfo = alertInfo;
      } else {
        if (alert.info instanceof Array) {
          console.log('Converting array');
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

      const actionParameter = state.parameters.filter(p => p.valueName === ActionListParameter).shift();
      state.actionList = actionParameter ? JSON.parse(actionParameter.value) : [];
    },
    view: ({ attrs: { inject, disabled } }) => {
      const {
        alert,
        alertInfo,
        parameters,
        participants,
      } = state;
      // console.table(statusOptions);

      return [
        m(TextInput, {
          disabled,
          id: 'headline',
          className: 'col s12 m6',
          initialValue: inject.title,
          onchange: (v: string) => (inject.title = alertInfo.headline = v),
          label: 'Headline',
          iconName: 'title',
        }),
        m(Select, {
          disabled,
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
          disabled,
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => (inject.description = alertInfo.description = v),
          label: 'Description',
          iconName: 'note',
        }),
        m(EditableTable, {
          headers: [
            { column: 'title', title: 'Title' },
            { column: 'description', title: 'Description' },
            { column: 'priority', title: 'Priority' },
          ],
          data: state.actionList,
          disabled,
          addRows: true,
          deleteRows: true,
          moveRows: true,
          onchange: data => {
            state.actionList = data;
            const updatedActionList = parameters.filter(p => p.valueName !== ActionListParameter);
            updatedActionList.push({
              valueName: ActionListParameter,
              value: JSON.stringify(data),
            });
            alertInfo.parameter = state.parameters = updatedActionList;
          },
        } as IEditableTable<IActionList>),
        m(MapEditor, {
          disabled,
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
