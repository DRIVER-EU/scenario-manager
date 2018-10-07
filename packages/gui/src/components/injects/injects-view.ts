import m from 'mithril';
import { InjectsList } from './injects-list';
import { InjectsForm } from './injects-form';

export const InjectsView = () => {
  return {
    view: () => m('.row', [
      m('.col.s12.m4', m(InjectsList)),
      m('.col.s12.m8', m(InjectsForm)),
    ]),
  };
};
