import m from 'mithril';
import { MessageConfigForm } from './message-config-form';
import { MeiosisComponent } from '../../services';
import { RoundIconButton, TextInput } from 'mithril-materialized';

const MessageConfigList: MeiosisComponent = () => {
  //let filterValue = '' as string | undefined;

  return {
    view: () => {
      return [
        m(
          '.row',
          m('.col.s12', [
            m(RoundIconButton, {
              iconName: 'add',
              class: 'green right btn-small',
              style: 'margin: 1em;',
              onclick: async () => {
                //await createUser(user);
              },
            }),
            m(TextInput, {
              label: 'Filter',
              id: 'filter',
              iconName: 'filter_list',
              //onkeyup: (_: KeyboardEvent, v?: string) => (filterValue = v),
              className: 'right',
            }),
          ])
        ),
        //users.length > 0
        //  ? m('.row.sb', m('.col.s12', m(Collection, { mode: CollectionMode.AVATAR, items })))
        //  : undefined,
      ];
    },
  };
};

export const MessageConfigView: MeiosisComponent = () => {
  return {
    view: ({ attrs: { state, actions } }) =>
      m('.row', [
        m('.col.s12.m5.l4', m(MessageConfigList, { state, actions })),
        m('.col.s12.m7.l8', m(MessageConfigForm, { state, actions })),
      ]),
  };
};
