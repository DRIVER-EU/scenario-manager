import m from 'mithril';
import { ObjectivesList } from './objectives-list';
import { ObjectiveForm } from './objective-form';

export const ObjectivesView = () => {
  return {
    view: () => m('.row.sb.large', [
      m('.col.s12.m5.l4', m(ObjectivesList)),
      m('.col.s12.m7.l8', m(ObjectiveForm)),
    ]),
  };
};
