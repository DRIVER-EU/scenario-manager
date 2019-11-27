import m, { FactoryComponent } from 'mithril';
import {
  InjectState,
  InjectConditionType,
  ITimingControlMessage,
  TimingControlCommand,
  IExecutingInject,
} from 'trial-manager-models';
import { timeControlChannel, TopicNames } from '../../models';
import { FlatButton } from 'mithril-materialized';
import { RunSvc, SocketSvc } from '../../services';
import { formatTime } from '../../utils';

export const ManualTransition: FactoryComponent<{ inject: IExecutingInject; editing?: (v: boolean) => void }> = () => {
  const state = {
    show: true,
    isEditing: false,
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
    view: ({ attrs: { inject, editing } }) => {
      const { show, isEditing } = state;
      const { id, state: from, expectedExecutionTimeAt } = inject;
      const isWaiting = waitingForManualConfirmation(inject);

      const onclick = () => {
        state.show = false;
        RunSvc.transition({
          id,
          from,
          to: InjectState.IN_PROGRESS,
          expectedExecutionTimeAt: expectedExecutionTimeAt ? expectedExecutionTimeAt.valueOf() : undefined,
        });
      };

      return m('.row', [
        show &&
          !isEditing &&
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
        editing && m(FlatButton, {
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
      ]);
    },
  };
};
