import m from 'mithril';
import { SessionControl } from './session-control';
import { InjectsForm } from '../injects/injects-form';
import { MeiosisComponent, RunSvc } from '../../services';

export const SessionView: MeiosisComponent = () => {
  return {
    oninit: ({
      attrs: {
        actions: { setEditMode },
      },
    }) => {
      RunSvc.activeSession();
      setEditMode(false);
    },
    view: ({ attrs: { state, actions } }) => {
      return m('.row.sb.large', [
        m('.col.s12.m4', m(SessionControl, { state, actions })),
        m('.col.s12.m8', m(InjectsForm, { state, actions })),
      ]);
    },
  };
};
