import m, { FactoryComponent } from 'mithril';
import { SessionTimelineView } from './session-timeline';
import { ExecutingInjectView } from '../executing/executing-inject-view';
import { RunSvc } from '../../services';

export const SessionState: FactoryComponent = () => {
  return {
    oninit: () => {
      RunSvc.activeTrial();
      m.redraw();
    },
    view: () => m('.row', [
      m('.col.s12.m6.sb.large.sb-hor', m(SessionTimelineView)),
      m('.col.s12.m6.sb.large', m(ExecutingInjectView)),
    ]),
  };
};
