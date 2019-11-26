import m from 'mithril';
import { SessionControl } from './session-control';
import { InjectsForm } from '../injects/injects-form';

export const SessionView = () => {
  return {
    view: () => m('.row.sb.large', [
      m('.col.s12.m4', m(SessionControl)),
      m('.col.s12.m8', m(InjectsForm, { disabled: true })),
    ]),
  };
};
