import m, { FactoryComponent } from 'mithril';
import { Socket } from 'socket.io-client';
import { TimePicker, DatePicker, FlatButton, ModalPanel } from 'mithril-materialized';
import { TimeState, IScenario, ITimeManagement, ITimeControl, TimeCommand, UserRole } from '../../../../models';
import { SocketSvc, MeiosisComponent } from '../../services';
import { formatTime, getActiveTrialInfo, getUserById, hasUserRole, isSessionInfoValid, padLeft } from '../../utils';

const sendCmd = (socket: Socket, msg: ITimeControl) => {
  socket.emit('time-control', msg);
  setTimeout(() => m.redraw(), 1000);
};

const updateSpeed = (socket: Socket, simulationSpeed: number) => {
  sendCmd(socket, {
    simulationSpeed,
    command: TimeCommand.Update,
  } as ITimeControl);
};

export const MediaControls: FactoryComponent<{
  id?: string;
  socket: Socket;
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
              disabled: canChangeSpeed === false || time.state === TimeState.Initialization,
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

const MediaStateControl: MeiosisComponent = () => {
  const socket = SocketSvc.socket;
  let startTime: string;
  let startDate: Date;

  const newTime = () => {
    const [hours, minutes] = startTime.split(':').map((v) => +v);
    return startDate.setHours(hours, minutes, 0, 0);
  };

  const timeHasNotChanged = (st: Date) => startTime === formatTime(st, false) && startDate.valueOf() === st.valueOf();

  const onSelect = (hrs: number, min: number) => {
    startTime = `${padLeft(hrs)}:${padLeft(min)}`;
  };

  return {
    view: ({
      attrs: {
        state,
        actions: { stopSession, updateInject },
      },
    }) => {
      const { scenario } = getActiveTrialInfo(state);
      const {
        time,
        sessionControl: { realtime, activeSession },
        session,
        trial,
        userId,
      } = state.exe;
      const st = scenario && scenario.startDate ? new Date(scenario.startDate) : new Date();
      startTime = startTime || `${padLeft(st.getHours())}:${padLeft(st.getMinutes())}` || '09:00';
      startDate = startDate || st;
      const canStart = activeSession && isSessionInfoValid(session);

      const loggedInUser = getUserById(trial, userId);
      const disabled = !loggedInUser || !hasUserRole(loggedInUser, UserRole.EXCON);

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
                      initialValue: startTime,
                      twelveHour: false,
                      disabled,
                      onSelect,
                    })
                  ),
                  m(
                    '.col.s6',
                    m(DatePicker, {
                      label: 'Start date:',
                      initialValue: startDate,
                      container: document.getElementById('main') as Element,
                      disabled,
                      onchange: (d: Date) => (startDate = d),
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
                  disabled: disabled || !canStart,
                  onclick: () => {
                    const simulationTime = realtime ? Date.now() : newTime();
                    sendCmd(socket, {
                      simulationTime,
                      simulationSpeed: 1,
                      command: TimeCommand.Init,
                    });
                    if (scenario && scenario.startDate && scenario.endDate) {
                      const scenarioDuration =
                        new Date(scenario.endDate).valueOf() - new Date(scenario.startDate).valueOf();
                      scenario.startDate = new Date(simulationTime).toUTCString();
                      scenario.endDate = new Date(simulationTime + scenarioDuration).toUTCString();
                      updateInject(scenario);
                    }
                    sendCmd(socket, { command: TimeCommand.Start });
                  },
                })
              )
            ),
          ];
        case TimeState.Initialization:
          return m('.row', [
            m(MediaControls, { socket, isPaused: true, canChangeSpeed: false, time, realtime }),
            m(FlatButton, {
              label: 'Reset session',
              disabled,
              onclick: async () => {
                // sendCmd(socket, { command: TimeCommand.Reset });
                await stopSession();
              },
            }),
          ]);
        case TimeState.Paused:
          return m('.row', [
            m(MediaControls, { socket, isPaused: true, canChangeSpeed: false, time, realtime }),
            m('.col.s12.left', [
              m(TimePicker, {
                label: 'Updated time:',
                container: '#main',
                initialValue: startTime,
                twelveHour: false,
                disabled,
                onSelect,
              }),
              m(DatePicker, {
                label: 'Updated date:',
                container: document.getElementById('main') as Element,
                initialValue: startDate,
                disabled,
                onchange: (d: Date) => (startDate = d),
              }),
              m(FlatButton, {
                label: 'Update time',
                iconName: 'update',
                disabled: disabled || timeHasNotChanged(st),
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
            m(MediaControls, { socket, isPaused: false, canChangeSpeed: !disabled, time, realtime }),
            m('em', `Speed: ${time.simulationSpeed}x`),
            time.simulationSpeed !== 1
              ? m(FlatButton, { iconName: 'restore', disabled, onclick: () => updateSpeed(socket, 1) })
              : undefined,
          ]);
        case TimeState.Stopped:
          return m(
            '.row',
            m(FlatButton, {
              label: 'Reset session',
              disabled,
              onclick: async () => {
                // sendCmd(socket, { command: TimeCommand.Reset });
                await stopSession();
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

export const TimeControl: MeiosisComponent<{ style?: string }> = () => {
  return {
    view: ({ attrs: { state, actions, options: { style } = {} } }) => {
      let isConnected = state.exe.sessionControl.isConnected;
      return [
        m('.button-group', { style }, isConnected ? m(MediaStateControl, { state, actions }) : undefined),
        m(ModalPanel, {
          id: 'stopPanel',
          title: 'Are you certain you want to stop?',
          description: 'After stopping the time service, you will not be able to continue anymore.',
          buttons: [
            { label: 'No, bring me back to safety' },
            {
              label: 'Yes, I am sure!',
              onclick: () => sendCmd(SocketSvc.socket, { command: TimeCommand.Stop }),
            },
          ],
        }),
      ];
    },
  };
};
