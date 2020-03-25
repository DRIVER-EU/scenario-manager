import m from 'mithril';
import { TextInput, TextArea, EmailInput, Button, Icon, Select, ModalPanel } from 'mithril-materialized';
import { ITrial, IPerson, UserRole, deepCopy, deepEqual } from '../../../../models';
import { TopicNames, usersChannel } from '../../models';
import { TrialSvc } from '../../services';
import { iterEnum, userIcon, userRoleToString } from '../../utils';

const log = console.log;

export const UsersForm = () => {
  const state = {
    trial: undefined as ITrial | undefined,
    user: undefined as IPerson | undefined,
    original: undefined as IPerson | undefined,
    subscription: usersChannel.subscribe(TopicNames.ITEM, ({ cur }, envelope) => {
      if (envelope.topic === TopicNames.ITEM_DELETE) {
        state.user = undefined;
        state.original = undefined;
      } else {
        state.user = cur && cur.id ? deepCopy(cur) : undefined;
        state.original = cur && cur.id ? deepCopy(cur) : undefined;
        m.redraw();
      }
    }),
  };
  const options = iterEnum(UserRole).map(r => ({
    id: +r,
    label: userRoleToString(+r),
  }));
  const onsubmit = (e: UIEvent) => {
    e.preventDefault();
    log('submitting...');
    if (state.user) {
      TrialSvc.updateUser(state.user);
    }
  };

  return {
    oninit: () => {
      state.trial = TrialSvc.getCurrent();
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const { user } = state;
      const hasChanged = !deepEqual(user, state.original);

      return m(
        '.row',
        { style: 'color: black' },
        m('form.col.s12', [
          m(
            '.contact-form',
            { key: user ? user.id : undefined },
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
                      iconName: userIcon(user),
                      label: 'Role',
                      placeholder: 'Pick your role',
                      checkedId: user.roles,
                      isMandatory: true,
                      multiple: true,
                      options,
                      onchange: v => (state.user ? (state.user.roles = v as UserRole[]) : undefined),
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
                          await TrialSvc.deleteUser(user);
                          const contacts = TrialSvc.getUsers();
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
