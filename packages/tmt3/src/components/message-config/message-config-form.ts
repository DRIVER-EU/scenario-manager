import m from 'mithril';
import { MeiosisComponent } from '../../services';

export const MessageConfigForm: MeiosisComponent = () => {
  return {
    view: () => {
      return m(
        '.row',
        { style: 'color: black' },
        m('form.col.s12')
      );
    },
  };
};
