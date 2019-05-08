import m, { FactoryComponent } from 'mithril';
import { SessionTimelineView } from './session-timeline';
import { ExecutingInjectView } from '../executing/executing-inject-view';

export const SessionState: FactoryComponent = () => {
  return {
    view: () => m('.row.sb.large', [
      m('.col.sb.large.s12.m6.l4', m(SessionTimelineView)),
      m('.col.sb.large.s12.m6.l8', m(ExecutingInjectView)),
    ]),
  };
};
