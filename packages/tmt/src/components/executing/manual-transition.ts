import m, { FactoryComponent } from 'mithril';
import {
  InjectState,
  InjectConditionType,
  ITimingControlMessage,
  TimingControlCommand,
  IExecutingInject,
  InjectType,
  IInject,
  MessageType,
  uniqueId,
} from 'trial-manager-models';
import { timeControlChannel, TopicNames } from '../../models';
import { FlatButton, ModalPanel, Select } from 'mithril-materialized';
import { RunSvc, SocketSvc } from '../../services';
import { formatTime, messageOptions, getMessageIcon, findPreviousInjects } from '../../utils';
import { MessageForm } from '../messages/message-form';
import { InjectConditions } from '../injects/inject-conditions';

export const ManualTransition: FactoryComponent<{ inject: IExecutingInject; editing?: (v: boolean) => void }> = () => {
  const state = {
    show: true,
    isEditing: false,
    options: [] as Array<{ id: string; label: string }>,
    newInject: {} as IInject,
  };

  const waitingForManualConfirmation = (inject: IExecutingInject) =>
    inject.state === InjectState.SCHEDULED &&
    inject.condition &&
    inject.condition.type === InjectConditionType.MANUALLY;

  const sendCmd = (socket: SocketIOClient.Socket, msg: ITimingControlMessage) => {
    socket.emit('time-control', msg);
    timeControlChannel.publish(TopicNames.CMD, { cmd: msg });
    setTimeout(() => m.redraw(), 1000);
  };

  const jumpToTime = (trialTime: number) => {
    sendCmd(SocketSvc.socket, {
      trialTime,
      trialTimeSpeed: 1,
      command: TimingControlCommand.Update,
    });
  };

  return {
    oninit: async () => {
      const trial = await RunSvc.activeTrial();
      const selectedMessageTypes = trial.selectedMessageTypes;
      state.options = messageOptions(selectedMessageTypes);
    },
    view: ({ attrs: { inject, editing } }) => {
      const { show, isEditing } = state;
      const { id, state: from, expectedExecutionTimeAt } = inject;
      const isWaiting = waitingForManualConfirmation(inject);
      const previousInjects = findPreviousInjects(inject, RunSvc.getInjects());

      const onclick = () => {
        state.show = false;
        RunSvc.transition({
          id,
          from,
          to: InjectState.IN_PROGRESS,
          expectedExecutionTimeAt: expectedExecutionTimeAt ? expectedExecutionTimeAt.valueOf() : undefined,
        });
      };

      const onChange = (inj?: IInject) => {
        if (inj) {
          state.newInject = inj;
        }
        // m.redraw();
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
        editing &&
          m(FlatButton, {
            className: 'right',
            iconName: 'edit',
            iconClass: 'right',
            label: isEditing ? 'Stop editing' : 'Edit',
            onclick: () => {
              state.isEditing = !isEditing;
              editing(state.isEditing);
              if (!state.isEditing) {
                state.show = true;
                RunSvc.updateInject(inject);
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
              onCreate: modal => {
                modal.options.endingTop = '5%';
                state.newInject = { id: uniqueId(), type: InjectType.INJECT, parentId: inject.id } as IInject;
              },
              id: 'add-modal',
              title: 'Add a new message',
              description: m('div', [
                m(Select, {
                  key: 'select',
                  iconName: getMessageIcon(state.newInject.messageType),
                  placeholder: 'Select the message type',
                  checkedId: state.newInject.messageType,
                  options: state.options,
                  fixedFooter: true,
                  onchange: v => {
                    state.newInject.messageType = v[0] as MessageType;
                  },
                }),
                m(MessageForm, {
                  inject: state.newInject,
                  key: state.newInject.messageType || 'mt',
                }),
                state.newInject.messageType
                  ? m(InjectConditions, {
                      injects: RunSvc.getInjects() || [],
                      inject: state.newInject,
                      previousInjects,
                      onChange,
                      key: 'inject_cond_' + inject.id,
                    })
                  : m('div', { key: 'dummy' }),
              ]),
              buttons: [
                { label: 'Cancel' },
                {
                  label: 'Create',
                  onclick: () => {
                    RunSvc.createInject(state.newInject);
                  },
                },
              ],
            }),
          ],
      ]);
    },
  };
};
