import m from 'mithril';
import { InjectsList } from './injects-list';
import { InjectsForm } from './injects-form';

export const InjectsView = () => {
  return {
    view: () => m('.row.sb.large', [
      m('.col.s12.m5.l4', m(InjectsList)),
      m('.col.s12.m7.l8', m(InjectsForm)),
    ]),
  };
};
