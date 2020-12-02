import m from 'mithril';
import { TextArea, TextInput, Select, Label, FlatButton } from 'mithril-materialized';
import { MarkdownEditor, IMarkdownEditor } from 'mithril-markdown';
import { render } from 'slimdown-js';
import {
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
  ResponseType,
} from '../../../../models';
import { MessageComponent } from '../../services';
import { getActiveTrialInfo, getUsersByRole } from '../../utils';

/** LCMS message, currently a wrapped CAP message */
export const LcmsMessageForm: MessageComponent = () => {
  let participants: IPerson[];

  // const validateActionList = debounce((al: IActionList[]) => {
  //   const errors: string[] = [];
  //   const priorities = Object.keys(Priority);
  //   const checkPriority = (prio: string) => priorities.indexOf(prio) >= 0;
  //   al.forEach(a => {
  //     a.priority = a.priority ? (a.priority.toUpperCase() as Priority) : Priority.AVERAGE;
  //     if (!checkPriority(a.priority)) {
  //       errors.push(`Priority ${a.priority} is not valid. Valid options are: ${priorities.join(', ')}.`);
  //     }
  //   });
  //   if (errors.length > 0) {
  //     const html = errors.join('<br/>');
  //     M.toast({ html, classes: 'red' });
  //     return false;
  //   }
  //   return true;
  // }, 500);

  return {
    oninit: ({
      attrs: {
        state: {
          app: { trial },
        },
      },
    }) => {
      participants = getUsersByRole(trial, UserRole.PARTICIPANT) || [];
    },
    view: ({
      attrs: {
        state,
        actions: { updateInject },
        options: { editing } = { editing: true },
      },
    }) => {
      const { inject } = getActiveTrialInfo(state);
      if (!inject) return;
      const disabled = !editing;
      const mdChanged = (p: IValueNamePair, md: string) => {
        p.value = md;
        updateInject(inject);
      };

      const alert = getMessage<IAlert>(inject, MessageType.CAP_MESSAGE);
      alert.identifier = inject.id;
      alert.msgType = alert.msgType || MsgType.Alert;
      alert.scope = alert.scope || Scope.Public;
      alert.status = alert.status || Status.Exercise;
      // alert.
      if (!alert.info) {
        alert.info = {} as IInfo;
        alert.info.event = 'Monitor';
        alert.info.category = Category.Other;
        alert.info.certainty = Certainty.Unknown;
        alert.info.responseType = ResponseType.None;
        alert.info.severity = Severity.Unknown;
        alert.info.urgency = Urgency.Unknown;
        // alertInfo.area = IArea
      } else if (alert.info instanceof Array) {
        alert.info = alert.info[0];
      }
      if (!alert.info.parameter) {
        alert.info.parameter = [] as IValueNamePair[];
      }
      const parameters = alert.info.parameter as IValueNamePair[];
      alert.info.headline = inject.title = inject.title || 'New LCMS message';
      const alertInfo = alert.info;
      return [
        m(TextInput, {
          disabled,
          id: 'headline',
          className: 'col s12 m6',
          initialValue: inject.title,
          onchange: (v: string) => {
            inject.title = alertInfo.headline = v;
            updateInject(inject);
          },
          label: 'Headline',
          iconName: 'title',
        }),
        m(Select, {
          disabled,
          label: 'Participant sending the message',
          iconName: 'person',
          className: 'col s12 m6',
          placeholder: 'Sender (requires email)',
          options: participants
            .filter((p) => p.email)
            .map((p) => ({ id: p.email || '', label: `${p.name} (${p.email})` })),
          checkedId: participants
            .filter((p) => p.email === alert.sender)
            .map((p) => p.email)
            .shift(),
          onchange: (v) => {
            alert.sender = v[0] as string;
            alertInfo.senderName = (participants.filter((p) => p.id === v[0]).shift() || ({} as IPerson)).name;
            updateInject(inject);
          },
        }),
        m(TextArea, {
          disabled,
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => {
            inject.description = alertInfo.description = v;
            updateInject(inject);
          },
          label: 'Description',
          iconName: 'note',
        }),
        m(
          '.col.s12',
          m('div', [
            m(Label, { label: 'Sections' }),
            m(FlatButton, {
              iconName: 'add',
              disabled: disabled || parameters.filter((p) => p.valueName === 'New section').length > 0,
              onclick: () => {
                alertInfo.parameter instanceof Array &&
                  alertInfo.parameter.push({ valueName: 'New section', value: 'Click me to change' });
                updateInject(inject);
              },
            }),
          ]),
          m(
            'div',
            parameters
              .filter((p) => p.valueName[0] !== '_')
              .map((p, i) => {
                return [
                  m(TextInput, {
                    disabled,
                    label: `Section ${i + 1}. Title`,
                    initialValue: p.valueName,
                    onchange: (t) => {
                      p.valueName = t;
                      updateInject(inject);
                    },
                  }),
                  m('.col.s12', [
                    m('div', [
                      m(Label, { label: `Section ${i + 1}. Content` }),
                      m(FlatButton, {
                        disabled,
                        iconName: 'delete',
                        onclick: () => {
                          if (alertInfo.parameter instanceof Array)
                            alertInfo.parameter = parameters.filter((_, index) => index !== i);
                          else if (alertInfo.parameter) {
                            alertInfo.parameter = undefined;
                          }
                          updateInject(inject);
                        },
                      }),
                    ]),
                    m(MarkdownEditor, {
                      parse: render,
                      disabled,
                      markdown: p.value || 'Click here to start editing',
                      onchange: (md: string) => mdChanged(p, md),
                    } as IMarkdownEditor),
                  ]),
                ];
              })
          )
        ),
        // m(
        //   '.col.s12',
        //   m('div', [
        //     m(Label, { label: 'Actions' }),
        //     m(FlatButton, {
        //       iconName: 'add',
        //       disabled: actionList.length > 0,
        //       onclick: () => {
        //         actionList.push({ title: 'New title', description: '', priority: Priority.AVERAGE });
        //         update();
        //       },
        //     }),
        //   ]),
        //   actionList.length > 0
        //     ? m(
        //         '.input-field',
        //         m(EditableTable, {
        //           headers: [
        //             { column: 'title', title: 'Title' },
        //             { column: 'description', title: 'Description' },
        //             { column: 'priority', title: 'Priority' },
        //           ],
        //           data: actionList,
        //           disabled,
        //           addRows: true,
        //           deleteRows: true,
        //           moveRows: true,
        //           onchange: data => {
        //             validateActionList(data);
        //             state.actionList = data;
        //             const updatedActionList = parameters.filter(p => p.valueName !== ActionListParameter);
        //             updatedActionList.push({
        //               valueName: ActionListParameter,
        //               value: JSON.stringify(data),
        //             });
        //             alertInfo.parameter = state.parameters = updatedActionList;
        //             update();
        //           },
        //         } as IEditableTable<IActionList>)
        //       )
        //     : undefined
        // ),
      ];
    },
  };
};
