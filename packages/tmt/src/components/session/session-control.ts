import m, { FactoryComponent } from 'mithril';
import { TimeControl } from './time-control';
import { SocketSvc, TrialSvc, RunSvc, ISubscriptionDefinition } from '../../services';
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
  IConnectMessage,
  ISessionManagement,
  SessionState,
  uniqueId,
  TimeState,
  ITimeManagement,
  IInject,
} from '../../../../models';
import { getInjectIcon } from '../../utils';

const isComplete = ({ id: sessionId, name: sessionName }: Partial<ISessionManagement>) =>
  sessionId && sessionId.length && sessionName && sessionName.length > 1 ? true : false;

const setActiveSession = (isActive: boolean) => {
  if (AppState.sessionControl) {
    AppState.sessionControl.activeSession = isActive;
  }
};

/** Helper component to specify the session id, name, comments */
const SessionSettings: FactoryComponent = () => {
  const state = {} as {
    trial: ITrial;
    scenario?: IScenario;
    scenarios: IScenario[];
  };

  const sessionManager = (cmd: 'start' | 'stop', trial?: ITrial, scenario?: IScenario) => {
    const createSessionMsg = () => {
      const {
        session: { name = 'New session' },
      } = AppState;
      console.log(trial);
      if (trial && scenario) {
        const session = {
          id: uniqueId(),
          state: SessionState.Started,
          name,
          tags: {
            trialId: trial.id,
            trialName: trial.title,
            scenarioId: scenario.id,
            scenarioName: scenario.title,
          },
        } as ISessionManagement;
        AppState.session = session;
        return session;
      }
      return undefined;
    };
    switch (cmd) {
      case 'start': {
        const s = createSessionMsg();
        console.log(s);
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

  const setScenario = (session?: Partial<ISessionManagement>) => {
    const { trial } = state;
    const scenarios = (state.scenarios = trial ? trial.injects.filter(i => i.type === InjectType.SCENARIO) : []);
    if (session && scenarios && scenarios.length >= 1) {
      state.scenario = session.tags?.scenarioId
        ? scenarios.filter(s => s.id === session.tags?.scenarioId).shift()
        : scenarios[0];
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

      if (session && !session.name) {
        session.id = uniqueId();
        session.name = 'New session';
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
                  initialValue: session.name || '',
                  label: 'Session name',
                  iconName: 'title',
                  disabled,
                  isMandatory: true,
                  onchange: (v: string) => (AppState.session.name = v),
                })
              ),
              m(
                '.col.s12',
                m(TextArea, {
                  initialValue: session.tags ? session.tags.comment : undefined,
                  label: 'Comments',
                  disabled,
                  onchange: (v: string) => {
                    if (AppState.session.tags) {
                      AppState.session.tags.comment = v;
                    } else {
                      AppState.session.tags = { comment: v };
                    }
                  },
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
                      AppState.time.state !== TimeState.Reset &&
                      AppState.time.state !== TimeState.Initialization),
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
    time: {} as ITimeManagement,
    disconnectModal: undefined as undefined | M.Modal,
    subscribed: injectsChannel.subscribe(TopicNames.ITEM_SELECT, ({ cur }) => (state.scenario = cur as IScenario)),
  } as {
    scenario?: IScenario;
    trial?: ITrial;
    isConnected: boolean;
    isConnecting: boolean;
    time: ITimeManagement;
    disconnectModal?: M.Modal;
    subscribed: ISubscriptionDefinition<{ cur: IInject; old: IInject }>;
  };

  const updateTime = (tm: ITimeManagement) => {
    const {
      time: { state: timeState, simulationSpeed },
    } = state;
    // console.log('Time msg received: ' + JSON.stringify(tm));
    if (timeState !== tm.state || simulationSpeed !== tm.simulationSpeed) {
      state.time = tm;
      m.redraw();
    }
  };

  const isTestbedConnected = (data: IConnectMessage) => {
    const { session = {} as Partial<ISessionManagement>, isConnected, time, host } = data;
    state.isConnecting = false;
    state.isConnected = isConnected;
    AppState.time = state.time = time;
    console.log(AppState.time);
    AppState.session = session;
    setActiveSession(data.session && data.session.state === SessionState.Started ? true : false);
    AppState.sessionControl.isConnected = isConnected;
    AppState.sessionControl.host = host;
    AppState.sessionControl.realtime = time?.simulationTime
      ? Math.abs(time?.simulationTime - Date.now()) < 10000
      : true;
    if (
      session.tags?.trialId &&
      session.state === SessionState.Started &&
      TrialSvc.getCurrent().id !== session.tags?.trialId
    ) {
      M.toast({
        html: `There is currently another trial running: ${session.tags?.trialName}`,
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
      state.subscribed.unsubscribe();
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
        ? time.state === TimeState.Reset
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
        [
          m(
            'div',
            { key },
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
                          scenario,
                          isConnected,
                          time,
                          canStart,
                          realtime,
                          // key,
                        }),
                      ])
                    )
                  )
                : // : undefined
                  m(TimeControl, {
                    // style: 'margin-left: 3em',
                    scenario,
                    isConnected,
                    time,
                    canStart,
                    realtime,
                    // key,
                  })
              : undefined
          ),
        ],
        // : undefined,
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
