import m from 'mithril';
import { TextInput, TextArea, Select, Button, Icon, Collapsible } from 'mithril-materialized';
import { ITrial, IObjective, deepCopy, deepEqual, IInjectGroup } from 'trial-manager-models';
import { TopicNames, objectiveChannel } from '../../models';
import { TrialSvc } from '../../services';
import { isInjectGroup, getInjectIcon } from '../../utils';

const log = console.log;

export const ObjectiveForm = () => {
  const state = {
    trial: undefined as ITrial | undefined,
    parent: undefined as IObjective | undefined,
    objective: undefined as IObjective | undefined,
    original: undefined as IObjective | undefined,
    injectGroups: undefined as IInjectGroup[] | undefined,
    subscription: objectiveChannel.subscribe(TopicNames.ITEM, ({ cur }) => {
      state.objective = cur && cur.id ? deepCopy(cur) : undefined;
      state.original = cur && cur.id ? deepCopy(cur) : undefined;
      state.parent = cur.parentId ? getParent(cur.parentId) : undefined;
    }),
  };

  const getParent = (id: string) => (TrialSvc.getObjectives() || []).filter(o => o.id === id).shift();

  return {
    oninit: () => {
      state.trial = TrialSvc.getCurrent();
      state.injectGroups = (TrialSvc.getInjects() || []).filter(isInjectGroup);
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const { objective, injectGroups } = state;
      const hasChanged = !deepEqual(objective, state.original);
      const stakeholders = TrialSvc.getStakeholders();
      const options = stakeholders
        ? stakeholders.map(u => ({
            id: u.id,
            label: u.name || 'unknown',
          }))
        : undefined;
      const onsubmit = (e: UIEvent) => {
        e.preventDefault();
        log('submitting...');
        if (objective) {
          objectiveChannel.publish(TopicNames.ITEM_UPDATE, { cur: objective });
          TrialSvc.updateObjective(objective);
        }
      };

      const mainInjectsGroups =
        injectGroups && objective && injectGroups.filter(g => g.mainObjectiveId === objective.id);
      const secInjectsGroups =
        injectGroups && objective && injectGroups.filter(g => g.secondaryObjectiveId === objective.id);

      return m(
        '.row',
        { style: 'color: black' },
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
                    ? m(Select, {
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
                      })
                    : undefined,
                ],
                mainInjectsGroups
                  ? m(
                      'row',
                      m(
                        '.col.s12',
                        m(Collapsible, {
                          items: mainInjectsGroups.map(i => ({
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
                          items: secInjectsGroups.map(i => ({
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
                    onclick: () => (state.objective = deepCopy(state.original)),
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
                    onclick: () => TrialSvc.deleteObjective(objective),
                  }),
                ]),
              ]
            : [],
        ])
      );
    },
  };
};
