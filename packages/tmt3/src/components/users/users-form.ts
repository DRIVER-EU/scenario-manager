import m from 'mithril';
import { TextInput, TextArea, EmailInput, Button, Icon, Select, ModalPanel } from 'mithril-materialized';
import { IPerson, UserRole, deepCopy, deepEqual } from '../../../../models';
import { MeiosisComponent } from '../../services';
import { getActiveTrialInfo, getUsers, iterEnum, userIcon, userRoleToString } from '../../utils';

export const UsersForm: MeiosisComponent = () => {
  let user = {} as IPerson;

  const options = iterEnum(UserRole).map((r) => ({
    id: +r,
    label: userRoleToString(+r),
  }));

  return {
    view: ({
      attrs: {
        state,
        actions: { selectUser, updateUser, deleteUser },
      },
    }) => {
      const { trial } = getActiveTrialInfo(state);

      const users = getUsers(trial);
      const { userId } = state.app;
      if (!userId) {
        return m(
          'p',
          m('i', `Please, create a user using the + button${users.length > 0 ? ', or select one in the list' : ''}.`)
        );
      }
      const original = users.filter((s) => s.id === userId).shift() || ({} as IPerson);
      if (!user || original.id !== user.id) {
        user = deepCopy(original);
      }

      const onsubmit = (e: UIEvent) => {
        e.preventDefault();
        if (user) {
          updateUser(user);
        }
      };
      const hasChanged = !deepEqual(user, original);

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
                      onchange: (v) => (user ? (user.roles = v as UserRole[]) : undefined),
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
                      onclick: () => (user = deepCopy(original)),
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
                          await deleteUser(user);
                          const contacts = getUsers(trial);
                          const cur = contacts && contacts.length > 0 ? contacts[0] : undefined;
                          cur && selectUser(cur);
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
