import m from 'mithril';
import { UsersForm } from './users-form';
import { IPerson, UserRole, uniqueId } from 'trial-manager-models';
import { MeiosisComponent } from '../../services';
import { RoundIconButton, TextInput, Collection, CollectionMode, ICollectionItem } from 'mithril-materialized';
import { getActiveTrialInfo, getUsers, userIcon, userRolesToString } from '../../utils';

const UsersList: MeiosisComponent = () => {
  let filterValue = '' as string | undefined;

  return {
    view: ({
      attrs: {
        state,
        actions: { createUser, selectUser },
      },
    }) => {
      const { trial } = getActiveTrialInfo(state);
      const { userId } = state.app;

      const users = getUsers(trial, filterValue).sort((a, b) => (a.name > b.name || a.id > b.id ? 1 : -1));
      if (!userId && users.length > 0) {
        selectUser(users[0]);
        // setTimeout(() => {
        //   selectUser(users[0]);
        //   m.redraw();
        // }, 0);
      }
      const items = users.map(
        (user) =>
          ({
            id: user.id,
            title: user.name || '?',
            iconName: 'create',
            avatar: userIcon(user),
            className: 'yellow black-text',
            active: userId === user.id,
            content: userRolesToString(user) + (user.notes ? `<br><i>${user.notes}</i>` : ''),
            onclick: () => selectUser(user),
          } as ICollectionItem)
      );

      return [
        m(
          '.row',
          m('.col.s12', [
            m(RoundIconButton, {
              iconName: 'person_add',
              class: 'green right btn-small',
              style: 'margin: 1em;',
              onclick: async () => {
                const user = {
                  id: uniqueId(),
                  name: 'New user',
                  roles: [UserRole.STAKEHOLDER],
                } as IPerson;
                await createUser(user);
              },
            }),
            m(TextInput, {
              label: 'Filter',
              id: 'filter',
              iconName: 'filter_list',
              onkeyup: (_: KeyboardEvent, v?: string) => (filterValue = v),
              className: 'right',
            }),
          ])
        ),
        users.length > 0
          ? m('.row.sb', m('.col.s12', m(Collection, { mode: CollectionMode.AVATAR, items })))
          : undefined,
      ];
    },
  };
};

export const UsersView: MeiosisComponent = () => {
  return {
    view: ({ attrs: { state, actions } }) =>
      m('.row', [
        m('.col.s12.m5.l4', m(UsersList, { state, actions })),
        m('.col.s12.m7.l8', m(UsersForm, { state, actions })),
      ]),
  };
};
