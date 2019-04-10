import m, { FactoryComponent } from 'mithril';
import { TimeControl } from './time-control';
import { SocketSvc, TrialSvc, RunSvc } from '../../services';
import { AppState, timeControlChannel, TopicNames } from '../../models';
import { FlatButton, Select, ISelectOptions, TextInput, TextArea } from 'mithril-materialized';
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
  TimeState,
} from 'trial-manager-models';
import { getInjectIcon } from '../../utils';

const isComplete = ({ sessionId, sessionName }: Partial<ISessionMgmt>) =>
  sessionId && sessionId.length && sessionName && sessionName.length > 1 ? true : false;

/** Helper component to specify the session id, name, comments */
const SessionSettings: FactoryComponent = () => {
  return {
    view: () => {
      const session = AppState.session;
      if (session && !session.sessionName) {
        session.sessionId = '1';
        session.sessionName = 'New session';
      }
      return [
        m('.row', [
          m(
            '.col.s3',
            m(TextInput, {
              initialValue: session.sessionId,
              label: 'ID',
              isMandatory: true,
              min: 0,
              onchange: (v: string) => (AppState.session.sessionId = v),
              iconName: 'title',
            })
          ),
          m(
            '.col.s9',
            m(TextInput, {
              initialValue: session.sessionName,
              label: 'Session name',
              isMandatory: true,
              onchange: (v: string) => (AppState.session.sessionName = v),
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
    const { time: { state: timeState, trialTimeSpeed } } = state;
    console.log('Time msg received: ' + JSON.stringify(tm));
    if (timeState !== tm.state || trialTimeSpeed !== tm.trialTimeSpeed) {
      state.time = tm;
      m.redraw();
    }
  };

  const isTestbedConnected = (data: IConnectMessage) => {
    state.isConnecting = false;
    state.isConnected = data.isConnected;
    AppState.time = state.time = data.time;
    if (state.isConnected) {
      RunSvc.active()
        .then(session => (AppState.session = session))
        .catch(e => console.warn('Getting active session: ' + e));
    }
    m.redraw();
  };

  const handleTimeControlMessages = (cmd: ITimingControlMessage) => {
    const createSessionMsg = (sessionState: SessionState) => {
      const { trial, scenario } = state;
      if (trial && scenario) {
        const session = {
          trialId: trial.id,
          trialName: trial.title,
          scenarioId: scenario.id,
          scenarioName: scenario.title,
          sessionId: AppState.session.sessionId,
          sessionName: AppState.session.sessionName,
          sessionState,
          comment: AppState.session.comment,
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
      const { isConnected, isConnecting, time } = state;
      const scenarios = state.scenarios.map(s => ({ id: s.id, label: s.title }));
      const canStart = isComplete(AppState.session);
      state.scenario = state.scenario || state.scenarios[0];
      return [
        m(
          '.row',
          m('.col.s12.m6', [
            isConnecting
              ? m('.row', [m('span', 'Connecting...'), m('.progress', m('.indeterminate'))])
              : m(FlatButton, {
                  iconName: isConnected ? 'radio_button_checked' : 'radio_button_unchecked',
                  label: state.isConnected ? 'Connected' : 'Connect',
                  disabled: isConnected,
                  onclick: () => {
                    state.isConnecting = true;
                    socket.emit('test-bed-connect');
                  },
                }),
          ])
        ),
        m(
          '.row',
          m(
            '.col.s12.m6',
            m(Select, {
              label: 'Run scenario',
              options: scenarios,
              iconName: getInjectIcon(InjectType.SCENARIO),
              onchange: (id: string) => {
                state.scenario = state.scenarios.filter(s => s.id === id).shift();
                if (state.scenario) { console.log('Scenario (new): ' + state.scenario.title); }
              },
            } as ISelectOptions<string>)
          )
        ),
        m(SessionSettings),
        m(
          '.row',
          m('.col.s12.m6', m(TimeControl, { scenario: state.scenario, isConnected, time, canStart }))
        ),
      ];
    },
  };
};
