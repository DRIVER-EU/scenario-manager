import m from 'mithril';
import { SessionTimelineView } from './session-timeline';
import { ExecutingInjectView } from '../executing/executing-inject-view';
import { MeiosisComponent } from '../../services';

export const SessionState: MeiosisComponent = () => {
  return {
    oninit: ({
      attrs: {
        actions: { updateSession },
      },
    }) => {
      updateSession();
    },
    view: ({ attrs: { state, actions } }) =>
      m('.row', [
        m('.col.s12.m6.sb.large.sb-hor', m(SessionTimelineView, { state, actions })),
        m('.col.s12.m6.sb.large', m(ExecutingInjectView, { state, actions })),
      ]),
  };
};
