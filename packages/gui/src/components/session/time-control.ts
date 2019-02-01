import m, { FactoryComponent } from 'mithril';
import { TimePicker, DatePicker, FlatButton, ModalPanel } from 'mithril-materialized';
import { States, IScenario, ITimingControlMessage, TimingControlCommand } from '../../models';
import { SocketSvc } from '../../services';
import { formatTime, padLeft } from '../../utils';
import { ITimeMessage } from './../../models/time-message';

const updateSpeed = (socket: SocketIOClient.Socket, trialTimeSpeed: number) =>
  socket.emit('time-control', {
    trialTimeSpeed,
    command: TimingControlCommand.Update,
  } as ITimingControlMessage);
const sendCmd = (socket: SocketIOClient.Socket, command: TimingControlCommand) =>
  socket.emit('time-control', {
    command,
  } as ITimingControlMessage);

const MediaControls: FactoryComponent<{
  socket: SocketIOClient.Socket;
  time: ITimeMessage;
  canChangeSpeed: boolean;
  isPaused: boolean;
}> = () => {
  return {
    view: ({ attrs: { time, socket, isPaused, canChangeSpeed } }) => {
      return [
        m(FlatButton, {
          iconName: 'fast_rewind',
          disabled: !canChangeSpeed,
          onclick: () => updateSpeed(socket, time.trialTimeSpeed / 2),
        }),
        m(FlatButton, {
          modalId: 'stopPanel',
          iconName: 'stop',
          disabled: time.state === States.Initialized,
        }),
        isPaused
          ? m(FlatButton, {
              iconName: 'play_arrow',
              onclick: () => sendCmd(socket, TimingControlCommand.Start),
            })
          : m(FlatButton, {
              iconName: 'pause',
              onclick: () => sendCmd(socket, TimingControlCommand.Pause),
            }),
        m(FlatButton, {
          iconName: 'fast_forward',
          disabled: !canChangeSpeed,
          onclick: () => updateSpeed(socket, time.trialTimeSpeed * 2),
        }),
      ];
    },
  };
};

const MediaStateControl: FactoryComponent<{
  socket: SocketIOClient.Socket;
  startTime: string;
  startDate: Date;
  time: ITimeMessage;
}> = () => {
  const state = {
    startTime: '00:00',
    startDate: new Date(),
    time: {} as ITimeMessage,
  };

  const newTime = () => {
    const [hours, minutes] = state.startTime.split(':').map(v => +v);
    return state.startDate.setUTCHours(hours, minutes, 0, 0);
  };

  const timeHasNotChanged = () => {
    const d = new Date(state.time.trialTime);
    return (
      state.startTime === formatTime(d, false) &&
      state.startDate.getUTCFullYear() === d.getUTCFullYear() &&
      state.startDate.getUTCMonth() === d.getUTCMonth() &&
      state.startDate.getUTCDate() === d.getUTCDate()
    );
  };
  const onSelect = (hrs: number, min: number) => {
    state.startTime = `${padLeft(hrs, 2)}:${padLeft(min, 2)}`;
  };

  return {
    view: ({ attrs: { socket, startTime, startDate, time } }) => {
      state.startTime = startTime;
      state.startDate = startDate;
      state.time = time;

      switch (time.state) {
        default:
        case States.Idle:
          return [
            m(
              '.row',
              m(FlatButton, {
                label: 'Initialise time',
                contentClass: 'btn-flat-large',
                iconName: 'timer',
                onclick: () =>
                  socket.emit('time-control', {
                    trialTime: newTime(),
                    trialTimeSpeed: 1,
                    command: TimingControlCommand.Init,
                  } as ITimingControlMessage),
              })
            ),
            m(
              '.row',
              m('.col', [
                m(TimePicker, {
                  label: 'Start time:',
                  container: '#main',
                  initialValue: state.startTime,
                  twelveHour: false,
                  onSelect,
                }),
                m(DatePicker, {
                  label: 'Start date:',
                  initialValue: state.startDate,
                  container: document.getElementById('main') as Element,
                  onchange: (d: Date) => (state.startDate = d),
                }),
              ])
            ),
          ];
        case States.Initialized:
          return m('.row', [
            m(MediaControls, { socket, isPaused: true, canChangeSpeed: false, time: state.time }),
            m(FlatButton, {
              label: 'Reset time',
              iconName: 'timer_off',
              onclick: () =>
                socket.emit('time-control', {
                  command: TimingControlCommand.Reset,
                } as ITimingControlMessage),
            }),
          ]);
        case States.Paused:
          return m('.row', [
            m(MediaControls, { socket, isPaused: true, canChangeSpeed: false, time: state.time }),
            m('.row.left', [
              m(TimePicker, {
                label: 'Updated time:',
                container: '#main',
                initialValue: state.startTime,
                twelveHour: false,
                onSelect,
              }),
              m(DatePicker, {
                label: 'Updated date:',
                container: document.getElementById('main') as Element,
                initialValue: state.startDate,
                onchange: (d: Date) => (state.startDate = d),
              }),
              m(FlatButton, {
                label: 'Update time',
                iconName: 'update',
                disabled: timeHasNotChanged(),
                onclick: () =>
                  socket.emit('time-control', {
                    trialTime: newTime(),
                    trialTimeSpeed: 0,
                    command: TimingControlCommand.Update,
                  } as ITimingControlMessage),
              }),
            ]),
          ]);
        case States.Started:
          return m('.row', [
            m(MediaControls, { socket, isPaused: false, canChangeSpeed: true, time: state.time }),
            m('em', 'Trial Time Speed Factor: ' + state.time.trialTimeSpeed),
            state.time.trialTimeSpeed !== 1
              ? m(FlatButton, { iconName: 'restore', onclick: () => updateSpeed(socket, 1) })
              : undefined,
          ]);
        case States.Stopped:
          return m(
            '.row',
            m(FlatButton, {
              label: 'Reset time',
              iconName: 'timer_off',
              onclick: () => sendCmd(socket, TimingControlCommand.Reset),
            })
          );
      }
    },
  };
};

export const TimeControl: FactoryComponent<{ scenario?: IScenario; isConnected: boolean; time: ITimeMessage }> = () => {
  const state = {
    socket: SocketSvc.socket,
    startTime: '00:00',
    startDate: new Date(),
    time: {} as ITimeMessage,
  };

  const updateStart: ((
    vnode: m.Vnode<{ scenario?: IScenario | undefined; isConnected: boolean; time: ITimeMessage }, {}>
  ) => any) = ({ attrs: { scenario } }) => {
    const start = scenario && scenario.startDate ? new Date(scenario.startDate) : new Date();
    state.startTime = formatTime(start);
    state.startDate = start;
  };

  return {
    oninit: updateStart,
    onupdate: updateStart,
    view: ({ attrs: { isConnected, time } }) => {
      state.time = time;
      return [
        m('.button-group', isConnected ? m(MediaStateControl, state) : m('span', 'NO CONNECTION AVAILABLE')),
        m(ModalPanel, {
          id: 'stopPanel',
          title: 'Are you certain you want to stop?',
          description: 'After stopping the time service, you will not be able to continue anymore.',
          buttons: [
            { label: 'No, bring me back to safety' },
            { label: 'Yes, I am sure!', onclick: () => sendCmd(state.socket, TimingControlCommand.Stop) },
          ],
        }),
      ];
    },
  };
};
