import m from 'mithril';
import { TextInput, TextArea, Button, Icon, Select, ModalPanel, Collapsible } from 'mithril-materialized';
import { IStakeholder, deepCopy, deepEqual } from 'trial-manager-models';
import { MeiosisComponent } from '../../services';
import { getObjectives, getStakeholders, getUsers } from '../../utils';

export const StakeholdersForm: MeiosisComponent = () => {
  let stakeholder = {} as IStakeholder;

  return {
    view: ({
      attrs: {
        state: {
          app: { trial, stakeholderId },
        },
        actions: { updateStakeholder, deleteStakeholder },
      },
    }) => {
      const stakeholders = getStakeholders(trial);
      if (!stakeholderId) {
        return m(
          'p',
          m(
            'i',
            `Please, create a stakeholder using the + button${
              stakeholders.length > 0 ? ', or select one in the list' : ''
            }.`
          )
        );
      }
      const users = getUsers(trial);
      const original = stakeholders.filter((s) => s.id === stakeholderId).shift() || ({} as IStakeholder);
      if (!stakeholder || original.id !== stakeholder.id) {
        stakeholder = deepCopy(original);
      }
      const options =
        users.length > 0
          ? users.map((u) => ({
              id: u.id,
              label: u.name,
            }))
          : undefined;
      const hasChanged = !deepEqual(stakeholder, original);
      const onsubmit = (e: UIEvent) => {
        e.preventDefault();
        if (stakeholder) {
          updateStakeholder(stakeholder);
        }
      };

      const id = stakeholder ? stakeholder.id : '';
      const objectives = getObjectives(trial).filter((o) => o.stakeholderIds && o.stakeholderIds.indexOf(id) >= 0);

      return m(
        '.row',
        { style: 'color: black' },
        m('form.col.s12', [
          m(
            '.contact-form',
            { key: stakeholder ? stakeholder.id : undefined },
            stakeholder && [
              m('h4', [
                m(Icon, {
                  iconName: 'contacts',
                  style: 'margin-right: 12px;',
                }),
                'Stakeholder details',
              ]),
              [
                m(TextInput, {
                  id: 'name',
                  isMandatory: true,
                  initialValue: stakeholder.name,
                  onchange: (v: string) => (stakeholder.name = v),
                  label: 'Name',
                  iconName: 'title',
                }),
                m(TextArea, {
                  id: 'desc',
                  initialValue: stakeholder.notes,
                  onchange: (v: string) => (stakeholder.notes = v),
                  label: 'Description',
                  iconName: 'description',
                }),
                options
                  ? m(Select, {
                      placeholder: 'Select contacts',
                      multiple: true,
                      iconName: 'group',
                      label: 'Contacts',
                      checkedId: stakeholder.contactIds,
                      isMandatory: true,
                      options,
                      onchange: (values?: unknown) => {
                        if (values && values instanceof Array) {
                          stakeholder.contactIds = values;
                        }
                      },
                    })
                  : undefined,
              ],
              objectives
                ? m(
                    '.row',
                    m(
                      '.col.s12',
                      m(Collapsible, {
                        items: objectives.map((o) => ({
                          header: o.title,
                          body: o.description || 'No description provided',
                          iconName: 'my_location',
                        })),
                      })
                    )
                  )
                : undefined,
              m('row', [
                m(Button, {
                  iconName: 'undo',
                  class: `green ${hasChanged ? '' : 'disabled'}`,
                  onclick: () => (stakeholder = deepCopy(original)),
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
                title: `Do you really want to delete "${stakeholder.name}?"`,
                options: { opacity: 0.7 },
                buttons: [
                  {
                    label: 'OK',
                    onclick: async () => {
                      await deleteStakeholder(stakeholder);
                      // const stakeholders = TrialSvc.getStakeholders();
                      // const cur = stakeholders && stakeholders.length > 0 ? stakeholders[0] : undefined;
                      // if (cur) {
                      //   stakeholdersChannel.publish(TopicNames.ITEM_SELECT, { cur });
                      // } else {
                      //   stakeholdersChannel.publish(TopicNames.ITEM_DELETE, { cur: stakeholder });
                      // }
                    },
                  },
                  {
                    label: 'Cancel',
                  },
                ],
              }),
            ]
          ),
        ])
      );
    },
  };
};
