import m, { FactoryComponent } from 'mithril';
import { TimeControl } from './time-control';
import { SocketSvc, TrialSvc, RunSvc } from '../../services';
import { AppState, injectsChannel, TopicNames } from '../../models';
import { Select, ISelectOptions, TextInput, TextArea, Switch, Icon, ModalPanel } from 'mithril-materialized';
import {
  ITrial,
  IScenario,
  InjectType,
  ITimeMessage,
  IConnectMessage,
  ISessionMgmt,
  SessionState,
  uniqueId,
  TimeState,
} from 'trial-manager-models';
import { getInjectIcon } from '../../utils';

const isComplete = ({ sessionId, sessionName }: Partial<ISessionMgmt>) =>
  sessionId && sessionId.length && sessionName && sessionName.length > 1 ? true : false;

const setActiveSession = (isActive: boolean) => {
  if (AppState.sessionControl) {
    AppState.sessionControl.activeSession = isActive;
  }
};

/** Helper component to specify the session id, name, comments */
const SessionSettings: FactoryComponent<{}> = () => {
  const state = {} as {
    trial: ITrial;
    scenario?: IScenario;
    scenarios: IScenario[];
  };

  const sessionManager = (cmd: 'start' | 'stop', trial?: ITrial, scenario?: IScenario) => {
    const createSessionMsg = (sessionState: SessionState) => {
      const {
        session: { sessionName = 'New session created', comment },
      } = AppState;
      if (trial && scenario) {
        const session = {
          trialId: trial.id,
          trialName: trial.title,
          scenarioId: scenario.id,
          scenarioName: scenario.title,
          sessionId: uniqueId(),
          sessionName,
          sessionState,
          comment,
        } as ISessionMgmt;
        AppState.session = session;
        return session;
      }
      return undefined;
    };
    switch (cmd) {
      case 'start': {
        const s = createSessionMsg(SessionState.START);
        if (s) {
          RunSvc.load(s)
            .then(() => setActiveSession(true))
            .catch(e => console.warn(e));
        }
        break;
      }
      case 'stop': {
        RunSvc.unload()
          .then(() => setActiveSession(false))
          .catch(e => console.warn(e));
      }
    }
  };

  const setScenario = (session?: Partial<ISessionMgmt>) => {
    const { trial } = state;
    const scenarios = (state.scenarios = trial ? trial.injects.filter(i => i.type === InjectType.SCENARIO) : []);
    if (session && scenarios && scenarios.length >= 1) {
      state.scenario = session.scenarioId ? scenarios.filter(s => s.id === session.scenarioId).shift() : scenarios[0];
    }
  };

  return {
    oninit: () => {
      state.trial = TrialSvc.getCurrent();
      setScenario(AppState.session);
    },
    oncreate: () => {
      if (state.scenario) {
        injectsChannel.publish(TopicNames.ITEM_SELECT, { cur: state.scenario });
      }
    },
    view: () => {
      const { trial, scenario } = state;
      const { session, sessionControl } = AppState;
      const { activeSession } = sessionControl;
      const isConnected = sessionControl && sessionControl.isConnected;
      const disabled = activeSession;
      const options = state.scenarios.map(s => ({ id: s.id, label: s.title }));

      if (session && !session.sessionName) {
        session.sessionId = uniqueId();
        session.sessionName = 'New session';
      }
      return [
        m('.row', [
          m(
            '.col.s12',
            m(Select, {
              label: 'Run scenario',
              checkedId: scenario ? scenario.id : undefined,
              options,
              disabled,
              iconName: getInjectIcon(InjectType.SCENARIO),
              onchange: ids => {
                const id = ids instanceof Array ? ids[0] : ids;
                state.scenario = state.scenarios.filter(s => s.id === id).shift();
                if (state.scenario) {
                  injectsChannel.publish(TopicNames.ITEM_SELECT, { cur: state.scenario });
                  console.log('Scenario (new): ' + state.scenario.title);
                }
              },
            } as ISelectOptions)
          ),
        ]),
        !isConnected
          ? undefined
          : m('.row', [
              m(
                '.col.s7',
                m(TextInput, {
                  initialValue: session.sessionName,
                  label: 'Session name',
                  disabled,
                  isMandatory: true,
                  onchange: (v: string) => (AppState.session.sessionName = v),
                  iconName: 'title',
                })
              ),
              m(
                '.col.s5',
                m(Switch, {
                  disabled: AppState.time && AppState.time.state !== TimeState.Idle,
                  label: 'Session',
                  left: activeSession ? 'Stop' : 'Stopped',
                  right: activeSession ? 'Started' : 'Start',
                  checked: activeSession,
                  onchange: v => sessionManager(v ? 'start' : 'stop', trial, scenario),
                })
              ),
              m(
                '.col.s12',
                m(TextArea, {
                  initialValue: session.comment || undefined,
                  label: 'Comments',
                  disabled,
                  onchange: (v: string) => (AppState.session.comment = v),
                  iconName: 'note',
                })
              ),
            ]),
        // m(
        //   '.row',
        //   m(
        //     '.col.s12',
        //     m(TextArea, {
        //       initialValue: session.comment || undefined,
        //       label: 'Comments',
        //       disabled,
        //       onchange: (v: string) => (AppState.session.comment = v),
        //       iconName: 'note',
        //     })
        //   )
        // ),
      ];
    },
  };
};

export const SessionControl: FactoryComponent = () => {
  const socket = SocketSvc.socket;
  const state = {
    trial: undefined as ITrial | undefined,
    // scenarios: [] as IScenario[],
    scenario: undefined as IScenario | undefined,
    isConnected: false,
    isConnecting: false,
    time: {} as ITimeMessage,
    disconnectModal: undefined as undefined | M.Modal,
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

  const isTestbedConnected = (data: IConnectMessage) => {
    const { session = {} as Partial<ISessionMgmt>, isConnected, time, host } = data;
    state.isConnecting = false;
    state.isConnected = isConnected;
    AppState.time = state.time = time;
    AppState.session = session;
    setActiveSession(data.session && data.session.sessionState === SessionState.START ? true : false);
    AppState.sessionControl.isConnected = isConnected;
    AppState.sessionControl.host = host;
    AppState.sessionControl.realtime = Math.abs(data.time.trialTime - Date.now()) < 10000;
    if (session.trialId && TrialSvc.getCurrent().id !== session.trialId) {
      M.toast({
        html: `The Test-bed is currently running another trial: ${session.trialName}`,
        classes: 'orange',
      });
    }
    m.redraw();
  };

  return {
    oninit: () => {
      state.trial = TrialSvc.getCurrent();
      // state.scenarios = state.trial.injects.filter(i => i.type === InjectType.SCENARIO);
      socket.on('time', updateTime);
      socket.on('is-connected', isTestbedConnected);
      // Check whether we are connected
      socket.emit('is-connected');
    },
    onremove: () => {
      socket.off('time', updateTime);
      socket.off('is-connected', isTestbedConnected);
    },
    view: () => {
      const { isConnected, isConnecting, scenario, time } = state;
      const {
        sessionControl: { realtime, activeSession },
      } = AppState;
      const key = scenario ? scenario.id : undefined;
      const canStart = activeSession && isComplete(AppState.session);
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
          m('.col.s12', [
            isConnecting
              ? m('.row', m('.col.s12', [m('span', 'Connecting...'), m('.progress', m('.indeterminate'))]))
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
                          if (state.disconnectModal) {
                            state.disconnectModal.open();
                          }
                        } else {
                          state.isConnecting = true;
                          socket.emit('test-bed-connect');
                        }
                      },
                    })
                  ),
                  isConnected
                    ? m(
                        '.col.s6',
                        m(Switch, {
                          left: '',
                          right: 'Real time',
                          checked: realtime,
                          onchange: s => (AppState.sessionControl.realtime = s),
                        })
                      )
                    : undefined
                ),
          ])
        ),
        m(SessionSettings),
        activeSession
          ? realtime
            ? canStart
              ? m(
                  '.row',
                  m(
                    '.col.s12.m6',
                    m('.input-field.col.s12', [
                      isConnected ? m(Icon, { iconName, className: 'prefix' }) : undefined,
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
              })
          : undefined,
        m(ModalPanel, {
          onCreate: modal => {
            state.disconnectModal = modal;
          },
          id: 'disconnect',
          title: 'Are you certain you want to disconnect?',
          description: 'After disconnecting, you will not receive updates anymore.',
          buttons: [
            { label: 'No, bring me back to safety' },
            {
              label: 'Yes, I am sure!',
              onclick: () => socket.emit('test-bed-disconnect'),
            },
          ],
        }),
      ];
    },
  };
};
