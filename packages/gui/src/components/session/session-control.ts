import m, { FactoryComponent } from 'mithril';
import { TimeControl } from './time-control';
import { SocketSvc, TrialSvc, RunSvc } from '../../services';
import { AppState, timeControlChannel, TopicNames } from '../../models';
import { Select, ISelectOptions, TextInput, TextArea, Switch, Icon } from 'mithril-materialized';
import {
  ITrial,
  IScenario,
  InjectType,
  ITimeMessage,
  IConnectMessage,
  ISessionMgmt,
  TimingControlCommand,
  SessionState,
  ITimingControlMessage,
  uniqueId,
  TimeState,
} from 'trial-manager-models';
import { getInjectIcon } from '../../utils';

const isComplete = ({ sessionId, sessionName }: Partial<ISessionMgmt>) =>
  sessionId && sessionId.length && sessionName && sessionName.length > 1 ? true : false;

/** Helper component to specify the session id, name, comments */
const SessionSettings: FactoryComponent<{ disabled: boolean }> = () => {
  return {
    view: ({ attrs: { disabled } }) => {
      const { session } = AppState;
      if (session && !session.sessionName) {
        session.sessionId = uniqueId();
        session.sessionName = 'New session';
      }
      return [
        m('.row', [
          m(
            '.col.s12',
            m(TextInput, {
              initialValue: session.sessionName,
              label: 'Session name',
              disabled,
              isMandatory: true,
              onchange: (v: string) => (AppState.session.sessionName = v),
              iconName: 'title',
            })
          ),
        ]),
        m(
          '.row',
          m(
            '.col.s12',
            m(TextArea, {
              initialValue: session.comment || undefined,
              label: 'Comments',
              disabled,
              onchange: (v: string) => (AppState.session.comment = v),
              iconName: 'note',
            })
          )
        ),
      ];
    },
  };
};

export const SessionControl: FactoryComponent = () => {
  const socket = SocketSvc.socket;
  const state = {
    trial: undefined as ITrial | undefined,
    scenarios: [] as IScenario[],
    scenario: undefined as IScenario | undefined,
    isConnected: false,
    isConnecting: false,
    time: {} as ITimeMessage,
    subscription: timeControlChannel.subscribe(TopicNames.CMD, ({ cmd }) => handleTimeControlMessages(cmd)),
  };

  const updateTime = (tm: ITimeMessage) => {
    const {
      time: { state: timeState, trialTimeSpeed },
    } = state;
    // console.log('Time msg received: ' + JSON.stringify(tm));
    if (timeState !== tm.state || trialTimeSpeed !== tm.trialTimeSpeed) {
      state.time = tm;
      m.redraw();
    }
  };

  const setScenario = (session?: Partial<ISessionMgmt>) => {
    const { scenarios } = state;
    if (session && scenarios && scenarios.length >= 1) {
      state.scenario = session.scenarioId ? scenarios.filter(s => s.id === session.scenarioId).shift() : scenarios[0];
    }
  };

  const isTestbedConnected = (data: IConnectMessage) => {
    state.isConnecting = false;
    state.isConnected = data.isConnected;
    AppState.time = state.time = data.time;
    AppState.session = data.session || {};
    AppState.sessionControl.isConnected = data.isConnected;
    AppState.sessionControl.host = data.host;
    AppState.sessionControl.realtime = Math.abs(data.time.trialTime - Date.now()) < 10000;
    if (state.isConnected) {
      setTimeout(
        () =>
          RunSvc.active()
            .then(session => {
              AppState.session = session;
              setScenario(session);
              if (TrialSvc.getCurrent().id !== session.trialId) {
                M.toast({
                  html: `The Test-bed is currently running another trial: ${session.trialName}`,
                  classes: 'orange',
                });
              }
              m.redraw();
            })
            .catch(e => console.warn('Getting active session: ' + e)),
        500
      );
    }
    m.redraw();
  };

  const handleTimeControlMessages = (cmd: ITimingControlMessage) => {
    const createSessionMsg = (sessionState: SessionState) => {
      const { trial, scenario } = state;
      const {
        session: { sessionId, sessionName, comment },
      } = AppState;
      if (trial && scenario) {
        const session = {
          trialId: trial.id,
          trialName: trial.title,
          scenarioId: scenario.id,
          scenarioName: scenario.title,
          sessionId,
          sessionName,
          sessionState,
          comment,
        } as ISessionMgmt;
        return session;
      }
      return undefined;
    };
    switch (cmd.command) {
      case TimingControlCommand.Init: {
        const s = createSessionMsg(SessionState.START);
        if (s) {
          RunSvc.load(s).catch(e => console.warn(e));
        }
        break;
      }
      case TimingControlCommand.Stop: {
        RunSvc.unload().catch(e => console.warn(e));
      }
    }
  };

  return {
    oninit: () => {
      state.trial = TrialSvc.getCurrent();
      state.scenarios = state.trial.injects.filter(i => i.type === InjectType.SCENARIO);
      setScenario(AppState.session);
      socket.on('time', updateTime);
      socket.on('is-connected', isTestbedConnected);
      // Check whether we are connected
      socket.emit('is-connected');
      // TODO display the inject states
      // socket.on('injectStates', (data: IStateUpdate[]) => console.log(data));
    },
    onremove: () => {
      state.subscription.unsubscribe();
      socket.off('time', updateTime);
      socket.off('is-connected', isTestbedConnected);
    },
    view: () => {
      const { isConnected, isConnecting, scenario, time } = state;
      const {
        sessionControl: { realtime },
      } = AppState;
      const key = scenario ? scenario.id : undefined;
      const scenarioOptions = state.scenarios.map(s => ({ id: s.id, label: s.title }));
      const canStart = isComplete(AppState.session);
      const disabled = time && time.state !== TimeState.Idle;
      const iconName = time
        ? time.state === TimeState.Idle
          ? 'timer'
          : time.state === TimeState.Stopped
          ? 'timer_off'
          : 'access_time'
        : 'access_time';
      return [
        m(
          '.row',
          m('.col.s12.m6', [
            isConnecting
              ? m('.row', [m('span', 'Connecting...'), m('.progress', m('.indeterminate'))])
              : m(
                  '.row',
                  { style: 'margin: 10px 0 20px 0;' },
                  m(
                    '.col.s6',
                    m(Switch, {
                      left: '',
                      right: isConnected ? 'Connected' : 'Connect',
                      checked: isConnected,
                      onchange: () => {
                        if (isConnected) {
                          socket.emit('test-bed-disconnect');
                        } else {
                          state.isConnecting = true;
                          socket.emit('test-bed-connect');
                        }
                      },
                    })
                  ),
                  m(
                    '.col.s6',
                    m(Switch, {
                      left: '',
                      right: 'Real time',
                      checked: realtime,
                      onchange: s => (AppState.sessionControl.realtime = s),
                    })
                  )
                ),
          ])
        ),
        m(
          '.row',
          m(
            '.col.s12.m6',
            m(Select, {
              label: 'Run scenario',
              checkedId: scenario ? scenario.id : undefined,
              options: scenarioOptions,
              disabled,
              iconName: getInjectIcon(InjectType.SCENARIO),
              onchange: (id: string) => {
                state.scenario = state.scenarios.filter(s => s.id === id).shift();
                if (state.scenario) {
                  console.log('Scenario (new): ' + state.scenario.title);
                }
              },
            } as ISelectOptions<string>)
          )
        ),
        m(SessionSettings, { disabled }),
        realtime
          ? canStart
            ? m(
                '.row',
                m(
                  '.col.s12.m6',
                  m('.input-field.col.s12', [
                    m(Icon, { iconName, className: 'prefix' }),
                    m(TimeControl, {
                      style: 'margin-left: 3em',
                      scenario: state.scenario,
                      isConnected,
                      time,
                      canStart,
                      realtime,
                      key,
                    }),
                  ])
                )
              )
            : undefined
          : m(TimeControl, {
              scenario: state.scenario,
              isConnected,
              time,
              canStart,
              realtime,
              key,
            }),
      ];
    },
  };
};
