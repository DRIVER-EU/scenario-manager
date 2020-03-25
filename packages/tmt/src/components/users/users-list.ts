import m, { FactoryComponent } from 'mithril';
import { UsersForm } from './users-form';
import { IPerson, UserRole, uniqueId } from '../../../../models';
import { TrialSvc } from '../../services';
import { usersChannel, TopicNames } from '../../models/channels';
import { RoundIconButton, TextInput, Collection, CollectionMode, ICollectionItem } from 'mithril-materialized';
import { userIcon, userRolesToString } from '../../utils';

const UsersList: FactoryComponent<IPerson> = () => {
  const state = {
    filterValue: '' as string | undefined,
    currentUserId: undefined as string | undefined,
    subscription: usersChannel.subscribe(TopicNames.ITEM, ({ cur }) => {
      state.currentUserId = cur.id;
    }),
  };
  const selectUser = (cur: IPerson) => () => {
    usersChannel.publish(TopicNames.ITEM_SELECT, { cur });
    state.currentUserId = cur.id;
  };

  return {
    onremove: () => state.subscription.unsubscribe(),
    view: () => {
      const users = (TrialSvc.getUsers(state.filterValue) || []).sort((a, b) =>
        a.name > b.name || a.id > b.id ? 1 : -1
      );
      if (!state.currentUserId && users.length > 0) {
        setTimeout(() => {
          selectUser(users[0])();
          m.redraw();
        }, 0);
      }
      const items = users.map(
        user =>
          ({
            id: user.id,
            title: user.name || '?',
            iconName: 'create',
            avatar: userIcon(user),
            className: 'yellow black-text',
            active: state.currentUserId === user.id,
            content: userRolesToString(user) + (user.notes ? `<br><i>${user.notes}</i>` : ''),
            onclick: selectUser(user),
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
                state.currentUserId = user.id;
                await TrialSvc.createUser(user);
              },
            }),
            m(TextInput, {
              label: 'Filter',
              id: 'filter',
              iconName: 'filter_list',
              onkeyup: (_: KeyboardEvent, v?: string) => (state.filterValue = v),
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

export const UsersView = () => {
  return {
    view: () => m('.row', [m('.col.s12.m5.l4', m(UsersList)), m('.col.s12.m7.l8', m(UsersForm))]),
  };
};
