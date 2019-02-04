import m from 'mithril';
import { TextInput, TextArea, Button, Icon, Select, ModalPanel } from 'mithril-materialized';
import { ITrial, IStakeholder } from 'trial-manager-models';
import { TopicNames, stakeholdersChannel } from '../../models';
import { deepCopy, deepEqual } from '../../utils';
import { TrialSvc } from '../../services';

const log = console.log;

export const StakeholdersForm = () => {
  const state = {
    trial: undefined as ITrial | undefined,
    stakeholder: undefined as IStakeholder | undefined,
    original: undefined as IStakeholder | undefined,
    subscription: stakeholdersChannel.subscribe(TopicNames.ITEM, ({ cur }, envelope) => {
      if (envelope.topic === TopicNames.ITEM_DELETE) {
        state.stakeholder = undefined;
        state.original = undefined;
      } else {
        state.stakeholder = cur && cur.id ? deepCopy(cur) : undefined;
        state.original = cur && cur.id ? deepCopy(cur) : undefined;
      }
    }),
  };

  return {
    oninit: () => {
      state.trial = TrialSvc.getCurrent();
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const { stakeholder } = state;
      const users = TrialSvc.getUsers();
      const options = users
        ? users.map(u => ({
            id: u.id,
            label: u.name,
          }))
        : undefined;
      const hasChanged = !deepEqual(stakeholder, state.original);
      const onsubmit = (e: UIEvent) => {
        e.preventDefault();
        log('submitting...');
        if (stakeholder) {
          TrialSvc.updateStakeholder(stakeholder);
        }
      };
      return m(
        '.row',
        { style: 'color: black' },
        m('form.col.s12', [
          m(
            '.contact-form',
            stakeholder
              ? [
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
                  m('row', [
                    m(Button, {
                      iconName: 'undo',
                      class: `green ${hasChanged ? '' : 'disabled'}`,
                      onclick: () => (state.stakeholder = deepCopy(state.original)),
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
                          await TrialSvc.deleteStakeholder(stakeholder);
                          const stakeholders = TrialSvc.getStakeholders();
                          const cur = stakeholders && stakeholders.length > 0 ? stakeholders[0] : undefined;
                          if (cur) {
                            stakeholdersChannel.publish(TopicNames.ITEM_SELECT, { cur });
                          } else {
                            stakeholdersChannel.publish(TopicNames.ITEM_DELETE, { cur: stakeholder });
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
