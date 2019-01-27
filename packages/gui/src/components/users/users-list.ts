import m, { FactoryComponent } from 'mithril';
import { UsersForm } from './users-form';
import { IPerson } from '../../models';
import { TrialSvc } from '../../services';
import { usersChannel, TopicNames } from '../../models/channels';
import { RoundIconButton, TextInput, Icon } from 'mithril-materialized';
import { uniqueId } from '../../utils';
import { UserRole } from '../../models/user-role';

const UsersList: FactoryComponent<IPerson> = () => {
  const state = {
    filterValue: '' as string | undefined,
    currentUserId: undefined as string | undefined,
    subscription: usersChannel.subscribe(TopicNames.ITEM, ({ cur }) => {
      state.currentUserId = cur.id;
    }),
  };
  return {
    onremove: () => state.subscription.unsubscribe(),
    view: () => {
      const users = (TrialSvc.getUsers(state.filterValue) || []).sort((a, b) => (a.name > b.name ? 1 : -1));
      return [
        m('.row', [
          m(RoundIconButton, {
            iconName: 'person_add',
            class: 'green right',
            onclick: async () => {
              const user = {
                id: uniqueId(),
                name: 'New user',
                role: UserRole.VIEWER,
              } as IPerson;
              state.currentUserId = user.id;
              await TrialSvc.createUser(user);
            },
          }),
          m(TextInput, {
            label: 'Filter',
            id: 'filter',
            iconName: 'filter_list',
            onkeyup: (ev: KeyboardEvent, v?: string) => (state.filterValue = v),
            contentClass: 'right',
          }),
        ]),
        users.length > 0
          ? m(
              '.row.sb',
              m(
                '.col.s12',
                m(
                  'ul.collection',
                  users.map(cur =>
                    m(
                      'li.collection-item avatar',
                      {
                        style: 'cursor: pointer;',
                        class: state.currentUserId === cur.id ? 'active' : undefined,
                        onclick: () => {
                          usersChannel.publish(TopicNames.ITEM_SELECT, { cur });
                          state.currentUserId = cur.id;
                        },
                      },
                      [
                        m(Icon, {
                          iconName: TrialSvc.userIcon(cur),
                          class: 'circle yellow black-text',
                        }),
                        m('span.title', cur.name),
                        m('p', TrialSvc.userRoleToString(cur.role)),
                      ]
                    )
                  )
                )
              )
            )
          : undefined,
      ];
    },
  };
};

export const UsersView = () => {
  return {
    view: () => m('.row', [m('.col.s12.m4.l3', m(UsersList)), m('.col.s12.m8.l9', m(UsersForm))]),
  };
};
