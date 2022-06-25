import m from 'mithril';
import { ObjectivesList } from './objectives-list';
import { ObjectiveForm } from './objective-form';
import { MeiosisComponent } from '../../services';

export const ObjectivesView: MeiosisComponent = () => {
  return {
    view: ({ attrs: { state, actions } }) =>
      m('.row.sb.large', [
        m('.col.s12.m5.l4', m(ObjectivesList, { state, actions })),
        m('.col.s12.m7.l8', m(ObjectiveForm, { state, actions })),
      ]),
  };
};
