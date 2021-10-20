import m from 'mithril';
import { SessionControl } from './session-control';
import { InjectsForm } from '../injects/injects-form';
import { MeiosisComponent } from '../../services';
import { getActiveTrialInfo } from '../../utils';

export const SessionView: MeiosisComponent = () => {
  return {
    oninit: ({
      attrs: {
        state,
        actions: { selectInject },
      },
    }) => {
      const { scenario } = getActiveTrialInfo(state);
      scenario && selectInject(scenario);
      m.redraw();
    },
    view: ({ attrs: { state, actions } }) => {
      const options = { editing: false };
      return m('.row.sb.large', [
        m('.col.s12.m4', m(SessionControl, { state, actions, options })),
        m('.col.s12.m8', m(InjectsForm, { state, actions, options })),
      ]);
    },
  };
};
