import m, { FactoryComponent } from 'mithril';
import { InjectState, InjectConditionType, ITimingControlMessage, TimingControlCommand } from 'trial-manager-models';
import { IExecutingInject, timeControlChannel, TopicNames } from '../../models';
import { FlatButton } from 'mithril-materialized';
import { RunSvc, SocketSvc } from '../../services';
import { formatTime } from '../../utils';

export const ManualTransition: FactoryComponent<{ inject: IExecutingInject }> = () => {
  const state = {
    show: true,
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
    view: ({ attrs: { inject } }) => {
      const { show } = state;
      const { id, state: from, expectedExecutionTimeAt } = inject;
      const isWaiting = waitingForManualConfirmation(inject);

      const onclick = () => {
        state.show = false;
        RunSvc.transition({ id, from, to: InjectState.IN_PROGRESS });
      };

      return show
        ? m('.row', [
            isWaiting
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
                }),
            expectedExecutionTimeAt
              ? m(FlatButton, {
                  className: 'left',
                  iconName: 'access_time',
                  iconClass: 'right',
                  label: `Jump to ${formatTime(expectedExecutionTimeAt, expectedExecutionTimeAt.getSeconds() > 0)}`,
                  onclick: () => {
                    jumpToTime(expectedExecutionTimeAt.valueOf());
                  },
                })
              : undefined,
          ])
        : undefined;
    },
  };
};
