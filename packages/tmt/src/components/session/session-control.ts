import m, { FactoryComponent } from 'mithril';
import { TimeControl } from './time-control';
import { SocketSvc, TrialSvc, RunSvc } from '../../services';
import { AppState, injectsChannel, TopicNames } from '../../models';
import {
  FlatButton,
  Select,
  ISelectOptions,
  TextInput,
  TextArea,
  InputCheckbox,
  Icon,
  ModalPanel,
} from 'mithril-materialized';
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
    const createSessionMsg = () => {
      const {
        session: { comment, sessionName = 'New session created' },
      } = AppState;
      if (trial && scenario) {
        const session = {
          trialId: trial.id,
          trialName: trial.title,
          scenarioId: scenario.id,
          scenarioName: scenario.title,
          sessionId: uniqueId(),
          sessionName,
          sessionState: SessionState.START,
          comment,
        } as ISessionMgmt;
        AppState.session = session;
        return session;
      }
      return undefined;
    };
    switch (cmd) {
      case 'start': {
        const s = createSessionMsg();
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

      // console.log(activeSession);
      // console.table(AppState.time);
      // console.log(sessionControl);

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
                '.col.s12',
                m(TextInput, {
                  initialValue: session.sessionName,
                  label: 'Session name',
                  iconName: 'title',
                  disabled,
                  isMandatory: true,
                  onchange: (v: string) => (AppState.session.sessionName = v),
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
              m('.col.s12.input-field', [
                m(FlatButton, {
                  className: 'col s6',
                  iconName: 'wifi_tethering',
                  label: 'Start session',
                  disabled,
                  onclick: () => sessionManager('start', trial, scenario),
                }),
                m(FlatButton, {
                  className: 'col s6',
                  iconName: 'portable_wifi_off',
                  label: 'Stop session',
                  disabled:
                    !disabled ||
                    (AppState.time &&
                      (AppState.time.state !== TimeState.Idle && AppState.time.state !== TimeState.Initialized)),
                  onclick: () => sessionManager('stop', trial, scenario),
                }),
              ]),
            ]),
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
    if (
      session.trialId &&
      session.sessionState === SessionState.START &&
      TrialSvc.getCurrent().id !== session.trialId
    ) {
      M.toast({
        html: `There is currently another trial running: ${session.trialName}`,
        classes: 'orange',
      });
    }
    m.redraw();
  };

  return {
    oninit: async () => {
      // state.scenarios = state.trial.injects.filter(i => i.type === InjectType.SCENARIO);
      socket.on('time', updateTime);
      socket.on('is-connected', isTestbedConnected);
      // Check whether we are connected
      socket.emit('is-connected');
      /** Load the active trial */
      // state.trial = await RunSvc.activeTrial();
      // m.redraw();
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
                    m(InputCheckbox, {
                      label: 'Connected',
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
                        m(InputCheckbox, {
                          label: 'Real time',
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
            ? // ? canStart
              m(
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
            : // : undefined
              m(TimeControl, {
                // style: 'margin-left: 3em',
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
