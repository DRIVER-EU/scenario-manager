import m, { FactoryComponent } from 'mithril';
import { TimeControl } from './time-control';
import { SocketSvc, TrialSvc } from '../../services';
import { FlatButton, Select, ISelectOptions } from 'mithril-materialized';
import { ITrial, IScenario, InjectLevel, ITimeMessage } from 'trial-manager-models';

export const SessionControl: FactoryComponent = () => {
  const socket = SocketSvc.socket;
  const state = {
    trial: undefined as ITrial | undefined,
    scenarios: [] as IScenario[],
    scenario: undefined as IScenario | undefined,
    isConnected: false,
    isConnecting: false,
    time: {} as ITimeMessage,
  };

  return {
    oninit: () => {
      state.trial = TrialSvc.getCurrent();
      state.scenarios = state.trial.injects.filter(i => i.level === InjectLevel.SCENARIO);

      socket.on('stateUpdated', () => m.redraw());
      socket.on('is-connected', (data: boolean) => {
        state.isConnected = data;
        state.isConnecting = false;
        m.redraw();
      });
      socket.emit('is-connected');
      socket.on('time', (time: ITimeMessage) => {
        state.time = time;
        m.redraw();
      });
    },
    view: () => {
      const { isConnected, isConnecting } = state;
      const scenarios = state.scenarios.map(s => ({ id: s.id, label: s.title }));
      state.scenario = state.scenarios[0];
      return [
        m(
          '.row',
          m('.col.s12.m6', [
            isConnecting
              ? m('.progress', m('.indeterminate'))
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
              onchange: id => (state.scenario = state.scenarios.filter(s => s.id === id).shift()),
            } as ISelectOptions<string>)
          )
        ),
        m('.row', m('.col.s12.m6', m(TimeControl, { scenario: state.scenario, isConnected, time: state.time }))),
      ];
    },
  };
};
