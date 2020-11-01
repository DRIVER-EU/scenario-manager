import m from 'mithril';
import { TextInput, TextArea, Select, Button, Icon, Collapsible } from 'mithril-materialized';
import { IObjective, deepCopy, deepEqual } from '../../../../models';
import { MeiosisComponent } from '../../services';
import { getInjectIcon, getInjects, getObjectives, getStakeholders, isInjectGroup } from '../../utils';

const log = console.log;

export const ObjectiveForm: MeiosisComponent = () => {
  let objective = {} as IObjective;

  return {
    view: ({
      attrs: {
        state: {
          app: { trial, objectiveId },
        },
        actions: { updateObjective, deleteObjective },
      },
    }) => {
      const objectives = getObjectives(trial);
      if (!objectiveId) {
        return m(
          'p',
          m(
            'i',
            `Please, create an objective using the + button${
              objectives.length > 0 ? ', or select one in the tree' : ''
            }.`
          )
        );
      }
      const original = objectives.filter((s) => s.id === objectiveId).shift() || ({} as IObjective);
      if (!objective || original.id !== objective.id) {
        objective = deepCopy(original);
      }
      const hasChanged = !deepEqual(objective, original);
      const stakeholders = getStakeholders(trial);
      const options = stakeholders
        ? stakeholders.map((u) => ({
            id: u.id,
            label: u.name || 'unknown',
          }))
        : undefined;

      const onsubmit = (e: UIEvent) => {
        e.preventDefault();
        log('submitting...');
        if (objective) {
          updateObjective(objective);
        }
      };

      const injectGroups = getInjects(trial).filter(isInjectGroup);

      const mainInjectsGroups =
        injectGroups && objective && injectGroups.filter((g) => g.mainObjectiveId === objectiveId);
      const secInjectsGroups =
        injectGroups && objective && injectGroups.filter((g) => g.secondaryObjectiveId === objectiveId);

      return m(
        '.row',
        { style: 'color: black' },
        // m('.col.s12', { key: objective ? objectiveId : undefined }, [
        m('.col.s12', [
          objective
            ? [
                m('h4', [
                  m(Icon, {
                    iconName: 'my_location',
                    style: 'margin-right: 12px;',
                  }),
                  `${objective.parentId ? 'Secondary' : 'Main'} objective`,
                ]),
                [
                  m(TextInput, {
                    id: 'title',
                    initialValue: objective.title,
                    onchange: (v: string) => (objective.title = v),
                    label: 'Title',
                    iconName: 'title',
                  }),
                  m(TextArea, {
                    id: 'desc',
                    initialValue: objective.description,
                    onchange: (v: string) => (objective.description = v),
                    label: 'Description',
                    iconName: 'description',
                  }),
                  options
                    ? [
                        m(Select, {
                          key: objective.id,
                          placeholder: 'Select stakeholders',
                          multiple: true,
                          iconName: 'group',
                          label: 'Stakeholders',
                          checkedId: objective.stakeholderIds,
                          isMandatory: true,
                          options,
                          onchange: (values?: unknown) => {
                            if (values && values instanceof Array) {
                              objective.stakeholderIds = values;
                            }
                          },
                        }),
                      ]
                    : undefined,
                ],
                mainInjectsGroups
                  ? m(
                      'row',
                      m(
                        '.col.s12',
                        m(Collapsible, {
                          items: mainInjectsGroups.map((i) => ({
                            header: i.title,
                            body: i.description || 'No description provided',
                            iconName: getInjectIcon(i.type),
                          })),
                        })
                      )
                    )
                  : undefined,
                secInjectsGroups
                  ? m(
                      'row',
                      m(
                        '.col.s12',
                        m(Collapsible, {
                          items: secInjectsGroups.map((i) => ({
                            header: i.title,
                            body: i.description || 'No description provided',
                            iconName: getInjectIcon(i.type),
                          })),
                        })
                      )
                    )
                  : undefined,
                m('row', [
                  m(Button, {
                    iconName: 'undo',
                    class: `green ${hasChanged ? '' : 'disabled'}`,
                    onclick: () => (objective = deepCopy(original)),
                  }),
                  ' ',
                  m(Button, {
                    iconName: 'save',
                    class: `green ${hasChanged ? '' : 'disabled'}`,
                    onclick: onsubmit,
                  }),
                  ' ',
                  m(Button, {
                    iconName: 'delete',
                    class: 'red',
                    onclick: () => deleteObjective(objective),
                  }),
                ]),
              ]
            : [],
        ])
      );
    },
  };
};
