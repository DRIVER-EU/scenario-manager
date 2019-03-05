import m, { FactoryComponent } from 'mithril';
import { TimeControl } from './time-control';
import { SocketSvc, TrialSvc, RunSvc } from '../../services';
import { AppState, timeControlChannel, TopicNames } from '../../models';
import { FlatButton, Select, ISelectOptions, NumberInput, TextInput, TextArea } from 'mithril-materialized';
import {
  ITrial,
  IScenario,
  InjectType,
  ITimeMessage,
  IConnectMessage,
  ISessionMessage,
  ITestbedSessionMessage,
  TimingControlCommand,
  SessionState,
  ITimingControlMessage,
} from 'trial-manager-models';
import { getInjectIcon } from '../../utils';

const isComplete = ({ id: sessionId, name: sessionName }: ISessionMessage) =>
  sessionId >= 0 && sessionName && sessionName.length > 1 ? true : false;

/** Helper component to specify the session id, name, comments */
const SessionSettings: FactoryComponent = () => {
  return {
    view: () => {
      const session = AppState.session;
      if (session && !session.name) {
        session.id = 1;
        session.name = 'New session';
      }
      return [
        m('.row', [
          m(
            '.col.s3',
            m(NumberInput, {
              initialValue: session.id,
              label: 'ID',
              isMandatory: true,
              min: 0,
              onchange: (v: number) => (AppState.session.id = v),
              iconName: 'title',
            })
          ),
          m(
            '.col.s9',
            m(TextInput, {
              initialValue: session.name,
              label: 'Session name',
              isMandatory: true,
              onchange: (v: string) => (AppState.session.name = v),
            })
          ),
        ]),
        m(
          '.row',
          m(
            '.col.s12',
            m(TextArea, {
              initialValue: session.comment,
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
    subscription: timeControlChannel.subscribe(TopicNames.CMD, ({ cmd }) => handleTimeControlMessages(cmd)),
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
          sessionId: AppState.session.id.toString(),
          sessionName: AppState.session.name,
          sessionState,
          comment: AppState.session.comment,
        } as ITestbedSessionMessage;
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

      socket.on('time', (tm: ITimeMessage) => {
        if (AppState.time.state !== tm.state || AppState.time.trialTimeSpeed !== tm.trialTimeSpeed) {
          m.redraw();
        }
      });
      socket.on('is-connected', (data: IConnectMessage) => {
        state.isConnecting = false;
        state.isConnected = data.isConnected;
        AppState.time = data.time;
        if (state.isConnected) {
          RunSvc.active()
            .then(session => (AppState.session = session))
            .catch(e => console.log(e));
        }
        m.redraw();
      });
      // Check whether we are connected
      socket.emit('is-connected');
      // TODO display the inject states
      // socket.on('injectStates', (data: IStateUpdate[]) => console.log(data));
    },
    onremove: () => {
      state.subscription.unsubscribe();
      socket.off('time');
      socket.off('is-connected');
    },
    view: () => {
      const { isConnected, isConnecting } = state;
      const scenarios = state.scenarios.map(s => ({ id: s.id, label: s.title }));
      const canStart = isComplete(AppState.session);
      const session = { ...AppState.session };
      state.scenario = state.scenarios[0];
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
              options: scenarios,
              iconName: getInjectIcon(InjectType.SCENARIO),
              onchange: (id: string) => (state.scenario = state.scenarios.filter(s => s.id === id).shift()),
            } as ISelectOptions<string>)
          )
        ),
        m(SessionSettings),
        m(
          '.row',
          m('.col.s12.m6', m(TimeControl, { scenario: state.scenario, isConnected, time: AppState.time, canStart }))
        ),
      ];
    },
  };
};
