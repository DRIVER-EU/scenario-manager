import m from 'mithril';
import { TextInput, TextArea, EmailInput, Button, Icon, Select, ModalPanel } from 'mithril-materialized';
import { IScenario, IPerson, UserRole, TopicNames, usersChannel } from '../../models';
import { deepCopy, deepEqual, iterEnum } from '../../utils';
import { ScenarioSvc } from '../../services';

const log = console.log;

export const UsersForm = () => {
  const state = {
    scenario: undefined as IScenario | undefined,
    user: undefined as IPerson | undefined,
    original: undefined as IPerson | undefined,
    subscription: usersChannel.subscribe(TopicNames.ITEM, ({ cur }, envelope) => {
      if (envelope.topic === TopicNames.ITEM_DELETE) {
        state.user = undefined;
        state.original = undefined;
      } else {
        state.user = cur && cur.id ? deepCopy(cur) : undefined;
        state.original = cur && cur.id ? deepCopy(cur) : undefined;
      }
    }),
  };

  return {
    oninit: () => {
      state.scenario = ScenarioSvc.getCurrent();
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const { user } = state;
      const hasChanged = !deepEqual(user, state.original);
      const onsubmit = (e: UIEvent) => {
        e.preventDefault();
        log('submitting...');
        if (user) {
          ScenarioSvc.updateUser(user);
        }
      };
      return m(
        '.row',
        { style: 'color: black' },
        m('form.col.s12', [
          m(
            '.contact-form',
            user
              ? [
                  m('h4', [
                    m(Icon, {
                      iconName: 'contacts',
                      style: 'margin-right: 12px;',
                    }),
                    'User details',
                  ]),
                  [
                    m(TextInput, {
                      id: 'name',
                      isMandatory: true,
                      initialValue: user.name,
                      onchange: (v: string) => (user.name = v),
                      label: 'Name',
                      iconName: 'account_circle',
                    }),
                    m(Select, {
                      iconName: ScenarioSvc.userIcon(user),
                      label: 'Role',
                      checkedId: user.role,
                      isMandatory: true,
                      options: iterEnum(UserRole).map(r => ({
                        id: +r,
                        label: ScenarioSvc.userRoleToString(+r),
                      })),
                      onchange: (id: unknown) => (user.role = id as number),
                    }),
                    m(EmailInput, {
                      id: 'email',
                      initialValue: user.email,
                      onchange: (v: string) => (user.email = v),
                      label: 'Email',
                      iconName: 'email',
                    }),
                    m(TextInput, {
                      id: 'mobile',
                      initialValue: user.mobile,
                      onchange: (v: string) => (user.mobile = v),
                      label: 'Mobile',
                      iconName: 'phone_android',
                    }),
                    m(TextInput, {
                      id: 'phone',
                      initialValue: user.phone,
                      onchange: (v: string) => (user.phone = v),
                      label: 'Phone',
                      iconName: 'phone',
                    }),
                    m(TextArea, {
                      id: 'desc',
                      initialValue: user.notes,
                      onchange: (v: string) => (user.notes = v),
                      label: 'Description',
                      iconName: 'description',
                    }),
                  ],
                  m('row', [
                    m(Button, {
                      iconName: 'undo',
                      class: `green ${hasChanged ? '' : 'disabled'}`,
                      onclick: () => (state.user = deepCopy(state.original)),
                    }),
                    ' ',
                    m(Button, {
                      iconName: 'save',
                      class: `green ${hasChanged ? '' : 'disabled'}`,
                      onclick: onsubmit,
                    }),
                    ' ',
                    m(Button, {
                      modalId: 'delete',
                      iconName: 'delete',
                      class: 'red',
                    }),
                  ]),
                  m(ModalPanel, {
                    id: 'delete',
                    title: `Do you really want to delete "${user.name}?"`,
                    options: { opacity: 0.7 },
                    buttons: [
                      {
                        label: 'OK',
                        onclick: async () => {
                          await ScenarioSvc.deleteUser(user);
                          const contacts = ScenarioSvc.getUsers();
                          const cur = contacts && contacts.length > 0 ? contacts[0] : undefined;
                          if (cur) {
                            usersChannel.publish(TopicNames.ITEM_SELECT, { cur });
                          } else {
                            usersChannel.publish(TopicNames.ITEM_DELETE, { cur: user });
                          }
                        },
                      },
                      {
                        label: 'Cancel',
                      },
                    ],
                  }),
                ]
              : []
          ),
        ])
      );
    },
  };
};
