import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select, Label, FlatButton } from 'mithril-materialized';
import { EditableTable, IEditableTable } from 'mithril-table';
import { MarkdownEditor, IMarkdownEditor } from 'mithril-markdown';
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
  Priority,
} from 'trial-manager-models';
import { TrialSvc } from '../../services';
import { debounce } from '../../utils';

/** LCMS message, currently a wrapped CAP message */
export const LcmsMessageForm: FactoryComponent<{ inject: IInject; onChange?: () => void; disabled?: boolean }> = () => {
  const state = {} as {
    alert: IAlert;
    alertInfo: IInfo;
    parameters: IValueNamePair[];
    participants: IPerson[];
    actionList: IActionList[];
  };

  const validateActionList = debounce((al: IActionList[]) => {
    const errors: string[] = [];
    const priorities = Object.keys(Priority);
    const checkPriority = (prio: string) => priorities.indexOf(prio) >= 0;
    al.forEach(a => {
      a.priority = a.priority ? (a.priority.toUpperCase() as Priority) : Priority.AVERAGE;
      if (!checkPriority(a.priority)) {
        errors.push(`Priority ${a.priority} is not valid. Valid options are: ${priorities.join(', ')}.`);
      }
    });
    if (errors.length > 0) {
      const html = errors.join('<br/>');
      M.toast({ html, classes: 'red' });
      return false;
    }
    return true;
  }, 500);

  return {
    oninit: ({ attrs: { inject } }) => {
      state.participants = TrialSvc.getUsersByRole(UserRole.PARTICIPANT) || [];
      const alert = getMessage<IAlert>(inject, MessageType.CAP_MESSAGE);
      alert.identifier = inject.id;
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
      state.alertInfo.headline = inject.title = inject.title || 'New LCMS message';
      state.alert = alert;

      const actionParameter = state.parameters.filter(p => p.valueName === ActionListParameter).shift();
      state.actionList = actionParameter ? JSON.parse(actionParameter.value) : [];
    },
    view: ({ attrs: { inject, disabled } }) => {
      const { alert, alertInfo, actionList, parameters, participants } = state;
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
          options: participants.map(p => ({ id: p.id || '', label: `${p.name} (${p.email})` })),
          checkedId: participants
            .filter(p => p.id === alert.sender)
            .map(p => p.id)
            .shift(),
          onchange: v => {
            alert.sender = v[0] as string;
            alertInfo.senderName = (participants.filter(p => p.id === v[0]).shift() || ({} as IPerson)).name;
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
        m(
          '.col.s12',
          m('div', [
            m(Label, { label: 'Sections' }),
            m(FlatButton, {
              iconName: 'add',
              disabled: disabled || parameters.filter(p => p.valueName === 'New section').length > 0,
              onclick: () => {
                state.parameters.push({ valueName: 'New section', value: 'Click me to change' });
              },
            }),
          ]),
          m(
            'div',
            parameters
              .filter(p => p.valueName[0] !== '_')
              .map((p, i) => {
                return [
                  m(TextInput, {
                    disabled,
                    label: `Section ${i + 1}. Title`,
                    initialValue: p.valueName,
                    onchange: t => (p.valueName = t),
                  }),
                  m('.col.s12', [
                    m('div', [
                      m(Label, { label: `Section ${i + 1}. Content` }),
                      m(FlatButton, {
                        disabled,
                        iconName: 'delete',
                        onclick: () => {
                          state.parameters = parameters.filter(c => c.valueName === p.valueName);
                        },
                      }),
                    ]),
                    m(MarkdownEditor, {
                      disabled,
                      markdown: p.value,
                      onchange: md => (p.value = md),
                    } as IMarkdownEditor),
                  ]),
                ];
              })
          )
        ),
        m(
          '.col.s12',
          m('div', [
            m(Label, { label: 'Actions' }),
            m(FlatButton, {
              iconName: 'add',
              disabled: actionList.length > 0,
              onclick: () => actionList.push({ title: 'New title', description: '', priority: Priority.AVERAGE }),
            }),
          ]),
          actionList.length > 0
            ? m(
                '.input-field',
                m(EditableTable, {
                  headers: [
                    { column: 'title', title: 'Title' },
                    { column: 'description', title: 'Description' },
                    { column: 'priority', title: 'Priority' },
                  ],
                  data: actionList,
                  disabled,
                  addRows: true,
                  deleteRows: true,
                  moveRows: true,
                  onchange: data => {
                    validateActionList(data);
                    state.actionList = data;
                    const updatedActionList = parameters.filter(p => p.valueName !== ActionListParameter);
                    updatedActionList.push({
                      valueName: ActionListParameter,
                      value: JSON.stringify(data),
                    });
                    alertInfo.parameter = state.parameters = updatedActionList;
                  },
                } as IEditableTable<IActionList>)
              )
            : undefined
        ),
      ];
    },
  };
};
