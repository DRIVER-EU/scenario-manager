import m from 'mithril';
import { TextInput, TextArea, Select, Button, Icon } from 'mithril-materialized';
import { ITrial, IObjective } from 'trial-manager-models';
import { TopicNames, objectiveChannel } from '../../models';
import { deepCopy, deepEqual } from '../../utils';
import { TrialSvc } from '../../services';

const log = console.log;

export const ObjectiveForm = () => {
  const state = {
    trial: undefined as ITrial | undefined,
    parent: undefined as IObjective | undefined,
    objective: undefined as IObjective | undefined,
    original: undefined as IObjective | undefined,
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
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const objective = state.objective;
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
