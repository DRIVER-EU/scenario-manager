import m, { FactoryComponent } from 'mithril';
import { TimePicker, DatePicker, FlatButton, ModalPanel } from 'mithril-materialized';
import { TimeState, IScenario, ITimeManagement, ITimeControl, TimeCommand } from '../../../../models';
import { SocketSvc, RunSvc } from '../../services';
import { formatTime, padLeft } from '../../utils';

const sendCmd = (socket: SocketIOClient.Socket, msg: ITimeControl) => {
  socket.emit('time-control', msg);
  setTimeout(() => m.redraw(), 1000);
};

const updateSpeed = (socket: SocketIOClient.Socket, simulationSpeed: number) => {
  sendCmd(socket, {
    simulationSpeed,
    command: TimeCommand.Update,
  } as ITimeControl);
};

export const MediaControls: FactoryComponent<{
  id?: string;
  socket: SocketIOClient.Socket;
  time: ITimeManagement;
  canChangeSpeed: boolean;
  canStop?: boolean;
  isPaused: boolean;
  realtime: boolean;
  className?: string;
}> = () => {
  return {
    view: ({ attrs: { id, time, socket, isPaused, canChangeSpeed, canStop = true, realtime, className } }) => {
      return m('div', { id, className }, [
        realtime
          ? undefined
          : m(FlatButton, {
              iconName: 'fast_rewind',
              disabled: !canChangeSpeed,
              onclick: () => updateSpeed(socket, (time.simulationSpeed || 0) / 2),
            }),
        canStop
          ? m(FlatButton, {
              modalId: 'stopPanel',
              iconName: 'stop',
              disabled: time.state === TimeState.Initialization,
            })
          : undefined,
        realtime
          ? undefined
          : isPaused
          ? m(FlatButton, {
              iconName: 'play_arrow',
              onclick: () => sendCmd(socket, { command: TimeCommand.Start }),
            })
          : m(FlatButton, {
              iconName: 'pause',
              onclick: () => sendCmd(socket, { command: TimeCommand.Pause }),
            }),
        realtime
          ? undefined
          : m(FlatButton, {
              iconName: 'fast_forward',
              disabled: !canChangeSpeed,
              onclick: () => updateSpeed(socket, (time.simulationSpeed || 0) * 2),
            }),
      ]);
    },
  };
};

const MediaStateControl: FactoryComponent<{
  socket: SocketIOClient.Socket;
  startTime: string;
  startDate: Date;
  time: ITimeManagement;
  canStart: boolean;
  realtime: boolean;
}> = () => {
  const state = {} as {
    startTime: string;
    startDate: Date;
    time: ITimeManagement;
  };

  const newTime = () => {
    const [hours, minutes] = state.startTime.split(':').map((v) => +v);
    return state.startDate.setHours(hours, minutes, 0, 0);
  };

  const timeHasNotChanged = () => {
    const d = state.time.simulationTime ? new Date(state.time.simulationTime) : new Date();
    return state.startTime === formatTime(d, false) && state.startDate.valueOf() === d.valueOf();
  };

  const onSelect = (hrs: number, min: number) => {
    state.startTime = `${padLeft(hrs)}:${padLeft(min)}`;
  };

  return {
    view: ({ attrs: { socket, startTime, startDate, time, canStart, realtime } }) => {
      state.startTime = state.startTime || startTime || '00:00';
      state.startDate = state.startDate || startDate || new Date();
      state.time = time;

      switch (time.state) {
        default:
        case TimeState.Reset:
          return [
            realtime
              ? undefined
              : m(
                  '.row',
                  m(
                    '.col.s6',
                    m(TimePicker, {
                      label: 'Start time:',
                      iconName: 'timer',
                      container: '#main',
                      initialValue: state.startTime,
                      twelveHour: false,
                      onSelect,
                    })
                  ),
                  m(
                    '.col.s6',
                    m(DatePicker, {
                      label: 'Start date:',
                      initialValue: state.startDate,
                      container: document.getElementById('main') as Element,
                      onchange: (d: Date) => (state.startDate = d),
                    })
                  )
                ),
            m(
              '.row',
              m(
                '.col.s12',
                m(FlatButton, {
                  label: 'Initialize scenario',
                  className: 'btn-flat-large',
                  // iconName: 'timer',
                  disabled: !canStart,
                  onclick: () => {
                    console.log('click');
                    if (realtime) {
                      sendCmd(socket, {
                        simulationTime: Date.now(),
                        simulationSpeed: 1,
                        command: TimeCommand.Init,
                      });
                    } else {
                      sendCmd(socket, {
                        simulationTime: newTime(),
                        simulationSpeed: 1,
                        command: TimeCommand.Init,
                      });
                    }
                    sendCmd(socket, { command: TimeCommand.Start });
                  },
                })
              )
            ),
          ];
        case TimeState.Initialization:
          return m('.row', [
            m(MediaControls, { socket, isPaused: true, canChangeSpeed: false, time: state.time, realtime }),
            m(FlatButton, {
              label: 'Reset session',
              // iconName: 'timer_off',
              onclick: async () => {
                await RunSvc.unload();
                sendCmd(socket, { command: TimeCommand.Reset });
              },
            }),
          ]);
        case TimeState.Paused:
          return m('.row', [
            m(MediaControls, { socket, isPaused: true, canChangeSpeed: false, time: state.time, realtime }),
            m('.col.s12.left', [
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
                onclick: () => {
                  sendCmd(socket, {
                    simulationTime: newTime(),
                    simulationSpeed: 0,
                    command: TimeCommand.Update,
                  });
                },
              }),
            ]),
          ]);
        case TimeState.Started:
          return m('.col.s12', [
            m(MediaControls, { socket, isPaused: false, canChangeSpeed: true, time: state.time, realtime }),
            m('em', `Speed: ${state.time.simulationSpeed}x`),
            state.time.simulationSpeed !== 1
              ? m(FlatButton, { iconName: 'restore', onclick: () => updateSpeed(socket, 1) })
              : undefined,
          ]);
        case TimeState.Stopped:
          return m(
            '.row',
            m(FlatButton, {
              label: 'Reset session',
              // iconName: 'timer_off',
              onclick: () => {
                sendCmd(socket, { command: TimeCommand.Reset });
                RunSvc.unload();
              },
            })
          );
      }
    },
  };
};

export interface ITimeControlOptions {
  scenario?: IScenario;
  isConnected: boolean;
  time: ITimeManagement;
  canStart: boolean;
  realtime: boolean;
  style?: string;
}

export const TimeControl: FactoryComponent<ITimeControlOptions> = () => {
  const state = {
    socket: SocketSvc.socket,
    time: {} as ITimeManagement,
    canStart: false,
    realtime: false,
  } as {
    socket: SocketIOClient.Socket;
    startTime: string;
    startDate: Date;
    time: ITimeManagement;
    canStart: boolean;
    realtime: boolean;
  };

  const updateStart: (vnode: m.Vnode<ITimeControlOptions, {}>) => void = ({ attrs: { scenario } }) => {
    console.log('scenario', scenario);
    const start = scenario && scenario.startDate ? new Date(scenario.startDate) : new Date();
    console.log('start');
    console.table(scenario);
    state.startTime = formatTime(start);
    state.startDate = start;
  };

  return {
    oninit: updateStart,
    onupdate: updateStart,
    view: ({ attrs: { isConnected, time, canStart, realtime, style } }) => {
      state.time = time;
      state.canStart = canStart;
      state.realtime = realtime;
      return [
        m('.button-group', { style }, isConnected ? m(MediaStateControl, state) : undefined),
        m(ModalPanel, {
          id: 'stopPanel',
          title: 'Are you certain you want to stop?',
          description: 'After stopping the time service, you will not be able to continue anymore.',
          buttons: [
            { label: 'No, bring me back to safety' },
            {
              label: 'Yes, I am sure!',
              onclick: () => sendCmd(state.socket, { command: TimeCommand.Stop }),
            },
          ],
        }),
      ];
    },
  };
};
