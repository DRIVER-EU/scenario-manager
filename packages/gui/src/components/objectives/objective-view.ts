import m from 'mithril';
import { ObjectivesList } from './objectives-list';
import { ObjectiveForm } from './objective-form';

export const ObjectivesView = () => {
  return {
    view: () => m('.row', [
      m('.col.s12.m4', m(ObjectivesList)),
      m('.col.s12.m8', m(ObjectiveForm)),
    ]),
  };
};
