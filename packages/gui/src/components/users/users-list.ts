import m, { FactoryComponent } from 'mithril';
import { UsersForm } from './users-form';
import { IPerson, UserRole } from 'trial-manager-models';
import { TrialSvc } from '../../services';
import { usersChannel, TopicNames } from '../../models/channels';
import { RoundIconButton, TextInput, Collection, CollectionMode } from 'mithril-materialized';
import { uniqueId } from '../../utils';

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
                role: UserRole.STAKEHOLDER,
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
                  Collection,
                  {
                    mode: CollectionMode.AVATAR,
                    items: users.map(cur => ({
                      title: cur.name || '?',
                      avatar: 'person_outline',
                      className: 'yellow black-text',
                      active: state.currentUserId === cur.id,
                      content: TrialSvc.userRoleToString(cur.role) + (cur.notes ? `<br><i>${cur.notes}</i>` : ''),
                      onclick: () => {
                        usersChannel.publish(TopicNames.ITEM_SELECT, { cur });
                        state.currentUserId = cur.id;
                      },
                    })),
                  }
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
    view: () => m('.row', [m('.col.s12.m5.l4', m(UsersList)), m('.col.s12.m7.l8', m(UsersForm))]),
  };
};
