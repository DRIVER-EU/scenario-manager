import m, { FactoryComponent } from 'mithril';
import { TimeControl } from './time-control';
import { SocketSvc, TrialSvc, AppState } from '../../services';
import { FlatButton, Select, ISelectOptions, NumberInput, TextInput, TextArea } from 'mithril-materialized';
import {
  ITrial,
  IScenario,
  InjectType,
  ITimeMessage,
  IStateUpdate,
  IConnectMessage,
  ISessionMessage,
} from 'trial-manager-models';
import { getInjectIcon } from '../../utils';

const isComplete = ({ id: sessionId, name: sessionName }: ISessionMessage) =>
  sessionId >= 0 && sessionName && sessionName.length > 1 ? true : false;

/** Helper component to specify the session id, name, comments */
const SessionSettings: FactoryComponent<{ session: ISessionMessage }> = () => {
  return {
    view: ({ attrs: { session } }) => {
      return [
        m('.row', [
          m(
            '.col.s3',
            m(NumberInput, {
              initialValue: session.id,
              label: 'ID',
              isMandatory: true,
              min: 0,
              onchange: (v: number) => (session.id = v),
              iconName: 'title',
            })
          ),
          m(
            '.col.s9',
            m(TextInput, {
              // initialValue: session.name,
              label: 'Session name',
              isMandatory: true,
              onchange: (v: string) => (session.name = v),
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
              onchange: (v: string) => (session.comment = v),
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
        m.redraw();
      });
      socket.emit('is-connected');
      // TODO display the inject states
      socket.on('injectStates', (data: IStateUpdate[]) => console.log(data));
    },
    view: () => {
      const { isConnected, isConnecting } = state;
      const scenarios = state.scenarios.map(s => ({ id: s.id, label: s.title }));
      const canStart = isComplete(AppState.session);
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
        m(SessionSettings, { session: AppState.session }),
        m(
          '.row',
          m('.col.s12.m6', m(TimeControl, { scenario: state.scenario, isConnected, time: AppState.time, canStart }))
        ),
      ];
    },
  };
};
