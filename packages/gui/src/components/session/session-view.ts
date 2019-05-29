import m from 'mithril';
import { SessionControl } from './session-control';

export const SessionView = () => {
  return {
    view: () => m('.row.sb.large', [
      m('.col.s12.m6', m(SessionControl)),
      // m('.col.s12.m6', m(ObjectiveForm)),
    ]),
  };
};
