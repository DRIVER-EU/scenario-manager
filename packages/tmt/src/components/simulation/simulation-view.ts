import m, { FactoryComponent } from 'mithril';
import { TimelineView } from './timeline-view';
import { ExecutingInjectView } from '../executing/executing-inject-view';

export const SimulationView: FactoryComponent = () => {
  return {
    view: () => m('.row', [
      m('.col.sb.xlarge.s12.m6.l4', m(TimelineView)),
      m('.col.sb.xlarge.s12.m6.l8', m(ExecutingInjectView)),
    ]),
  };
};
