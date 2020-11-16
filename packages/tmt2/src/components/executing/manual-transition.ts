import m from 'mithril';
import {
  InjectState,
  InjectConditionType,
  ITimeControl,
  TimeCommand,
  IExecutingInject,
  InjectType,
  IInject,
  MessageType,
  uniqueId,
} from '../../../../models';
import { FlatButton, ModalPanel, Select } from 'mithril-materialized';
import { MeiosisComponent, SocketSvc } from '../../services';
import { formatTime, messageOptions, getMessageIcon, getActiveTrialInfo } from '../../utils';
import { MessageForm } from '../messages/message-form';
import { InjectConditions } from '../injects/inject-conditions';

export const ManualTransition: MeiosisComponent<{ editing?: (v: boolean) => void }> = () => {
  let show = true;
  let isEditing = false;
  let msgOptions = [] as Array<{ id: string; label: string }>;
  let newInject = {} as IInject;

  const waitingForManualConfirmation = (inject: IExecutingInject) =>
    inject.state === InjectState.SCHEDULED &&
    inject.condition &&
    inject.condition.type === InjectConditionType.MANUALLY;

  const sendCmd = (socket: SocketIOClient.Socket, msg: ITimeControl) => {
    socket.emit('time-control', msg);
    setTimeout(() => m.redraw(), 1000);
  };

  const jumpToTime = (simulationTime: number) => {
    sendCmd(SocketSvc.socket, {
      simulationTime,
      simulationSpeed: 1,
      command: TimeCommand.Update,
    });
  };

  return {
    oninit: ({ attrs: { state } }) => {
      const { trial } = getActiveTrialInfo(state);
      const selectedMessageTypes = trial.selectedMessageTypes;
      msgOptions = messageOptions(selectedMessageTypes);
    },
    view: ({ attrs: { state, actions, options } }) => {
      const { inject } = getActiveTrialInfo<IExecutingInject>(state);
      const { updateExecutingInject, createInject, transitionInject } = actions;
      if (!inject) return;

      const { id: i, state: from, expectedExecutionTimeAt } = inject;
      const id = i as string;
      const isWaiting = waitingForManualConfirmation(inject);

      const onclick = () => {
        show = false;
        transitionInject({
          id,
          from,
          to: InjectState.IN_PROGRESS,
          expectedExecutionTimeAt: expectedExecutionTimeAt ? expectedExecutionTimeAt.valueOf() : undefined,
        });
      };

      return m('.row', [
        show &&
          !isEditing &&
          inject.type === InjectType.INJECT &&
          (isWaiting
            ? m(FlatButton, {
                className: 'right red-text',
                iconName: 'check_circle',
                iconClass: 'red-text right',
                label: 'Click here when ready',
                onclick,
              })
            : m(FlatButton, {
                className: 'right',
                iconName: 'send',
                iconClass: 'right',
                label: inject.state === InjectState.EXECUTED ? 'Resend' : 'Send now',
                onclick,
              })),
        options &&
          options.editing &&
          m(FlatButton, {
            className: 'right',
            iconName: 'edit',
            iconClass: 'right',
            label: isEditing ? 'Stop editing' : 'Edit',
            onclick: () => {
              isEditing = !isEditing;
              options && options.editing && options.editing(isEditing);
              if (!isEditing) {
                show = true;
                updateExecutingInject(inject);
              }
            },
          }),
        show &&
          expectedExecutionTimeAt &&
          m(FlatButton, {
            className: 'left',
            iconName: 'access_time',
            iconClass: 'right',
            label: `Jump to ${formatTime(expectedExecutionTimeAt, expectedExecutionTimeAt.getSeconds() > 0)}`,
            onclick: () => {
              jumpToTime(expectedExecutionTimeAt.valueOf());
            },
          }),
        show &&
          inject.type === InjectType.ACT && [
            m(FlatButton, {
              modalId: 'add-modal',
              className: 'right',
              iconName: 'add',
              iconClass: 'right',
            }),
            m(ModalPanel, {
              onCreate: (modal) => {
                modal.options.endingTop = '5%';
                newInject = { id: uniqueId(), type: InjectType.INJECT, parentId: inject.id } as IInject;
              },
              id: 'add-modal',
              title: 'Add a new message',
              description: m('div', [
                m(Select, {
                  // key: 'select',
                  iconName: getMessageIcon(newInject.messageType),
                  placeholder: 'Select the message type',
                  checkedId: newInject.messageType,
                  options: msgOptions,
                  fixedFooter: true,
                  onchange: (v) => {
                    newInject.messageType = v[0] as MessageType;
                  },
                }),
                m(MessageForm, {
                  state,
                  actions,
                  // inject: newInject,
                  // key: newInject.messageType || 'mt',
                }),
                newInject.messageType && m(InjectConditions, { state, actions }),
              ]),
              buttons: [
                { label: 'Cancel' },
                {
                  label: 'Create',
                  onclick: () => {
                    createInject(newInject);
                  },
                },
              ],
            }),
          ],
      ]);
    },
  };
};
